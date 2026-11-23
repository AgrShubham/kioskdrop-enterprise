"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Cpu,
  Smartphone,
  BarChart3,
  Radio,
  ChevronDown,
  LogIn,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { KioskDropLogo } from "./KioskDropLogo";
import { LoginModal } from "./LoginModal";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setDropdownOpen(false);
      window.location.reload();
    } catch {
      // Failed to logout
    }
  };

  const allNavLinks = [
    {
      href: "/request?room=Boardroom-4B&floor=4",
      label: "Employee Request",
      icon: Smartphone,
      active: pathname.startsWith("/request"),
      roles: ["EMPLOYEE", "IT_ADMIN", "FINOPS_AUDITOR"],
    },
    {
      href: "/kiosk-simulator",
      label: "Locker Kiosk Simulator",
      icon: Cpu,
      active: pathname.startsWith("/kiosk-simulator"),
      roles: ["EMPLOYEE", "IT_ADMIN", "FINOPS_AUDITOR"],
    },
    {
      href: "/admin",
      label: "Command Center",
      icon: BarChart3,
      active: pathname.startsWith("/admin"),
      // Command Center is strictly hidden from EMPLOYEE persona (Section 6.1)
      roles: ["IT_ADMIN", "FINOPS_AUDITOR"],
    },
  ];

  const currentRole = session?.role || "EMPLOYEE";
  const visibleNavLinks = allNavLinks.filter((link) => link.roles.includes(currentRole));

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case "IT_ADMIN":
        return "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
      case "FINOPS_AUDITOR":
        return "bg-amber-500/10 border-amber-500/40 text-amber-400";
      case "EMPLOYEE":
      default:
        return "bg-blue-500/10 border-blue-500/40 text-blue-400";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-xl transition-colors duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between gap-4">
          {/* Brand Lockup */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <KioskDropLogo variant="full" />
          </Link>

          {/* Dynamic RBAC Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-label={link.label}
                  className={`inline-flex items-center justify-center gap-2 p-2 sm:px-3 sm:py-2 min-h-[38px] rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    link.active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Tools: Theme Toggle, Telemetry Badge, User Persona */}
          <div className="flex items-center gap-2 sm:gap-3">
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

            {/* Persona Switcher / Sign-In Button */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[38px] rounded-xl border border-border bg-card/90 hover:bg-secondary/80 text-xs sm:text-sm font-medium transition-all shadow-sm glass-chamfer"
                aria-label="User Account and Persona Menu"
              >
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${getRoleBadgeStyle(
                    session?.role
                  )}`}
                >
                  {session?.name ? session.name.charAt(0) : "U"}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold leading-none">{session?.name || "Authenticating..."}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-mono">
                    {session?.role || "EMPLOYEE"}
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-card/95 backdrop-blur-xl p-2.5 shadow-2xl z-50 text-xs glass-chamfer animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/80 mb-2">
                    <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                      Enterprise Identity
                    </span>
                    <span className="text-[10px] font-mono text-primary font-bold">v1.0.3</span>
                  </div>

                  {/* 1-Tap Quick Personas */}
                  <div className="space-y-1">
                    <button
                      onClick={() => switchRole("EMPLOYEE")}
                      className={`w-full text-left p-2 rounded-xl flex flex-col gap-0.5 transition-all ${
                        session?.role === "EMPLOYEE"
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "hover:bg-secondary/60 text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Aarav Sharma</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400">
                          EMPLOYEE
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Sales & BD • Rapid Door Scan
                      </span>
                    </button>

                    <button
                      onClick={() => switchRole("IT_ADMIN")}
                      className={`w-full text-left p-2 rounded-xl flex flex-col gap-0.5 transition-all ${
                        session?.role === "IT_ADMIN"
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "hover:bg-secondary/60 text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Priya Patel</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          IT_ADMIN
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Superuser • VID/PID Whitelist & POs
                      </span>
                    </button>

                    <button
                      onClick={() => switchRole("FINOPS_AUDITOR")}
                      className={`w-full text-left p-2 rounded-xl flex flex-col gap-0.5 transition-all ${
                        session?.role === "FINOPS_AUDITOR"
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "hover:bg-secondary/60 text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Vikram Malhotra</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
                          FINOPS_AUDITOR
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Auditor • Indian Landed Customs Duty
                      </span>
                    </button>
                  </div>

                  <div className="border-t border-border/80 my-2" />

                  {/* Universal Login Modal Launcher */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setLoginModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In with Credentials / RFID</span>
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={handleLogout}
                    className="w-full mt-1.5 py-1.5 px-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-medium flex items-center justify-center gap-1.5 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Reset / Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Reusable Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={(s) => setSession(s)}
      />
    </>
  );
}
