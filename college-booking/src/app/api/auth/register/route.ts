import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { signToken } from "@/lib/jwt";

const COOKIE = { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 };

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (await prisma.user.findUnique({ where: { email } }))
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  const user = await prisma.user.create({ data: { name, email, password: await hashPassword(password), role: "USER" } });
  const res = NextResponse.json({ role: user.role });
  res.cookies.set("token", signToken({ id: user.id, role: user.role }), COOKIE);
  return res;
}
