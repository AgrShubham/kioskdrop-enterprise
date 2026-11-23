# 🚀 KioskDrop Enterprise — Splash & Loading Screens Design System

This specification outlines the visual architecture, motion dynamics, and production implementations for the **KioskDrop Enterprise** startup splash screens, interactive boot sequences, full-screen hardware loading states, and skeleton shimmer loaders.

---

## 📱 Visual Showcase & UI Previews

````carousel
![Mobile Animated Boot Splash Screen](C:/Users/agshu/.gemini/antigravity/brain/9d847b3f-df17-4bf3-ad83-a77cffcc6a27/preview-splash-screen.png)
<!-- slide -->
![Full-Screen Solenoid Loading Screen](C:/Users/agshu/.gemini/antigravity/brain/9d847b3f-df17-4bf3-ad83-a77cffcc6a27/preview-loading-screen.png)
<!-- slide -->
![Dashboard Shimmer Skeleton Loading State](C:/Users/agshu/.gemini/antigravity/brain/9d847b3f-df17-4bf3-ad83-a77cffcc6a27/preview-skeleton-screen.png)
````

---

## 🏗️ Architectural Overview

The loading and splash experience is architected in four distinct layers across the mobile and web applications:

```
+--------------------------------------------------------------------------------+
|                           1. NATIVE EXPO SPLASH                                |
|  - Instant native bootstrap from mobile OS (Android / iOS)                    |
|  - Configured in mobile/app.json ("contain", #070A10, splash-icon.png)         |
+--------------------------------------------------------------------------------+
                                       │
                                       ▼
+--------------------------------------------------------------------------------+
|                        2. IN-APP ANIMATED BOOT SPLASH                          |
|  - AppSplashScreen.tsx mounts seamlessly in mobile/app/_layout.tsx             |
|  - Breathing KD Monogram with concentric radial halos & cyan progress track     |
|  - Real-time diagnostic telemetry log step stream                              |
|  - Smooth cubic-bezier exit fade out                                           |
+--------------------------------------------------------------------------------+
                                       │
                                       ▼
+--------------------------------------------------------------------------------+
|                        3. FULL-SCREEN HARDWARE MODAL LOADER                    |
|  - LoadingScreen.tsx for mission-critical async transitions                   |
|  - Solenoid dispatch, remote locker unlock, zero-trust token exchange          |
|  - Concentric radar pulse rings, dashed spinner orbit, live subsystem code    |
+--------------------------------------------------------------------------------+
                                       │
                                       ▼
+--------------------------------------------------------------------------------+
|                        4. CONTENT SKELETON SHIMMER SYSTEM                      |
|  - Skeleton.tsx (StatCardSkeleton, LockerBaySkeleton, SkeletonBox)             |
|  - Zero layout-shift placeholders during React Query / SSE data fetching       |
|  - Replaces raw ActivityIndicator spinners with responsive, branded shapes     |
+--------------------------------------------------------------------------------+
```

---

## 📂 Implementation Inventory

### 1. Mobile Native Splash
- [`mobile/assets/splash-icon.png`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/assets/splash-icon.png) — $1024 \times 1024$ centered vector mark asset.
- [`mobile/app.json`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/app.json#L7-L12) — Configured with `resizeMode: "contain"` and background `#070A10`.

### 2. Mobile In-App Boot Screen
- [`mobile/src/components/ui/AppSplashScreen.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/src/components/ui/AppSplashScreen.tsx) — Full-screen animated sequence with breathing KD logo, halo rings, and boot stream.
- [`mobile/app/_layout.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/app/_layout.tsx#L57-L61) — Integrated into root layout with smooth state-driven unmount.

### 3. Mobile Loading Screen & Skeletons
- [`mobile/src/components/ui/LoadingScreen.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/src/components/ui/LoadingScreen.tsx) — Modal loading screen with rotating radar beacon and haptic-enabled cancel button.
- [`mobile/src/components/ui/Skeleton.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/src/components/ui/Skeleton.tsx) — Smooth oscillating shimmer components for metric cards and locker bays.
- [`mobile/src/components/ui/KioskDropLogo.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/src/components/ui/KioskDropLogo.tsx) — React Native SVG logo component with brand gradients.
- [`mobile/src/components/layout/GlobalHeader.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/src/components/layout/GlobalHeader.tsx#L76-L90) — Updated with bespoke KD emblem.
- [`mobile/app/(tabs)/index.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/app/(tabs)/index.tsx#L311-L320) — Integrated with `StatCardSkeleton` and `LockerBaySkeleton`.

### 4. Next.js Web App Loading System
- [`src/app/loading.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/src/app/loading.tsx) — Next.js 14 App Router automatic route suspense loading screen with animated logo and shimmer bar.
- [`src/components/LoadingScreen.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/src/components/LoadingScreen.tsx) — Client-side modal overlay for locker checkout and triage submission.

---

## 🧪 Verification & Quality Gates

| Test Suite | Environment | Result |
| :--- | :--- | :--- |
| **Mobile Typecheck** | `mobile` (`tsc --noEmit`) | **0 Errors** |
| **Mobile Jest Tests** | `mobile` (`jest`) | **5/5 Suites Passed, 24/24 Tests Passed** |
| **Web Typecheck** | Root (`tsc --noEmit`) | **0 Errors** |
| **Web Vitest Tests** | Root (`vitest run`) | **7/7 Suites Passed, 39/39 Tests Passed** |
