import { prisma } from "@/lib/prisma";

// Fetches all resources and converts id to string
export async function getResources() {
  const resources = await prisma.resource.findMany();
  return resources.map((r) => ({ ...r, id: String(r.id) }));
}
