# 💎 KioskDrop Enterprise — Brand Assets & Guidelines

Welcome to the official Brand Asset repository for **KioskDrop Enterprise** (`Zero-Trust Hardware Access & Fleet Gateway`).

This directory contains vector SVGs, high-resolution raster PNGs, mobile app launcher icons, animated splash assets, and brand design specifications.

---

## 📂 Asset Catalog & Directory Structure

```
brand-assets/
├── README.md                                    # Master Brand Guidelines & Usage Instructions
├── brand-guide.json                             # Machine-readable color tokens & geometry coordinates
│
├── logo/
│   ├── svg/                                     # Resolution-independent scalable vectors
│   │   ├── kioskdrop-monogram-black.svg         # Solid dark monogram (#0F172A)
│   │   ├── kioskdrop-monogram-white.svg         # Solid white monogram (#FFFFFF)
│   │   ├── kioskdrop-monogram-cyber-blue.svg    # Cyber sky accent monogram (#38BDF8)
│   │   ├── kioskdrop-logo-horizontal-dark.svg   # Full horizontal lockup (monogram + wordmark) on dark
│   │   ├── kioskdrop-logo-horizontal-light.svg  # Full horizontal lockup (monogram + wordmark) on light
│   │   └── kioskdrop-favicon.svg                # Scalable favicon with rounded brand container
│   │
│   └── png/                                     # Master raster exports with alpha channel
│       ├── kioskdrop-icon-1024x1024.png         # Master app store & production icon (1024x1024)
│       ├── kioskdrop-icon-512x512.png           # Standard web & packaging asset (512x512)
│       ├── kioskdrop-icon-256x256.png           # Desktop icon & avatar (256x256)
│       ├── kioskdrop-icon-128x128.png           # Compact dock & list icon (128x128)
│       ├── kioskdrop-monogram-black-transparent.png # Pure transparent black monogram (1024x1024)
│       ├── kioskdrop-monogram-white-transparent.png # Pure transparent white monogram (1024x1024)
│       ├── kioskdrop-reference-original.png     # Ground-truth design reference image
│       └── favicon.png                          # Standard 48x48 web favicon
│
├── mobile/                                      # Android & iOS Native Deployment Assets
│   ├── android-icon-foreground.png              # Android adaptive launcher icon foreground (432x432)
│   ├── android-icon-background.png              # Android adaptive launcher icon background (#0B0F17)
│   ├── android-icon-monochrome.png              # Android 13+ Material You themed monochrome mask
│   ├── splash-icon.png                          # Kinetic splash boot centerpiece icon (288x288)
│   └── splash-full-preview.png                  # Full preview of boot launch frame
│
├── previews/                                    # UI & Motion Verification Previews
│   ├── preview-splash-screen.png                # 4-stage kinetic splash screen render
│   ├── preview-loading-screen.png               # High-security mission-critical radar loading modal
│   └── preview-skeleton-screen.png              # Zero-layout-shift shimmer placeholder system
│
└── specifications/                              # Deep Engineering & Geometry Architecture Docs
    ├── kioskdrop_logo_specification.md          # 1000x1000 vector geometry & mathematical proofs
    ├── kioskdrop_splash_and_loading_specification.md # Timing curves & spring physics specification
    └── kioskdrop_app_opening_animation.md       # Kinetic animation choreography breakdown
```

---

## 📐 Monogram Anatomy & Geometry

The KioskDrop emblem is a modern typographic monogram combining the characters **K**, an isolation bar (**|**), and a forward drop chevron (**\>**).

```
   [ K-STEM ]   [ DIAGONALS ]    [ BAR ]    [ DROP CHEVRON ]
      │             ╱   ╲           │            ╲     ╱
      │            ╱     ╲          │             ╲   ╱
      │           ╱       ╲         │              ╲ ╱
      │            ╲     ╱          │               ╳
      │             ╲   ╱           │              ╱ ╲
      │              ╲ ╱            │             ╱   ╲
   Solid Pillar   Ascent/Dispatch  Isolation   Solenoid Release
```

1. **Vertical K-Stem:** Solid vertical foundation pillar representing physical locker bay infrastructure.
2. **K-Diagonals:** Dual 45° chamfered wings representing rapid dispatch and hardware routing.
3. **Central Divider Bar:** Zero-Trust isolation barrier separating unverified user input from physical hardware release.
4. **Drop Chevron (`|>`):** Symmetrical forward arrow symbolizing instant locker compartment solenoid dispatch.

---

## 🎨 Color Palette & Design Tokens

### Primary Palette
| Swatch | Color Name | Hex Code | RGB | Usage |
| :---: | :--- | :---: | :---: | :--- |
| <img src="https://via.placeholder.com/24/070A10/000000?text=+" width="24" height="24" /> | **Obsidian Dark** | `#070A10` | `7, 10, 16` | Master dark background, splash canvas, terminal background |
| <img src="https://via.placeholder.com/24/0F172A/000000?text=+" width="24" height="24" /> | **Slate Surface** | `#0F172A` | `15, 23, 42` | Bento cards, numeric keypad, dialog containers |
| <img src="https://via.placeholder.com/24/FFFFFF/000000?text=+" width="24" height="24" /> | **Pure White** | `#FFFFFF` | `255, 255, 255` | Light theme background, high-contrast typography |

### Status & Accent Palette
| Swatch | Token Name | Hex Code | Purpose & Semantic Role |
| :---: | :--- | :---: | :--- |
| <img src="https://via.placeholder.com/24/2563EB/000000?text=+" width="24" height="24" /> | **Sapphire Blue** | `#2563EB` | Primary brand accent, interactive buttons, **Employee** persona badge |
| <img src="https://via.placeholder.com/24/38BDF8/000000?text=+" width="24" height="24" /> | **Cyber Sky** | `#38BDF8` | Solenoid chevron kinetic flash, radar pulses, live sync indicator |
| <img src="https://via.placeholder.com/24/10B981/000000?text=+" width="24" height="24" /> | **Emerald Green** | `#10B981` | Solenoid unlocked, stock ready, **IT Admin** persona badge |
| <img src="https://via.placeholder.com/24/F59E0B/000000?text=+" width="24" height="24" /> | **Amber Gold** | `#F59E0B` | Active reservation timer, pending reception, **FinOps Auditor** badge |
| <img src="https://via.placeholder.com/24/EF4444/000000?text=+" width="24" height="24" /> | **Crimson Alert** | `#EF4444` | Tamper alarm, BadUSB rogue quarantine, 403 access denial |

---

## 📏 Clearspace & Minimum Sizes

- **Clearspace:** Maintain a minimum clear zone around the monogram equal to **15% of the symbol's height** (`0.15H`). No typography, boundaries, or competing graphics should intrude into this zone.
- **Minimum Digital Sizes:**
  - **Favicon:** 16 × 16 px (use `kioskdrop-favicon.svg` or `favicon.png`)
  - **App Navigation Bar:** 24 × 24 dp (use vector `KioskDropLogo` component)
  - **App Icon:** 48 × 48 dp (mobile launcher)
  - **Splash Screen Hero:** 96 × 96 dp minimum
- **Aspect Ratio:** The master bounding box is **1:1 square** (`1000 × 1000 px`). Never stretch, skew, or alter horizontal/vertical scaling independently.

---

## 🚫 Brand Usage Rules & Prohibitions

- **DO** use the official vector SVGs whenever possible for crisp multi-resolution rendering.
- **DO** use high-contrast combinations: White monogram on Obsidian Dark, or Obsidian/Black monogram on White surfaces.
- **DO** utilize the Cyber Sky `#38BDF8` accent for animated transitions or interactive hover states.
- **DO NOT** rotate the monogram at arbitrary angles (only 0° is authorized).
- **DO NOT** change the gap distance between the K-stem, divider bar, and drop chevron.
- **DO NOT** apply heavy drop-shadows, glow outlines, or 3D bevel filters to the flat vector geometry.
- **DO NOT** alter the 45° angle of the K diagonals or the drop chevron.

---

## 🔗 Related Resources & Source Code

- **React Web Component:** [`src/components/KioskDropLogo.tsx`](../src/components/KioskDropLogo.tsx)
- **React Native Mobile Component:** [`mobile/src/components/ui/KioskDropLogo.tsx`](../mobile/src/components/ui/KioskDropLogo.tsx)
- **Kinetic Opening Animation:** [`mobile/src/components/ui/AppSplashScreen.tsx`](../mobile/src/components/ui/AppSplashScreen.tsx)
- **Full Architecture Plan:** [`brand-assets/specifications/kioskdrop_logo_specification.md`](./specifications/kioskdrop_logo_specification.md)

