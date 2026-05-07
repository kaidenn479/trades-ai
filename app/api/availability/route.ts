import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tech = await prisma.technician.findUnique({
    where: { id: session.technicianId },
    select: { weeklyHours: true },
  });
  return NextResponse.json({ weeklyHours: tech?.weeklyHours ?? null });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { weeklyHours } = await req.json();
  await prisma.technician.update({
    where: { id: session.technicianId },
    data: { weeklyHours: JSON.stringify(weeklyHours) },
  });
  return NextResponse.json({ ok: true });
}
