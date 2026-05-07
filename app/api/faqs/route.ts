import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question, answer } = await req.json();
  const faq = await prisma.fAQ.create({
    data: { technicianId: session.technicianId, question, answer },
  });
  return NextResponse.json(faq, { status: 201 });
}
