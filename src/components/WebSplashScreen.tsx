"use client";

import React, { useEffect, useState, useCallback } from "react";
import { KioskDropLogo } from "./KioskDropLogo";

export interface WebSplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

const BOOT_LOGS = [
  "[SYS_INIT] Initializing Zero-Trust Security Enclave...",
  "[IOT_SYNC] Syncing Smart Locker SSE Bus...",
  "[SEC_PASS] Authorizing Bay Solenoid Matrix...",
  "[FLEET_OK] Enterprise Fleet Online.",
];

export function WebSplashScreen({
  onFinish,
  minDurationMs = 1750,
}: WebSplashScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [logIndex, setLogIndex] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);

  const dismiss = useCallback(
    (fast = false) => {
      if (isDismissing) return;
      setIsDismissing(true);
      try {
        sessionStorage.setItem("kioskdrop_boot_shown", "true");
      } catch {}

      setTimeout(
        () => {
          setIsVisible(false);
          onFinish?.();
        },
        fast ? 150 : 380
      );
    },
    [isDismissing, onFinish]
  );

  useEffect(() => {
    // Check if boot was already displayed in this browser tab
    try {
      if (sessionStorage.getItem("kioskdrop_boot_shown") === "true") {
        onFinish?.();
        return;
      }
    } catch {}

    setIsVisible(true);

    // Stage 1 -> 2: Chevron Drop Flash
    const t1 = setTimeout(() => setStage(2), 380);
    // Stage 2 -> 3: Brand Lockup Reveal
    const t2 = setTimeout(() => setStage(3), 480);
    // Stage 3 -> 4: Exit Aperture Zoom
    const t3 = setTimeout(() => {
      setStage(4);
      dismiss(false);
    }, minDurationMs);

    // Telemetry log stepper
    const l1 = setTimeout(() => setLogIndex(1), 400);
    const l2 = setTimeout(() => setLogIndex(2), 850);
    const l3 = setTimeout(() => setLogIndex(3), 1250);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        dismiss(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(l1);
      clearTimeout(l2);
      clearTimeout(l3);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [minDurationMs, dismiss, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="System Initializing"
      aria-modal="true"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070A10] text-white select-none transition-all duration-300 ${
        isDismissing ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(56,189,248,0.12),transparent_70%)] blur-3xl pointer-events-none" />

      {/* Center Kinetic Logo Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md">
        {/* Monogram with animated aperture pulse */}
        <div
          className={`relative flex items-center justify-center w-28 h-28 mb-8 transition-transform duration-500 ease-out ${
            stage >= 1 ? "scale-100 opacity-100" : "scale-85 opacity-0"
          }`}
        >
          {/* Rotating radar aura ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-sky-400/40 animate-[spin_8s_linear_infinite]" />
          <div className="absolute -inset-2 rounded-full bg-sky-500/10 blur-md animate-pulse" />

          {/* Monogram Icon */}
          <div className="relative w-20 h-20 rounded-2xl bg-[#0F172A] border border-white/10 p-3.5 shadow-2xl shadow-blue-500/20">
            <KioskDropLogo variant="icon" className="w-full h-full text-white" />
          </div>
        </div>

        {/* Brand Name Lockup */}
        <div
          className={`transition-all duration-500 delay-100 ${
            stage >= 3 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold tracking-wider uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Zero-Trust Gateway v1.0.3
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Kiosk<span className="text-blue-500">Drop</span> Enterprise
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Automated conference room AV micro-logistics platform & smart locker fleet.
          </p>
        </div>

        {/* Live Telemetry Code Terminal */}
        <div className="w-full mt-8 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left font-mono text-[11px] text-sky-400 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 text-slate-500 text-[10px] uppercase tracking-wider">
            <span>Hardware Telemetry Bus</span>
            <span>PORT_443_SECURE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">❯</span>
            <span className="animate-pulse">{BOOT_LOGS[logIndex]}</span>
          </div>
        </div>

        {/* Skip Action */}
        <button
          onClick={() => dismiss(true)}
          className="mt-6 text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors underline-offset-4 hover:underline"
        >
          Skip Boot (Esc)
        </button>
      </div>
    </div>
  );
}

