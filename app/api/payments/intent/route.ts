import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local" }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const { amount, currency = "usd", metadata = {} } = await req.json();

  if (!amount || amount < 50) {
    return NextResponse.json({ error: "Amount must be at least $0.50" }, { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert dollars to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
