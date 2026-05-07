import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest, COOKIE_NAME } from "@/lib/auth";

/**
 * DELETE /api/account
 * Soft-deletes the account: marks it deleted, clears credentials,
 * but preserves all clients, appointments, and payment history.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Require the user to confirm by sending their email
    let body: { confirmEmail?: string } = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!body.confirmEmail) {
      return NextResponse.json({ error: "Please confirm your email address to delete the account." }, { status: 400 });
    }

    const tech = await prisma.technician.findUnique({
      where: { id: session.technicianId },
      select: { id: true, email: true, status: true },
    });

    if (!tech) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (tech.status === "deleted") {
      return NextResponse.json({ error: "Account is already deleted" }, { status: 400 });
    }

    if (body.confirmEmail.toLowerCase().trim() !== tech.email.toLowerCase()) {
      return NextResponse.json({ error: "Email address does not match. Please try again." }, { status: 400 });
    }

    // Soft delete: mark as deleted + clear sensitive credentials.
    // All clients, appointments, services, and payment history are preserved.
    await prisma.technician.update({
      where: { id: tech.id },
      data: {
        status: "deleted",
        deletedAt: new Date().toISOString(),
        // Clear login credentials (account can no longer be accessed)
        password: null,
        resetToken: null,
        resetTokenExpiry: null,
        // Clear API integrations
        smtpHost: null,
        smtpPort: null,
        smtpUser: null,
        smtpPass: null,
        stripePublishableKey: null,
        stripeSecretKey: null,
      },
    });

    // Clear the session cookie
    const res = NextResponse.json({ ok: true, message: "Account deleted. Your billing history and records are preserved." });
    res.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("[account DELETE]", err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
