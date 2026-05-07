import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processClientMessage } from "@/lib/ai";
import { addHours } from "date-fns";

export async function POST(req: NextRequest) {
  const { technicianId, message, history } = await req.json();

  if (!technicianId || !message)
    return NextResponse.json({ error: "technicianId and message required" }, { status: 400 });

  const tech = await prisma.technician.findUnique({
    where: { id: technicianId },
    include: { services: true, faqs: true },
  });

  if (!tech)
    return NextResponse.json({ error: "Technician not found" }, { status: 404 });

  const decision = await processClientMessage(tech, "Test Client", message, history ?? []);

  if (decision.action === "book_appointment" && decision.appointmentTime) {
    let testClient = await prisma.client.findFirst({
      where: { technicianId, name: "Test Client" },
    });

    if (!testClient) {
      testClient = await prisma.client.create({
        data: { technicianId, name: "Test Client", phone: "+15550000000" },
      });
    }

    const start = decision.appointmentTime;
    const end = addHours(start, 1);

    const existing = await prisma.appointment.findFirst({
      where: { technicianId, clientId: testClient.id, startTime: start },
    });

    if (!existing) {
      await prisma.appointment.create({
        data: {
          technicianId,
          clientId: testClient.id,
          title: "Service Call – Test Client",
          startTime: start,
          endTime: end,
          notes: message,
        },
      });
    }
  }

  return NextResponse.json({ decision });
}
