import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const techId = session.technicianId;

  // Fetch all appointments (including past)
  const allAppointments = await prisma.appointment.findMany({
    where: { technicianId: techId },
    include: { client: true },
    orderBy: { startTime: "asc" },
  });

  const allMessages = await prisma.message.findMany({
    where: { client: { technicianId: techId } },
    orderBy: { createdAt: "asc" },
  });

  const allClients = await prisma.client.findMany({
    where: { technicianId: techId },
    orderBy: { createdAt: "asc" },
  });

  const services = await prisma.service.findMany({
    where: { technicianId: techId },
  });

  const tech = await prisma.technician.findUnique({
    where: { id: techId },
    select: { plan: true, messageCount: true },
  });

  // ── Revenue by week (last 8 weeks) ────────────────────────────────────────
  const now = new Date();
  const weeklyRevenue: { week: string; revenue: number; jobs: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 7);

    const weekJobs = allAppointments.filter(a => {
      const d = new Date(a.startTime);
      return d >= weekStart && d < weekEnd;
    });

    const revenue = weekJobs.reduce((sum, a) => {
      const svc = services.find(s => a.title.toLowerCase().includes(s.name.toLowerCase()));
      return sum + (svc?.basePrice ?? 0);
    }, 0);

    weeklyRevenue.push({
      week: weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue,
      jobs: weekJobs.length,
    });
  }

  // ── Messages by day (last 30 days) ────────────────────────────────────────
  const dailyMessages: { date: string; inbound: number; outbound: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayMsgs = allMessages.filter(m => m.createdAt.toISOString().slice(0, 10) === dateStr);
    if (i % 5 === 0 || dayMsgs.length > 0) {
      dailyMessages.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        inbound: dayMsgs.filter(m => m.direction === "inbound").length,
        outbound: dayMsgs.filter(m => m.direction === "outbound").length,
      });
    }
  }

  // ── Top services by booking count ─────────────────────────────────────────
  const serviceCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const a of allAppointments) {
    const svc = services.find(s => a.title.toLowerCase().includes(s.name.toLowerCase()));
    const key = svc?.name ?? a.title;
    if (!serviceCounts[key]) serviceCounts[key] = { name: key, count: 0, revenue: 0 };
    serviceCounts[key].count++;
    serviceCounts[key].revenue += svc?.basePrice ?? 0;
  }
  const topServices = Object.values(serviceCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ── Client growth (last 6 months) ─────────────────────────────────────────
  const clientGrowth: { month: string; clients: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const count = allClients.filter(c => {
      const cd = new Date(c.createdAt);
      return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
    }).length;
    clientGrowth.push({ month: label, clients: count });
  }

  // ── Summary stats ─────────────────────────────────────────────────────────
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const revenueThisMonth = allAppointments
    .filter(a => new Date(a.startTime) >= thisMonth)
    .reduce((sum, a) => {
      const svc = services.find(s => a.title.toLowerCase().includes(s.name.toLowerCase()));
      return sum + (svc?.basePrice ?? 0);
    }, 0);

  const revenueLastMonth = allAppointments
    .filter(a => { const d = new Date(a.startTime); return d >= lastMonth && d <= lastMonthEnd; })
    .reduce((sum, a) => {
      const svc = services.find(s => a.title.toLowerCase().includes(s.name.toLowerCase()));
      return sum + (svc?.basePrice ?? 0);
    }, 0);

  const convLimit = tech?.plan === "starter" ? 50 : null;

  return NextResponse.json({
    weeklyRevenue,
    dailyMessages,
    topServices,
    clientGrowth,
    summary: {
      totalRevenue: allAppointments.reduce((sum, a) => {
        const svc = services.find(s => a.title.toLowerCase().includes(s.name.toLowerCase()));
        return sum + (svc?.basePrice ?? 0);
      }, 0),
      revenueThisMonth,
      revenueLastMonth,
      revenueChange: revenueLastMonth > 0 ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) : null,
      totalJobs: allAppointments.length,
      totalClients: allClients.length,
      totalMessages: allMessages.length,
      messagesThisMonth: tech?.messageCount ?? 0,
      convLimit,
      plan: tech?.plan ?? "starter",
    },
  });
}
