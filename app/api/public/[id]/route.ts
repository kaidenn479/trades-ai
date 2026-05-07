import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tech = await prisma.technician.findUnique({
    where: { id },
    select: {
      id: true, name: true, phone: true, bio: true,
      tradeType: true, licenseNumber: true, serviceArea: true,
      emergencyService: true, weeklyHours: true, brandColor: true,
      services: {
        where: { status: "available" },
        orderBy: { category: "asc" },
      },
      faqs: true,
      blockedSlots: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!tech) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tech);
}
