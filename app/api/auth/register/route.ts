import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password)
    return NextResponse.json({ error: "All fields required" }, { status: 400 });

  if (password.length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const existing = await prisma.technician.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const tech = await prisma.technician.create({
    data: { name, email, password: hashed, timezone: "America/New_York" },
  });

  const token = await createSession(tech.id);
  const res = NextResponse.json({ ok: true, technicianId: tech.id });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
