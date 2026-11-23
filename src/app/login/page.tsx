"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Mail,
  Lock,
  Radio,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Wifi,
  ShieldCheck,
} from "lucide-react";
import { KioskDropLogo } from "@/components/KioskDropLogo";

type LoginTab = "credentials" | "demo" | "rfid";

const DEMO_PERSONAS = [
  {
    role: "EMPLOYEE",
    name: "Aarav Sharma",
    email: "aarav.sharma@enterprise.corp",
    department: "Sales & Strategic Accounts",
    rfidBadgeId: "RFID-EMP-8821",
    badgeColor: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    description: "Rapid AV Request, QR Scanning & Locker Pickup",
  },
  {
    role: "IT_ADMIN",
    name: "Priya Patel",
    email: "priya.patel@enterprise.corp",
    department: "Enterprise Infrastructure & AV Ops",
    rfidBadgeId: "RFID-IT-0042",
    badgeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    description: "Full Superuser: USB Zero-Trust, POs & Webhooks",
  },
  {
    role: "FINOPS_AUDITOR",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@enterprise.corp",
    department: "Corporate Procurement & FinOps",
    rfidBadgeId: "RFID-FIN-1109",
    badgeColor: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    description: "Read-Only Indian Customs Duty & Card Audits",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LoginTab>("credentials");
  const [email, setEmail] = useState("aarav.sharma@enterprise.corp");
  const [password, setPassword] = useState("kiosk2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rfidInput, setRfidInput] = useState("RFID-EMP-8821");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    fetch("/api/session/current")
      .then((res) => res.json())
      .then((d) => {
        setPingLatency(Math.round(performance.now() - start));
      })
      .catch(() => setPingLatency(null));
  }, []);

  const handleLogin = async (body: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication failed. Check credentials.");
      }
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#070A10] text-white">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-slate-700/80 shadow-2xl p-6 sm:p-8 glass-chamfer">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center p-2.5 shadow-lg shadow-blue-500/20">
            <KioskDropLogo variant="icon" className="w-full h-full text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Enterprise Authentication</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Zero-Trust Gateway v1.0.3</span>
              {pingLatency !== null && (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                  <Wifi className="w-3 h-3" /> {pingLatency}ms
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("credentials")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "credentials"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Credentials
          </button>
          <button
            onClick={() => setActiveTab("demo")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "demo"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1-Tap Demo
          </button>
          <button
            onClick={() => setActiveTab("rfid")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "rfid"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            RFID Tap
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Credentials */}
        {activeTab === "credentials" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin({ email, password });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="employee@enterprise.corp"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Directory Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Authorizing Identity..." : "Sign In with Enterprise Directory"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: 1-Tap Quick Demo */}
        {activeTab === "demo" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-2">
              Select an enterprise persona to authenticate instantly with appropriate role permissions:
            </p>
            {DEMO_PERSONAS.map((p) => (
              <button
                key={p.role}
                onClick={() => handleLogin({ role: p.role })}
                disabled={loading}
                className="w-full p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 transition-all text-left flex items-start justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{p.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${p.badgeColor}`}
                    >
                      {p.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{p.department}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all mt-1" />
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: RFID Badge Reader Simulation */}
        {activeTab === "rfid" && (
          <div className="space-y-4 text-center">
            <div className="relative mx-auto w-24 h-24 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-sky-400/40 animate-[spin_10s_linear_infinite]" />
              <Radio className="w-10 h-10 text-sky-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Simulate tapping an employee physical NFC/RFID badge against the kiosk reader:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="RFID-EMP-8821"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-center text-sky-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleLogin({ rfidBadgeId: rfidInput })}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
              >
                Tap Badge
              </button>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.rfidBadgeId}
                  onClick={() => {
                    setRfidInput(p.rfidBadgeId);
                    handleLogin({ rfidBadgeId: p.rfidBadgeId });
                  }}
                  className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                >
                  {p.rfidBadgeId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

