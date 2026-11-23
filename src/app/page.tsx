"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Smartphone,
  BarChart3,
  ArrowRight,
  Download,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Lock,
  Zap,
  Radio,
  Server,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";
import { KioskDropLogo } from "@/components/KioskDropLogo";

const SHA256_HASH = "2C9E9944DE63E72D7A5206B3FCB7573631355BB7CB30771870C407D262C8D076";

export default function HomePage() {
  const [copiedHash, setCopiedHash] = useState(false);
  const [previewTab, setPreviewTab] = useState<"scan" | "locker" | "itam">("scan");

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(SHA256_HASH);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const replayBootSequence = () => {
    try {
      sessionStorage.removeItem("kioskdrop_boot_shown");
    } catch {}
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-200">
      {/* Background ambient spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.18),transparent_65%)] blur-3xl"
      />

      {/* 1. HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-mono font-bold tracking-wider uppercase shadow-md shadow-sky-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Zero-Trust AV Logistics • Release v1.0.3
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Sub-60s Autonomous AV Dispatch for the Modern{" "}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 dark:from-blue-400 dark:via-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Boardroom
            </span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Eliminating meeting room friction with automated floor-based smart lockers, cryptographic OTP triage,
            BadUSB hardware quarantine, and statutory Indian customs landed-duty FinOps.
          </p>
        </div>

        {/* Live Fleet Telemetry Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-2">
          <div className="p-4 rounded-2xl bg-card border border-border glass-chamfer text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 font-mono">99.98%</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">Hardware Uptime</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border glass-chamfer text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">&lt;15s</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">Dispatch MTTR</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border glass-chamfer text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">12 Bays</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">Smart Locker Matrix</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border glass-chamfer text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">0 Incidents</div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">BadUSB Zero-Trust</div>
          </div>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/request?room=Boardroom-4B&floor=4"
            className="px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shadow-xl shadow-primary/25 flex items-center gap-2 hover:-translate-y-0.5"
          >
            <Smartphone className="w-4 h-4" />
            <span>Request AV Equipment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/kiosk-simulator"
            className="px-6 py-3.5 rounded-2xl bg-card hover:bg-secondary text-foreground font-bold text-sm border border-border transition-all glass-chamfer shadow-sm flex items-center gap-2 hover:-translate-y-0.5"
          >
            <Cpu className="w-4 h-4 text-sky-500" />
            <span>Launch 12-Bay Simulator</span>
          </Link>

          <a
            href="#mobile-app-showcase"
            className="px-6 py-3.5 rounded-2xl bg-secondary/80 hover:bg-secondary text-primary font-mono text-sm border border-primary/30 transition-all flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Mobile App (v1.0.3)</span>
          </a>
        </div>
      </section>

      {/* 2. ENTERPRISE BENTO GRID */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-border">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold uppercase mb-3">
            Core Architecture Pillars
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Engineered for High-Stakes Corporate Operations
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Eliminating executive meeting disruptions with autonomous edge hardware & statutory financial compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-card border border-border hover:border-blue-500/50 transition-all glass-chamfer shadow-sm hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Rapid-Drop QR Triage</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scan conference room door placards, diagnose AV symptoms (HDMI handshake, USB-C DP Alt Mode), and issue
                cryptographic 6-digit OTPs in under 20 seconds.
              </p>
            </div>
            <Link
              href="/request?room=Boardroom-4B&floor=4"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80"
            >
              <span>Experience Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-card border border-border hover:border-emerald-500/50 transition-all glass-chamfer shadow-sm hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Zero-Trust VID/PID Whitelist</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hardware isolation engine stops BadUSB malware. Hardware USB Vendor/Product IDs are authenticated on checkout
                and return with deadbolt quarantine enforcement.
              </p>
            </div>
            <Link
              href="/admin"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500"
            >
              <span>View Whitelist Security</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-card border border-border hover:border-sky-500/50 transition-all glass-chamfer shadow-sm hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">12-Bay IoT Locker Bank</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dual mechanical solenoid actuators, optoelectronic IR break-beam presence sensors, 5V/3A smart charging
                loops, and dual-frequency audio clack synthesis.
              </p>
            </div>
            <Link
              href="/kiosk-simulator"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500"
            >
              <span>Open Hardware Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-card border border-border hover:border-amber-500/50 transition-all glass-chamfer shadow-sm hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Statutory Indian FinOps</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compound Indian customs duty engine (HSN 85437099 at 44.40% landed duty), Happay & Zaggle virtual card
                ledgers, and automated ERP restock purchase orders.
              </p>
            </div>
            <Link
              href="/admin"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500"
            >
              <span>Explore Landed Tariff Math</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. MOBILE APP SHOWCASE & DOWNLOAD CENTER */}
      <section
        id="mobile-app-showcase"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-border scroll-mt-20"
      >
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Device Mockup Frame */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            {/* Interactive Tab Switcher above device */}
            <div className="flex gap-2 p-1 rounded-2xl bg-card border border-border mb-6 text-xs font-semibold shadow-xs">
              <button
                onClick={() => setPreviewTab("scan")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  previewTab === "scan" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                1. Door Scanner
              </button>
              <button
                onClick={() => setPreviewTab("locker")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  previewTab === "locker" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                2. Locker Matrix
              </button>
              <button
                onClick={() => setPreviewTab("itam")}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  previewTab === "itam" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                3. Zero-Trust ITAM
              </button>
            </div>

            {/* Mobile Device Chassis */}
            <div className="relative w-[300px] sm:w-[320px] h-[640px] rounded-[48px] bg-slate-950 p-3.5 border-4 border-slate-700 shadow-2xl shadow-blue-500/10 ring-1 ring-black/20">
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>

              {/* Inner Screen Surface (Always Dark Cyber UI) */}
              <div className="relative w-full h-full rounded-[38px] bg-[#070A10] overflow-hidden text-white flex flex-col pt-10 px-4 pb-4">
                {/* Mobile Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>KD-MOB-1.0.3</span>
                  </div>
                  <span>9:41 AM</span>
                </div>

                {/* Preview 1: Scanner */}
                {previewTab === "scan" && (
                  <div className="flex-1 flex flex-col justify-between pt-6 text-center animate-in fade-in duration-200">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-sky-400 text-[10px] font-mono mb-3">
                        SCANNER_ENGAGED
                      </div>
                      <h4 className="font-extrabold text-sm text-white">Boardroom 4B Door Portal</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Point lens at room placard to diagnose</p>
                    </div>

                    <div className="relative my-auto w-44 h-44 mx-auto rounded-3xl border-2 border-dashed border-sky-400 flex items-center justify-center bg-slate-900/40">
                      <div className="absolute inset-0 bg-sky-400/10 animate-pulse rounded-3xl" />
                      <QrCode className="w-20 h-20 text-sky-400" />
                      <div className="absolute inset-x-2 top-1/2 h-0.5 bg-sky-400 shadow-[0_0_10px_#38BDF8] animate-bounce" />
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-left text-[11px]">
                      <div className="text-slate-400">Detected Symptom:</div>
                      <div className="text-emerald-400 font-bold mt-0.5">HDMI Incompatible / USB-C Hub Fault</div>
                    </div>
                  </div>
                )}

                {/* Preview 2: Locker Matrix */}
                {previewTab === "locker" && (
                  <div className="flex-1 flex flex-col pt-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-white">Floor 4 Smart Bank</span>
                      <span className="text-[10px] font-mono text-emerald-400">12 BAYS ONLINE</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 flex-1">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xl border p-2 flex flex-col justify-between text-[10px] ${
                            i === 3
                              ? "bg-blue-500/20 border-blue-500 text-blue-300"
                              : "bg-slate-900/80 border-slate-800 text-slate-400"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold">#{i + 1}</span>
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                          <div className="text-[9px] mt-2 font-medium">
                            {i === 3 ? "UNLOCKING..." : "5V CHARGE"}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-600 text-center font-bold text-xs mt-3">
                      Enter 6-Digit Pickup PIN
                    </div>
                  </div>
                )}

                {/* Preview 3: ITAM */}
                {previewTab === "itam" && (
                  <div className="flex-1 flex flex-col pt-4 animate-in fade-in duration-200 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold">Zero-Trust Registry</span>
                      <span className="text-[10px] font-mono text-sky-400">SHA-256</span>
                    </div>

                    <div className="space-y-2 mt-2">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-white">Anker 7-in-1 Hub</span>
                          <span className="text-emerald-400 font-mono">WHITELISTED</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">VID: 29BD • PID: 4102</div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900 border border-rose-500/30">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-white">Unknown Flash Drive</span>
                          <span className="text-rose-400 font-mono">QUARANTINE</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">VID: 0000 • PID: 0000 (BadUSB)</div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-white">Belkin 4K Display Adapter</span>
                          <span className="text-emerald-400 font-mono">WHITELISTED</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">VID: 05AC • PID: 12A8</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Download Hub Card */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase">
              <Download className="w-3.5 h-3.5" />
              Verified Production APK Build
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              KioskDrop Enterprise Mobile App
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Equip your corporate IT engineers, facilities coordinators, and meeting organizers with the dedicated Android
              application. Features instant camera QR room dispatch, live locker bay solenoid controls, offline caching,
              and tamper-evident telemetry.
            </p>

            {/* Direct 1-Click APK Download Action Card */}
            <div className="p-6 rounded-3xl bg-card border border-border shadow-xl glass-chamfer space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <div className="font-bold text-foreground text-base">kioskdrop-enterprise-v1.0.3.apk</div>
                  <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                    Version 1.0.3 (Build 4) • Android 9.0+ • 118.2 MB
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                  <Check className="w-3.5 h-3.5" />
                  STABLE RELEASE
                </span>
              </div>

              {/* Direct Download Button */}
              <a
                href="/downloads/kioskdrop-enterprise-v1.0.3.apk"
                download="kioskdrop-enterprise-v1.0.3.apk"
                className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-3 hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                <span>Download Standalone APK (118.2 MB)</span>
              </a>

              {/* SHA-256 Cryptographic Hash */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold">Cryptographic SHA-256 Hash:</span>
                  <button
                    onClick={copyHashToClipboard}
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-mono text-[11px]"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-secondary/80 border border-border font-mono text-[11px] text-foreground break-all select-all">
                  {SHA256_HASH}
                </div>
              </div>

              {/* Scan-to-Sideload dynamic QR Code info */}
              <div className="flex items-center gap-4 pt-2">
                <div className="w-20 h-20 rounded-2xl bg-white border border-border p-1.5 flex items-center justify-center shrink-0 shadow-md">
                  <QrCode className="w-full h-full text-slate-950" />
                </div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground block mb-0.5">Scan to Sideload Instantly</span>
                  Open your Android camera to download and install this build directly to your mobile device over the
                  corporate Wi-Fi.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ROLE PERMISSION MATRIX */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-border">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">Enterprise Role Matrix</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Strict multi-tier privilege segregation across employees, infrastructure teams, and finance auditors.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border bg-card glass-chamfer shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-mono text-muted-foreground uppercase tracking-wider text-[11px]">
                <th className="p-4 sm:p-5">Platform Capability</th>
                <th className="p-4 sm:p-5 text-blue-600 dark:text-blue-400">Aarav (EMPLOYEE)</th>
                <th className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400">Priya (IT_ADMIN)</th>
                <th className="p-4 sm:p-5 text-amber-600 dark:text-amber-400">Vikram (FINOPS_AUDITOR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Room QR Door Placard Scan & AV Triage</td>
                <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">✓ Full Access</td>
                <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">✓ Full Access</td>
                <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">✓ Full Access</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">6-Digit Cryptographic OTP Locker Pickup</td>
                <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">✓ Full Access</td>
                <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">✓ Full Access</td>
                <td className="p-4 sm:p-5 text-muted-foreground font-bold">Read-Only</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Zero-Trust USB VID/PID Whitelist Management</td>
                <td className="p-4 sm:p-5 text-destructive font-bold">✗ 403 Forbidden</td>
                <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">✓ Full Superuser</td>
                <td className="p-4 sm:p-5 text-muted-foreground font-bold">Read-Only Audit</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Emergency Solenoid Override & Bay Flashing</td>
                <td className="p-4 sm:p-5 text-destructive font-bold">✗ 403 Forbidden</td>
                <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">✓ Full Superuser</td>
                <td className="p-4 sm:p-5 text-destructive font-bold">✗ Restricted</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Indian Landed Duty Tariff & Card FinOps Ledger</td>
                <td className="p-4 sm:p-5 text-destructive font-bold">✗ 403 Forbidden</td>
                <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">✓ PO Issuance</td>
                <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">✓ Full Audit Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. CORPORATE FOOTER */}
      <footer className="relative z-10 border-t border-border bg-card/60 dark:bg-card/20 py-12 text-muted-foreground text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center p-1.5 shadow-xs">
              <KioskDropLogo variant="icon" className="w-full h-full text-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground">KioskDrop Enterprise</span>
              <span className="text-muted-foreground ml-2">v1.0.3 • Production Reference Simulator</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <Link href="/request?room=Boardroom-4B&floor=4" className="hover:text-foreground transition-colors">
              Employee Portal
            </Link>
            <Link href="/kiosk-simulator" className="hover:text-foreground transition-colors">
              IoT Simulator
            </Link>
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Command Center
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Authentication Gateway
            </Link>
            <button
              onClick={replayBootSequence}
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-mono transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replay Boot Sequence</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-border/60 text-center text-[11px] text-muted-foreground/70">
          Protected by Zero-Trust Hardware Endpoint Whitelisting • HSN 85437099 Statutory Indian Tariff Conformance
        </div>
      </footer>
    </div>
  );
}
