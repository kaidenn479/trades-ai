import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addHours } from "date-fns";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { serviceId, serviceName, date, time, contact } = await req.json();

  if (!contact?.name || !contact?.phone || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tech = await prisma.technician.findUnique({ where: { id } });
  if (!tech) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find or create client
  let client = await prisma.client.findFirst({
    where: { technicianId: id, phone: contact.phone },
  });
  if (!client) {
    client = await prisma.client.create({
      data: {
        technicianId: id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email || null,
        notes: contact.address ? `Address: ${contact.address}` : null,
      },
    });
  }

  // Parse start time from date + time string
  const startDate = new Date(date);
  const [timePart, meridiem] = time.split(" ");
  const [hoursStr, minutesStr] = timePart.split(":");
  let hours = parseInt(hoursStr);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  startDate.setHours(hours, parseInt(minutesStr ?? "0"), 0, 0);
  const endDate = addHours(startDate, 1);

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      technicianId: id,
      clientId: client.id,
      title: `${serviceName} — ${contact.name}`,
      startTime: startDate,
      endTime: endDate,
      location: contact.address || null,
      notes: contact.notes || null,
    },
  });

  // Save inbound message record
  await prisma.message.create({
    data: {
      clientId: client.id,
      direction: "inbound",
      channel: "web",
      content: `Booked: ${serviceName} on ${startDate.toLocaleDateString()} at ${time}${contact.address ? ` · ${contact.address}` : ""}`,
      aiGenerated: false,
    },
  });

  // Send SMS confirmation via Twilio if configured
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    tech.phone &&
    contact.phone
  ) {
    try {
      const twilio = (await import("twilio")).default;
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const dateStr = startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      await twilioClient.messages.create({
        body: `Hi ${contact.name}! Your ${serviceName} appointment with ${tech.name} is confirmed for ${dateStr} at ${time}.${contact.address ? ` Address: ${contact.address}.` : ""} See you then! Reply STOP to opt out.`,
        from: tech.phone,
        to: contact.phone,
      });
    } catch (err) {
      console.error("SMS send failed:", err);
    }
  }

  return NextResponse.json({ ok: true, appointmentId: appointment.id });
}
