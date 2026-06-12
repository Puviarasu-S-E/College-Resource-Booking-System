import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export type GraphQLContext = {
  user: { id: number; role: string } | null;
};

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  const token = req.cookies.get("token")?.value;
  if (!token) return { user: null };
  const user = verifyToken(token);
  return { user };
}
