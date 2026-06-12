import { prisma } from "@/lib/prisma";
import { GraphQLContext } from "@/graphql/context";

// Converts "09:30" to total minutes (570) for easy time comparison
function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export const bookingResolvers = {
  Query: {
    // Returns already-booked time slots for a resource on a given date
    bookedSlots: async (_: unknown, args: { resourceId: string; date: string }) => {
      return prisma.booking.findMany({
        where: {
          resourceId: Number(args.resourceId),
          date: new Date(args.date),
          status: { in: ["APPROVED", "PENDING"] },
        },
        select: { startTime: true, endTime: true },
      });
    },

    // Returns bookings of the logged-in user
    myBookings: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return prisma.booking.findMany({
        where: { userId: ctx.user.id },
        include: { user: true, resource: true },
        orderBy: { date: "desc" },
      });
    },

    // Admin only: returns all bookings
    allBookings: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (ctx.user?.role !== "ADMIN") throw new Error("Unauthorized");
      return prisma.booking.findMany({
        include: { user: true, resource: true },
        orderBy: { date: "desc" },
      });
    },
  },

  Mutation: {
    // Creates a new booking after checking for time conflicts
    createBooking: async (_: unknown, args: { resourceId: string; date: string; startTime: string; endTime: string }, ctx: GraphQLContext) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const bookingDate = new Date(args.date);

      // Get all approved bookings for this resource on this date
      const existingBookings = await prisma.booking.findMany({
        where: { resourceId: Number(args.resourceId), date: bookingDate, status: "APPROVED" },
      });

      // Check if the new time slot overlaps with any existing booking
      const newStart = timeToMinutes(args.startTime);
      const newEnd = timeToMinutes(args.endTime);

      const hasConflict = existingBookings.some((booking) => {
        const existingStart = timeToMinutes(booking.startTime);
        const existingEnd = timeToMinutes(booking.endTime);
        return newStart < existingEnd && newEnd > existingStart;
      });

      if (hasConflict) throw new Error("Time slot conflicts with an existing approved booking");

      return prisma.booking.create({
        data: {
          userId: ctx.user.id,
          resourceId: Number(args.resourceId),
          date: bookingDate,
          startTime: args.startTime,
          endTime: args.endTime,
          status: "PENDING",
        },
        include: { user: true, resource: true },
      });
    },

    // User cancels their own pending booking
    cancelBooking: async (_: unknown, args: { bookingId: string }, ctx: GraphQLContext) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const booking = await prisma.booking.findUnique({ where: { id: Number(args.bookingId) } });
      if (!booking || booking.userId !== ctx.user.id) throw new Error("Not found");
      if (booking.status !== "PENDING") throw new Error("Only pending bookings can be cancelled");

      return prisma.booking.update({
        where: { id: Number(args.bookingId) },
        data: { status: "REJECTED" },
        include: { user: true, resource: true },
      });
    },

    // Admin approves a booking
    approveBooking: async (_: unknown, args: { bookingId: string }, ctx: GraphQLContext) => {
      if (ctx.user?.role !== "ADMIN") throw new Error("Unauthorized");
      return prisma.booking.update({
        where: { id: Number(args.bookingId) },
        data: { status: "APPROVED" },
        include: { user: true, resource: true },
      });
    },

    // Admin rejects a booking with a reason
    rejectBooking: async (_: unknown, args: { bookingId: string; reason: string }, ctx: GraphQLContext) => {
      if (ctx.user?.role !== "ADMIN") throw new Error("Unauthorized");
      return prisma.booking.update({
        where: { id: Number(args.bookingId) },
        data: { status: "REJECTED", rejectionReason: args.reason },
        include: { user: true, resource: true },
      });
    },
  },
};
