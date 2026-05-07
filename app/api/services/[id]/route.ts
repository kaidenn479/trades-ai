import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const service = await prisma.service.update({
    where: { id, technicianId: session.technicianId },
    data: {
      name: body.name,
      category: body.category,
      description: body.description || null,
      basePrice: body.basePrice ? parseFloat(body.basePrice) : null,
      priceType: body.priceType,
      estimatedHours: body.estimatedHours ? parseFloat(body.estimatedHours) : null,
      status: body.status,
      available247: body.available247 ?? false,
    },
  });

  return NextResponse.json(service);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.service.delete({ where: { id, technicianId: session.technicianId } });
  return NextResponse.json({ ok: true });
}
