import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slots = await prisma.blockedSlot.findMany({
    where: { technicianId: session.technicianId },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { date, startTime, endTime, reason, allDay } = await req.json();
  if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });
  try {
    const slot = await prisma.blockedSlot.create({
      data: { technicianId: session.technicianId, date, startTime: startTime || null, endTime: endTime || null, reason: reason || null, allDay: allDay ?? true },
    });
    return NextResponse.json(slot, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
