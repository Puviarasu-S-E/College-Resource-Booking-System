import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.id }, select: { id: true, name: true, email: true, role: true } });
}
