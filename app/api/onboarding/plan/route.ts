import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const VALID_PLANS = ["starter", "pro", "business"];

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Not logged in. Please register first." }, { status: 401 });
    }

    let body: { plan?: string } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { plan } = body;
    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan. Choose starter, pro, or business." }, { status: 400 });
    }

    await prisma.technician.update({
      where: { id: session.technicianId },
      data: { plan },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding/plan]", err);
    return NextResponse.json(
      { error: "Server error saving plan. Please try again." },
      { status: 500 }
    );
  }
}
