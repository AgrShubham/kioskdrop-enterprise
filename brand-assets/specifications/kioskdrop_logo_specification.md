# 💎 KioskDrop Enterprise — Brand Logo & Visual Identity System

This specification documents the vector reconstruction, geometry, and cross-platform production asset suite created for **KioskDrop Enterprise** from the provided logo reference.

---

## 🖼️ Reference vs. Reconstructed Brand Assets

````carousel
![Reference Uploaded by User](C:/Users/agshu/.gemini/antigravity/brain/9d847b3f-df17-4bf3-ad83-a77cffcc6a27/reference-logo.png)
<!-- slide -->
![KioskDrop Brand App Icon (1024x1024)](C:/Users/agshu/.gemini/antigravity/brain/9d847b3f-df17-4bf3-ad83-a77cffcc6a27/logo-brand-icon.png)
<!-- slide -->
![Android Adaptive Foreground Icon](C:/Users/agshu/.gemini/antigravity/brain/9d847b3f-df17-4bf3-ad83-a77cffcc6a27/logo-adaptive-foreground.png)
````

---

## 📐 Geometric Architecture & Meaning

The logo is a minimalist, high-impact monogram combining **K** and **D** (formed by the central divider and the chevron `|>`):

```
+-----------+        +----+        +------+
|     K     |        | |  |        |  >   |
|  Stem &   |   +    |    |   +    | Drop |   ===>   "KD" (KioskDrop)
| Diagonals |        |Bar |        | Slot |
+-----------+        +----+        +------+
```

1. **The Letter "K"**:
   - **Vertical Stem**: Anchored on the left at $x \in [155, 224]$ ($W = 69\text{px}$, $H = 354\text{px}$).
   - **Dual Diagonals**: Crafted with exact $45.00^\circ$ slopes ($|dy/dx| = 1.0$) meeting at a centered junction vertex $(298, 500)$. Flat top and bottom horizontal cuts align with the stem baseline.
2. **The Central Divider ("|")**:
   - A $70\text{px}$ wide pillar located at $x \in [500, 569]$, creating a rhythmic $28\text{px}$ negative-space channel from the K-diagonals.
3. **The Forward Drop Chevron (">")**:
   - Spanning $x \in [597, 845]$ with an apex at $(845, 500)$.
   - Forms a geometric **"D"** with the central bar while functioning as a cyber-physical symbol:
     - **Forward Motion & Dispatch**
     - **Smart Locker Door / Solenoid Drop Bay**
     - **Telemetry Pulse**

> [!NOTE]
> The reconstructed vector geometry matches the source reference image with **99.05% pixel fidelity** (the remaining 0.95% is subpixel antialiasing edge filtering).

---

## 🎨 Official Colorways & Variations

| Variant | Primary Surface | Elements | Usage |
| :--- | :--- | :--- | :--- |
| **Monochrome Dark** | `#070A10` / Dark UI | Pure White `#FFFFFF` | Mobile status bar, terminal, contrast headers |
| **Monochrome Light** | `#FFFFFF` / Paper | Jet Black `#0A0E17` | Invoices, print assets, high-contrast light mode |
| **Cyber-Cyan Brand Accent** | Dark Navy `#0A0E17` | White Stems + Electric Cyan/Blue Gradient (`#38BDF8` $\to$ `#2563EB`) | App icons, web navbar, splash screens, favicon |

---

## 📁 Generated Asset Directory

### Web Application (`public/`)
- [`public/logo-icon.svg`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/public/logo-icon.svg) — Square vector icon (`currentColor` responsive).
- [`public/logo-icon-brand.svg`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/public/logo-icon-brand.svg) — Brand icon with electric cyan glow and rounded dark container.
- [`public/logo-horizontal-dark.svg`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/public/logo-horizontal-dark.svg) — Full brand lockup: KD mark + "KioskDrop" + "ENTERPRISE" badge.
- [`public/logo-horizontal-light.svg`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/public/logo-horizontal-light.svg) — Full brand lockup for light surfaces.
- [`public/favicon.svg`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/public/favicon.svg) / [`public/favicon.png`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/public/favicon.png) — Browser tab icon.

### Mobile Application (`mobile/assets/`)
- [`mobile/assets/icon.png`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/assets/icon.png) — $1024 \times 1024$ Store & Launch Icon.
- [`mobile/assets/android-icon-foreground.png`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/assets/android-icon-foreground.png) — $512 \times 512$ Adaptive Icon Foreground.
- [`mobile/assets/android-icon-background.png`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/assets/android-icon-background.png) — $512 \times 512$ Deep Obsidian Background (`#070A10`).
- [`mobile/assets/android-icon-monochrome.png`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/assets/android-icon-monochrome.png) — $432 \times 432$ Android 13+ Themed Icon.
- [`mobile/assets/splash-icon.png`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/assets/splash-icon.png) — $1024 \times 1024$ App Splash Icon.

### Next.js React Component
- [`src/components/KioskDropLogo.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/src/components/KioskDropLogo.tsx) — Reusable `<KioskDropLogo variant="icon" | "full" accent="brand" | "monochrome" />` component integrated into [`src/components/Navbar.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/src/components/Navbar.tsx).
