"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Wrench, CheckCircle } from "lucide-react";

type Screen = "auth" | "forgot" | "forgot-sent";

function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [mode, setMode] = useState<"login" | "register">(
    params.get("tab") === "register" ? "register" : "login"
  );
  const [screen, setScreen] = useState<Screen>("auth");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login"
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error ?? "Something went wrong");
    else router.push("/dashboard");
  }

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    setLoading(false);
    setScreen("forgot-sent");
  }

  function switchMode(next: "login" | "register") {
    setMode(next);
    setError("");
    setForm({ name: "", email: "", password: "" });
  }

  // ── Forgot sent ──────────────────────────────────────────────────────────────
  if (screen === "forgot-sent") {
    return (
      <Shell>
        <div className="bg-[#111827] rounded-2xl p-8 border border-white/5 shadow-2xl text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Check your email</p>
          <p className="text-slate-400 text-sm mb-6">
            If <span className="text-slate-300">{forgotEmail}</span> has an account, we sent a reset link.
            Check your spam folder too.
          </p>
          <button
            onClick={() => { setScreen("auth"); setForgotEmail(""); }}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Back to Sign In
          </button>
        </div>
      </Shell>
    );
  }

  // ── Forgot password form ──────────────────────────────────────────────────────
  if (screen === "forgot") {
    return (
      <Shell subtitle="Enter your email and we'll send a reset link">
        <div className="bg-[#111827] rounded-2xl p-6 border border-white/5 shadow-2xl">
          {error && <ErrorBox>{error}</ErrorBox>}
          <form onSubmit={submitForgot} className="space-y-4">
            <AuthInput
              label="Email address"
              type="email"
              value={forgotEmail}
              onChange={setForgotEmail}
              placeholder="you@example.com"
            />
            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          <p className="text-center text-xs text-slate-600 mt-5">
            <button onClick={() => { setScreen("auth"); setError(""); }} className="text-orange-400 hover:text-orange-300 transition-colors">
              ← Back to sign in
            </button>
          </p>
        </div>
      </Shell>
    );
  }

  // ── Auth (login / register) ───────────────────────────────────────────────────
  return (
    <Shell subtitle={mode === "login" ? "Welcome back" : "Create your free account"}>
      <div className="bg-[#111827] rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
        {/* Tab toggle */}
        <div className="flex border-b border-white/5">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === m
                  ? "text-white bg-white/5 border-b-2 border-orange-500"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && <ErrorBox>{error}</ErrorBox>}
          <form onSubmit={submitAuth} className="space-y-4">
            {mode === "register" && (
              <AuthInput label="Full Name" type="text" value={form.name}
                onChange={(v) => setForm({ ...form, name: v })} placeholder="Mike Thompson" />
            )}
            <AuthInput label="Email" type="email" value={form.email}
              onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Password</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => { setScreen("forgot"); setForgotEmail(form.email); setError(""); }}
                    className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === "register" ? "Min 8 characters" : "••••••••"}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all duration-200"
            >
              {loading
                ? mode === "login" ? "Signing in..." : "Creating account..."
                : mode === "login" ? "Sign In" : "Create Free Account"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-5">
            {mode === "login" ? (
              <>No account?{" "}
                <button onClick={() => switchMode("register")} className="text-orange-400 hover:text-orange-300 transition-colors">
                  Create one free →
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-orange-400 hover:text-orange-300 transition-colors">
                  Sign in →
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </Shell>
  );
}

// ── Shared layout ─────────────────────────────────────────────────────────────
function Shell({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.12), transparent)" }}
      />
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-4 shadow-lg shadow-orange-500/30">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Trades AI</h1>
          {subtitle && <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

function AuthInput({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5 block">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
      />
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
      {children}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
