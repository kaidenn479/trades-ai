"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) setError(data.error);
    else router.push("/dashboard");
  }

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
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-1 text-sm">Automate client communication for your trade business</p>
        </div>

        <div className="bg-[#111827] rounded-2xl p-6 border border-white/5 shadow-2xl">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <AuthInput label="Full Name" type="text" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Mike Thompson" />
            <AuthInput label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" />
            <AuthInput label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Min 8 characters" />
            <button type="submit" disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all duration-200">
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 transition-colors">Sign in →</Link>
          </p>
        </div>
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
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50 transition-all" />
    </div>
  );
}
