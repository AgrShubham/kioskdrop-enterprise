"use client";

import React, { useEffect } from "react";
import { KioskDropLogo } from "./KioskDropLogo";
import { X } from "lucide-react";

export interface HardwareRadarModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  subsystem?: string;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function HardwareRadarModal({
  visible,
  title = "Connecting to Smart Locker...",
  message = "Authorizing hardware solenoid channel...",
  subsystem = "IOT_SOLENOID_DISPATCH",
  onCancel,
  cancelLabel = "Cancel Operation",
}: HardwareRadarModalProps) {
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onCancel) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm mx-4 p-8 rounded-3xl bg-[#0F172A] border border-slate-700/80 shadow-2xl shadow-blue-500/10 flex flex-col items-center text-center text-white glass-chamfer">
        {onCancel && (
          <button
            onClick={onCancel}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Concentric Radar Rings & Glowing Monogram */}
        <div className="relative flex items-center justify-center w-28 h-28 mb-6">
          <div className="absolute inset-0 rounded-full bg-sky-500/15 animate-ping duration-1000" />
          <div className="absolute -inset-2 rounded-full border border-dashed border-sky-400/40 animate-[spin_6s_linear_infinite]" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 shadow-lg p-3">
            <KioskDropLogo variant="icon" className="w-full h-full text-white" />
          </div>
        </div>

        {/* Subsystem Code Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-sky-400 text-[10px] font-mono font-bold tracking-wider uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {subsystem}
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-bold text-white tracking-tight mb-1">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">{message}</p>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </div>
  );
}

