import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  try {
    const service = await prisma.service.create({
      data: {
        technicianId: session.technicianId,
        name: body.name,
        category: body.category ?? "General",
        description: body.description || null,
        basePrice: body.basePrice ? parseFloat(body.basePrice) : null,
        priceType: body.priceType ?? "flat",
        estimatedHours: body.estimatedHours ? parseFloat(body.estimatedHours) : null,
        status: body.status ?? "available",
        available247: body.available247 ?? false,
      },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Service create error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
