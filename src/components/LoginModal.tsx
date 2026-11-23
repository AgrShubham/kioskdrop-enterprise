"use client";

import React, { useState, useEffect } from "react";
import {
  X,
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
} from "lucide-react";
import { KioskDropLogo } from "./KioskDropLogo";

type LoginTab = "credentials" | "demo" | "rfid";

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (session: any) => void;
}

const DEMO_PERSONAS = [
  {
    role: "EMPLOYEE",
    name: "Aarav Sharma",
    email: "aarav.sharma@enterprise.corp",
    department: "Sales & Strategic Accounts",
    rfidBadgeId: "RFID-EMP-8821",
    badgeColor: "border-blue-500/40 bg-blue-500/10 text-blue-500",
    description: "Rapid AV Request, QR Scanning & Locker Pickup",
  },
  {
    role: "IT_ADMIN",
    name: "Priya Patel",
    email: "priya.patel@enterprise.corp",
    department: "Enterprise Infrastructure & AV Ops",
    rfidBadgeId: "RFID-IT-0042",
    badgeColor: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
    description: "Full Superuser: USB Zero-Trust, POs & Webhooks",
  },
  {
    role: "FINOPS_AUDITOR",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@enterprise.corp",
    department: "Corporate Procurement & FinOps",
    rfidBadgeId: "RFID-FIN-1109",
    badgeColor: "border-amber-500/40 bg-amber-500/10 text-amber-500",
    description: "Read-Only Indian Customs Duty & Card Audits",
  },
];

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<LoginTab>("credentials");
  const [email, setEmail] = useState("aarav.sharma@enterprise.corp");
  const [password, setPassword] = useState("kiosk2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rfidInput, setRfidInput] = useState("RFID-EMP-8821");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const start = performance.now();
      fetch("/api/session/current")
        .then(() => {
          setPingLatency(Math.round(performance.now() - start));
        })
        .catch(() => setPingLatency(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      onSuccess?.(data.data.session);
      onClose();
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || "Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 text-foreground glass-chamfer">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center p-2">
            <KioskDropLogo variant="icon" className="w-full h-full text-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Enterprise Authentication</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Zero-Trust Gateway v1.0.3</span>
              {pingLatency !== null && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                  <Wifi className="w-3 h-3" /> {pingLatency}ms
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-secondary/80 p-1 rounded-2xl border border-border mb-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("credentials")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "credentials"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Credentials
          </button>
          <button
            onClick={() => setActiveTab("demo")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "demo"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1-Tap Demo
          </button>
          <button
            onClick={() => setActiveTab("rfid")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "rfid"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            RFID Tap
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
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
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="employee@enterprise.corp"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Directory Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary/60 border border-border text-xs text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Authorizing Identity..." : "Sign In with Enterprise Directory"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: 1-Tap Quick Demo */}
        {activeTab === "demo" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">
              Select an enterprise persona to authenticate instantly with appropriate role permissions:
            </p>
            {DEMO_PERSONAS.map((p) => (
              <button
                key={p.role}
                onClick={() => handleLogin({ role: p.role })}
                disabled={loading}
                className="w-full p-3.5 rounded-2xl bg-secondary/40 hover:bg-secondary border border-border hover:border-primary/50 transition-all text-left flex items-start justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{p.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${p.badgeColor}`}
                    >
                      {p.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">{p.department}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-0.5">{p.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: RFID Badge Reader Simulation */}
        {activeTab === "rfid" && (
          <div className="space-y-4 text-center">
            <div className="relative mx-auto w-24 h-24 rounded-full bg-secondary border border-border flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-sky-400/40 animate-[spin_10s_linear_infinite]" />
              <Radio className="w-10 h-10 text-sky-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Simulate tapping an employee physical NFC/RFID badge against the kiosk reader:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                placeholder="RFID-EMP-8821"
                className="flex-1 px-3 py-2 rounded-xl bg-secondary/60 border border-border text-xs font-mono text-center text-primary focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => handleLogin({ rfidBadgeId: rfidInput })}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-md"
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
                  className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                >
                  {p.rfidBadgeId}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
