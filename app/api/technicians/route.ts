import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tech = await prisma.technician.findUnique({
    where: { id: session.technicianId },
    select: {
      id: true, name: true, email: true, phone: true,
      tradeType: true, licenseNumber: true, serviceArea: true,
      emergencyService: true,
      _count: { select: { clients: true, appointments: true } },
    },
  });

  if (!tech) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json([tech]);
}
