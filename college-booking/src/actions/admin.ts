import { prisma } from "@/lib/prisma";

// Fetches stats and recent bookings for the admin dashboard
export async function getAdminDashboardStats() {
  const totalResources = await prisma.resource.count();
  const totalBookings = await prisma.booking.count();
  const pending = await prisma.booking.count({ where: { status: "PENDING" } });
  const approved = await prisma.booking.count({ where: { status: "APPROVED" } });

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { date: "desc" },
    include: { user: true, resource: true },
  });

  return { totalResources, totalBookings, pending, approved, recentBookings };
}

// Fetches all bookings for the admin bookings page
export async function getAllBookings() {
  const bookings = await prisma.booking.findMany({
    include: { user: true, resource: true },
    orderBy: { date: "desc" },
  });

  return bookings.map((b) => ({
    ...b,
    id: String(b.id),
    date: b.date.toISOString(),
    user: { ...b.user, id: String(b.user.id) },
    resource: { ...b.resource, id: String(b.resource.id) },
  }));
}

// Fetches all resources for the admin resources page
export async function getAdminResources() {
  const resources = await prisma.resource.findMany();
  return resources.map((r) => ({ ...r, id: String(r.id) }));
}
