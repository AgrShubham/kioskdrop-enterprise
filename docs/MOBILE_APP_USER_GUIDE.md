# 📱 KioskDrop Enterprise Mobile App — Complete Owner & Developer Guide

> **Purpose of this guide:** Step-by-step instructions tailored for your Windows workstation (`d:\PROJECTS\Ricoz Internship\Project 1`) covering how to instruct an Antigravity agent to build the React Native mobile app, how to run it on your phone or emulator, how to demo every feature, and how to package installable builds.

---

## 1. How Your Three Blueprint Files Work Together

Think of these three files as a complete software factory kit:

| File | Audience | Role |
| :--- | :--- | :--- |
| **[`MOBILE_APP_CONVERSION_PROMPT.md`](../MOBILE_APP_CONVERSION_PROMPT.md)** | The Antigravity Coding Agent | **The Technical Bible.** Contains every API payload, database quirk, backend patch snippet, NativeWind color hex code, screen wireframe, edge case, and Jest assertion. |
| **[`MOBILE_APP_EXECUTION_PLAN.md`](../MOBILE_APP_EXECUTION_PLAN.md)** | The Agent & You (Reviewing Progress) | **The Step-by-Step Build Roadmap.** Orders work safely into `Phase -1 -> Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4` with checkboxes and strict exit gates so nothing gets skipped. |
| **[`docs/MOBILE_APP_USER_GUIDE.md`](MOBILE_APP_USER_GUIDE.md)** *(this file)* | **You (Owner / Developer)** | **Your Operator Manual.** Exact commands to start the build, run both servers on Windows, connect phones/emulators, demo every flow, and troubleshoot issues. |

---

## 2. How to Launch the Build with Antigravity

Open a clean Antigravity agent chat inside workspace `d:\PROJECTS\Ricoz Internship\Project 1` and choose whichever style fits you best:

### Option A — Full Autonomous Build (Recommended)
Use `/goal` so the agent works through every phase and passes every test gate automatically before reporting back:

```text
/goal
Read @MOBILE_APP_CONVERSION_PROMPT.md and @MOBILE_APP_EXECUTION_PLAN.md.
Execute the entire conversion strictly from Phase -1 through Phase 4, checking off every Quality Gate cleanly before proceeding to the next phase. Do not commit or push git branches until I review the result.
```

### Option B — Plan-First Approval Workflow
If you want to review the file list and ask adjustments before Phase 0 edits begin:

```text
/plan
Read @MOBILE_APP_CONVERSION_PROMPT.md and @MOBILE_APP_EXECUTION_PLAN.md. Inspect the current codebase and present your milestone confirmation before starting Phase 0.
```

### Option C — Supervised Phase-by-Phase Execution
If you want to inspect after each milestone, run one phase at a time:
1. `"Execute Phase -1 and Phase 0 of @MOBILE_APP_EXECUTION_PLAN.md per @MOBILE_APP_CONVERSION_PROMPT.md, then report gate results."`
2. `"Execute Phase 1 and Phase 2 of @MOBILE_APP_EXECUTION_PLAN.md and verify tests pass."`
3. `"Execute Phase 3 (3A, 3B, 3C) of @MOBILE_APP_EXECUTION_PLAN.md and verify TypeScript passes."`
4. `"Execute Phase 4 of @MOBILE_APP_EXECUTION_PLAN.md: run all 5 Jest suites, live API Bearer tests, bundle export, and finish mobile/README.md."`

---

## 3. Prerequisites on Your Windows Machine

Your machine already has **Node.js (`v25.9.0`)**, **npm (`11.6.2`)**, and **Android Debug Bridge (`adb`)** on PATH!

To preview the finished app live, pick **one or more** display targets:

1. **Easiest (Physical Android Phone or iPhone via Expo Go — zero heavy SDK install):**
   - Install **Expo Go** from Google Play Store or Apple App Store on your phone.
   - Make sure your phone and Windows PC are on the **same Wi-Fi network**.
2. **Android Studio Emulator (Desktop Android window):**
   - Open **Android Studio -> Device Manager -> Start any Virtual Device (Pixel / API 34+)**.
   - Verify Windows sees it by running `adb devices` in PowerShell.
3. **Browser Preview (Quick visual check without phone/emulator):**
   - Built into Expo (`npx expo start --web`); works immediately in Chrome/Edge.
4. *(Note about iOS Simulator on Windows)*: Apple's iOS Simulator only runs on macOS (`Xcode`). On Windows, test iOS either on a **physical iPhone using Expo Go** or build an `.ipa` remotely via **Expo EAS Build**.

---

## 4. Running the Backend + Mobile App Locally (Two Terminals)

Because the mobile app connects to your Next.js API server (`/api/*`), run **two PowerShell terminals** side-by-side:

### Terminal 1 — Start the KioskDrop Next.js Backend

> **Important Branch Reminder (`experimental` vs `main`):**  
> Your `experimental` branch uses **SQLite** (`file:./dev.db`), while `.env` may contain a Neon Postgres connection string for `main`. On `experimental`, always pass `$env:DATABASE_URL="file:./dev.db"`:

```powershell
cd "d:\PROJECTS\Ricoz Internship\Project 1"
$env:DATABASE_URL="file:./dev.db"

# Ensure SQLite Prisma client & seed data are ready:
npx prisma generate
npx prisma db push
npm run db:seed

# Bind on 0.0.0.0 so physical phones on your Wi-Fi can reach port 3000 too:
npx next dev -H 0.0.0.0 -p 3000
```

Wait until you see Next.js listening on port `3000` (`http://localhost:3000`).

*(If you ever test while on the `main` branch instead, do NOT override `DATABASE_URL` with SQLite — use your Neon `.env` Postgres connection and `npx next dev -H 0.0.0.0 -p 3000`.)*

### Terminal 2 — Start the Expo Mobile App

```powershell
cd "d:\PROJECTS\Ricoz Internship\Project 1\mobile"
npx expo start
```

From the Expo terminal menu:
- Press **`a`** -> Opens automatically in a running **Android Emulator**
- Press **`w`** -> Opens **Expo Web** in your desktop browser (`http://localhost:8081`)
- **Scan the QR Code** -> Opens live on your **physical Android phone (Expo Go)** or **iPhone (Camera app -> Expo Go)**!

---

## 5. Connecting Different Devices Cleanly (Networking Cheatsheet)

Mobile devices do not share `localhost` with your PC in the same way browsers do. Here is how each device reaches your PC's port `3000`:

| Target Device | URL Used by App | Setup Tip |
| :--- | :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:3000` *(Auto-detected)* | Special Android alias for host PC `127.0.0.1`. Or run `adb reverse tcp:3000 tcp:3000` to use `localhost:3000`. |
| **Physical Phone (Android / iPhone via Expo Go)** | `http://<YOUR-PC-LAN-IP>:3000` *(Auto-detected from Expo QR)* | Ensure Windows Firewall allows Node/Port 3000 on your Wi-Fi profile (see command below). |
| **Expo Web Browser** | `http://localhost:3000` *(Auto-detected)* | Uses CORS headers added in Phase 0 (`next.config.js`). |
| **Hosted Vercel Backend** | `https://kioskdrop-enterprise.vercel.app` | Tap the **Persona chip -> Server Config** inside the app to switch anytime without restarting Expo! Note: live SSE push streams work best against Terminal 1's local stateful Node server (ADR D3). |

### Find Your PC LAN IP (PowerShell)
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254*" } | Select-Object InterfaceAlias, IPAddress
```

### Allow Port 3000 Through Windows Firewall (If Physical Phone Times Out)
Run PowerShell **as Administrator** once:
```powershell
New-NetFirewallRule -DisplayName "KioskDrop Nextjs Dev 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

### In-App Connection Verifier
Once the app opens, tap the top-right **Persona Chip (`EMP`) -> Server Connection** tab and press **Test Ping**:
- Green result (`Connected • ~15-60ms • 4 rooms loaded`) confirms your phone is talking cleanly to Prisma & Next.js.

---

## 6. Guided Feature Walkthrough (Demo Script on Mobile)

Try these 4 signature enterprise scenarios once your app connects:

1. **Test 1 — Floor Fallback & Broken USB-C Port Bypass (Rapid-Drop Tab)**
   - Tap **`Scan Room QR`** to test the live camera scanner (or select **`Client-Pitch-3C`** manually).
   - Observe the **Floor 3 -> Floor 4 Hub Proximity Routing** notice (`Client-Pitch-3C` is on Floor 3, automatically served by `lkr_floor4`).
   - Select **"Display Not Recognized (BYOD Laptop)"** -> toggle **"Laptop USB-C port physically loose/damaged"** -> see recommended SKU change to **Enterprise 4K Wireless HDMI Kit**.
   - Tap **Diagnose & Reserve Hardware** -> note the 6-digit PIN + 10:00 countdown -> tap **Open in Locker Kiosk**.

2. **Test 2 — Biometric Face ID / Fingerprint Unlock & BadUSB Security Alarm (Kiosk Tab)**
   - In Kiosk, verify the hub + reserved bay glows Amber.
   - Unlock using the pre-filled **6-digit Keypad** (`ENTER`), **Tap RFID Badge**, OR **Biometric Unlock** (triggers real Android Fingerprint / iOS Face ID!).
   - Bay turns **Sky Blue (DOOR OPEN)** -> tap **Take Device (IR Break)** (bay becomes **Checked Out**) OR tap **Simulate Foreign BadUSB (`0x16C0/0x05DF`)** to watch error haptics, crimson **Quarantine**, and real-time **SSE Telemetry** alert!
   - On a **Checked Out** bay, tap **Return & Plug In** -> test *Defective 5V/3A Fault* (closes employee ticket while quarantining the bay) or *Counterfeit Swap* (`409 SECURITY_MISMATCH_ALARM`).

3. **Test 3 — RBAC Escalation, Customs Duty Stack & Mobile PO Reception Intake (Command Center Tab)**
   - Open **Command** while logged in as **Aarav (`EMPLOYEE`)** -> confirm the **RBAC Guard Banner** blocks Compliance/FinOps writes.
   - Tap **`Switch to IT Admin (Priya Patel)`** inside the banner -> app immediately receives & stores a signed Bearer token in SecureStore and unlocks all 4 modules with zero reload!
   - In **Zero-Trust & Duty**: enter `34000` CIF + `85437099` (`DIRECT_IMPORT`) -> verify Total Customs Duty = **`₹15,095.86`** (`44.40%`).
   - In **FinOps & POs**: authorize a new **Zaggle Card (`SAP S/4HANA`)** purchase order (`PENDING_RECEPTION`), then tap **`Scan & Stock Hardware`** directly on that PO card to inspect & stock a new serialized asset into any open locker bay (`POST /api/admin/reception/scan`)!
   - In **Analytics & Hubs**: inspect the **Room 4B 14-day anomaly alert** (`4` unreturned adapters) and tap bars on the **Procurement Savings Chart**.
   - In **ITSM Webhooks**: tap **`Mock ServiceNow Event`**, open the JSON Payload Inspector, and trigger **Replay Event**.

4. **Test 4 — Deep-Link CLI Verification (Optional)**
   With an Android Emulator or USB phone connected via `adb`:
   ```powershell
   cd "d:\PROJECTS\Ricoz Internship\Project 1\mobile"
   npx uri-scheme open "kioskdrop://request?room=Boardroom-4B&floor=4" --android
   ```

---

## 7. Running Tests & Packaging an Installable `.apk`

### Run All Automated Checks (Root + Mobile)
```powershell
# 1. Verify Next.js Web + Backend Vitest (39/39)
cd "d:\PROJECTS\Ricoz Internship\Project 1"
$env:DATABASE_URL="file:./dev.db"
npm run typecheck
npm run lint
npm run test

# 2. Verify React Native TypeScript + 5 Mobile Jest Suites + Expo Health
cd "d:\PROJECTS\Ricoz Internship\Project 1\mobile"
npx tsc --noEmit
npm test
npx expo-doctor
```

### Build a Shareable Android `.apk` via EAS Cloud Build
When you want an installable standalone `.apk` without needing Expo Go:
1. Create a free Expo account at [expo.dev](https://expo.dev).
2. Run inside `/mobile`:
   ```powershell
   npx eas-cli login
   npx eas-cli build --platform android --profile preview
   ```
   When finished, EAS gives you a QR code / download link for the `.apk`. Remember to point the app's **Server Config** (`PersonaServerSheet`) at a reachable HTTPS URL (such as your Vercel deployment) if testing outside your home Wi-Fi!

---

## 8. Troubleshooting Quick Reference

| Symptom | Likely Cause | Fix |
| :--- | :--- | :--- |
| `PrismaClientInitializationError` or Postgres error on `experimental` | Shell didn't set `$env:DATABASE_URL="file:./dev.db"`, so `.env` Postgres URL loaded against SQLite schema | Always run `$env:DATABASE_URL="file:./dev.db"` in Terminal 1 before `prisma` or `next dev`. |
| Phone opens Expo Go but Kiosk/Rooms spin forever or say Network Error | Windows Firewall blocking port `3000`, or `next dev` bound to `127.0.0.1` only | Start backend with `npx next dev -H 0.0.0.0 -p 3000`, open Firewall TCP `3000`, and verify URL in **Persona Sheet -> Test Ping**. |
| `[● SYNC]` stays amber instead of green `[● LIVE]` | Connected to serverless Vercel endpoint or stale SSE socket | Run against local Terminal 1 (`npx next dev`) and foreground the app so `AppState` reconnects cleanly. |
| Metro bundler cache glitches after config/plugin edits | Stale Babel / NativeWind CSS transform cache | Run `npx expo start -c` inside `mobile/`. |
| Git status shows extra cache files before committing | Unignored temporary folders or OS artifacts | Run `git status -s` first; confirm `mobile/node_modules/` and `mobile/.expo/` are ignored by `.gitignore`, and never mix SQLite schema (`experimental`) into `main`. |

