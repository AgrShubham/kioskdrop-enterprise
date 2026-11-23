# 🎬 KioskDrop Enterprise — App Opening Animation Architecture

This document specifies the motion design, stage choreography, and physical feedback parameters of the **App Opening Animation** in the **KioskDrop Enterprise** mobile application.

---

## ⏱️ Choreographed Motion Timeline

The opening animation runs on a synchronized kinetic timeline lasting **1,750ms** (or an immediate **150ms** fast-forward if tapped):

```mermaid
sequenceDiagram
    autonumber
    participant OS as Native OS / Splash
    participant Boot as AppSplashScreen.tsx
    participant Haptics as Device Haptic Engine
    participant Shell as App Shell (Tabs)

    OS->>Boot: JavaScript bundle loaded (seamless handoff)
    Note over Boot: Stage 1: Elastic Logo Entrance (0ms - 480ms)<br/>Scale: 0.82 ➔ 1.04 ➔ 1.0 (Back-Out Easing)
    Boot->>Haptics: Stage 2: Chevron Drop Flash (380ms)
    Haptics-->>Boot: Tactile click feedback (selection)
    Note over Boot: Stage 3: Identity & Diagnostics Reveal (450ms - 1,400ms)<br/>TranslateY: 18px ➔ 0px • Diagnostics Stream
    Note over Boot: Stage 4: Aperture Zoom-Through (1,400ms - 1,750ms)<br/>Scale: 1.0 ➔ 1.32 • Opacity: 1.0 ➔ 0.0
    Boot->>Shell: Unmounts cleanly; Reveals Live Telemetry Dashboard
```

---

## 🎯 The 4 Kinetic Stages

### Stage 1: Elastic Logo Entrance (`0ms – 480ms`)
- **Physics**: Initial scale at `0.82` and opacity at `0.0`. Uses an overshooting cubic bezier curve (`Easing.out(Easing.back(1.4))`) that scales up to `1.04` before resting cleanly at `1.0`.
- **Lighting**: Concentric ambient halo ring (`#2563EB`) pulses outward with oscillating opacity (`0.12 ➔ 0.28`).

### Stage 2: Solenoid Drop Ignition & Haptic Pulse (`380ms`)
- **Visual Spark**: The forward drop chevron `>` fires a high-intensity cyan strobe (`#38BDF8`) symbolizing the locker solenoid locking mechanism engaging.
- **Haptic Tactility**: Fires `haptics.selection()` on physical devices at the exact apex of the visual flash.

### Stage 3: Identity & Diagnostics Stream (`450ms – 1,400ms`)
- **Typography**: "KioskDrop" and the "ENTERPRISE SMART LOCKER" badge glide upward from $Y = 18\text{px}$ to $0\text{px}$ with a smooth ease-out.
- **Hardware Boot Telemetry**: The terminal log sequentially ticks through the four core initialization steps:
  1. `Initializing Zero-Trust Security Enclave...`
  2. `Syncing Smart Locker SSE Bus...`
  3. `Authorizing Bay Solenoid Matrix...`
  4. `Enterprise Fleet Online.`
- **Shimmer Progress**: Cyan/blue linear gradient bar sweeps across the track over $1,400\text{ms}$.

### Stage 4: Cinematic Aperture / Zoom-Through Reveal (`1,400ms – 1,750ms`)
- **Portal Effect**: Rather than a basic flat fade, the entire splash stage expands smoothly:
  - **Scale**: $1.00 \to 1.32$ (`Easing.in(Easing.cubic)`)
  - **Opacity**: $1.00 \to 0.00$
- **Result**: Creates the sensation of a camera aperture opening or flying *through* the KD emblem directly into the live workspace tabs.

---

## ⚡ Ergonomics: Tap-to-Skip Fast Path
Power users opening the app repeatedly do not want to wait 1.7 seconds every launch:
- The entire container is wrapped in a `Pressable` responder.
- **Tapping anywhere on screen** immediately fast-forwards into an accelerated **150ms** zoom-fade and unmounts, giving users instant access.

---

## 📁 Source Implementation
- **Source Component**: [`mobile/src/components/ui/AppSplashScreen.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/src/components/ui/AppSplashScreen.tsx)
- **App Mount Point**: [`mobile/app/_layout.tsx`](file:///d:/Partition1%20Backup/PROJECTS/Ricoz%20Internship/KioskDrop%20App/mobile/app/_layout.tsx#L57-L61)
- **Verification**: Fully compatible with React Native Animated Native Driver (`useNativeDriver: true`) for continuous **60fps / 120fps** execution without JS thread jank.
