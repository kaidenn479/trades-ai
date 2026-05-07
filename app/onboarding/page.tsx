"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, CheckCircle, Zap, Shield, Users, ArrowRight, Star } from "lucide-react";

type Plan = "starter" | "pro" | "business";

const PLANS: {
  id: Plan;
  name: string;
  price: number;
  desc: string;
  features: string[];
  highlight: boolean;
  badge?: string;
  icon: React.ElementType;
  iconColor: string;
}[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    desc: "Perfect for solo technicians just getting started.",
    icon: Wrench,
    iconColor: "from-slate-500 to-slate-600",
    highlight: false,
    features: [
      "Up to 50 conversations/mo",
      "Online booking page",
      "Job scheduling & calendar",
      "Client management",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    desc: "For growing businesses that need the full toolkit.",
    icon: Zap,
    iconColor: "from-orange-500 to-amber-500",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited conversations",
      "Everything in Starter",
      "Online payments (Stripe)",
      "Revenue analytics dashboard",
      "Custom brand color",
      "Custom AI personality",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 199,
    desc: "Multi-tech teams and established companies.",
    icon: Users,
    iconColor: "from-violet-500 to-purple-600",
    highlight: false,
    features: [
      "Everything in Pro",
      "Up to 10 technicians",
      "Custom branding",
      "Calendar integrations",
      "Dedicated onboarding",
      "Phone support",
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function choosePlan(plan: Plan) {
    setSelected(plan);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Something went wrong");
        setLoading(false);
        setSelected(null);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
      setSelected(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-start px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.14), transparent)" }}
      />

      {/* Header */}
      <div className="relative text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4 shadow-lg shadow-orange-500/30">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Choose your plan</h1>
        <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">
          Start your <span className="text-orange-400 font-semibold">14-day free trial</span> — no credit card required.
          You can upgrade or downgrade any time.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          {["14-day free trial", "No credit card", "Cancel any time"].map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="relative mb-6 w-full max-w-4xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {PLANS.map(({ id, name, price, desc, features, highlight, badge, icon: Icon, iconColor }) => {
          const isSelected = selected === id;
          const isLoading = loading && isSelected;

          return (
            <div
              key={id}
              className={`relative rounded-2xl border p-7 transition-all ${
                highlight
                  ? "bg-slate-900 border-slate-700 shadow-2xl md:scale-105"
                  : "bg-[#111827] border-white/5 shadow-lg"
              } ${isSelected ? "ring-2 ring-orange-500" : ""}`}
            >
              {/* Badge */}
              {badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-md shadow-orange-500/30">
                  {badge}
                </div>
              )}

              {/* Icon + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={`text-sm font-bold ${highlight ? "text-orange-400" : "text-slate-300"}`}>{name}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-extrabold text-white">${price}</span>
                    <span className="text-xs text-slate-500 mb-0.5">/mo</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-5 leading-relaxed">{desc}</p>

              {/* CTA */}
              <button
                onClick={() => choosePlan(id)}
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold mb-6 transition-all flex items-center justify-center gap-2 ${
                  highlight
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-lg shadow-orange-500/20"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                } disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                    </svg>
                    Setting up...
                  </>
                ) : (
                  <>Start Free Trial <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {/* Features */}
              <ul className="space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${highlight ? "text-orange-400" : "text-emerald-500"}`} />
                    <span className="text-xs text-slate-400 leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="relative text-xs text-slate-600 mt-8 text-center max-w-sm">
        Not sure which plan is right for you? Start with Starter — you can always upgrade later from your dashboard.
      </p>
    </div>
  );
}
