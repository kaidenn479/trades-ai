import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { amount, currency = "usd", technicianId, metadata = {} } = await req.json();

  if (!technicianId) {
    return NextResponse.json({ error: "technicianId required" }, { status: 400 });
  }

  // Look up this company's Stripe secret key
  const tech = await prisma.technician.findUnique({
    where: { id: technicianId },
    select: { stripeSecretKey: true, name: true },
  });

  if (!tech?.stripeSecretKey) {
    return NextResponse.json({
      error: "This company has not set up Stripe payments yet. Please contact them directly.",
      code: "NO_STRIPE",
    }, { status: 503 });
  }

  if (!amount || amount < 0.5) {
    return NextResponse.json({ error: "Amount must be at least $0.50" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(tech.stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // dollars to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { ...metadata, company: tech.name, technicianId },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
