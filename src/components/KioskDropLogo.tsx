"use client";

import React from "react";

export interface KioskDropLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "icon" | "full";
  theme?: "auto" | "light" | "dark";
  accent?: "brand" | "monochrome";
  className?: string;
  size?: number | string;
}

/**
 * KioskDrop Enterprise Logo Component
 * Pixel-perfect geometric vector reproduction of the KD Monogram & Brand Lockup.
 * Features the signature K-stem, central divider, and forward-drop chevron.
 */
export function KioskDropLogo({
  variant = "icon",
  theme = "auto",
  accent = "brand",
  className = "",
  size,
  ...props
}: KioskDropLogoProps) {
  const isMonochrome = accent === "monochrome";

  if (variant === "full") {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <svg
          viewBox="0 0 1000 1000"
          className="h-8 w-8 shrink-0 overflow-visible"
          role="img"
          aria-label="KioskDrop Icon"
          {...props}
        >
          <defs>
            <linearGradient id="kd-brand-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          {/* K Element */}
          <path
            d="M 155,323 L 224,323 L 224,475 L 376,323 L 472,323 L 298,497 L 298,503 L 472,677 L 376,677 L 224,525 L 224,677 L 155,677 Z"
            className="fill-current text-foreground"
          />
          {/* Middle Bar */}
          <rect
            x="500"
            y="323"
            width="69"
            height="354"
            className="fill-current text-foreground"
          />
          {/* Chevron */}
          <path
            d="M 597,323 L 688,323 L 845,500 L 688,677 L 597,677 L 754,500 Z"
            fill={isMonochrome ? "currentColor" : "url(#kd-brand-cyan)"}
            className={isMonochrome ? "text-foreground" : ""}
          />
        </svg>

        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-foreground">
            Kiosk<span className="text-primary font-bold">Drop</span>
          </span>
          <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md border border-primary/30 bg-primary/10 text-primary">
            Enterprise
          </span>
        </div>
      </div>
    );
  }

  // Standalone Icon
  return (
    <svg
      viewBox="0 0 1000 1000"
      className={`overflow-visible ${className}`}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label="KioskDrop Enterprise Logo"
      {...props}
    >
      <defs>
        <linearGradient id="kd-icon-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* K */}
      <path
        d="M 155,323 L 224,323 L 224,475 L 376,323 L 472,323 L 298,497 L 298,503 L 472,677 L 376,677 L 224,525 L 224,677 L 155,677 Z"
        className="fill-current text-foreground"
      />
      {/* Middle Bar */}
      <rect
        x="500"
        y="323"
        width="69"
        height="354"
        className="fill-current text-foreground"
      />
      {/* Chevron */}
      <path
        d="M 597,323 L 688,323 L 845,500 L 688,677 L 597,677 L 754,500 Z"
        fill={isMonochrome ? "currentColor" : "url(#kd-icon-cyan)"}
        className={isMonochrome ? "text-foreground" : ""}
      />
    </svg>
  );
}

export default KioskDropLogo;

