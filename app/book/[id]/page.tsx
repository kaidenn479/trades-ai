"use client";

import { useEffect, useState, use } from "react";
import {
  Wrench, Flame, Droplets, Zap, Clock, CheckCircle, Calendar,
  CreditCard, User, Phone, Mail, MapPin, Shield, Star, ChevronRight,
  ArrowLeft, BadgeCheck, Lock, AlertCircle, ChevronDown,
} from "lucide-react";

type Service = {
  id: string; name: string; category: string; description: string | null;
  basePrice: number | null; priceType: string; estimatedHours: number | null;
  available247: boolean;
};
type BlockedSlot = {
  id: string; date: string; startTime: string | null; endTime: string | null;
  reason: string | null; allDay: boolean;
};
type WeeklyHours = Record<string, { open: boolean; start: string; end: string }>;
type Tech = {
  id: string; name: string; phone: string | null; bio: string | null;
  tradeType: string; licenseNumber: string | null; serviceArea: string | null;
  emergencyService: boolean; services: Service[];
  faqs: { id: string; question: string; answer: string }[];
  weeklyHours: string | null;
  blockedSlots: BlockedSlot[];
};
type Tab = "services" | "schedule" | "payment" | "confirmed";

const DEMO_SERVICES: Service[] = [
  { id: "d1", name: "AC Tune-Up & Inspection",      category: "HVAC",     description: "Full system check, filter replacement, coil cleaning, refrigerant level check, and efficiency report.", basePrice: 89,  priceType: "flat",     estimatedHours: 1.5, available247: false },
  { id: "d2", name: "Emergency AC Repair",           category: "HVAC",     description: "Same-day diagnosis and repair for non-cooling units. Includes parts assessment and labor.", basePrice: 89, priceType: "hourly",   estimatedHours: 2,   available247: true  },
  { id: "d3", name: "Furnace Installation",          category: "HVAC",     description: "Full furnace replacement including haul-away of old unit, new installation, and system test.", basePrice: 1200, priceType: "flat",   estimatedHours: 4,   available247: false },
  { id: "d4", name: "Air Quality Assessment",        category: "HVAC",     description: "Comprehensive indoor air quality test including humidity, dust, allergens, and ventilation review.", basePrice: null, priceType: "estimate", estimatedHours: 1,  available247: false },
  { id: "d5", name: "Drain Cleaning",               category: "Plumbing", description: "Clear clogged kitchen, bathroom, or main sewer drains using professional equipment.", basePrice: 149, priceType: "flat",     estimatedHours: 1,   available247: false },
  { id: "d6", name: "Water Heater Installation",    category: "Plumbing", description: "Remove old unit, install new water heater, test pressure and temperature, and clean workspace.", basePrice: 650, priceType: "flat",    estimatedHours: 3,   available247: false },
];

const DEMO_FAQS = [
  { id: "f1", question: "Do you offer same-day service?", answer: "Yes! We offer same-day appointments for most services. Emergency AC repair is available 24/7." },
  { id: "f2", question: "Are you licensed and insured?", answer: "Absolutely. We are fully licensed, bonded, and insured for your peace of mind." },
  { id: "f3", question: "What payment methods do you accept?", answer: "We accept all major credit/debit cards, as well as cash and check on the day of service." },
  { id: "f4", question: "Do you offer a warranty?",         answer: "All labor comes with a 90-day warranty. Parts warranties depend on the manufacturer." },
];

const CAT_STYLE: Record<string, { bg: string; border: string; text: string; badge: string; icon: typeof Wrench }> = {
  HVAC:       { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-600",    badge: "bg-red-100 text-red-600 border-red-200",    icon: Flame    },
  Plumbing:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-600",   badge: "bg-blue-100 text-blue-600 border-blue-200",   icon: Droplets },
  Electrical: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Zap },
  General:    { bg: "bg-slate-50",  border: "border-slate-200",  text: "text-slate-600",  badge: "bg-slate-100 text-slate-600 border-slate-200",  icon: Wrench  },
  Roofing:    { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700 border-amber-200",  icon: Wrench  },
  Landscaping:{ bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",badge: "bg-emerald-100 text-emerald-700 border-emerald-200",icon: Wrench },
};

const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;
const ALL_TIME_SLOTS = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"];

function getNextDays(n: number) {
  return Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d; });
}

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function slotTo24h(slot: string): number {
  // "8:00 AM" -> 8, "1:00 PM" -> 13
  const [time, ampm] = slot.split(" ");
  let [h] = time.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h;
}

function isDayBlocked(date: Date, weeklyHours: WeeklyHours | null, blockedSlots: BlockedSlot[]): boolean {
  const dayKey = DAY_KEYS[date.getDay()];
  // Check weekly hours
  if (weeklyHours && weeklyHours[dayKey] && !weeklyHours[dayKey].open) return true;
  // Check all-day blocked slots
  const dateStr = toDateStr(date);
  if (blockedSlots.some(s => s.date === dateStr && s.allDay)) return true;
  return false;
}

function getAvailableSlots(date: Date, weeklyHours: WeeklyHours | null, blockedSlots: BlockedSlot[]): string[] {
  const dayKey = DAY_KEYS[date.getDay()];
  const dateStr = toDateStr(date);

  let startH = 8, endH = 17;
  if (weeklyHours && weeklyHours[dayKey]) {
    const [sh] = weeklyHours[dayKey].start.split(":").map(Number);
    const [eh] = weeklyHours[dayKey].end.split(":").map(Number);
    startH = sh;
    endH = eh;
  }

  // Partial blocks for this date
  const partialBlocks = blockedSlots.filter(s => s.date === dateStr && !s.allDay && s.startTime && s.endTime);

  return ALL_TIME_SLOTS.filter(slot => {
    const h = slotTo24h(slot);
    if (h < startH || h >= endH) return false;
    // Check if this hour overlaps a partial block
    for (const block of partialBlocks) {
      const [bsh] = (block.startTime as string).split(":").map(Number);
      const [beh] = (block.endTime as string).split(":").map(Number);
      if (h >= bsh && h < beh) return false;
    }
    return true;
  });
}

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tech, setTech] = useState<Tech | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [tab, setTab] = useState<Tab>("services");
  const [selected, setSelected] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [paying, setPaying] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [confirmationId] = useState(() => "JOB-" + Math.random().toString(36).slice(2,8).toUpperCase());
  const [quoteForm, setQuoteForm] = useState({ name: "", phone: "", email: "", serviceType: "", description: "", address: "" });
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  useEffect(() => {
    if (id === "demo") {
      setTech({ id: "demo", name: "Mike's HVAC & Plumbing", phone: "+15550001234", bio: "Family-owned HVAC and plumbing company serving the Orlando area for over 15 years. Licensed, bonded, and always on time.", tradeType: "HVAC", licenseNumber: "CAC1234567", serviceArea: "Orlando & surrounding areas", emergencyService: true, services: DEMO_SERVICES, faqs: DEMO_FAQS, weeklyHours: null, blockedSlots: [] });
      setIsDemo(true);
      setLoading(false);
      return;
    }
    fetch(`/api/public/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setTech({ id, name: "Demo Company", phone: null, bio: "Add services from your dashboard to display them here.", tradeType: "General", licenseNumber: null, serviceArea: null, emergencyService: false, services: DEMO_SERVICES, faqs: DEMO_FAQS, weeklyHours: null, blockedSlots: [] });
          setIsDemo(true);
        } else {
          setTech(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setTech({ id, name: "Demo Company", phone: null, bio: null, tradeType: "General", licenseNumber: null, serviceArea: null, emergencyService: false, services: DEMO_SERVICES, faqs: DEMO_FAQS, weeklyHours: null, blockedSlots: [] });
        setIsDemo(true);
        setLoading(false);
      });
  }, [id]);

  function pickService(s: Service) { setSelected(s); setTab("schedule"); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function confirmPayment(e: React.FormEvent) {
    e.preventDefault();
    setPaying(true);
    if (!isDemo && selected && selectedDate && selectedTime) {
      try {
        await fetch(`/api/public/${id}/book`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId: selected.id, serviceName: selected.name, date: selectedDate.toISOString(), time: selectedTime, contact }),
        });
      } catch { /* non-blocking */ }
    }
    await new Promise(r => setTimeout(r, 1600));
    setPaying(false);
    setTab("confirmed");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    setQuoteSending(true);
    setQuoteError(null);
    try {
      const res = await fetch(`/api/public/${id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quoteForm),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setQuoteError(d.error ?? "Something went wrong");
      } else {
        setQuoteSent(true);
        setQuoteForm({ name: "", phone: "", email: "", serviceType: "", description: "", address: "" });
      }
    } catch {
      setQuoteError("Network error — please try again");
    }
    setQuoteSending(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Loading...</span>
      </div>
    </div>
  );

  if (!tech) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center"><AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-slate-400">Page not found.</p></div>
    </div>
  );

  const CatIcon = CAT_STYLE[tech.tradeType]?.icon ?? Wrench;
  const completedSteps = tab === "services" ? [] : tab === "schedule" ? ["services"] : tab === "payment" ? ["services","schedule"] : ["services","schedule","payment"];
  const STEPS: { id: Tab; label: string }[] = [{ id:"services",label:"Services"},{id:"schedule",label:"Schedule"},{id:"payment",label:"Payment"},{id:"confirmed",label:"Confirmed"}];

  const parsedWeeklyHours: WeeklyHours | null = tech.weeklyHours ? JSON.parse(tech.weeklyHours) : null;
  const availableTimeSlots = selectedDate ? getAvailableSlots(selectedDate, parsedWeeklyHours, tech.blockedSlots) : [];

  const canPay = !!(selectedDate && selectedTime && contact.name && contact.phone);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Demo banner */}
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-700 font-medium">
          Preview mode — add services from your dashboard to show real data
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200">
              <CatIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight">{tech.name}</div>
              <div className="text-[11px] text-slate-400">{tech.tradeType} Professional{tech.serviceArea ? ` · ${tech.serviceArea}` : ""}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {tech.licenseNumber && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                <BadgeCheck className="w-3.5 h-3.5" /> Licensed
              </div>
            )}
            {tech.emergencyService && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> 24/7 Emergency
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-8">

        {/* Progress steps */}
        {tab !== "confirmed" && (
          <div className="flex items-center mb-8">
            {STEPS.filter(s => s.id !== "confirmed").map((s, i, arr) => {
              const active = tab === s.id;
              const done = completedSteps.includes(s.id);
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => done ? setTab(s.id) : undefined}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${active ? "text-orange-600" : done ? "text-slate-700 hover:text-orange-500 cursor-pointer" : "text-slate-400 cursor-default"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all ${
                      active ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
                      : done ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-white border-slate-300 text-slate-400"
                    }`}>
                      {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="hidden sm:block">{s.label}</span>
                  </button>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 rounded-full transition-colors ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── SERVICES ── */}
        {tab === "services" && (
          <div className="space-y-8">
            {/* About */}
            {(tech.bio || tech.serviceArea) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                  <CatIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  {tech.bio && <p className="text-sm text-slate-600 leading-relaxed">{tech.bio}</p>}
                  <div className="flex flex-wrap gap-3 mt-2">
                    {tech.serviceArea && <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="w-3 h-3" />{tech.serviceArea}</span>}
                    {tech.licenseNumber && <span className="flex items-center gap-1 text-xs text-slate-400"><BadgeCheck className="w-3 h-3" />License #{tech.licenseNumber}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[{icon:Shield,label:"Licensed & Insured",sub:"Verified credentials"},{icon:Star,label:"5-Star Rated",sub:"Trusted by hundreds"},{icon:BadgeCheck,label:"Background Checked",sub:"Safe for your home"}].map(({icon:Icon,label,sub})=>(
                <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800">{label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            {/* Services */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Our Services</h2>
              <p className="text-sm text-slate-500 mb-5">Select a service to book your appointment.</p>
              {tech.services.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No services listed yet</p>
                  <p className="text-slate-400 text-sm mt-1">Check back soon or call us directly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tech.services.map(s => {
                    const col = CAT_STYLE[s.category] ?? CAT_STYLE.General;
                    const Icon = col.icon;
                    const price = s.priceType === "estimate" ? "Free Estimate"
                      : s.basePrice != null ? `$${s.basePrice.toLocaleString()}${s.priceType === "hourly" ? "/hr" : " flat"}`
                      : "Call for pricing";
                    return (
                      <button key={s.id} onClick={() => pickService(s)} className="text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-orange-300 hover:-translate-y-0.5 transition-all group">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${col.bg} ${col.border} border`}>
                            <Icon className={`w-5 h-5 ${col.text}`} />
                          </div>
                          <div className="flex gap-1.5 flex-wrap justify-end">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${col.badge}`}>{s.category}</span>
                            {s.available247 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-600 font-semibold">24/7</span>}
                          </div>
                        </div>
                        <div className="font-bold text-slate-900 mb-1">{s.name}</div>
                        <div className={`text-base font-bold ${col.text} mb-2`}>{price}</div>
                        {s.estimatedHours && <div className="flex items-center gap-1 text-xs text-slate-400 mb-2"><Clock className="w-3 h-3" />~{s.estimatedHours}h</div>}
                        {s.description && <p className="text-xs text-slate-500 leading-relaxed mb-3">{s.description}</p>}
                        <div className="flex items-center gap-1 text-xs font-semibold text-orange-500 group-hover:gap-2 transition-all">
                          Book Now <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FAQs */}
            {tech.faqs.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-2">
                  {tech.faqs.map(f => (
                    <div key={f.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <button onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-semibold text-slate-800">{f.question}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openFaq === f.id ? "rotate-180" : ""}`} />
                      </button>
                      {openFaq === f.id && <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">{f.answer}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── GET A QUOTE ── */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Get a Free Quote</h3>
                  <p className="text-xs text-slate-500">Not sure which service you need? Describe your issue and we&apos;ll get back to you.</p>
                </div>
              </div>

              {quoteSent ? (
                <div className="mt-4 flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Quote request sent!</p>
                    <p className="text-sm text-slate-500 mt-1">We&apos;ll reach out shortly with pricing and availability.</p>
                  </div>
                  <button onClick={() => setQuoteSent(false)} className="text-sm text-orange-500 hover:text-orange-600 underline">Submit another request</button>
                </div>
              ) : (
                <form onSubmit={submitQuote} className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <QuoteLightField label="Your Name *" value={quoteForm.name} onChange={v => setQuoteForm({...quoteForm, name: v})} placeholder="John Smith" required />
                    <QuoteLightField label="Phone *" value={quoteForm.phone} onChange={v => setQuoteForm({...quoteForm, phone: v})} placeholder="+1 (555) 000-0000" required type="tel" />
                  </div>
                  <QuoteLightField label="Email" value={quoteForm.email} onChange={v => setQuoteForm({...quoteForm, email: v})} placeholder="you@example.com" type="email" />
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Service Type</label>
                    <select value={quoteForm.serviceType} onChange={e => setQuoteForm({...quoteForm, serviceType: e.target.value})}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all">
                      <option value="">Select a category…</option>
                      {tech.services.length > 0
                        ? [...new Set(tech.services.map(s => s.category))].map(c => <option key={c} value={c}>{c}</option>)
                        : ["HVAC", "Plumbing", "Electrical", "General", "Other"].map(c => <option key={c} value={c}>{c}</option>)
                      }
                      <option value="Other">Other / Not sure</option>
                    </select>
                  </div>
                  <QuoteLightField label="Service Address" value={quoteForm.address} onChange={v => setQuoteForm({...quoteForm, address: v})} placeholder="123 Main St, City, State" />
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">Describe the issue *</label>
                    <textarea value={quoteForm.description} onChange={e => setQuoteForm({...quoteForm, description: e.target.value})} required
                      placeholder="Tell us what's going on — the more detail, the more accurate our quote."
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none h-24 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                  </div>
                  {quoteError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />{quoteError}
                    </div>
                  )}
                  <button type="submit" disabled={quoteSending}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold rounded-xl shadow-md shadow-orange-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {quoteSending
                      ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Sending…</>
                      : <><Mail className="w-4 h-4"/>Request Free Quote</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {tab === "schedule" && (
          <div className="space-y-5">
            <button onClick={() => setTab("services")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to services
            </button>

            {/* Selected service pill */}
            {selected && (() => {
              const col = CAT_STYLE[selected.category] ?? CAT_STYLE.General;
              const price = selected.priceType === "estimate" ? "Free Estimate" : selected.basePrice != null ? `$${selected.basePrice.toLocaleString()}${selected.priceType==="hourly"?"/hr":""}` : "TBD";
              return (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${col.bg} ${col.border} border shrink-0`}>
                    <col.icon className={`w-4 h-4 ${col.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{selected.name}</div>
                    <div className="text-sm font-bold text-orange-600">{price}</div>
                  </div>
                  <button onClick={() => { setSelected(null); setTab("services"); }} className="text-xs text-slate-400 hover:text-slate-700 transition-colors underline">Change</button>
                </div>
              );
            })()}

            {/* Date */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500" />Choose a date</h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {getNextDays(14).map(d => {
                  const active = selectedDate?.toDateString() === d.toDateString();
                  const blocked = isDayBlocked(d, parsedWeeklyHours, tech.blockedSlots);
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => { if (!blocked) { setSelectedDate(d); setSelectedTime(null); } }}
                      disabled={blocked}
                      title={blocked ? "Not available" : undefined}
                      className={`rounded-xl p-2.5 text-center transition-all border ${
                        blocked
                          ? "bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed opacity-60"
                          : active
                            ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
                            : "bg-white border-slate-200 hover:border-orange-300 text-slate-700 hover:bg-orange-50"
                      }`}>
                      <div className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{d.toLocaleDateString("en-US",{weekday:"short"})}</div>
                      <div className="text-base font-bold mt-0.5">{d.getDate()}</div>
                      <div className="text-[10px] opacity-60">{d.toLocaleDateString("en-US",{month:"short"})}</div>
                      {blocked && <div className="text-[9px] mt-0.5 opacity-50">Unavailable</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time */}
            {selectedDate && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" />Choose a time</h3>
                {availableTimeSlots.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    No available times for this day. Please select another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {availableTimeSlots.map(t => (
                      <button key={t} onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          selectedTime === t
                            ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
                            : "bg-white border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50"
                        }`}>{t}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-orange-500" />Your information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LightField icon={User}  label="Full Name *"     value={contact.name}    onChange={v=>setContact({...contact,name:v})}    placeholder="John Smith"          required />
                  <LightField icon={Phone} label="Phone Number *"  value={contact.phone}   onChange={v=>setContact({...contact,phone:v})}   placeholder="+1 (555) 000-0000"   required type="tel" />
                </div>
                <LightField icon={Mail}   label="Email"           value={contact.email}   onChange={v=>setContact({...contact,email:v})}   placeholder="you@example.com"     type="email" />
                <LightField icon={MapPin} label="Service Address" value={contact.address} onChange={v=>setContact({...contact,address:v})} placeholder="123 Main St, City, State" />
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Notes (optional)</label>
                  <textarea value={contact.notes} onChange={e=>setContact({...contact,notes:e.target.value})} placeholder="Describe the issue or anything the technician should know..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 resize-none h-20 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
                </div>
              </div>
            </div>

            <button onClick={() => canPay && setTab("payment")} disabled={!canPay}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-base">
              Continue to Payment <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── PAYMENT ── */}
        {tab === "payment" && (
          <form onSubmit={confirmPayment} className="space-y-5">
            <button type="button" onClick={() => setTab("schedule")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to schedule
            </button>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Booking Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900">{selected?.name}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{selected?.category}</div>
                  </div>
                  <div className="font-bold text-orange-600">
                    {selected?.priceType==="estimate" ? "Free Estimate" : selected?.basePrice != null ? `$${selected.basePrice.toLocaleString()}${selected.priceType==="hourly"?"/hr":""}` : "TBD"}
                  </div>
                </div>
                {[
                  { icon: Calendar, label: "Date",    value: selectedDate?.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}) },
                  { icon: Clock,    label: "Time",    value: selectedTime },
                  { icon: User,     label: "Name",    value: contact.name },
                  { icon: Phone,    label: "Phone",   value: contact.phone },
                  { icon: MapPin,   label: "Address", value: contact.address || "Confirm on day of service" },
                ].map(({icon:Icon,label,value}) => value && (
                  <div key={label} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-400"><Icon className="w-3.5 h-3.5" />{label}</span>
                    <span className="text-slate-800 font-medium text-right max-w-[55%]">{value}</span>
                  </div>
                ))}

                {selected?.priceType !== "estimate" && selected?.basePrice != null && (
                  <>
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <div className="flex justify-between text-slate-500"><span>Service fee</span><span>${selected.basePrice.toLocaleString()}</span></div>
                      <div className="flex justify-between text-slate-500"><span>Booking deposit (20%)</span><span>${(selected.basePrice*0.2).toFixed(2)}</span></div>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-3">
                      <span>Due today</span>
                      <span className="text-orange-600">${(selected.basePrice*0.2).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-400">Remaining balance due day of service.</p>
                  </>
                )}
                {selected?.priceType === "estimate" && (
                  <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-3">
                    <span>Due today</span><span className="text-emerald-600">$0.00</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card */}
            {selected?.priceType !== "estimate" && selected?.basePrice != null && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2"><CreditCard className="w-4 h-4 text-orange-500"/>Payment Details</h3>
                <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5"><Lock className="w-3 h-3"/>256-bit SSL encryption</p>
                <div className="space-y-3">
                  <LightField icon={User} label="Cardholder Name" value={card.name} onChange={v=>setCard({...card,name:v})} placeholder="John Smith" required />
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input value={card.number} onChange={e=>setCard({...card,number:e.target.value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim()})}
                        placeholder="1234 5678 9012 3456" required maxLength={19}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 font-mono tracking-widest transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Expiry</label>
                      <input value={card.expiry} onChange={e=>setCard({...card,expiry:e.target.value.replace(/\D/g,"").slice(0,4).replace(/^(\d{2})(\d)/,"$1/$2")})}
                        placeholder="MM/YY" required maxLength={5}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 font-mono transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">CVV</label>
                      <input value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value.replace(/\D/g,"").slice(0,4)})}
                        placeholder="123" required maxLength={4}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 font-mono transition-all" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  {["VISA","MC","AMEX","DISC"].map(b=>(
                    <div key={b} className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500">{b}</div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={paying}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 disabled:opacity-60 transition-all flex items-center justify-center gap-2 text-base">
              {paying
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Processing...</>
                : selected?.priceType === "estimate"
                ? <><CheckCircle className="w-4 h-4"/>Confirm Booking</>
                : <><Lock className="w-4 h-4"/>Pay & Confirm Booking</>
              }
            </button>
            <p className="text-center text-xs text-slate-400">Full refund if cancelled 24+ hours before service.</p>
          </form>
        )}

        {/* ── CONFIRMED ── */}
        {tab === "confirmed" && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re all booked!</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                {tech.name} will be there on time. {contact.phone && "You'll receive a text confirmation shortly."}
              </p>
            </div>

            <div className="max-w-sm mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="font-bold text-slate-900">{selected?.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{tech.name}</div>
                </div>
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Confirmed
                </div>
              </div>
              <div className="text-xs text-slate-400 font-mono">{confirmationId}</div>
              {[
                {icon:Calendar,label:"Date",    value:selectedDate?.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})},
                {icon:Clock,   label:"Time",    value:selectedTime},
                {icon:User,    label:"Name",    value:contact.name},
                {icon:Phone,   label:"Phone",   value:contact.phone},
                {icon:MapPin,  label:"Address", value:contact.address},
              ].filter(r=>r.value).map(({icon:Icon,label,value})=>(
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div><div className="text-xs text-slate-400">{label}</div><div className="text-sm font-semibold text-slate-900">{value}</div></div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={()=>{setTab("services");setSelected(null);setSelectedDate(null);setSelectedTime(null);setContact({name:"",phone:"",email:"",address:"",notes:""});setCard({number:"",expiry:"",cvv:"",name:""});}}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                Book Another Service
              </button>
              {tech.phone && (
                <a href={`tel:${tech.phone}`} className="px-6 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-400 transition-colors flex items-center gap-2 justify-center shadow-md shadow-orange-200">
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LightField({ icon: Icon, label, value, onChange, placeholder, required, type = "text" }: {
  icon: typeof User; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
          className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
      </div>
    </div>
  );
}

function QuoteLightField({ label, value, onChange, placeholder, required, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all" />
    </div>
  );
}
