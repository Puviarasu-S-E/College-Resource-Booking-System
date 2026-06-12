import { prisma } from "@/lib/prisma";

// Fetches booking counts and total resources for the user dashboard
export async function getDashboardStats(userId: number) {
  const total = await prisma.booking.count({ where: { userId } });
  const pending = await prisma.booking.count({ where: { userId, status: "PENDING" } });
  const approved = await prisma.booking.count({ where: { userId, status: "APPROVED" } });
  const resourceCount = await prisma.resource.count();

  return { total, pending, approved, resourceCount };
}
