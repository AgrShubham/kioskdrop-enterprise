# 📱 Master Antigravity Prompt & 10x Engineering Specification: KioskDrop Enterprise Mobile App (React Native / Expo)

> **How to invoke an Antigravity agent with this specification:**  
> Open an Antigravity agent chat in workspace `d:\PROJECTS\Ricoz Internship\Project 1` and send:  
> `@MOBILE_APP_CONVERSION_PROMPT.md Execute Phases 0 through 4 in order. Do not skip any Phase Quality Gate, mock contract, edge case, or runtime check.`

---

## 0. Agent Persona, Scope & Non-Negotiable Constraints

You are acting as my **Principal Mobile Architect, React Native Engineer, Security Reviewer, and QA Lead**.

Your mission is to build a production-grade, cross-platform **iOS and Android mobile application** inside **`/mobile`** using **React Native (Expo SDK + TypeScript strict)** that delivers complete functional, visual, security, telemetry, and FinOps parity with the **KioskDrop Enterprise** web platform (`src/`), powered directly by the **existing Next.js 14 Route Handlers (`/api/*`) and Prisma ORM backend**.

### Mandatory Operating Rules
1. **Inspect Before Writing Code:** Read these authoritative repository files before Phase 0 edits:
   - Auth & API Infrastructure: `src/lib/session.ts`, `src/app/api/session/role/route.ts`, `src/app/api/session/current/route.ts`, `src/lib/api-response.ts`, `src/lib/locker-lockout.ts`, `src/lib/telemetry-bus.ts`
   - Domain & Services: `src/domain/states.ts`, `src/services/triage.ts`, `src/services/landed-cost.ts`, `src/services/pin.ts`, `src/services/reservation.ts`, `src/services/kiosk.ts`
   - Web UI Reference & Design System: `src/app/globals.css`, `src/components/Navbar.tsx`, `src/app/request/page.tsx`, `src/app/kiosk-simulator/page.tsx`, `src/app/admin/page.tsx`, `dark_theme_redesign_plan.md`
   - Database & Config: `prisma/schema.prisma`, `prisma/seed.ts`, `tsconfig.json`, `next.config.js`, `package.json`
2. **Preserve Web App, CI/CD & Database Compatibility 100%:**
   - Do **NOT** break existing web routes (`/`, `/request`, `/kiosk-simulator`, `/admin`), existing cookie auth, Vercel deployment, or the **39/39 Vitest suite** (`npm run test`).
   - Do **NOT** change `prisma/schema.prisma` datasource `provider`. Notice that the `experimental` branch uses `sqlite` (`DATABASE_URL="file:./dev.db"`) while `main` uses `postgresql` (Neon Postgres). Your `/mobile` app and Phase 0 backend edits must be completely agnostic to the underlying database provider.
3. **Zero Duplicated Business Logic:**
   - Deterministic AV symptom-to-SKU triage (`triage.ts`), timing-safe HMAC OTP PIN hashing (`pin.ts`), atomic locker compartment claiming (`reservation.ts`), solenoid/sensor custody SHA-256 hash-chaining (`kiosk.ts`), RBAC enforcement (`requireRole`), and statutory customs duty computation (`landed-cost.ts`) MUST remain authoritative on the Next.js backend.
   - Mobile performs client-side Zod validation, preview hints, currency/countdown formatting, native hardware interactions (QR camera, Face ID/Touch ID, haptics), and real-time UI synchronization.
4. **Integer Paise Arithmetic Only:**
   - Never convert monetary totals to IEEE-754 floats for math. Always consume integer `paise` fields (`Int`) from API payloads and format cleanly into INR strings (`₹1,000.00`).
5. **Truth-in-Verification:**
   - Never fabricate test results, compiler output, or runtime runs. Explicitly execute every Phase Gate command and report actual stdout/results.

---

## 1. Industry-Standard Tech Stack & Architectural Decisions

This stack follows official React Native / Expo production standards tuned for **Expo Go instant previews**, **EAS standalone iOS/Android builds**, **zero C++ native-linking friction**, and **1:1 design parity with Next.js + Tailwind**:

| Layer | Package / Tool | Installation Strategy | Why This Standard Was Selected |
| :--- | :--- | :--- | :--- |
| **Core Runtime** | **React Native + Expo SDK (latest stable compatible with Expo Go)**, **TypeScript strict**, **Hermes** | `npx create-expo-app@latest` + `npx expo install` | Official RN toolchain. Using `npx expo install` guarantees ABI compatibility across all native Expo modules inside Expo Go and EAS Build without CocoaPods/Gradle mismatches. |
| **Navigation & Deep Links** | **`expo-router`** | Bundled with Expo template | File-based App Router (`app/(tabs)/*` + modal `app/scanner.tsx`) mirrors Next.js conventions and handles typed deep links (`kioskdrop://request?room=Boardroom-4B&floor=4`, `kioskdrop://kiosk?locker=...&pin=...`). |
| **Styling & Motion** | **`nativewind` (v4)** + **`tailwindcss`** + **`react-native-reanimated`** + **`react-native-safe-area-context`** | `npx expo install nativewind tailwindcss react-native-reanimated react-native-safe-area-context` | Reuses Tailwind utilities and implements both **Obsidian & Electric Sapphire** Dark Mode and **Executive Crisp** Light Mode with GPU-driven 60fps solenoid/LED pulse animations. |
| **Icons & Vector Graphics** | **`lucide-react-native`** + **`react-native-svg`** | `npx expo install lucide-react-native react-native-svg` | Exact 1:1 icon parity with web Lucide (`ShieldCheck`, `Cpu`, `Smartphone`, `BarChart3`, `KeyRound`, `QrCode`, `Radio`, `Fingerprint`, `Nfc`, `Zap`, etc.). |
| **Server State & Cache** | **`@tanstack/react-query` v5** | `npm install @tanstack/react-query` | Manages polling/refetching, request deduplication, error/retry boundaries, and instant SSE-triggered cache invalidation (`queryClient.invalidateQueries`). |
| **Validation & Types** | **`zod`** | `npm install zod` | Runtime parsing & type safety aligned 1:1 with backend route schemas. |
| **Client State & Encrypted Auth** | **`zustand`** + **`@react-native-async-storage/async-storage`** + **`expo-secure-store`** | `npx expo install expo-secure-store @react-native-async-storage/async-storage && npm install zustand` | `expo-secure-store` encrypts the signed HMAC `kioskdrop_session` Bearer token in iOS Keychain / Android Keystore; Zustand + AsyncStorage persist theme, custom server URL, and recent SSE event buffer. |
| **Real-Time Telemetry (SSE)** | **`react-native-sse`** | `npm install react-native-sse` | **Critical RN constraint:** Hermes lacks browser `EventSource` and `BroadcastChannel`. `react-native-sse` supports named SSE events (`LOCKER_RESERVED`, `DOOR_UNLOCKED`, etc.), `Last-Event-ID`, and custom `Authorization: Bearer <token>` headers cleanly. |
| **Native QR Camera** | **`expo-camera` (`CameraView`)** | `npx expo install expo-camera` | Turns the simulated web QR entry into a genuine camera QR scanner for conference rooms with hardware flashlight toggle and simulator/permission-denied fallback. |
| **Biometrics, Haptics & UX** | **`expo-local-authentication`**, **`expo-haptics`**, **`expo-clipboard`**, **`expo-constants`**, **`expo-linking`** | `npx expo install expo-local-authentication expo-haptics expo-clipboard expo-constants expo-linking` | Real Face ID / Touch ID / Android BiometricPrompt unlock on Kiosk, tactile keypad clicks, error buzzes on BadUSB alarms, 1-tap OTP copy, and automatic LAN IP host discovery. |
| **Charts** | **`react-native-gifted-charts`** + **`react-native-svg`** | `npm install react-native-gifted-charts` | Replaces web-only DOM `<svg>` `recharts` with native SVG grouped bar charts (`Wholesale B2B` vs `Retail Avoided` vs `Net Savings`) that work inside Expo Go (no Skia native build required). |
| **Testing** | **`jest-expo`**, **`@testing-library/react-native`**, **`@types/jest`** | `npx expo install jest-expo @testing-library/react-native @types/jest` | Fast headless component, navigation, and logic unit testing. |

### Explicit Anti-Patterns (Strictly Forbidden)
- ❌ **DO NOT** import browser/Next.js modules (`recharts`, `next/navigation`, `next/headers`, `window.localStorage`, `document`, DOM `EventSource`, `BroadcastChannel`, `AudioContext`) inside `/mobile`.
- ❌ **DO NOT** spin up a duplicate Express/Fastify/tRPC backend — consume the existing `/api/*` Next.js handlers directly.
- ❌ **DO NOT** hardcode `http://localhost:3000` unconditionally (fails on Android Emulators `10.0.2.2:3000` and physical phones requiring LAN IP or Vercel HTTPS).
- ❌ **DO NOT** suppress `TypeScript` errors (`@ts-ignore`, `as any` everywhere) or drop unit assertions to pass CI.
- ❌ **DO NOT** render web HTML `<table>` layouts on phone viewports — transform all admin datasets into responsive `ChamferCard` lists with search/filter chips and detail modals.

---

## 2. Target Monorepo Architecture

```text
d:\PROJECTS\Ricoz Internship\Project 1\
├── src/                                  # Existing Next.js 14 App + Shared Backend
│   ├── lib/session.ts                    # PATCH (Phase 0): Bearer header auth + cookie fallback
│   ├── app/api/session/role/route.ts     # PATCH (Phase 0): Return signed `token` in JSON body + cookie
│   └── ...                               # All other routes & services UNTOUCHED
├── next.config.js                       # PATCH (Phase 0): Dev-safe CORS headers on /api/:path*
├── tsconfig.json                         # PATCH (Phase 0): Add "mobile" to "exclude"
├── .gitignore                            # PATCH (Phase 0): Ignore mobile caches & native build dirs
└── mobile/                               # NEW: React Native Expo Application
    ├── app.json                          # Expo manifest: scheme "kioskdrop", permissions, plugins
    ├── eas.json                          # EAS profiles: development, preview (APK), production
    ├── package.json                      # Expo dependencies + scripts (typecheck, test, doctor, start)
    ├── tsconfig.json                     # strict: true, "@/*" -> "./src/*"
    ├── babel.config.js                   # nativewind/babel + react-native-reanimated/plugin
    ├── metro.config.js                   # withNativeWind(config, { input: "./global.css" })
    ├── tailwind.config.js                # Dark Obsidian Sapphire & Light semantic color tokens
    ├── global.css                        # @tailwind base; @tailwind components; @tailwind utilities;
    ├── .env.example                      # Documented EXPO_PUBLIC_API_URL targets
    ├── jest.config.js                    # jest-expo preset + moduleNameMapper "@/*"
    ├── jest.setup.ts                     # Deterministic RN + Expo native module mocks
    ├── README.md                         # Complete setup guide (Android/iOS/Physical/EAS/Deep Links)
    ├── app/
    │   ├── _layout.tsx                   # Root Providers: SafeArea, QueryClient, Theme, SSE, Stack
    │   ├── +not-found.tsx                # Graceful unmatched deep-link / 404 screen
    │   ├── scanner.tsx                   # Modal Route: CameraView QR scanner + Torch + Manual Picker
    │   └── (tabs)/
    │       ├── _layout.tsx               # 4-Tab Bar + GlobalHeader + PersonaServerSheet + TelemetryDrawer
    │       ├── index.tsx                 # Tab 1: Home Gateway & Quick Workflows
    │       ├── request.tsx               # Tab 2: Rapid-Drop QR Portal + Diagnostic Triage + OTP Pass
    │       ├── kiosk.tsx                 # Tab 3: Smart Locker Terminal (12-Bay Grid + Keypad + MFA + BadUSB)
    │       └── admin.tsx                 # Tab 4: Enterprise Command Center (Compliance/FinOps/Analytics/Webhooks)
    ├── src/
    │   ├── constants/
    │   │   ├── symptoms.ts               # Exact 5 diagnostic symptoms & fallback SKU hints
    │   │   └── presets.ts                # Presets for API URLs & BadUSB test vector constants (0x16C0/0x05DF)
    │   ├── types/
    │   │   └── domain.ts                 # Complete domain interfaces mirroring prisma/schema.prisma & states.ts
    │   ├── schemas/
    │   │   └── api.ts                    # Zod schemas for all requests, responses & normalized ApiError
    │   ├── lib/
    │   │   ├── env.ts                    # 4-tier platform API URL resolver + sanitizer
    │   │   ├── api.ts                    # Fetch client: timeout, Bearer injection, ApiClientError vs NetworkError
    │   │   ├── format.ts                 # Integer-paise INR formatter, compact INR, MM:SS countdown, date helpers
    │   │   ├── qr-parser.ts              # Deep-link/Web-URL/JSON/Raw-slug QR parser + Kiosk PIN sanitizer
    │   │   ├── haptics.ts                # Safe expo-haptics triggers (tap, success, error, warning)
    │   │   ├── storage.ts                # expo-secure-store session token + AsyncStorage helpers
    │   │   └── theme.ts                  # Palette definitions + bay status LED colors
    │   ├── store/
    │   │   └── app-store.ts              # Zustand store: themeMode, apiBaseUrlOverride, sseState, events[50]
    │   ├── hooks/
    │   │   ├── useSession.ts             # Current session query + switchRole mutation (persists Bearer token)
    │   │   └── useTelemetrySSE.ts        # react-native-sse subscriber + AppState lifecycle + Query invalidation
    │   └── components/
    │       ├── ui/
    │       │   ├── ChamferCard.tsx       # Precision chamfered container with top specular edge highlight
    │       │   ├── StatusBadge.tsx       # Semantic pill badges (emerald/amber/sky/crimson/slate)
    │       │   └── ScreenHeader.tsx      # Compact hero badge + title block
    │       ├── layout/
    │       │   ├── GlobalHeader.tsx      # Brand, LIVE/SYNC pill, ThemeToggle, Persona chip
    │       │   ├── PersonaServerSheet.tsx # Role switcher (EMP/IT_ADMIN/FINOPS) + API URL tester
    │       │   └── TelemetryDrawerModal.tsx # Live SSE event stream log inspector (up to 50 events)
    │       ├── request/
    │       │   ├── SymptomCard.tsx       # Selectable AV failure symptom card
    │       │   └── PinPassCard.tsx       # Illuminated OTP Pickup Pass + TTL timer + Copy + Open in Kiosk
    │       ├── kiosk/
    │       │   ├── LockerBayCard.tsx     # Bay tile: LED glow, solenoid/door/IR/5V sensors, inline actions
    │       │   ├── NumericKeypad.tsx     # 6-slot display + 3x4 backlit grid (`CLEAR`, `0`, `ENTER`) + haptics
    │       │   └── ReturnInspectionModal.tsx # Healthy / 5V Charging Fault / BadUSB mismatch test modal
    │       └── admin/
    │           ├── RbacBanner.tsx        # Inline RBAC escalation alert for EMPLOYEE persona
    │           ├── LandedCostCalculator.tsx # HSN Indian Customs Duty stack calculator (ADR D6)
    │           ├── AssetRegistrySection.tsx # Zero-Trust USB VID/PID search, filters & whitelist toggle
    │           ├── FinOpsReplenishSheet.tsx # B2B PO creator (Zaggle/Happay -> SAP/Oracle/Zoho)
    │           ├── ReceptionScanModal.tsx # PO intake (`PENDING_RECEPTION` -> `POST /api/admin/reception/scan`)
    │           ├── ProcurementBarChart.tsx # react-native-gifted-charts grouped bar chart + legend
    │           └── WebhookInspectorModal.tsx # JSON payload modal + Replay Event action
    └── __tests__/
        ├── format.test.ts                # Paise->INR, golden test vector parity, URL resolver tests
        ├── qr-parser.test.ts             # URI/Web/JSON/Raw QR resolution + PIN sanitizer tests
        ├── keypad-kiosk.test.tsx         # Loading/connection error vs invalid PIN separation + unlock tests
        ├── request-triage.test.tsx       # Symptom selection, portDamaged switch & PinPassCard countdown/copy
        └── admin-rbac.test.tsx           # Employee RBAC restriction, role switch, landed cost UI tests
```

---

## 3. Phase 0: Backend Mobile-Compatibility Patches (Exact Specifications)

Make these **minimal, 100% backwards-compatible** edits at the repository root BEFORE initializing `/mobile`:

### 3.1 Dual-Transport Auth (`src/lib/session.ts`)
Currently `getSession()` reads only `cookies().get(SESSION_COOKIE_NAME)`. Update it so mobile clients authenticating via `Authorization: Bearer <token>` work identically to web browsers while keeping Vitest and SSR fallbacks intact:

```ts
import { cookies, headers } from "next/headers";
// ... keep all existing interfaces, constants, signSession(), verifySession(), requireRole() untouched!

export async function getSession(): Promise<UserSession> {
  // 1. Mobile / API Bearer Token Precedence
  try {
    const headerStore = headers();
    const authHeader =
      headerStore.get("authorization") || headerStore.get("Authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const bearerToken = authHeader.slice(7).trim();
      if (bearerToken) {
        const decoded = verifySession(bearerToken);
        if (decoded) return decoded;
      }
    }
  } catch {
    // Outside request context (e.g., Vitest direct service calls)
  }

  // 2. Web Cookie Fallback (100% preserved)
  try {
    const cookieStore = cookies();
    const cookieToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (cookieToken) {
      const decoded = verifySession(cookieToken);
      if (decoded) return decoded;
    }
  } catch {
    // Outside request context
  }

  return DEFAULT_EMPLOYEE_SESSION;
}
```
- **Verify:** Existing `UnauthorizedError`, `ForbiddenError`, `DEFAULT_EMPLOYEE_SESSION`, `signSession`, `verifySession`, and `requireRole` remain unchanged.

### 3.2 Expose Signed Token on Role Switch (`src/app/api/session/role/route.ts`)
Keep setting the `kioskdrop_session` `httpOnly` cookie **and** include `token` in the JSON body so React Native can store it in `expo-secure-store`:

```ts
const token = signSession(sessionData);

const response = successResponse({
  message: `Switched active persona to ${targetUser.name} (${targetUser.role})`,
  session: sessionData,
  token, // Stored securely in expo-secure-store by the React Native client
});
```
Also verify `GET /api/session/current` (`src/app/api/session/current/route.ts`) reflects the Bearer-authenticated persona automatically once `getSession()` checks `Authorization: Bearer <token>`.

### 3.3 Dev-Friendly API CORS Headers (`next.config.js`)
Native iOS/Android `fetch` bypasses browser CORS, **but** Expo Web (`http://localhost:8081`) requires CORS headers when calling Next.js on `:3000`. Update `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, idempotency-key, Last-Event-ID, x-servicenow-signature",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```
*(Note: Because Bearer tokens are sent explicitly in the `Authorization` header rather than ambient cookies on native/Expo Web, `"*"` with explicit allowed headers does not weaken cookie CSRF protection; never relax server-side `requireRole()` checks.)*

### 3.4 Root TypeScript & Git Isolation
- **`tsconfig.json`:** Update `"exclude": ["node_modules", "mobile"]` so root `npm run typecheck` does not fail on React Native JSX or Expo module resolution.
- **`.gitignore`:** Append cleanly:
  ```gitignore
  # React Native / Expo Mobile Workspace
  mobile/node_modules/
  mobile/.expo/
  mobile/dist/
  mobile/web-build/
  mobile/android/
  mobile/ios/
  mobile/.env
  mobile/.env*.local
  mobile/*.jks
  mobile/*.p8
  mobile/*.p12
  mobile/*.key
  mobile/*.mobileprovision
  mobile/*.orig.*
  ```

### Phase 0 Quality Gate
Run at workspace root before touching `/mobile`:
- `npm run typecheck` -> `0` errors
- `npm run lint` -> `0` errors
- `npm run test` -> **39/39** Vitest tests pass

---

## 4. Phase 1: Exact Mobile Config Blueprints

Bootstrap `/mobile` with `npx create-expo-app@latest mobile --template blank-typescript` (or `tabs`), then install verified packages via `npx expo install` so SDK versions align cleanly. Ensure all config files adhere strictly to these specifications:

### 4.1 `mobile/app.json`
- `"name": "KioskDrop Enterprise"`
- `"slug": "kioskdrop-enterprise"`
- `"scheme": "kioskdrop"` (enables `kioskdrop://request?room=Boardroom-4B&floor=4` and `kioskdrop://kiosk?locker=lkr_floor4&pin=123456`)
- `"userInterfaceStyle": "automatic"`
- `"experiments": { "typedRoutes": true }`
- `"ios"`:
  - `"bundleIdentifier": "com.kioskdrop.enterprise"`
  - `"supportsTablet": true`
  - `"infoPlist"`:
    - `"NSCameraUsageDescription": "KioskDrop scans meeting-room QR tags and equipment barcodes for Zero-Trust AV dispatch."`
    - `"NSFaceIDUsageDescription": "KioskDrop uses Face ID to authorize rapid smart-locker solenoid unlock."`
- `"android"`:
  - `"package": "com.kioskdrop.enterprise"`
  - `"permissions": ["CAMERA", "USE_BIOMETRIC", "USE_FINGERPRINT"]`
  - `"intentFilters"` for `kioskdrop://` scheme
- `"plugins"`: `["expo-router", "expo-secure-store", ["expo-camera", { "cameraPermission": "..." }], ["expo-local-authentication", { "faceIDPermission": "..." }]]`

### 4.2 `mobile/eas.json`
Define 3 clean profiles:
- `development`: `{ "developmentClient": true, "distribution": "internal" }`
- `preview`: `{ "distribution": "internal", "android": { "buildType": "apk" } }`
- `production`: `{ "autoIncrement": true }`

### 4.3 `mobile/package.json` Scripts
Include:
- `"start": "expo start"`
- `"android": "expo start --android"`
- `"ios": "expo start --ios"`
- `"web": "expo start --web"`
- `"typecheck": "tsc --noEmit"`
- `"test": "jest --watchAll=false"`
- `"doctor": "npx expo-doctor"`

### 4.4 `mobile/tsconfig.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`
- **`mobile/tsconfig.json`**: Extends `"expo/tsconfig.base"`, sets `"strict": true`, `"paths": { "@/*": ["./src/*"] }`.
- **`mobile/babel.config.js`**: `presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"]`, plus `plugins: ["react-native-reanimated/plugin"]` (MUST be last plugin!).
- **`mobile/metro.config.js`**: Uses `getDefaultConfig(__dirname)` wrapped with `withNativeWind(config, { input: "./global.css" })`.
- **`mobile/tailwind.config.js`**: `darkMode: "class"`, `content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"]`, `presets: [require("nativewind/preset")]`, semantic Obsidian Sapphire colors configured cleanly.
- **`mobile/.env.example`**:
  ```env
  # Choose based on your runtime target:
  # Android Emulator -> http://10.0.2.2:3000
  # iOS Simulator    -> http://localhost:3000
  # Physical Device  -> http://<YOUR-PC-LAN-IP>:3000
  # Production Demo  -> https://kioskdrop-enterprise.vercel.app
  EXPO_PUBLIC_API_URL=http://localhost:3000
  ```

### 4.5 `mobile/jest.config.js` & `mobile/jest.setup.ts`
- Configure `preset: "jest-expo"`, `setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"]`, `moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" }`, and proper `transformIgnorePatterns` for React Native / Expo / Lucide / Gifted Charts / NativeWind packages.
- **`mobile/jest.setup.ts`** MUST deterministically mock native bridge modules:
  - `expo-secure-store` (in-memory `Map` backing `getItemAsync`, `setItemAsync`, `deleteItemAsync`)
  - `@react-native-async-storage/async-storage` (official `@react-native-async-storage/async-storage/jest/async-storage-mock` or clean Map mock)
  - `expo-haptics` (`impactAsync`, `notificationAsync`, `selectionAsync` no-op Jest mocks)
  - `expo-local-authentication` (`hasHardwareAsync`, `isEnrolledAsync`, `authenticateAsync`)
  - `expo-clipboard` (`setStringAsync` Jest mock)
  - `expo-camera` (`CameraView` stub component + `useCameraPermissions`)
  - `react-native-sse` (controllable `EventSource` mock class with `addEventListener`, `close`)
  - `react-native-reanimated` (`require("react-native-reanimated/mock")`)

---

## 5. Complete Verified Domain, State Machine, Seed Data & API Contracts

All interfaces in `mobile/src/types/domain.ts` and schemas in `mobile/src/schemas/api.ts` MUST match the actual backend route handlers & Prisma schema:

### 5.1 Domain Enums & State Transitions (`src/domain/states.ts`)
- **Roles:** `"EMPLOYEE" | "IT_ADMIN" | "FINOPS_AUDITOR"`
- **CompartmentStatus:**
  - `"EMPTY"` -> `["STOCKED_AVAILABLE", "MAINTENANCE_QUARANTINE"]`
  - `"STOCKED_AVAILABLE"` -> `["EMPTY", "RESERVED_FOR_PICKUP", "MAINTENANCE_QUARANTINE"]`
  - `"RESERVED_FOR_PICKUP"` -> `["DOOR_OPEN_AWAITING_REMOVAL", "STOCKED_AVAILABLE", "MAINTENANCE_QUARANTINE"]`
  - `"DOOR_OPEN_AWAITING_REMOVAL"` -> `["CHECKED_OUT", "STOCKED_AVAILABLE", "MAINTENANCE_QUARANTINE"]`
  - `"CHECKED_OUT"` -> `["STOCKED_AVAILABLE", "MAINTENANCE_QUARANTINE"]`
  - `"MAINTENANCE_QUARANTINE"` -> `["STOCKED_AVAILABLE", "EMPTY"]`
- **TicketStatus:**
  `"OPEN_RESERVED" | "DISPENSED_ACTIVE" | "RETURNED_CLOSED" | "EXPIRED" | "CANCELLED" | "OVERDUE_ESCALATED"`
- **AssetCondition:** `"HEALTHY" | "NEEDS_INSPECTION" | "DAMAGED"`
- **AssetAvailability:** `"IN_LOCKER" | "RESERVED" | "OUT" | "QUARANTINED"`
- **DisplayType / RoomSystem:** `"4K_LED_WALL" | "PROJECTOR_HDMI" | "DUAL_MONITOR"` & `"BYOD_LEGACY" | "TEAMS_ROOM" | "ZOOM_ROOM"`

### 5.2 Complete Endpoint Specifications & Verified Quirks

Every backend success response includes `{ success: true, ...data, requestId }`.  
Every error response includes `{ success: false, error: { code, message, details }, requestId }`.

#### A. Session & Discovery Routes
1. **`GET /api/session/current`** (Public; uses `Authorization: Bearer` -> cookie -> default `usr_emp_01`)
   - **Response `200`:**
     ```ts
     {
       success: true;
       session: UserSession; // { userId, name, email, department, role, rfidBadgeId }
       availableUsers: Array<{
         id: string; name: string; email: string;
         department: string; role: UserRole; rfidBadgeId: string;
       }>;
     }
     ```
2. **`POST /api/session/role`** (Public demo persona impersonator)
   - **Body:** `{ role?: UserRole; userId?: string }`
   - **Response `200`:** `{ success: true, message: string, session: UserSession, token: string, requestId }`
   - **Action:** Mobile saves `token` in `expo-secure-store`, invalidates all React Query caches, and reconnects SSE with the new Bearer token.
3. **`GET /api/rooms`** (Any role)
   - **Response `200`:**
     ```ts
     {
       success: true;
       rooms: Array<{
         id: string; name: string; floor: number; building: string;
         displayType: string; roomSystem: string; qrCodeSlug: string;
       }>;
     }
     ```
4. **`GET /api/lockers`** (Any role; backend executes lazy `cleanupExpiredReservations()` automatically)
   - **Response `200`:**
     ```ts
     {
       success: true;
       lockers: Array<{
         id: string; name: string; floor: number; locationNote: string;
         onlineStatus: boolean; lastHeartbeatAt: string | null; temperatureC: number | null;
         compartments: Array<{
           id: string; lockerId: string; compartmentNumber: number; status: CompartmentStatusType;
           assetId: string | null; solenoidLocked: boolean; doorPhysicalOpen: boolean;
           irSensorBreakBeam: boolean; chargingConnected: boolean;
           asset: (AssetItem & { sku: HardwareSKU }) | null;
           tickets: Array<{
             id: string; itsmExternalId: string; status: TicketStatusType;
             expiresAt: string; reportedSymptom: string;
             user: { id: string; name: string; rfidBadgeId: string };
             meetingRoom: { id: string; name: string; floor: number; qrCodeSlug: string };
           }>;
         }>;
       }>;
     }
     ```
5. **`GET /api/realtime/live-lockers?lockerId=...`** (Optional Neon Realtime audit card)
   - **Response `200`:** `{ success: true, data: any, service: "neon-realtime", branch: string }`

#### B. Dispatch & Smart Kiosk Routes
6. **`POST /api/diagnose-and-reserve`** (Uses `session.userId`)
   - **Headers:** `idempotency-key: idemp_mob_<timestamp>_<random>` (Generate a **fresh key per explicit reservation tap**!)
   - **Body:** `{ meetingRoomId?: string; qrCodeSlug?: string; symptomCode: string; portDamaged?: boolean; preferredSkuId?: string | null }` (At least one of `meetingRoomId` / `qrCodeSlug` required)
   - **Response `201`:**
     ```ts
     {
       success: true;
       ticketId: string; itsmTicketNumber: string; // e.g. "INC00..."
       locker: { id: string; name: string; floor: number; compartmentNumber: number };
       allocatedAsset: { id: string; serialNumber: string; skuName: string; usbVendorId: string; usbProductId: string };
       accessPin: string; // 6 digits on initial create; "******" if idempotency-key hits an existing OPEN_RESERVED ticket!
       expiresAt: string; // ISO-8601 UTC timestamp
       requestId: string;
     }
     ```
   - **Critical Edge Quirk:** If `accessPin === "******"`, the UI must NEVER pass `"******"` to Kiosk `?pin=` or pretend it's unlockable; show a crisp warning explaining an earlier reservation was replayed and prompt the user to inspect Kiosk or unlock via RFID/Biometric.
   - **Errors:** `404 ROOM_NOT_FOUND`, `409 NO_STOCK`
7. **`POST /api/kiosk/authenticate-and-unlock`**
   - **Body:** `{ lockerId: string; authMethod: "PIN" | "RFID" | "BIOMETRIC"; credentialValue: string }`
   - **Biometric Contract:** Backend (`kiosk.ts#L108-118`) verifies `ticket.user.biometricTemplateRef?.includes(credentialValue)`. After OS Face ID / Touch ID (`expo-local-authentication`) succeeds, pass `authMethod: "BIOMETRIC", credentialValue: "BIO-TMPL"` (matches all 3 seeded templates: `BIO-TMPL-SHA256-AARAV-8821`, `...-PRIYA-0042`, `...-VIKRAM-1109`).
   - **Response `200`:**
     ```ts
     {
       success: true; unlockedCompartment: number; solenoidReleased: boolean;
       assetSerialNumber: string; skuName: string; message: string; requestId: string;
     }
     ```
   - **Critical Backend Lockout Quirk (`route.ts#L51-65`):** On attempts 1–4, backend returns `401 AUTH_FAILED` with attempts remaining (`4`, `3`, `2`, `1`). On the **5th** failed attempt, `recordFailedAttempt` throws `LockerLockedOutError` *inside* the inner `try/catch (authError)` block, so the server may return `401 AUTH_FAILED` containing `"undefined attempt(s) remaining"`, and on the **6th+** request within 15 minutes the outer check returns `423 LOCKER_LOCKED_OUT`. Mobile MUST handle **both** `401 AUTH_FAILED` and `423 LOCKER_LOCKED_OUT` gracefully, sanitizing/rendering the error banner cleanly without crashing!
8. **`POST /api/kiosk/remove-asset`**
   - **Body:** `{ lockerId: string; compartmentNumber: number }`
   - **Response `200`:** `{ success: true, message: string, requestId: string }` (Bay -> `CHECKED_OUT`, IR beam -> `false`, charging -> `false`, Ticket -> `DISPENSED_ACTIVE`)
9. **`POST /api/kiosk/return-asset`**
   - **Body:**
     ```ts
     {
       lockerId: string; compartmentNumber: number; assetSerialNumber: string;
       usbVendorId: string; usbProductId: string; chargingConnected: boolean;
     }
     ```
   - **Response `200`:**
     ```ts
     {
       success: true; ticketClosed: string;
       compartmentStatus: "STOCKED_AVAILABLE" | "MAINTENANCE_QUARANTINE";
       auditEventId: string; message: string; requestId: string;
     }
     ```
   - **Fault Tolerance Rule:** `chargingConnected: false` still closes the ticket (`RETURNED_CLOSED`) while quarantining the bay (`MAINTENANCE_QUARANTINE`) and marking the asset `NEEDS_INSPECTION` so the employee isn't stranded!
   - **Errors:** `409 SECURITY_MISMATCH_ALARM` if Serial/VID/PID differs -> bay quarantined + SSE alarm emitted!
10. **`POST /api/kiosk/report-foreign-device`**
    - **Body:** `{ lockerId: string; compartmentNumber: number; foreignVendorId?: string; foreignProductId?: string; simulatedAttackVector?: string }` (Defaults: `"0x16C0"`, `"0x05DF"`, `"BadUSB Keystroke Injection payload detected"`)
    - **Response `200`:** `{ success: true, alarmTriggered: true, compartmentStatus: "MAINTENANCE_QUARANTINE", incidentCode: string, message: string, requestId: string }`

#### C. Admin, Landed Cost, FinOps, Intake & Webhook Routes
11. **`GET /api/admin/compliance`** (`IT_ADMIN`, `FINOPS_AUDITOR` -> else `403 FORBIDDEN`)
    - **Response `200`:**
      ```ts
      {
        success: true;
        assets: Array<AssetItem & {
          sku: HardwareSKU & { tariffRate: TariffRate };
          compartment: (LockerCompartment & { locker: SmartLocker }) | null;
        }>;
        tariffRates: Array<TariffRate & { skus: HardwareSKU[] }>;
        requestId: string;
      }
      ```
12. **`POST /api/admin/compliance`** (`IT_ADMIN` only!)
    - **Body:** `{ assetId: string; hidWhitelisted: boolean }`
    - **Response `200`:** `{ success: true, updated: AssetItem, message: string, requestId: string }`
13. **`POST /api/admin/compliance/landed-cost`** (Any role)
    - **Body:** `{ cifAmountINR: number; hsnCode: string; procurementMode: "DIRECT_IMPORT" | "DOMESTIC_WHOLESALE" }`
    - **Response `200`:**
      ```ts
      {
        success: true;
        cifAmountPaise: number; assessableValuePaise: number;
        bcdPaise: number; swsPaise: number; igstPaise: number;
        totalDutiesPaise: number; totalLandedCostPaise: number;
        effectiveCostNetOfItcPaise: number;
        procurementMode: "DIRECT_IMPORT" | "DOMESTIC_WHOLESALE";
        effectiveDutyRatePercent: number;
        formatted: {
          cifINR: string; assessableValueINR: string; bcdINR: string;
          swsINR: string; igstINR: string; totalDutiesINR: string;
          totalLandedCostINR: string; netCostAfterItcINR: string;
        };
        rates: { bcdPercent: string; swsPercent: string; igstPercent: string };
        requestId: string;
      }
      ```
14. **`GET /api/admin/finops`** (`IT_ADMIN`, `FINOPS_AUDITOR`)
    - **Response `200`:**
      ```ts
      {
        success: true;
        transactions: Array<FinOpsTransaction & { purchaseOrder?: PurchaseOrder & { items: PurchaseOrderItem[] } | null }>;
        purchaseOrders: Array<PurchaseOrder & { items: Array<PurchaseOrderItem & { sku: HardwareSKU }> }>;
        skus: Array<HardwareSKU & { tariffRate: TariffRate }>;
        totalSavingsPaise: number;
        requestId: string;
      }
      ```
15. **`POST /api/admin/finops`** (`IT_ADMIN` only!)
    - **Body:** Always explicitly send `{ skuId, quantity, procurementMode: "DIRECT_IMPORT" | "DOMESTIC_WHOLESALE", cardProvider: "ZAGGLE_CARD" | "HAPPAY_PETTY_CASH", erpTarget: "SAP_S4HANA" | "ORACLE_NETSUITE" | "ZOHO_BOOKS", vendorName? }`.
    - **CRITICAL PAYLOAD KEY QUIRK (`finops/route.ts#L153-158`):** Returns **`transaction`** (NOT `finopsTransaction`!):
      ```ts
      {
        success: true; purchaseOrder: PurchaseOrder; transaction: FinOpsTransaction;
        dutyBreakdown: LandedCostBreakdown; message: string; requestId: string;
      }
      ```
16. **`POST /api/admin/reception/scan`** (`IT_ADMIN` only! Exists in backend even though web admin left PO intake implicit — **expose cleanly in Mobile FinOps Module!**)
    - **Body:** `{ purchaseOrderId: string; skuId: string; serialNumber: string; usbVendorId: string; usbProductId: string; targetLockerId: string; targetCompartmentNumber: number }`
    - **Response `201`:** `{ success: true, asset: AssetItem & { sku: HardwareSKU }, compartmentStatus: "STOCKED_AVAILABLE", message: string, requestId: string }`
17. **`GET /api/admin/analytics`** (`IT_ADMIN`, `FINOPS_AUDITOR`)
    - **CRITICAL PAYLOAD SHAPE (`analytics/route.ts#L126-136`):**
      ```ts
      {
        success: true;
        anomalyAlerts: Array<{
          roomId: string; roomName: string; floor: number;
          unreturnedCount14Days: number; status: "HIGH_ANOMALY_FLAGGED";
          recommendation: string; urgency: "HIGH";
        }>;
        floorMetrics: Array<{
          lockerId: string; lockerName: string; floor: number; temperatureC: number | null;
          totalBays: number; occupiedBays: number; checkedOutBays: number;
          quarantinedBays: number; occupancyRatePercent: number;
        }>;
        financialSummary: {
          totalIncidentsResolved: number;
          totalRetailAvoidedPaise: number;
          totalWholesalePaise: number;
          netSavingsPaise: number;
        };
        consumptionTrends: Array<{
          month: string; wholesaleINR: number; retailAvoidedINR: number; savingsINR: number;
        }>;
        requestId: string;
      }
      ```
18. **`GET /api/admin/webhooks` & `POST /api/admin/webhooks`** (`IT_ADMIN` only!)
    - `GET` Response: `{ success: true, events: WebhookEvent[], requestId }` (Last 50 events)
    - `POST` Body: `{ webhookEventId: string }` -> Response: `{ success: true, replayed: WebhookEvent, message: string, requestId }`
19. **`POST /api/webhooks/servicenow` & `POST /api/webhooks/zendesk`** (Public mock inbound webhook receivers)
    - Response: `{ success: true, received: true, eventId: string, externalEventId: string, status: "SUCCESS" | "FAILED", requestId }`
20. **`GET /api/telemetry/stream`** (SSE `text/event-stream`)
    - Named events: `"LOCKER_RESERVED"`, `"DOOR_UNLOCKED"`, `"ASSET_REMOVED"`, `"ASSET_RETURNED"`, `"SECURITY_MISMATCH_ALARM"`, `"TICKET_EXPIRED"`, `"TICKET_OVERDUE"`, `"INVENTORY_RESTOCKED"`
    - Payload JSON per event: `{ id: string, type: TelemetryEventType, version: "1.0", ts: string, payload: Record<string, unknown> }`
    - Keepalive comment every 15s (`: heartbeat <ts>`). Supports `Last-Event-ID` header replay.

### 5.3 Statutory Customs Duty Math & Golden Vectors (ADR D6)
Client preview helpers or tests verifying Landed Cost calculations must satisfy these exact component-wise round-half-up integer paise rules (`src/services/landed-cost.ts`):
- **Direct Import:**
  - $V_a = \text{Math.round}(V_{CIF} \times 1.01)$
  - $BCD = \text{Math.round}(V_a \times \frac{bcdBp}{10000})$ *(2000 bp = 20%)*
  - $SWS = \text{Math.round}(BCD \times \frac{swsBp}{10000})$ *(1000 bp = 10% of BCD = 2% of Va)*
  - $IGST = \text{Math.round}((V_a + BCD + SWS) \times \frac{igstBp}{10000})$ *(1800 bp = 18%)*
  - $TotalDuty = BCD + SWS + IGST$
  - $TotalLanded = V_{CIF} + TotalDuty$
  - $EffectiveNetOfITC = V_{CIF} + BCD + SWS$
- **Golden Test Vector A:** CIF `100000` paise (`₹1,000.00`) -> $V_a = 101000$, $BCD = 20200$, $SWS = 2020$, $IGST = 22180$, `totalDutiesPaise = 44400` (`₹444.00`, `44.40%`), `effectiveCostNetOfItcPaise = 122220` (`₹1,222.20`).
- **Golden Test Vector B:** CIF `3400000` paise (`₹34,000.00`) -> $V_a = 3434000$, $BCD = 686800$, $SWS = 68680$, $IGST = 754106$, `totalDutiesPaise = 1509586` (`₹15,095.86`).

### 5.4 Seeded Fixtures Reference (`prisma/seed.ts`)
- **Personas (3):**
  - `usr_emp_01` — Aarav Sharma (`EMPLOYEE`, `RFID-EMP-8821`, `BIO-TMPL-SHA256-AARAV-8821`, Sales & Strategic Accounts)
  - `usr_it_02` — Priya Patel (`IT_ADMIN`, `RFID-IT-0042`, `BIO-TMPL-SHA256-PRIYA-0042`, Enterprise Infrastructure & AV Operations)
  - `usr_fin_03` — Vikram Malhotra (`FINOPS_AUDITOR`, `RFID-FIN-1109`, `BIO-TMPL-SHA256-VIKRAM-1109`, Corporate Procurement & FinOps)
- **Rooms (4):**
  - `Boardroom-4B` (Floor 4, `4K_LED_WALL`, `BYOD_LEGACY`)
  - `Innovation-Lab-4A` (Floor 4, `DUAL_MONITOR`, `TEAMS_ROOM`)
  - `Townhall-2A` (Floor 2, `PROJECTOR_HDMI`, `ZOOM_ROOM`)
  - `Client-Pitch-3C` (Floor 3, `4K_LED_WALL`, `BYOD_LEGACY` — tests automatic **Floor 3 -> Floor 4 Hub proximity fallback!**)
- **Lockers (2 x 12 Bays):** `lkr_floor4` (*Floor 4 Boardroom Hub*, `22.8°C`), `lkr_floor2` (*Floor 2 Townhall Hub*, `23.1°C`).
- **7 Hardware SKUs & Prices:**
  - `sku_usbc_hdmi_60w` (Anker A8338-PRO, `45000` wholesale / `185000` retail paise)
  - `sku_wireless_hdmi_4k` (Barco CS-400W, `1450000` / `2499900`, `ETA-SD-20240588210`, `R-41098201`)
  - `sku_hdcp_scaler_4k` (Kramer VP-427A, `380000` / `650000`)
  - `sku_hdmi_21_cable` (Belkin AV10175, `75000` / `249900`)
  - `sku_dp_14_cable` (Club3D CAC-1060, `82000` / `289900`)
  - `sku_spotlight_ble` (Logitech 910-004654, `680000` / `1099500`, `ETA-SD-20240211409`, `R-41092831`)
  - `sku_boundary_mic_kit` (Shure CVB-B/O, `420000` / `899000`)
- **Special Compliance & Anomaly Seed Fixtures:**
  - Quarantined assets: `ast_damaged_test_01` (`SN-USBC-DEFECTIVE-99`, `NEEDS_INSPECTION`) and `ast_badusb_risk_02` (`SN-BADUSB-RUBBER-DUCKY-01`, `0x16C0` / `0x05DF`, `hidWhitelisted: false`)
  - Anomaly dataset: **Room 4B** has **4** unreturned tickets within 10 days -> `HIGH_ANOMALY_FLAGGED`; **Room 2A** has **3** in 10 days -> clean; **Room 3C** has **4** over 15–24 days -> outside 14-day window -> clean.
  - Seeded PO/Txns: `po_2026_001` (`₹34,000.00`, duty `₹15,095.86`, `INSPECTED_STOCKED`), `txn_zaggle_001` (`INV-2026-09812`), `txn_happay_002` (`₹7,500.00`, `INV-2026-11045`).
  - Custody Log Hash Chain: `SHA-256("${prevHash}:${eventType}:${ts}:${details}")`, Genesis `prevHash = "0".repeat(64)`.

---

## 6. Core Mobile Infrastructure Specs (`mobile/src/lib/` & `hooks/`)

### 6.1 `mobile/src/lib/env.ts` — 4-Tier Server URL Resolver
Implement pure, unit-testable functions `normalizeApiBaseUrl(raw)` and `resolveApiBaseUrl(params)`:
- **Resolution Precedence:**
  1. Validated Zustand user override (`apiBaseUrlOverride`) persisted in AsyncStorage
  2. `process.env.EXPO_PUBLIC_API_URL` (when non-empty)
  3. Expo Go LAN Host Auto-Detection: read `Constants.expoConfig?.hostUri` (e.g. `"192.168.1.42:8081"`); extract IPv4 host and default to `http://${host}:3000` so a physical phone scanning the Expo QR connects directly to the dev workstation!
  4. Platform Default Fallback:
     - `Platform.OS === "android"` -> `"http://10.0.2.2:3000"`
     - `Platform.OS === "ios"` or `"web"` -> `"http://localhost:3000"`
- **Sanitization (`normalizeApiBaseUrl`):** Must trim whitespace, require `http://` or `https://` protocol, reject empty/invalid URLs, and strip trailing `/` characters.
- **Presets Exported for `PersonaServerSheet`:**
  - Android Emulator: `http://10.0.2.2:3000`
  - iOS / Localhost: `http://localhost:3000`
  - Production Demo: `https://kioskdrop-enterprise.vercel.app`

### 6.2 `mobile/src/lib/api.ts` — Resilient Typed Fetch Client
- Define two explicit error classes:
  - `NetworkConnectionError` (fetch rejected, DNS failure, timeout via `AbortController` at `12000ms`)
  - `ApiClientError(status, code, message, details, requestId)` (non-2xx HTTP response parsed from backend JSON `{ error: { code, message, details } }`)
- Read current Bearer token automatically via `getStoredSessionToken()` and attach `Authorization: Bearer <token>` on every API call if present.
- Provide `pingServerLatency(baseUrl)`: executes `GET ${baseUrl}/api/rooms` with timing (`Date.now()`) and returns `{ ok, latencyMs, roomCount, error? }`.
- Export `generateIdempotencyKey()`: returns ``idemp_mob_${Date.now()}_${Math.random().toString(36).slice(2, 8)}``.

### 6.3 `mobile/src/lib/format.ts` — Deterministic Currency & Countdown Utilities
- `formatPaiseToINR(paise: number): string`: Divide `paise / 100`. Verify Android Hermes `en-IN` grouping (`₹1,000.00`, `₹34,000.00`, `₹1,00,000.00`); include a deterministic manual Indian comma-grouping fallback (`##,##,###.00`) if a minimal Intl runtime omits `en-IN` grouping!
- `formatCompactINR(inrAmount: number): string`: Formats chart Y-axis ticks (e.g. `42000 -> "₹42k"`, `0 -> "₹0"`).
- `formatCountdown(expiresAtIso: string, nowMs?: number): { label: string; isExpired: boolean; remainingSeconds: number }`:
  - Returns `"EXPIRED"` + `isExpired: true` when `<= 0`; otherwise zero-padded `MM:SS` (e.g. `"09:42"`).

### 6.4 `mobile/src/lib/qr-parser.ts` — Multi-Format Room QR & Kiosk Sanitizer
- `parseRoomQrPayload(raw: string, rooms: MeetingRoom[]): string | null`:
  - Handles `kioskdrop://request?room=Boardroom-4B&floor=4`
  - Handles `https://.../request?room=Boardroom-4B`
  - Handles JSON QR strings `{"room":"Boardroom-4B","qrCodeSlug":"..."}`
  - Handles raw slug `"Boardroom-4B"` or room name `"Executive Boardroom 4B"` (case-insensitive trimmed lookup against `rooms`, OR safe alphanumeric/hyphen slug match when rooms haven't cached yet)
  - Returns matched canonical `qrCodeSlug` or `null` if invalid/malicious/unmatched.
- `sanitizePin(raw?: string | string[] | null): string`: Accepts string or Expo Router array param, strips `\D`, slices max 6 digits.

### 6.5 `mobile/src/hooks/useTelemetrySSE.ts` — `react-native-sse` + `AppState` Lifecycle
- Uses `EventSource` from `react-native-sse` against `${apiBaseUrl}/api/telemetry/stream` with custom headers `{ Authorization: Bearer <token>, ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}) }`.
- Listens to `open`, `error`, and **all 8** named SSE events (`LOCKER_RESERVED`, `DOOR_UNLOCKED`, `ASSET_REMOVED`, `ASSET_RETURNED`, `SECURITY_MISMATCH_ALARM`, `TICKET_EXPIRED`, `TICKET_OVERDUE`, `INVENTORY_RESTOCKED`).
- On event receipt:
  1. Validates/parses payload into `TelemetryEvent` and updates `lastEventIdRef.current`.
  2. Pushes onto Zustand store's capped 50-item event buffer (`prependTelemetryEvent`).
  3. Invalidates `["lockers"]`, `["admin", "analytics"]`, `["admin", "compliance"]`, `["admin", "finops"]` via `queryClient.invalidateQueries`.
  4. On `"SECURITY_MISMATCH_ALARM"`, triggers `haptics.error()`.
- **`AppState` Mobile Protection:**
  - When `AppState` transitions to `"background"` / `"inactive"`: immediately close active `EventSource` (`es.close()`) and clear reconnect timers to save battery and prevent broken OS sockets.
  - When transitioning back to `"active"`: reconnect `EventSource` immediately with exponential backoff on subsequent drops (`2000ms -> 4000ms -> 8000ms -> max 15000ms`) and run `queryClient.invalidateQueries({ queryKey: ["lockers"] })` so any transitions that happened while backgrounded appear instantly.

---

## 7. Design System, Accessibility & Screen Wireframe Blueprints

### 7.1 "Obsidian & Electric Sapphire" + Executive Light Palette (`mobile/src/lib/theme.ts`)
Maintain 1:1 fidelity with `src/app/globals.css` and `dark_theme_redesign_plan.md`:

| Token | Dark ("Obsidian & Electric Sapphire") | Light ("Executive Crisp") | Purpose |
| :--- | :--- | :--- | :--- |
| `background` | `#0B0F17` | `#F8FAFC` | Screen & scroll view canvas |
| `card` | `#121927` | `#FFFFFF` | Cards, bay tiles, modals |
| `border` | `#212C3D` | `#E2E8F0` | 1px machined borders |
| `muted` | `#192233` | `#F1F5F9` | Pills, keypad clear key, segmented track |
| `accent` | `#1D273B` | `#E2E8F0` | Active press highlight |
| `foreground` | `#F1F5F9` | `#0F172A` | Primary text |
| `mutedForeground` | `#94A3B8` | `#64748B` | Captions, metadata |
| `primary` | `#3B82F6` (`#60A5FA` light text) | `#2563EB` | Sapphire CTA, Enter key, active tab |
| `emerald` | `#10B981` / `#34D399` | `#059669` | Stocked, online, savings, HMAC valid |
| `amber` | `#F59E0B` / `#FBBF24` | `#D97706` | Reserved LED, countdown, RBAC warning |
| `sky` / `cyan` | `#38BDF8` / `#06B6D4` | `#0284C7` | Door unlocked aura, OTP glow, wholesale chart |
| `destructive` | `#EF4444` (soft bg `rgba(239,68,68,0.12)`) | `#DC2626` | Quarantine, BadUSB alarm, blocked HID |

### 7.2 Ergonomic Craft & Responsive Breakpoints
- **`ChamferCard`:** `rounded-2xl`, `borderWidth: 1`, crisp `borderColor`, plus subtle `borderTopColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.85)"` top chamfer sheen and soft shadow elevation.
- **Tap Targets:** Enforce `minHeight >= 44` (`>= 48` on Kiosk keypad keys) and generous padding everywhere; never cause horizontal overflow on `320pt`–`430pt` phone widths (`flex-wrap`, `shrink`, bounded text).
- **Responsive Layout via `useWindowDimensions()`:**
  - Compact phones (`width < 375`): 2-column Locker Bay Grid
  - Standard phones (`375 <= width < 768`): 3-column Locker Bay Grid
  - Tablets (`width >= 768`): 4-column Locker Bay Grid + side-by-side 2-pane split on Kiosk (Bay Matrix Left | Keypad & MFA Right) and Admin!
- **Accessibility:** Supply descriptive `accessibilityRole`, `accessibilityLabel`, and `accessibilityState` (`selected`, `disabled`, `checked`) on every interactive card, tab, toggle, keypad digit, and status pill.

### 7.3 Wireframe & Interaction Specs per Screen

#### A. Global Shell (`GlobalHeader.tsx` + `PersonaServerSheet.tsx` + `TelemetryDrawerModal.tsx`)
```text
┌─────────────────────────────────────────────────────┐
│ [🛡] KioskDrop [ENT]     [● LIVE] [☀/🌙] [👤 EMP ▾] │  <- Safe-area top header
├─────────────────────────────────────────────────────┤
│                  <Active Tab Screen>                │
├──────────┬──────────┬──────────┬────────────────────┤
│ 🛡 Home  │ 📱 Drop  │ 🖥 Kiosk │ 📊 Command         │  <- 4-Tab Bar (min-h 56pt)
└──────────┴──────────┴──────────┴────────────────────┘
```
- **Tapping `[● LIVE]` / `[◌ SYNC]`:** Opens `TelemetryDrawerModal` displaying connection status, current server URL, and a scrolling feed of up to 50 live SSE events (`LOCKER_RESERVED`, `SECURITY_MISMATCH_ALARM`, etc.) with color-coded badges and expanded JSON snippet.
- **Tapping `[☀/🌙]`:** Persists Dark/Light choice to Zustand + AsyncStorage and fires `haptics.selection()`.
- **Tapping `[👤 EMP ▾]`:** Opens `PersonaServerSheet` with:
  1. **Demo Persona Switcher:** Lists `Aarav Sharma (EMPLOYEE)`, `Priya Patel (IT_ADMIN)`, `Vikram Malhotra (FINOPS_AUDITOR)` with active ring; tapping calls `POST /api/session/role`, saves signed `token` in `expo-secure-store`, clears error states, invalidates all queries, and displays toast confirmation.
  2. **Backend Connection Config:** Shows active resolved `apiBaseUrl`, quick preset buttons (`10.0.2.2:3000`, `localhost:3000`, `Vercel Demo`), custom URL text field with Save/Reset, and **"Test Ping"** button returning `"Connected • 24ms • 4 rooms loaded"` or diagnostic error!

#### B. Tab 1: Home Gateway (`app/(tabs)/index.tsx`)
- Subtle sapphire badge (`ZERO-TRUST AV MICRO-LOGISTICS`), hero heading, active persona pill (`Signed in as Aarav Sharma · EMPLOYEE`), and live system telemetry summary bar computed from `GET /api/lockers` (`24 Total Bays · X Available · Y Checked Out · Z Quarantined`).
- Three tactile `ChamferCard` navigation cards:
  1. **Rapid-Drop Room QR & Triage** -> Quick action buttons: **`Scan QR`** (`/scanner`) + **`Select Room`** (`/(tabs)/request`).
  2. **IoT Floor Locker Kiosk** -> Displays Floor 4 & Floor 2 online indicators & live reserved count -> opens `/(tabs)/kiosk`.
  3. **ITAM & FinOps Command Center** -> Dynamically displays `Unlocked (IT_ADMIN / FINOPS)` or `View Restricted (Switch Persona)` -> opens `/(tabs)/admin`.

#### C. Tab 2: Rapid-Drop Diagnostic Portal (`app/(tabs)/request.tsx` + `app/scanner.tsx`)
- **`app/scanner.tsx` (Camera Modal):**
  - Renders `expo-camera` `<CameraView barcodeScannerSettings={{ barcodeTypes: ["qr"] }} enableTorch={torchOn} />` with precision sapphire corner reticule and top `[Flashlight]` + `[Close]` buttons.
  - Permission denied / iOS Simulator unsupported state: renders clear card explaining camera status with **`Open Settings`** (`Linking.openSettings()`) and **`Enter Room Manually`** buttons.
  - Ref-based scan lock (`isHandlingScan`) prevents double-navigation; parses QR via `parseRoomQrPayload` -> fires `haptics.success()` -> navigates cleanly to `/(tabs)/request?room=<slug>`.
- **`app/(tabs)/request.tsx`:**
  1. **Room Selector & Context Card:** Top **`[📷 Scan Room QR]`** button + horizontal/wrapped pills for all fetched rooms. Displays `room.name`, `Floor X • displayType • roomSystem • qrCodeSlug`. If selected room is Floor 3 (`Client-Pitch-3C`) or has no locker on the same floor, explicitly renders a Sapphire info pill: `"Nearest Hub Routing: Floor 3 -> Floor 4 Boardroom Hub"`.
  2. **5 Symptom Diagnostic Cards:** Selecting `SYMPTOM_NO_DISPLAY_BYOD` reveals a crisp `Switch` toggle: **"Laptop USB-C port physically loose/damaged (Bypass with 4K Wireless HDMI Kit)"**. Shows live Diagnostic Preview (`Primary SKU` + `"ServiceNow INC auto-ticket + 10m TTL"`).
  3. **`[Diagnose & Reserve Hardware]` CTA:** Sends `POST /api/diagnose-and-reserve` with fresh `idempotency-key`. Shows inline `409 NO_STOCK` alert if empty.
  4. **`PinPassCard.tsx` (Rendered on `201`):**
     - Illuminated Sapphire/Emerald card with `LOCKER RESERVED`, live `MM:SS` countdown badge (turning crimson `EXPIRED — Reserve Again` at `00:00`), ITSM ticket (`INC00...`), Locker & `BAY #X`, giant monospace 6-digit `accessPin` + **`[Copy PIN]`** (`expo-clipboard` + `"Copied ✓"` feedback), Asset `S/N`, USB `VID/PID`, and primary green CTA **`[Open in Locker Kiosk →]`** routing to `/(tabs)/kiosk?locker=...&bay=...&pin=...`. *(If server returned `"******"`, show explicit replayed-idempotency banner cleanly.)*

#### D. Tab 3: Smart Locker Terminal (`app/(tabs)/kiosk.tsx` + `ReturnInspectionModal.tsx`)
```text
┌─────────────────── Kiosk Screen (Phone) ───────────────────┐
│ Hub Switcher: [Floor 4: Boardroom Hub] [Floor 2: Townhall] │
│ Status: ● ONLINE  |  East Wing Corridor      |  🌡 22.8°C │
├────────────────────────────────────────────────────────────┤
│ 12-Bay Hardware Grid (2-col <375w, 3-col 375+, 4-col Tab)  │
│ ┌──────┐ ┌──────┐ ┌──────┐  • Bay #1 [● LED] RESERVED      │
│ │ #1 🟡│ │ #2 🟢│ │ #3 🔵│  • Bay #3 [UNLOCKED] DOOR OPEN  │
│ └──────┘ └──────┘ └──────┘    -> [Take Device] [BadUSB ⚡] │
│ • Bay #X CHECKED_OUT -> [Return & Plug In] (opens modal)   │
├────────────────────────────────────────────────────────────┤
│ Keypad Display:  [ 4 ][ 8 ][ 2 ][ 9 ][ 1 ][ 0 ]            │
│ Inline Banner:   "Invalid PIN. 4 attempts remaining."      │
│   [ 1 ] [ 2 ] [ 3 ]     Alternative Unlocks:               │
│   [ 4 ] [ 5 ] [ 6 ]     [🪪 Tap RFID Badge (RFID-EMP-8821)]│
│   [ 7 ] [ 8 ] [ 9 ]     [🔐 Biometric Unlock (Face/Touch)] │
│   [CLR] [ 0 ] [ENT]                                        │
└────────────────────────────────────────────────────────────┘
```
- **MANDATORY `f894343` Regression Protection:**
  1. `useEffect` syncs `urlLocker` and `sanitizePin(urlPin)` when navigated via deep-link / `PinPassCard`.
  2. While `lockersQuery.isLoading`: show clean connecting skeleton in Bay Grid and **keep `ENTER`, RFID, and Biometric controls disabled**. **NEVER** show `"Please enter a valid 6-digit PIN."` while lockers are loading!
  3. While `lockersQuery.isError`: show red connection banner with **`[Retry Connection]`** (`refetch()`) inside the Bay Grid and keep unlock controls disabled — **NEVER** show PIN validation error when controller is unreachable!
  4. Only validate `/^\d{6}$/` once `activeLocker` is loaded. Pressing any digit or `CLEAR` clears any stale error banner immediately!
- **Interactive Bay Workflows:**
  - **Door Open (`DOOR_OPEN_AWAITING_REMOVAL`):**
    - **`Take Device (IR Break)`** -> `POST /api/kiosk/remove-asset` -> `haptics.success()`
    - **`Simulate Foreign BadUSB`** -> confirms/fires `POST /api/kiosk/report-foreign-device` (`0x16C0` / `0x05DF`) -> `haptics.error()` -> crimson quarantine alert banner!
  - **Checked Out (`CHECKED_OUT` -> `ReturnInspectionModal.tsx`):**
    - Shows bay number, expected SKU & ticket info, editable/prefilled `serialNumber`, `usbVendorId`, `usbProductId` (with preset scenario quick-fill buttons!):
      1. *Healthy OEM Return* (`chargingConnected: true`, matching SN/VID/PID -> `STOCKED_AVAILABLE`)
      2. *Defective 5V/3A Fault* (`chargingConnected: false`, matching SN/VID/PID -> `RETURNED_CLOSED` + `MAINTENANCE_QUARANTINE`)
      3. *Counterfeit / BadUSB Swap* (`SN-FAKE-USB-999`, `0x16C0`, `0x05DF` -> triggers `409 SECURITY_MISMATCH_ALARM` + `haptics.error()`!)

#### E. Tab 4: Enterprise Command Center (`app/(tabs)/admin.tsx`)
1. **Employee RBAC Guard Card (`RbacBanner.tsx`):** Shown whenever `session.role === "EMPLOYEE"` (or when any admin endpoint returns `403 FORBIDDEN`) with 1-tap buttons: **`[Switch to IT Admin (Priya)]`** and **`[Switch to FinOps (Vikram)]`**. Notice that `POST /api/admin/compliance/landed-cost` still functions even as `EMPLOYEE`!
2. **4 Scrollable Segmented Module Tabs:**
   - **`Zero-Trust & Duty` (`Compliance`):**
     - **Landed Cost Calculator (`LandedCostCalculator.tsx`):** CIF INR numeric input, 4 HSN chips (`85437099`, `85182210`, `85444299`, `85181000`), mode toggle (`DIRECT_IMPORT` vs `DOMESTIC_WHOLESALE`), **`[Compute Landed Cost]`** button -> displays `CIF`, `Assessable Va`, `BCD`, `SWS`, `IGST`, `Total Duties (effectiveDutyRatePercent%)`, `Total Landed Cost`, and emerald `Effective Net of ITC`.
     - **Serialized Asset Cards (`AssetRegistrySection.tsx`):** Search bar (Serial / SKU / VID), filter chips (`ALL`, `WHITELISTED`, `BLOCKED`, `QUARANTINED`). Card displays Serial, SKU name, USB `VID:PID`, regulatory badges (`WPC ETA`, `BIS CRS`, or `Cabled`), condition/availability badge, locker/bay location, and **`[WHITELISTED / BLOCKED]`** toggle calling `POST /api/admin/compliance` (disabled with clear lock caption unless `session.role === "IT_ADMIN"`).
   - **`FinOps & POs` (`FinOps`):**
     - Top horizontal metrics (`Total Wholesale Savings`, `Monthly Limit ₹1,00,000`, `ERP Reconciled 100%`).
     - **`[+ Authorize B2B Replenishment]` CTA** -> opens `FinOpsReplenishSheet.tsx` (SKU selector, quantity stepper `1..20`, `DIRECT_IMPORT` / `DOMESTIC_WHOLESALE`, `ZAGGLE_CARD` / `HAPPAY_PETTY_CASH`, `SAP_S4HANA` / `ORACLE_NETSUITE` / `ZOHO_BOOKS`) -> `POST /api/admin/finops` (reads `data.transaction`!).
     - **Purchase Orders & Reception Intake:** Cards showing `poNumber`, mode, vendor, total landed cost `₹`, status (`PENDING_RECEPTION` amber vs `INSPECTED_STOCKED` emerald). For `PENDING_RECEPTION` POs when `IT_ADMIN`, show **`[Scan & Stock Hardware]`** CTA opening `ReceptionScanModal.tsx` (prefills `purchaseOrderId` & `skuId`, allows barcode/QR serial fill or generated `SN-INT-...`, VID/PID, Target Locker & Bay `1–12` selector -> `POST /api/admin/reception/scan`).
     - **FinOps Ledger Cards:** Card provider pill, MCC `5045`, CGST Rule 46 `gstInvoiceNumber`, formatted amount, ERP sync status.
   - **`Analytics & Hubs` (`Analytics`):**
     - Reads `financialSummary` (`totalIncidentsResolved`, `totalRetailAvoidedPaise`, `totalWholesalePaise`, `netSavingsPaise`).
     - **14-Day Consumption Anomaly Cards:** Renders `anomalyAlerts` (`Boardroom-4B` flagged `>= 4` unreturned in 14 days with crimson warning & Teams/Zoom upgrade recommendation, or healthy status card when empty).
     - **Floor Locker Occupancy Cards:** Locker name, floor, temp `°C`, `occupancyRatePercent` visual progress bar, 3 mini counters (`Stocked/Res`, `Out`, `Quarantined`).
     - **Grouped Procurement Savings Bar Chart (`ProcurementBarChart.tsx`):** Renders `analytics.consumptionTrends` via `react-native-gifted-charts` `<BarChart />` with 3 bars per month (`Wholesale B2B #38BDF8`, `Retail Avoided #34D399`, `Net Savings #818CF8`), formatted `₹k` Y-axis labels, interactive tap tooltip, and color legend.
   - **`ITSM Webhooks` (`Webhooks`):**
     - For `IT_ADMIN`: Quick simulator triggers **`[+ Mock ServiceNow Event]`** (`POST /api/webhooks/servicenow`) and **`[+ Mock Zendesk Event]`** (`POST /api/webhooks/zendesk`) that refresh the log immediately!
     - Event feed cards (`source`, `direction`, `status`, `HMAC VALID`, `latencyMs`, `externalEventId`). Tapping opens `WebhookInspectorModal.tsx` showing pretty-printed JSON payload and **`[Replay Webhook Event]`** button (`POST /api/admin/webhooks`).

---

## 8. Critical Mobile Edge-Case Matrix

Handle every scenario explicitly inside your implementation and verify in tests/runtime checks:

| Edge Case | Required Mobile Handling |
| :--- | :--- |
| **Duplicate `idempotency-key` returns `accessPin: "******"`** | Always generate a fresh unique key per explicit tap; if `"******"` is ever returned, show an amber badge inside `PinPassCard`, mask Copy button, and route to Kiosk without `?pin=******`. |
| **10-min Pickup TTL hits `00:00`** | Timer switches badge to `EXPIRED`, disables `"Open in Locker Kiosk"` stale auto-fill, invalidates `["lockers"]`, and displays `"Reserve Again"` prompt. |
| **5th vs 6th Kiosk Failed Auth (`401` vs `423`)** | Parse `401 AUTH_FAILED` and `423 LOCKER_LOCKED_OUT` cleanly; never assume remaining count is numeric (guard `"undefined attempt(s)"` cleanly if returned on attempt 5!). |
| **Kiosk Loading / Controller Offline vs Bad PIN** | Keep `ENTER`, RFID, and Biometric disabled while `/api/lockers` is loading or errored; never show `"Please enter a valid 6-digit PIN."` on network failure. |
| **Expo Go Physical Phone vs Android Emulator** | Android Emulator defaults to `http://10.0.2.2:3000`; Physical phone auto-detects Expo `hostUri` IP (`http://<LAN-IP>:3000`); user can override anytime in `PersonaServerSheet` + test latency. |
| **Camera Permission Denied or Simulator Hardware** | Show clear permission message + `Linking.openSettings()` button + 1-tap `Manual Room Selection` fallback inside `app/scanner.tsx`. |
| **Biometric Sensor Unavailable / Not Enrolled** | Check `hasHardwareAsync()` & `isEnrolledAsync()` first; if false, display descriptive toast (`"No biometrics enrolled on this device — use 6-digit PIN or Corporate RFID"`) instead of crashing. |
| **SSE Drop When App Moves to Background** | Close `EventSource` cleanly on `AppState` `"background"` / `"inactive"`; reconnect with backoff + invalidate React Query `["lockers"]` when `"active"`. |
| **Android Hermes `Intl` Grouping Quirk** | Include deterministic regex Indian comma grouping fallback inside `formatPaiseToINR` so `₹34,000.00` and `₹1,00,000.00` render consistently across Android & iOS & Jest. |

---

## 9. Phased Execution Plan, Exact Test Specs & Final QA Runbook

Execute strictly in sequence. Fix any failure before advancing to the next phase:

### Phase 0: Backend Dual-Auth & Root Isolation
- Patch `src/lib/session.ts`, `src/app/api/session/role/route.ts`, `next.config.js`, `tsconfig.json`, `.gitignore`.
- **Gate:** At root run `npm run typecheck`, `npm run lint`, and `npm run test` (**39/39** pass).

### Phase 1: Scaffold `/mobile` & Design Tokens
- Create `/mobile` with Expo SDK, TypeScript strict, Expo Router, NativeWind v4, Reanimated, `lucide-react-native`, `react-native-svg`, TanStack Query, Zod, Zustand, AsyncStorage, SecureStore, `react-native-sse`, `expo-camera`, `expo-haptics`, `expo-local-authentication`, `expo-clipboard`, `react-native-gifted-charts`, `jest-expo`, `@testing-library/react-native`.
- Author `app.json`, `eas.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `.env.example`, `jest.config.js`, `jest.setup.ts`.
- **Gate:** `cd mobile && npx tsc --noEmit` (`0` errors) and `npx expo-doctor`.

### Phase 2: Core Infrastructure & Global Shell
- Build `src/types/domain.ts`, `src/schemas/api.ts`, `src/constants/*`, `src/lib/*` (`env`, `api`, `format`, `qr-parser`, `haptics`, `storage`, `theme`), `src/store/app-store.ts`, `src/hooks/*` (`useSession`, `useTelemetrySSE`), `app/_layout.tsx`, and `GlobalHeader` / `PersonaServerSheet` / `TelemetryDrawerModal`.
- **Gate:** `cd mobile && npx tsc --noEmit` + `format.test.ts` & `qr-parser.test.ts` pass cleanly.

### Phase 3: Full Screen & Native Hardware Implementation
- Build `(tabs)/index.tsx`, `(tabs)/request.tsx`, `app/scanner.tsx`, `(tabs)/kiosk.tsx` (`LockerBayCard`, `NumericKeypad`, `ReturnInspectionModal`), and `(tabs)/admin.tsx` (all 4 modules + `LandedCostCalculator` + `FinOpsReplenishSheet` + `ReceptionScanModal` + `ProcurementBarChart` + `WebhookInspectorModal`).
- **Gate:** `cd mobile && npx tsc --noEmit` (`0` errors across every screen and component).

### Phase 4: Exhaustive Unit, Component & Live Runtime Verification
1. **Write all 5 Jest test suites in `mobile/__tests__/` with concrete assertions:**
   - **`format.test.ts`:**
     - `formatPaiseToINR(100000)` === `"₹1,000.00"`
     - `formatPaiseToINR(1509586)` === `"₹15,095.86"`
     - `formatPaiseToINR(10000000)` === `"₹1,00,000.00"`
     - Verifies client helper / golden vector parity for Vector A (`44400`, `122220`) and Vector B (`1509586`).
     - `normalizeApiBaseUrl("http://192.168.1.10:3000/")` === `"http://192.168.1.10:3000"`, rejects invalid strings.
     - `resolveApiBaseUrl` honors override -> env -> Expo `hostUri` -> Android `10.0.2.2:3000` / iOS `localhost:3000`.
     - `formatCountdown` formats `MM:SS` properly and returns `isExpired: true` (`"EXPIRED"`) when timestamp is past.
   - **`qr-parser.test.ts`:**
     - Resolves `"kioskdrop://request?room=Boardroom-4B&floor=4"` -> `"Boardroom-4B"`
     - Resolves `"https://kioskdrop-enterprise.vercel.app/request?room=Client-Pitch-3C"` -> `"Client-Pitch-3C"`
     - Resolves `'{"room":"Innovation-Lab-4A"}'` -> `"Innovation-Lab-4A"`
     - Case-insensitive slug/name matching (`"townhall-2a"` -> `"Townhall-2A"`)
     - Rejects malicious/unrelated QR strings (`"https://evil.example/phish"` -> `null`)
     - `sanitizePin("48a9-2199")` -> `"489219"` (max 6 digits)
   - **`keypad-kiosk.test.tsx`:**
     - Renders skeleton & keeps `ENTER` / RFID / Biometric **disabled** while `isLoadingLockers === true` (does **NOT** display PIN validation error).
     - When `GET /api/lockers` fails, renders Retry Connection banner and **never** renders `"Please enter a valid 6-digit PIN."`.
     - With lockers loaded: pressing `ENTER` with 3 digits shows validation banner; tapping digit `4` or `CLEAR` clears the error banner immediately.
     - Entering 6 digits and pressing `ENTER` calls `POST /api/kiosk/authenticate-and-unlock` with `{ lockerId, authMethod: "PIN", credentialValue }`; triggers `haptics` mock; handles both `401 AUTH_FAILED` and `423 LOCKER_LOCKED_OUT`.
   - **`request-triage.test.tsx`:**
     - Selecting `Client-Pitch-3C` renders Floor 3 -> Floor 4 fallback proximity notice.
     - Toggling `portDamaged` on `SYMPTOM_NO_DISPLAY_BYOD` switches preview SKU to Wireless 4K HDMI Kit and submits `{ portDamaged: true }`.
     - Successful `201` renders `PinPassCard` with formatted OTP PIN, `itsmTicketNumber`, copies PIN on tap (`expo-clipboard`), and guards `"******"` replayed-key responses.
   - **`admin-rbac.test.tsx`:**
     - When `session.role === "EMPLOYEE"`, renders `RbacBanner` with `Switch to IT Admin` and `Switch to FinOps` actions; compliance HID toggle buttons remain disabled.
     - Tapping role switch calls `POST /api/session/role` and persists returned Bearer `token` in `expo-secure-store`.
     - Landed Cost module posts `{ cifAmountINR, hsnCode, procurementMode }` and renders returned INR formatted duties cleanly.
2. **Runtime & Bundle Smoke Verification:**
   - Start Next.js API server locally (on `experimental` branch pass `DATABASE_URL="file:./dev.db"`).
   - Run live HTTP smoke verification against the running backend:
     1. `POST /api/session/role` (`{"role":"IT_ADMIN"}`) returns JSON containing a signed `token` string + cookie.
     2. `GET /api/admin/compliance` *without* cookie/Bearer returns `403` (default `EMPLOYEE`); calling *with* `Authorization: Bearer <token>` returns `200` with seeded assets!
   - Run Expo bundler verification (`cd mobile && npx expo export --platform web` or Metro bundle check) to verify zero broken imports/aliases across all routes.
   - Launch Android Emulator / iOS Simulator (or Expo Go) if available on the host, inspect UI & console cleanly, or clearly document which physical/emulator check was unavailable on Windows without Xcode.
3. **Create `mobile/README.md`:**
   - Document prerequisites, running Next.js API + Expo together, `10.0.2.2` Android Emulator vs LAN IP Expo Go vs iOS Simulator vs Vercel URL, deep-link CLI tests (`npx uri-scheme open "kioskdrop://request?room=Boardroom-4B" --android`), and EAS preview/APK build commands.

### Final Delivery Gate (Must All Report Truthfully)
- ✅ Root: `npm run typecheck`, `npm run lint`, `npm run test` (39/39)
- ✅ Mobile: `cd mobile && npx tsc --noEmit`, `cd mobile && npm test` (all 5 suites green), `cd mobile && npx expo-doctor`, Expo bundle export check
- ✅ Live Bearer Auth + RBAC + API round-trip verified against running Next.js backend

Start by reading the Phase 0 files (`src/lib/session.ts`, `src/app/api/session/role/route.ts`, `next.config.js`, `tsconfig.json`, `.gitignore`), running the baseline root checks, and executing Phase 0 cleanly.
