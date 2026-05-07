"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, MessageSquare, Users, Briefcase, ArrowUpRight, ArrowDownRight, Minus, Zap } from "lucide-react";

type AnalyticsData = {
  weeklyRevenue: { week: string; revenue: number; jobs: number }[];
  dailyMessages: { date: string; inbound: number; outbound: number }[];
  topServices: { name: string; count: number; revenue: number }[];
  clientGrowth: { month: string; clients: number }[];
  summary: {
    totalRevenue: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueChange: number | null;
    totalJobs: number;
    totalClients: number;
    totalMessages: number;
    messagesThisMonth: number;
    convLimit: number | null;
    plan: string;
  };
};

const PLAN_LIMITS: Record<string, { convos: number | null; label: string; color: string }> = {
  starter:  { convos: 50,   label: "Starter",  color: "text-slate-400 bg-slate-500/10 border-slate-500/20"   },
  pro:      { convos: null, label: "Pro",       color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  business: { convos: null, label: "Business",  color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-500">
      <div className="flex gap-1.5">
        {[0,150,300].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{animationDelay:`${d}ms`}} />)}
      </div>
    </div>
  );

  if (!data) return <div className="text-slate-500 text-sm">Failed to load analytics.</div>;

  const { summary } = data;
  const plan = PLAN_LIMITS[summary.plan] ?? PLAN_LIMITS.starter;
  const convUsedPct = plan.convos ? Math.min((summary.messagesThisMonth / plan.convos) * 100, 100) : 0;

  const maxRevenue = Math.max(...data.weeklyRevenue.map(w => w.revenue), 1);
  const maxTopService = Math.max(...data.topServices.map(s => s.count), 1);

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Plan badge + usage */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold w-fit ${plan.color}`}>
          <Zap className="w-4 h-4" />
          {plan.label} Plan
        </div>
        {plan.convos && (
          <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">Conversations this month</span>
              <span className="text-xs font-bold text-white tabular-nums">{summary.messagesThisMonth} / {plan.convos}</span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${convUsedPct > 85 ? "bg-red-500" : convUsedPct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${convUsedPct}%` }}
              />
            </div>
            {convUsedPct > 85 && (
              <p className="text-[11px] text-red-400 mt-2">You&apos;re near your limit. Upgrade to Pro for unlimited conversations.</p>
            )}
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Revenue This Month",
            value: summary.revenueThisMonth > 0 ? `$${summary.revenueThisMonth.toLocaleString()}` : "$0",
            sub: summary.revenueChange !== null
              ? `${summary.revenueChange >= 0 ? "+" : ""}${summary.revenueChange}% vs last month`
              : "No data last month",
            icon: TrendingUp,
            trend: summary.revenueChange,
            grad: "from-emerald-600 to-teal-500",
            glow: "shadow-emerald-500/20",
            ring: "border-emerald-500/15",
          },
          {
            label: "Total Revenue",
            value: summary.totalRevenue > 0 ? `$${summary.totalRevenue.toLocaleString()}` : "$0",
            sub: `across ${summary.totalJobs} jobs`,
            icon: TrendingUp,
            trend: null,
            grad: "from-blue-600 to-cyan-500",
            glow: "shadow-blue-500/20",
            ring: "border-blue-500/15",
          },
          {
            label: "Total Clients",
            value: summary.totalClients,
            sub: "all time",
            icon: Users,
            trend: null,
            grad: "from-violet-600 to-purple-500",
            glow: "shadow-violet-500/20",
            ring: "border-violet-500/15",
          },
          {
            label: "Total Messages",
            value: summary.totalMessages,
            sub: `${summary.messagesThisMonth} this month`,
            icon: MessageSquare,
            trend: null,
            grad: "from-orange-500 to-amber-400",
            glow: "shadow-orange-500/20",
            ring: "border-orange-500/15",
          },
        ].map(({ label, value, sub, icon: Icon, trend, grad, glow, ring }) => (
          <div key={label} className={`relative rounded-2xl border ${ring} bg-white/[0.03] p-5 overflow-hidden hover:bg-white/[0.05] transition-colors`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${grad} opacity-[0.08] blur-xl -translate-y-4 translate-x-4`} />
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-4 shadow-lg ${glow}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
            <div className="text-xs font-medium text-slate-300 mt-0.5">{label}</div>
            <div className="flex items-center gap-1 mt-1">
              {trend !== null && trend !== undefined && (
                trend > 0 ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> :
                trend < 0 ? <ArrowDownRight className="w-3 h-3 text-red-400" /> :
                <Minus className="w-3 h-3 text-slate-500" />
              )}
              <span className="text-[10px] text-slate-500">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Revenue chart */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-semibold text-white">Revenue</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Last 8 weeks</div>
            </div>
            <div className="text-[10px] text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">Weekly</div>
          </div>
          {maxRevenue <= 1 ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm flex-col gap-2">
              <TrendingUp className="w-8 h-8 opacity-30" />
              <span>Revenue data will appear as jobs are booked</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.weeklyRevenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1623", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "12px" }}
                  labelStyle={{ color: "#94a3b8" }}
                  itemStyle={{ color: "#fb923c" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Message activity */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-semibold text-white">Message Activity</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Inbound vs outbound</div>
            </div>
            <div className="flex gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />In</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Out</span>
            </div>
          </div>
          {data.dailyMessages.every(d => d.inbound === 0 && d.outbound === 0) ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm flex-col gap-2">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <span>Message activity will appear here</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.dailyMessages} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f1623", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "12px" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Line type="monotone" dataKey="inbound" stroke="#f97316" strokeWidth={2} dot={false} name="Inbound" />
                <Line type="monotone" dataKey="outbound" stroke="#3b82f6" strokeWidth={2} dot={false} name="Outbound" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top services */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white mb-1">Top Services</div>
          <div className="text-[11px] text-slate-500 mb-5">By number of bookings</div>
          {data.topServices.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-slate-600 text-sm flex-col gap-2">
              <Briefcase className="w-8 h-8 opacity-30" />
              <span>No bookings yet</span>
            </div>
          ) : (
            <div className="space-y-3">
              {data.topServices.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-300 truncate">{s.name}</span>
                      <span className="text-[11px] text-slate-500 ml-3 shrink-0">{s.count} job{s.count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${(s.count / maxTopService) * 100}%` }}
                      />
                    </div>
                  </div>
                  {s.revenue > 0 && (
                    <div className="text-[11px] text-emerald-400 font-semibold shrink-0">${s.revenue.toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client growth */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="text-sm font-semibold text-white mb-1">New Clients</div>
          <div className="text-[11px] text-slate-500 mb-5">Per month, last 6 months</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.clientGrowth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f1623", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "12px" }}
                labelStyle={{ color: "#94a3b8" }}
                itemStyle={{ color: "#8b5cf6" }}
                formatter={(v: number) => [v, "New clients"]}
              />
              <Bar dataKey="clients" fill="url(#clientGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <defs>
                <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
