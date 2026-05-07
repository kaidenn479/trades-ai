import Link from "next/link";
import {
  Wrench, Zap, Droplets, Flame, Phone, Clock, CheckCircle,
  MessageSquare, Calendar, Star, ArrowRight, Shield, Users,
  ChevronRight, BadgeCheck, Lock, TrendingUp, Smartphone,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Nav />
      <Hero />
      <LogoBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">Trades AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {[["Features", "#features"], ["How it Works", "#how-it-works"], ["Pricing", "#pricing"]].map(([label, href]) => (
            <a key={label} href={href} className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">Sign in</Link>
          <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold rounded-xl shadow-md shadow-orange-200 transition-all">
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/60 via-white to-white pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-orange-100/40 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-6 border border-orange-200">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            AI-Powered for HVAC & Home Service Pros
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6">
            Stop losing jobs<br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">to missed calls</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Trades AI texts and emails clients back instantly — answering questions, quoting services, and booking jobs 24/7. Built for HVAC techs, plumbers, and electricians.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold rounded-xl shadow-xl shadow-orange-200 transition-all text-base">
              Start Free — No Card Needed <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-base shadow-sm">
              See How It Works
            </a>
          </div>
          <p className="text-sm text-slate-400 mt-4">Set up in under 5 minutes · Cancel any time</p>
        </div>

        {/* Chat demo */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center gap-2 mx-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-500 font-medium">AI Assistant — Online</span>
              </div>
            </div>
            <div className="p-5 space-y-4 bg-white">
              <DemoBubble from="client" text="My AC isn't cooling and it's 97°F. Can someone come today?" />
              <DemoBubble from="ai" text="Absolutely! We have emergency AC service available today. We charge $89/hr and most repairs take 1–2 hours. Can I get your address and a time that works?" tag="Replied in 2s" />
              <DemoBubble from="client" text="555 Oak Dr, Orlando. Anytime after 1pm." />
              <DemoBubble from="ai" text="You're booked for 1:30 PM today at 555 Oak Dr! You'll get a text confirmation shortly. See you soon! 🙌" tag="Job booked" tagColor="orange" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-5">
            {[["2s", "Avg. reply time"], ["98%", "Jobs booked"], ["24/7", "Always on"]].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold text-slate-900">{val}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoBubble({ from, text, tag, tagColor = "green" }: { from: "client" | "ai"; text: string; tag?: string; tagColor?: "green" | "orange" }) {
  return (
    <div className={`flex ${from === "client" ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${from === "client" ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {tag && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold ${tagColor === "orange" ? "text-orange-500" : "text-emerald-600"}`}>
            <CheckCircle className="w-3 h-3" /> {tag}
          </div>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          from === "client"
            ? "bg-slate-800 text-white rounded-tr-sm"
            : "bg-orange-50 border border-orange-100 text-slate-800 rounded-tl-sm"
        }`}>{text}</div>
      </div>
    </div>
  );
}

// ── LOGO BAR ──────────────────────────────────────────────────────────────────
function LogoBar() {
  const trades = ["HVAC", "Plumbing", "Electrical", "Roofing", "Landscaping", "Carpentry", "Painting", "General"];
  return (
    <section className="py-10 border-y border-slate-100 bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Built for every trade</p>
        <div className="flex flex-wrap justify-center gap-3">
          {trades.map(t => (
            <span key={t} className="px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-medium text-slate-600 shadow-sm">{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FEATURES ──────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    { icon: MessageSquare, title: "Instant AI replies", desc: "Clients text or email — the AI responds in under 3 seconds with accurate pricing and availability. No more missed leads.", color: "bg-orange-100 text-orange-600" },
    { icon: Calendar,      title: "Auto job booking",  desc: "The AI confirms appointments, picks the time, and saves it to your dashboard. You show up ready to work.", color: "bg-violet-100 text-violet-600" },
    { icon: Clock,         title: "24/7 emergency service", desc: "Mark services as available around the clock. The AI handles emergency calls at 2am so you don't have to.", color: "bg-red-100 text-red-600" },
    { icon: Phone,         title: "SMS & email, unified", desc: "Connect your Twilio number and email. Every conversation appears in one clean inbox on your dashboard.", color: "bg-blue-100 text-blue-600" },
    { icon: TrendingUp,    title: "Revenue analytics", desc: "See jobs booked, revenue tracked, and which services are most popular — all updated in real time.", color: "bg-emerald-100 text-emerald-600" },
    { icon: Shield,        title: "Smart escalation",  desc: "Warranty disputes, insurance, or anything complex — the AI flags it for you instead of guessing.", color: "bg-amber-100 text-amber-600" },
    { icon: Smartphone,    title: "Mobile-first dashboard", desc: "Check your schedule, clients, and bookings from your phone between jobs. No desktop required.", color: "bg-cyan-100 text-cyan-600" },
    { icon: BadgeCheck,    title: "Your voice, your brand", desc: "Set your AI's tone, add your bio and FAQs. It sounds exactly like you — professional and on-brand.", color: "bg-pink-100 text-pink-600" },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-4 border border-slate-200">Features</div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Everything you need to close more jobs</h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">Stop losing leads to voicemail. Trades AI handles the front line while you focus on the work.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-2">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: "01", title: "Create your profile",    desc: "Sign up, choose your trade, add your license number and service area. Done in 2 minutes." },
    { num: "02", title: "Add your services",       desc: "List what you offer — AC repair, furnace install, drain cleaning — with flat, hourly, or free estimate pricing." },
    { num: "03", title: "Connect your phone & email", desc: "Link your Twilio SMS number and email. The AI starts responding to clients immediately." },
    { num: "04", title: "Jobs come to you",        desc: "Clients get instant replies, book their own appointments, and you see everything on your dashboard." },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold mb-4 border border-slate-200">How it Works</div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Up and running in under 5 minutes</h2>
          <p className="text-lg text-slate-500">No IT team. No complicated setup. Just connect and go.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex gap-4 items-start">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md shadow-orange-200">
                {num}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
function Testimonials() {
  const reviews = [
    { name: "Marcus T.", trade: "HVAC Technician · Miami, FL",   text: "I used to miss 3–4 calls a day on the job. Now the AI handles every one and I show up to a full schedule.", avatar: "M" },
    { name: "Diane R.", trade: "Master Plumber · Austin, TX",    text: "It quoted my prices, scheduled the job, and the customer was already waiting when I arrived. Absolutely unreal.", avatar: "D" },
    { name: "Kevin S.", trade: "Electrician · Phoenix, AZ",      text: "My 5-star reviews went up because clients say I'm 'always responsive.' It's replying at midnight — I'm not.", avatar: "K" },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-4 border border-amber-200">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Trusted by pros
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Real results from real tradespeople</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(({ name, trade, text, avatar }) => (
            <div key={name} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-5">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{name}</div>
                  <div className="text-xs text-slate-400">{trade}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Starter", price: 49, desc: "Perfect for solo technicians just getting started.",
      features: ["AI SMS replies", "Up to 50 conversations/mo", "Job booking", "Customer booking page", "Email support"],
      cta: "Start Free Trial", highlight: false,
    },
    {
      name: "Pro", price: 99, desc: "For growing businesses that need the full toolkit.",
      features: ["Everything in Starter", "Unlimited conversations", "Payment collection", "Analytics dashboard", "Priority support", "Custom AI personality"],
      cta: "Start Free Trial", highlight: true,
    },
    {
      name: "Business", price: 199, desc: "Multi-tech teams and established HVAC companies.",
      features: ["Everything in Pro", "Up to 10 technicians", "Custom branding", "Calendar integrations", "Dedicated onboarding", "Phone support"],
      cta: "Contact Sales", highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold mb-4 border border-slate-200">Pricing</div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-slate-500">Start free for 14 days. No credit card required.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map(({ name, price, desc, features, cta, highlight }) => (
            <div key={name} className={`rounded-2xl border p-7 relative ${highlight ? "bg-slate-900 border-slate-800 shadow-2xl scale-105" : "bg-white border-slate-200 shadow-sm"}`}>
              {highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-md shadow-orange-200">
                  Most Popular
                </div>
              )}
              <div className={`text-sm font-semibold mb-1 ${highlight ? "text-orange-400" : "text-orange-600"}`}>{name}</div>
              <div className="flex items-end gap-1 mb-2">
                <span className={`text-4xl font-extrabold ${highlight ? "text-white" : "text-slate-900"}`}>${price}</span>
                <span className={`text-sm mb-1.5 ${highlight ? "text-slate-400" : "text-slate-400"}`}>/mo</span>
              </div>
              <p className={`text-sm mb-6 ${highlight ? "text-slate-400" : "text-slate-500"}`}>{desc}</p>
              <Link href="/register"
                className={`w-full block text-center py-2.5 rounded-xl text-sm font-semibold mb-7 transition-all ${
                  highlight
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-900/30"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}>
                {cta}
              </Link>
              <ul className="space-y-3">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${highlight ? "text-orange-400" : "text-emerald-500"}`} />
                    <span className={`text-sm ${highlight ? "text-slate-300" : "text-slate-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-slate-400 mt-8">
          All plans include a 14-day free trial. Compare that to an answering service at $800+/mo — with no AI, no booking, and no analytics.
        </p>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-200 p-14">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-200">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Ready to fill your schedule?</h2>
          <p className="text-slate-500 text-base mb-8 leading-relaxed">Join the HVAC techs and plumbers who never miss a job. Set up in 5 minutes.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold rounded-xl shadow-xl shadow-orange-200 transition-all text-base">
            Start Free — No Card Needed <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center justify-center gap-5 mt-6">
            {["14-day free trial", "No contracts", "Cancel any time"].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-slate-100 py-10 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <Wrench className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-800">Trades AI</span>
        </div>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Trades AI. Built for the pros who build everything else.</p>
        <div className="flex gap-6">
          {[["Sign In", "/login"], ["Register", "/register"], ["Pricing", "#pricing"]].map(([label, href]) => (
            <Link key={label} href={href} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">{label}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
