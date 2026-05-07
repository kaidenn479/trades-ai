import Groq from "groq-sdk";
import { Technician, Service, FAQ } from "@prisma/client";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type AIDecision =
  | { action: "reply"; message: string }
  | { action: "book_appointment"; message: string; appointmentTime?: Date }
  | { action: "escalate"; message: string; reason: string };

type TechnicianWithRelations = Technician & {
  services: Service[];
  faqs: FAQ[];
};

export async function processClientMessage(
  tech: TechnicianWithRelations,
  clientName: string | null,
  clientMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  availableSlots?: string[]
): Promise<AIDecision> {
  const systemPrompt = buildSystemPrompt(tech, availableSlots);

  const messages = [
    ...conversationHistory,
    { role: "user" as const, content: clientMessage },
  ];

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  const text = response.choices[0]?.message?.content ?? "";
  return parseAIResponse(text);
}

function buildSystemPrompt(
  tech: TechnicianWithRelations,
  availableSlots?: string[]
): string {
  const servicesText =
    tech.services.length > 0
      ? tech.services
          .filter((s) => s.status === "available")
          .map((s) => {
            const price = s.basePrice
              ? s.priceType === "hourly"
                ? `$${s.basePrice}/hr`
                : s.priceType === "estimate"
                ? "Free estimate"
                : `$${s.basePrice} flat`
              : "Call for pricing";
            const duration = s.estimatedHours ? ` (~${s.estimatedHours}h)` : "";
            const emergency = s.available247 ? " [24/7 AVAILABLE]" : "";
            return `- ${s.name} [${s.category}]${emergency}: ${price}${duration}. ${s.description ?? ""}`;
          })
          .join("\n")
      : "Contact us for a full list of services and pricing.";

  const faqText =
    tech.faqs.length > 0
      ? tech.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")
      : "";

  const slotsText =
    availableSlots && availableSlots.length > 0
      ? `\nAVAILABLE APPOINTMENT SLOTS:\n${availableSlots.join("\n")}`
      : "";

  const emergency = tech.emergencyService
    ? "24/7 emergency service is available — mention this when relevant."
    : "Standard business hours only — no after-hours emergency service.";

  return `You are an AI assistant for ${tech.name}, a ${tech.tradeType} technician${tech.licenseNumber ? ` (License: ${tech.licenseNumber})` : ""}. Your job is to respond to client inquiries, answer questions about services, provide pricing info, and help schedule service calls.

TECHNICIAN INFO:
Name: ${tech.name}
Trade: ${tech.tradeType}
${tech.licenseNumber ? `License: ${tech.licenseNumber}` : ""}
${tech.serviceArea ? `Service Area: ${tech.serviceArea}` : ""}
Timezone: ${tech.timezone}
Emergency Service: ${emergency}
${tech.bio ? `Bio: ${tech.bio}` : ""}
${tech.aiPersonality ? `Communication style: ${tech.aiPersonality}` : ""}

AVAILABLE SERVICES:
${servicesText}

${faqText ? `FREQUENTLY ASKED QUESTIONS:\n${faqText}` : ""}
${slotsText}

TODAY'S DATE: ${new Date().toISOString().split("T")[0]}

INSTRUCTIONS:
1. Be professional, friendly, and concise. Clients are often on mobile or calling from a job site.
2. Answer questions about services and pricing using only the data above. Never invent details.
3. BOOKING RULES — follow exactly:
   - If the client wants to schedule a service call but hasn't given a specific date/time → use [ACTION:BOOK] and offer 2-3 available time slots.
   - If the client gives a specific date AND time (e.g. "Thursday at 10am", "tomorrow morning") → use [ACTION:BOOK], confirm that time naturally, AND include [APPT_TIME:YYYY-MM-DDTHH:MM:00] at the end. Example: [APPT_TIME:2026-05-09T10:00:00].
   - If available slots are listed above, offer those first. When the client picks one, confirm with [APPT_TIME:...].
4. If the question involves warranties, legal liability, insurance claims, or requires the technician personally → use [ACTION:ESCALATE:reason].
5. For all other replies → use [ACTION:REPLY].
6. Once a client confirms a time, stop asking questions and confirm clearly with [APPT_TIME:...].
7. Sign off naturally.`;
}

function parseAIResponse(text: string): AIDecision {
  const apptMatch = text.match(/\[APPT_TIME:([^\]]+)\]/);
  const appointmentTime = apptMatch ? new Date(apptMatch[1]) : undefined;

  const clean = (str: string) =>
    str.replace(/\[ACTION:[^\]]*\]/g, "").replace(/\[APPT_TIME:[^\]]*\]/g, "").trim();

  if (text.includes("[ACTION:BOOK]")) {
    return { action: "book_appointment", message: clean(text), appointmentTime };
  }

  const escalateMatch = text.match(/\[ACTION:ESCALATE:([^\]]+)\]/);
  if (escalateMatch) {
    return { action: "escalate", message: clean(text), reason: escalateMatch[1] };
  }

  return { action: "reply", message: clean(text) };
}
