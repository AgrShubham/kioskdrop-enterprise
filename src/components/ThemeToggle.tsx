"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder with exact dimensions to avoid layout shift
    return (
      <div
        className={`w-9 h-9 rounded-lg border border-border bg-card/60 flex items-center justify-center ${className}`}
        aria-hidden="true"
      >
        <span className="w-4 h-4 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={(e) => toggleTheme(e)}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative w-9 h-9 rounded-lg border border-border bg-card hover:bg-secondary/70 text-foreground transition-all duration-200 flex items-center justify-center shadow-sm group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {/* Sun icon for Dark -> Light */}
      <Sun
        className={`w-4 h-4 text-amber-500 absolute transition-all duration-300 transform ${
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100 text-amber-600"
        }`}
      />

      {/* Moon icon for Light -> Dark */}
      <Moon
        className={`w-4 h-4 text-blue-400 absolute transition-all duration-300 transform ${
          isDark
            ? "rotate-0 scale-100 opacity-100 text-blue-300"
            : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}
