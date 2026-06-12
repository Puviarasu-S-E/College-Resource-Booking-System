import { prisma } from "@/lib/prisma";

// Fetches all bookings for a specific user, newest first
export async function getUserBookings(userId: number) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { resource: true },
    orderBy: { date: "desc" },
  });

  // Convert numbers and dates to strings so they can be passed to Client Components
  return bookings.map((b) => ({
    ...b,
    id: String(b.id),
    date: b.date.toISOString(),
    resource: { ...b.resource, id: String(b.resource.id) },
  }));
}
