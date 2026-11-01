"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  Theme,
  getResolvedTheme,
  applyThemeClass,
  transitionTheme,
} from "@/lib/theme-transition";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme, event?: React.MouseEvent) => void;
  toggleTheme: (event?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "kioskdrop-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Synchronize on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initialTheme: Theme = stored || "dark";
      setThemeState(initialTheme);
      const resolved = getResolvedTheme(initialTheme);
      setResolvedTheme(resolved);
      applyThemeClass(resolved);
    } catch {
      // localStorage may fail in private mode
    }
    setMounted(true);
  }, []);

  // Listen to system preference changes when in 'system' mode
  useEffect(() => {
    if (!mounted || typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const resolved = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(resolved);
        applyThemeClass(resolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  // Synchronize across tabs
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        setThemeState(newTheme);
        const resolved = getResolvedTheme(newTheme);
        setResolvedTheme(resolved);
        applyThemeClass(resolved);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [mounted]);

  const setTheme = useCallback(
    (newTheme: Theme, event?: React.MouseEvent) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {}

      const newResolved = getResolvedTheme(newTheme);
      setResolvedTheme(newResolved);
      transitionTheme(newResolved, event);
    },
    []
  );

  const toggleTheme = useCallback(
    (event?: React.MouseEvent) => {
      const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
      setTheme(nextTheme, event);
    },
    [resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
