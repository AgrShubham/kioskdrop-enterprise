"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Cpu,
  Smartphone,
  BarChart3,
  User,
  Radio,
  ChevronDown,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface UserPersona {
  userId: string;
  name: string;
  email: string;
  department: string;
  role: "EMPLOYEE" | "IT_ADMIN" | "FINOPS_AUDITOR";
  rfidBadgeId: string;
}

export function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<UserPersona | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetch("/api/session/current")
      .then((res) => res.json())
      .then((data) => {
        if (data.session) setSession(data.session);
      })
      .catch(() => {});
  }, []);

  const switchRole = async (role: "EMPLOYEE" | "IT_ADMIN" | "FINOPS_AUDITOR") => {
    try {
      const res = await fetch("/api/session/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.session);
        setDropdownOpen(false);
        window.location.reload();
      }
    } catch {
      // Failed to switch
    }
  };

  const navLinks = [
    {
      href: "/request?room=Boardroom-4B&floor=4",
      label: "Employee Request",
      icon: Smartphone,
      active: pathname.startsWith("/request"),
    },
    {
      href: "/kiosk-simulator",
      label: "Locker Kiosk Simulator",
      icon: Cpu,
      active: pathname.startsWith("/kiosk-simulator"),
    },
    {
      href: "/admin",
      label: "Command Center",
      icon: BarChart3,
      active: pathname.startsWith("/admin"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl transition-colors duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline">
            KioskDrop <span className="text-primary font-normal text-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 rounded-md ml-1">Enterprise</span>
          </span>
        </Link>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  link.active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status Pill & Role Impersonator Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Live SSE Telemetry indicator */}
          <div
            title="Real-time Server-Sent Events (SSE) Telemetry Active"
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 dark:shadow-[0_0_12px_rgba(16,185,129,0.18)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Radio className="w-3 h-3 ml-0.5" />
            <span>LIVE TELEMETRY</span>
          </div>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card/90 hover:bg-secondary/80 text-xs sm:text-sm font-medium transition-all shadow-sm glass-chamfer"
            >
              <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {session?.name.charAt(0) || "U"}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold leading-none">{session?.name || "Loading..."}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {session?.role || "EMPLOYEE"}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-2 shadow-2xl z-50 text-xs glass-chamfer">
                <div className="px-2 py-1.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                  Demo Persona Switcher (ADR D1)
                </div>

                <button
                  onClick={() => switchRole("EMPLOYEE")}
                  className={`w-full text-left p-2 rounded-lg flex flex-col gap-0.5 transition-colors ${
                    session?.role === "EMPLOYEE"
                      ? "bg-primary/10 border border-primary/30 text-primary"
                      : "hover:bg-secondary/60"
                  }`}
                >
                  <span className="font-bold">Aarav Sharma</span>
                  <span className="text-[10px] text-muted-foreground">
                    Role: EMPLOYEE • Sales & BD (Room 4B)
                  </span>
                </button>

                <button
                  onClick={() => switchRole("IT_ADMIN")}
                  className={`w-full text-left p-2 rounded-lg flex flex-col gap-0.5 transition-colors mt-1 ${
                    session?.role === "IT_ADMIN"
                      ? "bg-primary/10 border border-primary/30 text-primary"
                      : "hover:bg-secondary/60"
                  }`}
                >
                  <span className="font-bold">Priya Patel</span>
                  <span className="text-[10px] text-muted-foreground">
                    Role: IT_ADMIN • AV Infrastructure Operations
                  </span>
                </button>

                <button
                  onClick={() => switchRole("FINOPS_AUDITOR")}
                  className={`w-full text-left p-2 rounded-lg flex flex-col gap-0.5 transition-colors mt-1 ${
                    session?.role === "FINOPS_AUDITOR"
                      ? "bg-primary/10 border border-primary/30 text-primary"
                      : "hover:bg-secondary/60"
                  }`}
                >
                  <span className="font-bold">Vikram Malhotra</span>
                  <span className="text-[10px] text-muted-foreground">
                    Role: FINOPS_AUDITOR • Corporate Procurement
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
