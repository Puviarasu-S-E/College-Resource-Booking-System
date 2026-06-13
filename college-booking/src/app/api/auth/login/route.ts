import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.password)))
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const res = NextResponse.json({ role: user.role });
  res.cookies.set("token", signToken({ id: user.id, role: user.role }), COOKIE);
  return res;
}
