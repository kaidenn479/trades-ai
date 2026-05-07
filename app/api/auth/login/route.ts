import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password)
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });

  const tech = await prisma.technician.findUnique({ where: { email } });
  if (!tech || !tech.password)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  if ((tech as { status?: string }).status === "deleted")
    return NextResponse.json({ error: "This account has been deleted. Contact support if this was a mistake." }, { status: 403 });

  const valid = await bcrypt.compare(password, tech.password);
  if (!valid)
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const token = await createSession(tech.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
