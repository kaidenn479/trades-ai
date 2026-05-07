"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  LayoutDashboard, Wrench, HelpCircle, Users, Calendar,
  Settings, LogOut, Plus, Trash2, Pencil,
  RefreshCw, CheckCircle, AlertCircle, Clock, X,
  ChevronRight, Zap, Droplets, Flame, ShieldCheck, ExternalLink,
  TrendingUp, CalendarOff, Bell, BarChart2,
} from "lucide-react";
import AnalyticsTab from "./analytics-tab";

type Technician = {
  id: string; name: string; email: string; phone: string | null;
  bio: string | null; timezone: string; tradeType: string;
  licenseNumber: string | null; serviceArea: string | null;
  emergencyService: boolean; aiPersonality: string | null;
  brandColor: string; plan: string;
  stripePublishableKey: string | null; stripeSecretKey: string | null;
  services: Service[]; faqs: FAQ[]; clients: Client[]; appointments: Appointment[];
};
type Service = {
  id: string; name: string; category: string; description: string | null;
  basePrice: number | null; priceType: string; estimatedHours: number | null;
  status: string; available247: boolean;
};
type FAQ = { id: string; question: string; answer: string };
type Client = { id: string; name: string | null; phone: string | null; email: string | null; messages: { content: string; createdAt: string; channel: string }[] };
type Appointment = { id: string; title: string; startTime: string; endTime: string; location: string | null; client: { name: string | null; phone: string | null; email: string | null } };
type BlockedSlot = { id: string; date: string; startTime: string | null; endTime: string | null; reason: string | null; allDay: boolean };
type Tab = "overview" | "analytics" | "services" | "faqs" | "clients" | "appointments" | "availability" | "settings";

const DAYS = ["mon","tue","wed","thu","fri","sat","sun"] as const;
const DAY_LABELS: Record<string, string> = { mon:"Monday", tue:"Tuesday", wed:"Wednesday", thu:"Thursday", fri:"Friday", sat:"Saturday", sun:"Sunday" };
type WeeklyHours = Record<string, { open: boolean; start: string; end: string }>;
const DEFAULT_HOURS: WeeklyHours = Object.fromEntries(
  DAYS.map(d => [d, { open: ["mon","tue","wed","thu","fri"].includes(d), start: "08:00", end: "17:00" }])
);

const NAV = [
  { id: "overview"     as Tab, label: "Overview",      icon: LayoutDashboard },
  { id: "analytics"    as Tab, label: "Analytics",     icon: BarChart2 },
  { id: "services"     as Tab, label: "Services",      icon: Wrench },
  { id: "availability" as Tab, label: "Availability",  icon: CalendarOff },
  { id: "appointments" as Tab, label: "Job Calls",     icon: Calendar },
  { id: "clients"      as Tab, label: "Clients",       icon: Users },
  { id: "faqs"         as Tab, label: "FAQs",          icon: HelpCircle },
  { id: "settings"     as Tab, label: "Settings",      icon: Settings },
];

const TRADE_ICONS: Record<string, typeof Wrench> = { HVAC: Flame, Plumbing: Droplets, Electrical: Zap, General: Wrench };
const CATEGORIES = ["HVAC","Plumbing","Electrical","General","Roofing","Carpentry","Painting","Landscaping"];

export default function Dashboard() {
  const router = useRouter();
  const [tech, setTech] = useState<Technician | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTech(); }, []);

  async function loadTech() {
    setLoading(true);
    const listRes = await fetch("/api/technicians");
    if (listRes.status === 401) { router.push("/login"); return; }
    const list = await listRes.json();
    if (!list[0]) { setLoading(false); return; }
    const res = await fetch(`/api/technicians/${list[0].id}`);
    setTech(await res.json());
    setLoading(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/30">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{animationDelay:"0ms"}} />
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{animationDelay:"150ms"}} />
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{animationDelay:"300ms"}} />
        </div>
      </div>
    </div>
  );

  if (!tech) return <div className="min-h-screen bg-[#07090f] flex items-center justify-center text-slate-400">No data found. <button onClick={() => router.push("/login")} className="ml-2 text-orange-400 underline">Login</button></div>;

  const TradeIcon = TRADE_ICONS[tech.tradeType] ?? Wrench;
  const initials = tech.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);

  return (
    <div className="min-h-screen bg-[#07090f] flex text-white font-sans">

      {/* ── SIDEBAR ── */}
      <aside className="w-[220px] shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0a0d15]" style={{position:"sticky",top:0,height:"100vh"}}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
              <TradeIcon className="w-4.5 h-4.5 text-white" style={{width:"18px",height:"18px"}} />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Trades AI</div>
              <div className="text-[10px] text-slate-500 tracking-wide">{tech.tradeType}</div>
            </div>
          </div>
        </div>

        {/* Booking link pill */}
        <div className="px-3 pb-3">
          <a href={`/book/${tech.id}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/15 transition-colors group">
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Booking Page</span>
            <ChevronRight className="w-3 h-3 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        <div className="mx-3 h-px bg-white/[0.05] mb-2" />

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-gradient-to-r from-orange-500/20 to-transparent text-orange-300 border border-orange-500/[0.15]"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}>
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-orange-400" : "group-hover:text-slate-300"}`} />
                <span>{label}</span>
                {active && <div className="ml-auto w-1 h-1 rounded-full bg-orange-400" />}
              </button>
            );
          })}
        </nav>

        <div className="mx-3 h-px bg-white/[0.05] mt-2" />

        {/* User card */}
        <div className="p-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs font-bold shrink-0 text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">{tech.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{tech.email}</div>
            </div>
            <button onClick={logout} className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5" title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
          {tech.emergencyService && (
            <div className="mt-1.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
              <span className="text-[10px] text-red-400 font-medium">24/7 Emergency On</span>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#07090f]/80 backdrop-blur-xl border-b border-white/[0.05] px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">{NAV.find(n => n.id === tab)?.label}</h1>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{pageSubtitle(tab, tech)}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
            <button onClick={loadTech} className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {tab === "overview"     && <OverviewTab tech={tech} setTab={setTab} />}
          {tab === "analytics"    && <AnalyticsTab />}
          {tab === "services"     && <ServicesTab tech={tech} onRefresh={loadTech} />}
          {tab === "faqs"         && <FAQsTab tech={tech} onRefresh={loadTech} />}
          {tab === "clients"      && <ClientsTab clients={tech.clients} />}
          {tab === "appointments" && <AppointmentsTab appointments={tech.appointments} onRefresh={loadTech} />}
          {tab === "availability" && <AvailabilityTab techId={tech.id} />}
          {tab === "settings"     && <SettingsTab tech={tech} onSave={loadTech} />}
        </div>
      </main>
    </div>
  );
}

function pageSubtitle(tab: Tab, tech: Technician): string {
  switch (tab) {
    case "overview":      return `Welcome back, ${tech.name.split(" ")[0]} — here's what's happening`;
    case "analytics":     return "Revenue, bookings, and conversation trends";
    case "services":      return "Manage the services you offer";
    case "faqs":          return "Common questions shown on your booking page";
    case "clients":       return "Customers who have reached out";
    case "appointments":  return "Upcoming and recent job calls";
    case "availability":  return "Set your working hours and block off time";
    case "settings":      return "Profile, trade type, and preferences";
  }
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────

function OverviewTab({ tech, setTab }: { tech: Technician; setTab: (t: Tab) => void }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());

  const jobsThisMonth = tech.appointments.filter(a => new Date(a.startTime) >= monthStart).length;
  const jobsThisWeek  = tech.appointments.filter(a => new Date(a.startTime) >= weekStart).length;
  const activeServices = tech.services.filter(s => s.status === "available").length;
  const services247    = tech.services.filter(s => s.available247).length;
  const estRevenue = tech.appointments.reduce((sum, a) => {
    const match = tech.services.find(s => a.title.toLowerCase().includes(s.name.toLowerCase()) && s.priceType === "flat" && s.basePrice);
    return sum + (match?.basePrice ?? 0);
  }, 0);

  const catCounts: Record<string, number> = {};
  tech.services.forEach(s => { catCounts[s.category] = (catCounts[s.category] ?? 0) + 1; });
  const maxCat = Math.max(...Object.values(catCounts), 1);
  const CAT_COLORS: Record<string, string> = { HVAC:"bg-red-500", Plumbing:"bg-blue-500", Electrical:"bg-yellow-500", General:"bg-slate-500", Roofing:"bg-amber-500", Landscaping:"bg-emerald-500", Painting:"bg-purple-500", Carpentry:"bg-orange-500" };

  const statCards = [
    { label:"Total Clients",   value:tech.clients.length,   sub:`${tech.clients.filter(c=>c.messages.length>0).length} with messages`, icon:Users,      grad:"from-blue-600 to-cyan-500",    glow:"shadow-blue-500/20",   ring:"border-blue-500/15"  },
    { label:"Jobs This Month", value:jobsThisMonth,          sub:`${jobsThisWeek} this week`,                                            icon:Calendar,   grad:"from-violet-600 to-purple-500", glow:"shadow-violet-500/20", ring:"border-violet-500/15"},
    { label:"Active Services", value:activeServices,         sub:`${services247} available 24/7`,                                        icon:Wrench,     grad:"from-orange-500 to-amber-400",  glow:"shadow-orange-500/20", ring:"border-orange-500/15"},
    { label:"Est. Revenue",    value:estRevenue>0?`$${estRevenue.toLocaleString()}`:"—", sub:"from upcoming jobs",                      icon:TrendingUp, grad:"from-emerald-600 to-teal-500",  glow:"shadow-emerald-500/20",ring:"border-emerald-500/15"},
  ];

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, sub, icon:Icon, grad, glow, ring }) => (
          <div key={label} className={`relative rounded-2xl border ${ring} bg-white/[0.03] p-5 overflow-hidden hover:bg-white/[0.05] transition-colors`}>
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${grad} opacity-[0.08] blur-xl -translate-y-4 translate-x-4`} />
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-4 shadow-lg ${glow}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
            <div className="text-xs font-medium text-slate-300 mt-0.5">{label}</div>
            <div className="text-[10px] text-slate-500 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Profile card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/25 text-white font-bold text-sm shrink-0">
              {tech.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
            </div>
            <div>
              <div className="font-semibold text-white text-sm">{tech.name}</div>
              <div className="text-[11px] text-slate-500">{tech.tradeType} · {tech.licenseNumber ? `Lic #${tech.licenseNumber}` : "No license"}</div>
            </div>
          </div>
          {tech.serviceArea && <div className="text-xs text-slate-400 mb-3 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-orange-400" />{tech.serviceArea}</div>}
          <div className="flex flex-wrap gap-2">
            {tech.emergencyService && <span className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-medium">24/7 Emergency</span>}
            <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">Licensed</span>
          </div>
          <button onClick={() => setTab("settings")} className="mt-4 w-full text-xs text-orange-400 hover:text-orange-300 py-1.5 rounded-lg hover:bg-orange-500/5 transition-colors">Edit Profile →</button>
        </div>

        {/* Services chart */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-widest">By Category</div>
            <button onClick={() => setTab("services")} className="text-[10px] text-orange-400 hover:text-orange-300">Manage →</button>
          </div>
          {Object.keys(catCounts).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-600">
              <Wrench className="w-5 h-5" />
              <span className="text-xs">No services yet</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(catCounts).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-16 text-[11px] text-slate-400 truncate">{cat}</div>
                  <div className="flex-1 bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${CAT_COLORS[cat] ?? "bg-slate-500"} transition-all duration-500`} style={{width:`${(count/maxCat)*100}%`}} />
                  </div>
                  <div className="text-[11px] text-slate-500 w-3 text-right tabular-nums">{count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Quick Actions</div>
          <div className="space-y-2">
            {[
              { label:"Add a Service",   tab:"services" as Tab,      icon:Wrench,     color:"text-orange-400 bg-orange-500/10 border-orange-500/20" },
              { label:"Add FAQ",         tab:"faqs" as Tab,           icon:HelpCircle, color:"text-blue-400 bg-blue-500/10 border-blue-500/20"       },
              { label:"Set Availability",tab:"availability" as Tab,   icon:CalendarOff,color:"text-violet-400 bg-violet-500/10 border-violet-500/20" },
              { label:"View Job Calls",  tab:"appointments" as Tab,   icon:Calendar,   color:"text-emerald-400 bg-emerald-500/10 border-emerald-500/20"},
            ].map(({ label, tab:t, icon:Icon, color }) => (
              <button key={label} onClick={() => setTab(t)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all hover:brightness-110 ${color}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />{label}
                <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent messages */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Recent Clients</div>
            <button onClick={() => setTab("clients")} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">View all →</button>
          </div>
          {tech.clients.filter(c => c.messages.length > 0).slice(0, 5).length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-600 text-sm">No messages yet</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {tech.clients.filter(c => c.messages.length > 0).slice(0, 5).map(c => (
                <div key={c.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-[11px] font-bold text-slate-300 shrink-0">
                    {(c.name ?? c.phone ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{c.name ?? c.phone ?? c.email ?? "Unknown"}</div>
                    <div className="text-[11px] text-slate-500 truncate">{c.messages[0].content}</div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wide shrink-0 ${c.messages[0].channel==="sms"?"bg-blue-500/15 text-blue-400":c.messages[0].channel==="web"?"bg-orange-500/15 text-orange-400":"bg-purple-500/15 text-purple-400"}`}>
                    {c.messages[0].channel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming jobs */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Upcoming Jobs</div>
            <button onClick={() => setTab("appointments")} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">View all →</button>
          </div>
          {tech.appointments.slice(0, 5).length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-600 text-sm">No upcoming jobs</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {tech.appointments.slice(0, 5).map(a => (
                <div key={a.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center shrink-0">
                    <Wrench className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{a.title}</div>
                    <div className="text-[11px] text-orange-400/80">{format(new Date(a.startTime),"MMM d 'at' h:mm a")}</div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold uppercase tracking-wide shrink-0">Conf.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SERVICES ──────────────────────────────────────────────────────────────────

function ServicesTab({ tech, onRefresh }: { tech: Technician; onRefresh: () => void }) {
  const blank = { name:"", category:"General", description:"", basePrice:"", priceType:"flat", estimatedHours:"", status:"available", available247:false };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaveError(null);
    try {
      const res = editing
        ? await fetch(`/api/services/${editing}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) })
        : await fetch("/api/services",             { method:"POST",  headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!res.ok) { const d = await res.json().catch(()=>({})); setSaveError(d.error ?? `Error ${res.status}`); setSaving(false); return; }
    } catch { setSaveError("Network error"); setSaving(false); return; }
    setSaving(false); setForm(blank); setEditing(null); setShowForm(false); onRefresh();
  }

  async function remove(id: string) {
    await fetch(`/api/services/${id}`, { method:"DELETE" }); onRefresh();
  }

  function startEdit(s: Service) {
    setEditing(s.id);
    setForm({ name:s.name, category:s.category, description:s.description??"", basePrice:s.basePrice!=null?String(s.basePrice):"", priceType:s.priceType, estimatedHours:s.estimatedHours!=null?String(s.estimatedHours):"", status:s.status, available247:s.available247 });
    setShowForm(true);
  }

  const PRICE_LABELS: Record<string,string> = { flat:"Flat Rate ($)", hourly:"Hourly Rate ($/hr)", estimate:"Free Estimate" };

  return (
    <div className="max-w-3xl space-y-4">
      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      )}

      {showForm && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-white">{editing ? "Edit Service" : "New Service"}</h3>
              <p className="text-xs text-slate-500 mt-0.5">This service will appear on your customer booking page</p>
            </div>
            <button onClick={() => { setShowForm(false); setEditing(null); setForm(blank); setSaveError(null); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={save} className="space-y-4">
            <DashField label="Service Name *" value={form.name} onChange={v => setForm({...form,name:v})} required placeholder="AC Tune-Up, Water Heater Install..." />
            <div className="grid grid-cols-2 gap-3">
              <DashSelect label="Category" value={form.category} onChange={v => setForm({...form,category:v})}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </DashSelect>
              <DashSelect label="Status" value={form.status} onChange={v => setForm({...form,status:v})}>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="seasonal">Seasonal</option>
              </DashSelect>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DashSelect label="Price Type" value={form.priceType} onChange={v => setForm({...form,priceType:v})}>
                <option value="flat">Flat Rate</option>
                <option value="hourly">Hourly</option>
                <option value="estimate">Free Estimate</option>
              </DashSelect>
              {form.priceType !== "estimate" && <DashField label={PRICE_LABELS[form.priceType]} value={form.basePrice} onChange={v => setForm({...form,basePrice:v})} placeholder="150" />}
            </div>
            <DashField label="Est. Duration (hours)" value={form.estimatedHours} onChange={v => setForm({...form,estimatedHours:v})} placeholder="2" />
            <div className="flex items-center justify-between py-2 px-1">
              <div>
                <div className="text-sm font-medium text-slate-200">24/7 Available</div>
                <div className="text-xs text-slate-500">Emergency / around-the-clock booking</div>
              </div>
              <Toggle checked={form.available247} onChange={v => setForm({...form,available247:v})} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form,description:e.target.value})}
                placeholder="What does this service include?"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 resize-none h-20 focus:outline-none focus:border-orange-500/40 focus:bg-white/[0.06] transition-all" />
            </div>
            {saveError && <ErrorBanner>{saveError}</ErrorBanner>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/20">
                {saving ? "Saving…" : editing ? "Save Changes" : "Add Service"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(blank); setSaveError(null); }}
                className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-sm rounded-xl transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {tech.services.length === 0
        ? <EmptyState icon={Wrench} title="No services yet" text="Add your first service and it'll appear on your customer booking page." cta="Add Service" onCta={() => setShowForm(true)} />
        : (
          <div className="space-y-3">
            {tech.services.map(s => (
              <div key={s.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.1] hover:bg-white/[0.04] transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white">{s.name}</span>
                      <CategoryBadge category={s.category} />
                      <ServiceStatusPill status={s.status} />
                      {s.available247 && <span className="text-[10px] px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/20 font-medium">24/7</span>}
                    </div>
                    <div className="text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent mt-1">
                      {s.priceType==="estimate" ? "Free Estimate" : s.basePrice!=null ? `$${s.basePrice.toLocaleString()}${s.priceType==="hourly"?"/hr":" flat"}` : "Call for pricing"}
                    </div>
                    {s.estimatedHours && <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> ~{s.estimatedHours}h estimated</div>}
                    {s.description && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.description}</p>}
                  </div>
                  <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconBtn icon={Pencil} onClick={() => startEdit(s)} />
                    <IconBtn icon={Trash2} onClick={() => remove(s.id)} danger />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ── FAQs ──────────────────────────────────────────────────────────────────────

function FAQsTab({ tech, onRefresh }: { tech: Technician; onRefresh: () => void }) {
  const [form, setForm] = useState({ question:"", answer:"" });
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch("/api/faqs", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    setSaving(false); setForm({ question:"", answer:"" }); onRefresh();
  }

  async function remove(id: string) { await fetch(`/api/faqs/${id}`, { method:"DELETE" }); onRefresh(); }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h3 className="font-semibold text-white mb-1">Add a FAQ</h3>
        <p className="text-xs text-slate-500 mb-4">These appear on your customer booking page as an accordion.</p>
        <form onSubmit={save} className="space-y-3">
          <DashField label="Question *" value={form.question} onChange={v => setForm({...form,question:v})} required placeholder="Do you offer weekend appointments?" />
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 block">Answer *</label>
            <textarea value={form.answer} onChange={e => setForm({...form,answer:e.target.value})} required
              placeholder="Yes, we offer Saturday appointments from 8am–2pm…"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 resize-none h-20 focus:outline-none focus:border-orange-500/40 focus:bg-white/[0.06] transition-all" />
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/20">
            <Plus className="w-4 h-4" />{saving ? "Adding…" : "Add FAQ"}
          </button>
        </form>
      </div>

      {tech.faqs.length === 0
        ? <EmptyState icon={HelpCircle} title="No FAQs yet" text="Add the questions clients ask most often." />
        : (
          <div className="space-y-2">
            {tech.faqs.map(f => (
              <div key={f.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.1] transition-colors flex gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200">{f.question}</div>
                  <div className="text-sm text-slate-400 mt-1 leading-relaxed">{f.answer}</div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <IconBtn icon={Trash2} onClick={() => remove(f.id)} danger />
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ── CLIENTS ───────────────────────────────────────────────────────────────────

function ClientsTab({ clients }: { clients: Client[] }) {
  return (
    <div className="max-w-3xl space-y-3">
      {clients.length === 0
        ? <EmptyState icon={Users} title="No clients yet" text="Clients appear here when they submit a booking or quote request." />
        : clients.map(c => (
          <div key={c.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.1] transition-colors flex items-start gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/[0.06] flex items-center justify-center text-sm font-bold text-orange-300 shrink-0">
              {(c.name ?? c.phone ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 text-sm">{c.name ?? "Unknown"}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.phone}{c.phone && c.email ? " · " : ""}{c.email}</div>
              {c.messages[0] && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{c.messages[0].content}</p>}
            </div>
            {c.messages[0] && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wide shrink-0 ${c.messages[0].channel==="sms"?"bg-blue-500/15 text-blue-400":c.messages[0].channel==="web"?"bg-orange-500/15 text-orange-400":"bg-purple-500/15 text-purple-400"}`}>
                {c.messages[0].channel}
              </span>
            )}
          </div>
        ))
      }
    </div>
  );
}

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────

function AppointmentsTab({ appointments, onRefresh }: { appointments: Appointment[]; onRefresh: () => void }) {
  return (
    <div className="max-w-3xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">{appointments.length} upcoming</div>
        <button onClick={onRefresh} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-colors">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>
      {appointments.length === 0
        ? <EmptyState icon={Calendar} title="No upcoming jobs" text="Jobs appear here once customers book through your booking page." />
        : appointments.map(a => (
          <div key={a.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.1] transition-colors flex items-start justify-between gap-4">
            <div className="flex gap-4 items-start flex-1 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100">{a.title}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span className="text-sm text-orange-300">{format(new Date(a.startTime), "EEEE, MMM d 'at' h:mm a")}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">{a.client.name ?? a.client.phone ?? a.client.email ?? "Unknown client"}</div>
                {a.location && <div className="text-xs text-slate-500 mt-0.5">{a.location}</div>}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> Confirmed
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ── AVAILABILITY ──────────────────────────────────────────────────────────────

function AvailabilityTab({ techId }: { techId: string }) {
  const [hours, setHours] = useState<WeeklyHours>(DEFAULT_HOURS);
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [blockForm, setBlockForm] = useState({ date:"", startTime:"", endTime:"", reason:"", allDay:true });
  const [addingBlock, setAddingBlock] = useState(false);
  const [blockSaving, setBlockSaving] = useState(false);
  const [loadError, setLoadError] = useState<string|null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/availability").then(r => r.json()),
      fetch("/api/availability/blocked").then(r => r.json()),
    ]).then(([avail, slots]) => {
      if (avail.weeklyHours) { try { setHours(JSON.parse(avail.weeklyHours)); } catch {} }
      if (Array.isArray(slots)) setBlocked(slots);
    }).catch(() => setLoadError("Failed to load availability"));
  }, [techId]);

  async function saveHours() {
    setSaving(true); setSaved(false);
    await fetch("/api/availability", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ weeklyHours: hours }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  async function addBlock(e: React.FormEvent) {
    e.preventDefault(); setBlockSaving(true);
    const res = await fetch("/api/availability/blocked", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(blockForm) });
    if (res.ok) {
      const slot = await res.json();
      setBlocked(b => [...b, slot]);
      setBlockForm({ date:"", startTime:"", endTime:"", reason:"", allDay:true });
      setAddingBlock(false);
    }
    setBlockSaving(false);
  }

  async function removeBlock(id: string) {
    await fetch(`/api/availability/blocked/${id}`, { method:"DELETE" });
    setBlocked(b => b.filter(s => s.id !== id));
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-3xl space-y-5">

      {loadError && <ErrorBanner>{loadError}</ErrorBanner>}

      {/* Weekly hours */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-white">Weekly Hours</h3>
            <p className="text-xs text-slate-500 mt-0.5">Set the days and times you&apos;re available for jobs</p>
          </div>
          <button onClick={saveHours} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/20">
            {saved ? <><CheckCircle className="w-3.5 h-3.5" /> Saved!</> : saving ? "Saving…" : "Save Hours"}
          </button>
        </div>

        <div className="space-y-2">
          {DAYS.map(day => {
            const h = hours[day] ?? { open:false, start:"08:00", end:"17:00" };
            return (
              <div key={day} className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${h.open ? "border-orange-500/15 bg-orange-500/[0.04]" : "border-white/[0.05] bg-white/[0.02]"}`}>
                <Toggle checked={h.open} onChange={v => setHours(prev => ({...prev, [day]:{...h, open:v}}))} />
                <div className={`w-24 text-sm font-medium transition-colors ${h.open?"text-slate-200":"text-slate-600"}`}>{DAY_LABELS[day]}</div>
                {h.open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={h.start}
                      onChange={e => setHours(prev => ({...prev,[day]:{...h,start:e.target.value}}))}
                      className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-all w-32" />
                    <span className="text-slate-500 text-sm">to</span>
                    <input type="time" value={h.end}
                      onChange={e => setHours(prev => ({...prev,[day]:{...h,end:e.target.value}}))}
                      className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-all w-32" />
                    <div className="ml-auto text-xs text-slate-500">
                      {(() => {
                        const [sh,sm] = h.start.split(":").map(Number);
                        const [eh,em] = h.end.split(":").map(Number);
                        const hrs = ((eh*60+em)-(sh*60+sm))/60;
                        return hrs > 0 ? `${hrs}h` : "";
                      })()}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-600 flex-1">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked dates */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-white">Blocked Dates</h3>
            <p className="text-xs text-slate-500 mt-0.5">Vacation, appointments, or any time you&apos;re unavailable</p>
          </div>
          {!addingBlock && (
            <button onClick={() => setAddingBlock(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 text-xs font-medium rounded-xl transition-colors">
              <Plus className="w-3.5 h-3.5" /> Block Date
            </button>
          )}
        </div>

        {addingBlock && (
          <form onSubmit={addBlock} className="mb-5 p-4 rounded-xl border border-orange-500/15 bg-orange-500/[0.04] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 block">Date *</label>
                <input type="date" required min={today} value={blockForm.date} onChange={e => setBlockForm({...blockForm,date:e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-all" />
              </div>
              <DashField label="Reason (optional)" value={blockForm.reason} onChange={v => setBlockForm({...blockForm,reason:v})} placeholder="Vacation, personal, etc." />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-medium text-slate-200">All day</div>
                <div className="text-xs text-slate-500">Block the entire day</div>
              </div>
              <Toggle checked={blockForm.allDay} onChange={v => setBlockForm({...blockForm,allDay:v})} />
            </div>
            {!blockForm.allDay && (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 block">From</label>
                  <input type="time" value={blockForm.startTime} onChange={e => setBlockForm({...blockForm,startTime:e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-all" />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 block">To</label>
                  <input type="time" value={blockForm.endTime} onChange={e => setBlockForm({...blockForm,endTime:e.target.value})}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-all" />
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={blockSaving}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-all hover:from-orange-400 hover:to-amber-400">
                {blockSaving ? "Saving…" : "Block This Date"}
              </button>
              <button type="button" onClick={() => setAddingBlock(false)}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-sm rounded-xl transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {blocked.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-slate-600">
            <CalendarOff className="w-6 h-6" />
            <span className="text-sm">No blocked dates</span>
          </div>
        ) : (
          <div className="space-y-2">
            {blocked.map(s => {
              const d = new Date(s.date + "T12:00:00");
              const isPast = s.date < today;
              return (
                <div key={s.id} className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${isPast ? "border-white/[0.04] opacity-50" : "border-red-500/15 bg-red-500/[0.04]"}`}>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0">
                    <CalendarOff className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200">{format(d, "EEEE, MMMM d, yyyy")}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {s.allDay ? "All day" : `${s.startTime ?? ""} – ${s.endTime ?? ""}`}
                      {s.reason ? ` · ${s.reason}` : ""}
                      {isPast ? " · Past" : ""}
                    </div>
                  </div>
                  <button onClick={() => removeBlock(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────

function SettingsTab({ tech, onSave }: { tech: Technician; onSave: () => void }) {
  const [form, setForm] = useState({
    name:tech.name, bio:tech.bio??"", phone:tech.phone??"",
    timezone:tech.timezone, tradeType:tech.tradeType,
    licenseNumber:tech.licenseNumber??"", serviceArea:tech.serviceArea??"",
    emergencyService:tech.emergencyService, aiPersonality:tech.aiPersonality??"",
    smtpHost:"", smtpPort:"587", smtpUser:"", smtpPass:"",
    brandColor: tech.brandColor ?? "#f97316",
    stripePublishableKey: "", stripeSecretKey: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch(`/api/technicians/${tech.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); onSave();
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-4">
      <SettingsCard title="Profile">
        <DashField label="Full Name" value={form.name} onChange={v => setForm({...form,name:v})} />
        <DashField label="Bio" value={form.bio} onChange={v => setForm({...form,bio:v})} placeholder="Licensed HVAC tech with 15 years experience…" />
        <DashField label="Phone (Twilio number)" value={form.phone} onChange={v => setForm({...form,phone:v})} placeholder="+15551234567" />
        <DashField label="Timezone" value={form.timezone} onChange={v => setForm({...form,timezone:v})} placeholder="America/New_York" />
      </SettingsCard>

      <SettingsCard title="Trade Info">
        <DashSelect label="Trade Type" value={form.tradeType} onChange={v => setForm({...form,tradeType:v})}>
          {["HVAC","Plumbing","Electrical","General","Roofing","Carpentry","Painting","Landscaping"].map(t => <option key={t} value={t}>{t}</option>)}
        </DashSelect>
        <DashField label="License Number" value={form.licenseNumber} onChange={v => setForm({...form,licenseNumber:v})} placeholder="LIC-123456" />
        <DashField label="Service Area" value={form.serviceArea} onChange={v => setForm({...form,serviceArea:v})} placeholder="Miami-Dade County, Broward County" />
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-slate-200">24/7 Emergency Service</div>
            <div className="text-xs text-slate-500 mt-0.5">Shows the emergency badge on your booking page</div>
          </div>
          <Toggle checked={form.emergencyService} onChange={v => setForm({...form,emergencyService:v})} />
        </div>
      </SettingsCard>

      <SettingsCard title="Branding" subtitle="Customize how your customer booking page looks.">
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2 block">Brand Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={form.brandColor} onChange={e => setForm({...form, brandColor: e.target.value})}
              className="w-10 h-10 rounded-xl border border-white/[0.08] bg-transparent cursor-pointer p-0.5" />
            <div className="flex gap-2 flex-wrap">
              {["#f97316","#3b82f6","#10b981","#8b5cf6","#ef4444","#ec4899","#0ea5e9","#14b8a6"].map(c => (
                <button key={c} type="button" onClick={() => setForm({...form, brandColor: c})}
                  style={{backgroundColor: c}}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${form.brandColor === c ? "border-white scale-110" : "border-transparent"}`} />
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">This color will be used on your customer booking page buttons and accents.</p>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2 block">Your Booking Link</label>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl">
            <span className="text-sm text-slate-300 flex-1 font-mono truncate">/book/{tech.id}</span>
            <a href={`/book/${tech.id}`} target="_blank" rel="noreferrer" className="text-orange-400 hover:text-orange-300 transition-colors shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Stripe Payments" subtitle="Your customers pay directly into your Stripe account. Get your keys at dashboard.stripe.com → Developers → API Keys.">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 mb-1">
          <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-300 leading-relaxed">
            Money goes <strong>directly to you</strong> — Trades AI never touches your payments. Your Stripe secret key is encrypted and never exposed to customers.
          </p>
        </div>
        <DashField
          label="Publishable Key (pk_live_... or pk_test_...)"
          value={form.stripePublishableKey}
          onChange={v => setForm({...form, stripePublishableKey: v})}
          placeholder="Starts with pk_live_ or pk_test_"
        />
        <DashField
          label="Secret Key (sk_live_... or sk_test_...)"
          type="password"
          value={form.stripeSecretKey}
          onChange={v => setForm({...form, stripeSecretKey: v})}
          placeholder="Starts with sk_live_ or sk_test_"
        />
        {(tech.stripePublishableKey || tech.stripeSecretKey) && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle className="w-3.5 h-3.5" /> Stripe is connected — customers can pay on your booking page
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Email (SMTP)" subtitle="Used to send appointment confirmations. Gmail: host smtp.gmail.com, port 587, use an App Password.">
        <div className="grid grid-cols-2 gap-3">
          <DashField label="SMTP Host" value={form.smtpHost} onChange={v => setForm({...form,smtpHost:v})} placeholder="smtp.gmail.com" />
          <DashField label="Port" value={form.smtpPort} onChange={v => setForm({...form,smtpPort:v})} placeholder="587" />
        </div>
        <DashField label="Email Address" type="email" value={form.smtpUser} onChange={v => setForm({...form,smtpUser:v})} />
        <DashField label="App Password" type="password" value={form.smtpPass} onChange={v => setForm({...form,smtpPass:v})} />
      </SettingsCard>

      <button type="submit" disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all">
        {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : saving ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

function SettingsCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function DashField({ label, value, onChange, type="text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/40 focus:bg-white/[0.06] transition-all" />
    </div>
  );
}

function DashSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/40 transition-all appearance-none">
        {children}
      </select>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${checked ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/30" : "bg-white/10"}`}>
      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200 shadow-sm ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
}

function EmptyState({ icon:Icon, title, text, cta, onCta }: { icon: typeof Wrench; title: string; text: string; cta?: string; onCta?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-white/[0.05] bg-white/[0.02]">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <div className="text-sm font-medium text-slate-300 mb-1">{title}</div>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">{text}</p>
      {cta && onCta && (
        <button onClick={onCta} className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold rounded-xl hover:from-orange-400 hover:to-amber-400 transition-all shadow-lg shadow-orange-500/20">
          {cta}
        </button>
      )}
    </div>
  );
}

function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
      <AlertCircle className="w-4 h-4 shrink-0" />{children}
    </div>
  );
}

const CATEGORY_COLORS: Record<string,string> = {
  HVAC:"bg-red-500/10 text-red-400 border-red-500/20", Plumbing:"bg-blue-500/10 text-blue-400 border-blue-500/20",
  Electrical:"bg-yellow-500/10 text-yellow-400 border-yellow-500/20", General:"bg-slate-500/10 text-slate-400 border-slate-500/20",
  Roofing:"bg-amber-500/10 text-amber-400 border-amber-500/20", Carpentry:"bg-orange-500/10 text-orange-400 border-orange-500/20",
  Painting:"bg-purple-500/10 text-purple-400 border-purple-500/20", Landscaping:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};
function CategoryBadge({ category }: { category: string }) {
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[category]??CATEGORY_COLORS.General}`}>{category}</span>;
}
function ServiceStatusPill({ status }: { status: string }) {
  const s: Record<string,string> = { available:"bg-emerald-500/10 text-emerald-400 border-emerald-500/20", unavailable:"bg-slate-500/10 text-slate-400 border-slate-500/20", seasonal:"bg-amber-500/10 text-amber-400 border-amber-500/20" };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${s[status]??s.unavailable}`}>{status}</span>;
}
function IconBtn({ icon:Icon, onClick, danger }: { icon: typeof Pencil; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${danger?"text-slate-600 hover:text-red-400 hover:bg-red-500/10":"text-slate-600 hover:text-slate-300 hover:bg-white/5"}`}>
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
