import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (id !== session.technicianId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tech = await prisma.technician.findUnique({
    where: { id },
    include: {
      services: { orderBy: { createdAt: "desc" } },
      faqs: true,
      clients: {
        orderBy: { createdAt: "desc" },
        include: {
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
      appointments: {
        where: { startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        include: { client: { select: { name: true, phone: true, email: true } } },
      },
    },
  });

  if (!tech) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(tech);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (id !== session.technicianId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const tech = await prisma.technician.update({
    where: { id },
    data: {
      name: body.name,
      bio: body.bio,
      phone: body.phone,
      timezone: body.timezone,
      tradeType: body.tradeType,
      licenseNumber: body.licenseNumber,
      serviceArea: body.serviceArea,
      emergencyService: body.emergencyService,
      aiPersonality: body.aiPersonality,
      smtpHost: body.smtpHost || null,
      smtpPort: body.smtpPort ? parseInt(body.smtpPort) : null,
      smtpUser: body.smtpUser || null,
      smtpPass: body.smtpPass || null,
      brandColor: body.brandColor || "#f97316",
      plan: body.plan || undefined,
      stripePublishableKey: body.stripePublishableKey || null,
      stripeSecretKey: body.stripeSecretKey || null,
    },
  });

  return NextResponse.json(tech);
}
