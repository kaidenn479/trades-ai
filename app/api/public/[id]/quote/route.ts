import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, phone, email, serviceType, description, address } = await req.json();

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  const tech = await prisma.technician.findUnique({ where: { id } });
  if (!tech) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    let client = await prisma.client.findFirst({
      where: { technicianId: id, phone },
    });
    if (!client) {
      client = await prisma.client.create({
        data: {
          technicianId: id,
          name,
          phone,
          email: email || null,
          notes: address ? `Address: ${address}` : null,
        },
      });
    }

    await prisma.message.create({
      data: {
        clientId: client.id,
        direction: "inbound",
        channel: "web",
        content: `Quote Request — ${serviceType || "General"}: ${description || "No details provided"}${address ? ` · ${address}` : ""}`,
        aiGenerated: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Quote request error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
