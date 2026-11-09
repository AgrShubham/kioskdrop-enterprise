# 🎬 KioskDrop Enterprise — Master Screen Capture Video Guide & Voiceover Script

> **Platform:** KioskDrop Enterprise  
> **Production Target:** 1080p / 4K 60fps Product Walkthrough & Architectural Demo  
> **Target Video Runtime:** ~5 to 6 minutes  
> **Local Demo URL:** `http://localhost:3000`  
> **Live Production URL:** `https://kioskdrop-enterprise.vercel.app`  

---

## 📑 Table of Contents

1. [Recording Methods (Automated vs. Manual)](#1-recording-methods)
2. [Video Storyboard & Scene Timeline](#2-video-storyboard--scene-timeline)
3. [Full Word-for-Word Voiceover Script & Visual Action Cues](#3-full-voiceover-script--action-cues)
   - [Scene 1: Introduction & Brand Hero (0:00 – 0:50)](#scene-1-introduction--brand-hero)
   - [Scene 2: Employee Rapid-Drop Request & Diagnostic Triage (0:50 – 2:00)](#scene-2-employee-rapid-drop-request)
   - [Scene 3: IoT Smart Locker Hardware Bank & Tactile Keypad (2:00 – 3:30)](#scene-3-iot-smart-locker-simulator)
   - [Scene 4: ITAM, Compliance & FinOps Command Center (3:30 – 5:15)](#scene-4-command-center--finops)
   - [Scene 5: Summary & Strategic Enterprise Impact (5:15 – 6:00)](#scene-5-summary--closing)
4. [Technical Feature Breakdown & Architectural Cheat Sheet](#4-technical-feature-breakdown)
5. [Audio, Lighting & Video Polish Checklist](#5-audio--video-polish-checklist)

---

## 1. Recording Methods

You have two powerful options to capture the video:

### Option A: Fully Automated Synchronized Recorder with Indian Female Voiceover (Recommended)
We have provided an automated director engine that generates professional Indian Female AI voiceover narration (`en-IN-NeerjaNeural`), paces the browser's on-screen interactions to match the narration down to the exact second, records in 1080p Full HD, and outputs a ready-to-share MP4 and WebM video!

**To run the synchronized Indian female voiceover video recorder:**
```bash
# 1. Ensure local dev server is running
npm run dev

# 2. Run the synchronized video & Indian female voiceover engine
npm run record:synced
```
*Generated output artifacts:*
- `recordings/kioskdrop_enterprise_demo_synced_indian_female.mp4` *(1080p H.264 + AAC, ~11.5 MB)*
- `recordings/kioskdrop_enterprise_demo_synced_indian_female.webm` *(1080p VP8 + Opus, ~28 MB)*
- `recordings/kioskdrop_indian_female_voiceover.mp3` *(Standalone voiceover track)*

---

### Option B: Quick Video-Only Recorder
```bash
npm run record:video
```
*Output file:* `./recordings/kioskdrop_enterprise_demo.webm`

---

### Option C: Manual Screen Capture with Live Voiceover
If you want to record your live voice and personal mouse pacing:
1. **Windows Game Bar (Zero Install):** Press <kbd>Win</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> to instantly start/stop 1080p 60fps recording with microphone audio.
2. **OBS Studio:** Set Canvas to `1920x1080`, Add **Window Capture** → Google Chrome (`http://localhost:3000`), and configure your microphone with a noise suppression filter.
3. **Loom / Screen Studio / Camtasia:** Select fullscreen or Chrome browser window, enable cursor click ripples, and speak through the voiceover script below.

---

## 2. Video Storyboard & Scene Timeline

```mermaid
timeline
    title KioskDrop Enterprise Demo Video Flow
    00:00 - 00:50 : Scene 1: Problem Statement, Hero Overview & Global Navbar Controls
    00:50 - 02:00 : Scene 2: Employee Rapid-Drop Triage, Degraded Port Detection & 6-Digit PIN
    02:00 - 03:30 : Scene 3: IoT Smart Locker Bank, Tactile Audio Keypad, IR Sensor & BadUSB Alarm
    03:30 - 05:15 : Scene 4: Command Center (Indian Customs Landed-Cost, FinOps, Telemetry & Webhooks)
    05:15 - 06:00 : Scene 5: Architectural Summary & Enterprise ROI Recap
```

---

## 3. Full Voiceover Script & Action Cues

### Scene 1: Introduction & Brand Hero
**Timestamp:** `0:00 – 0:50`  
**Route:** [`/`](file:///d:/PROJECTS/Ricoz%20Internship/Project%201/src/app/page.tsx)  
**Primary Focus:** Value proposition, solving last-meter meeting room failures, luxury dark/light aesthetics, and global navbar primitives.

| Visual Cue / On-Screen Action | Word-for-Word Voiceover Script | Speaker Notes & Tips |
| :--- | :--- | :--- |
| **0:00** — Browser opens on Home Page. Cursor gently hovers over the glowing title `KioskDrop Enterprise`. | *"Welcome to KioskDrop Enterprise — the automated conference room AV micro-logistics platform designed to eliminate last-meter meeting room equipment failures."* | Deliver with confidence and an executive tone. |
| **0:12** — Cursor hovers over subtitle: *"Solving last-meter meeting room equipment failures with zero-trust asset whitelisting and real-time telemetry."* | *"In high-stakes corporate environments, when a boardroom display cable fails or a USB converter goes missing, executive meetings stall, costing enterprises an average of $54,000 per room annually in lost productivity."* | Highlight the real-world enterprise pain point. |
| **0:25** — Move cursor to top navigation bar. Point to the **Live Telemetry** badge pulsing green. | *"KioskDrop solves this by deploying smart floor lockers backed by real-time Server-Sent Events (SSE) telemetry, visible right here on the global command bar."* | Notice the pulsing green dot. |
| **0:33** — Click the **Theme Toggle** button. The circular ripple animation expands across the canvas into Light Mode. | *"Our interface features a zero-FOUC luxury theme engine. With a single click, the View Transitions API triggers a smooth circular ripple, switching between our crisp high-contrast day theme..."* | Let the circular animation complete smoothly. |
| **0:41** — Click the Theme Toggle again to ripple back into Obsidian Dark Mode. | *"...and our deep Obsidian and Electric Sapphire dark mode, tailored for command-center environments."* | Showcases visual excellence. |
| **0:46** — Click the **Persona Switcher** dropdown in the top right. Show `Aarav Sharma (Employee)`, `Priya Patel (IT Admin)`, and `Vikram (FinOps)`. | *"Built with strict enterprise Role-Based Access Control, the platform adapts instantly whether you are an everyday meeting employee, an IT infrastructure administrator, or a FinOps auditor."* | Closes navbar section. |

---

### Scene 2: Employee Rapid-Drop Request & Diagnostic Triage
**Timestamp:** `0:50 – 2:00`  
**Route:** [`/request`](file:///d:/PROJECTS/Ricoz%20Internship/Project%201/src/app/request/page.tsx)  
**Primary Focus:** Meeting room QR code simulation, instant symptom diagnosis, degraded port detection, and dynamic PIN generation with TTL countdown.

| Visual Cue / On-Screen Action | Word-for-Word Voiceover Script | Speaker Notes & Tips |
| :--- | :--- | :--- |
| **0:50** — Click **Employee Request** (or "Open Scanner" from Home Page). Page transitions to `/request`. | *"Let's experience the employee workflow. When an AV failure occurs, the employee simply taps the room's NFC tag or scans the QR code outside their conference room."* | Emphasize the ease of access. |
| **1:02** — Cursor clicks between room pills: `Executive Boardroom 4B`, `Innovation Lab`, `Townhall Auditorium`. Select `Innovation Lab`. | *"The portal immediately ingests the physical room context — floor level, display type, and connected AV systems. Here we are troubleshooting the Innovation Lab on Floor 4."* | Highlights context awareness. |
| **1:14** — Scroll to symptom cards. Hover over the 3 diagnostic options: BYOD display failure, Video wall blackout, Out-of-sync audio. Click **Display Not Recognized (BYOD Laptop)**. | *"Instead of filing a slow IT ticket and waiting 45 minutes for support, the employee selects their symptom: 'Display Not Recognized'."* | Contrast with legacy IT helpdesks. |
| **1:25** — Check the sub-checkbox: **"Laptop port mechanically loose / degraded (Bypass via 4K Wireless HDMI Kit)"**. | *"Notice our intelligent diagnostic engine: if the employee reports a loose or damaged physical port on their laptop, the system automatically pivots from a standard USB-C cable to an Enterprise 4K Wireless HDMI Transmitter Kit!"* | Key diagnostic differentiator. |
| **1:38** — On the right column, highlight the **Diagnostic Resolution Engine** recommendation card. | *"Every recommended asset is verified against our Zero-Trust cybersecurity database, confirming authorized USB VID/PID and statutory compliance before release."* | Connects hardware to cybersecurity. |
| **1:47** — Click **"Reserve & Generate 6-Digit PIN"**. Button shows loading state, then transitions into the interactive **Pickup Pass Card**. | *"Clicking Reserve unlocks our nearest floor locker. In under 2 seconds, the system generates a secure 6-digit One-Time Access PIN, identifies the exact bay — Floor 4, Bay #1 — and initializes a 10-minute dynamic countdown timer while auto-creating a ServiceNow incident in the background."* | Highlight the generated 6-digit PIN clearly. |

---

### Scene 3: IoT Smart Locker Hardware Bank & Tactile Keypad
**Timestamp:** `2:00 – 3:30`  
**Route:** [`/kiosk-simulator`](file:///d:/PROJECTS/Ricoz%20Internship/Project%201/src/app/kiosk-simulator/page.tsx)  
**Primary Focus:** 12-bay floor locker bank, tactile audio keypad, IR break-beam presence sensors, solenoid door actuation, RFID tap, and foreign BadUSB quarantine.

| Visual Cue / On-Screen Action | Word-for-Word Voiceover Script | Speaker Notes & Tips |
| :--- | :--- | :--- |
| **2:00** — Click **Locker Kiosk Simulator** in the navbar. Page loads 12-bay locker grid and keypad terminal. | *"Now let's walk down the corridor to the physical floor locker terminal. This simulator directly models our 12-bay hardware installation."* | Sets up physical hardware perspective. |
| **2:12** — Cursor highlights the **Floor Switcher** (`Floor 4: Boardroom Hub` vs `Floor 2: Townhall Hub`) and ambient telemetry (`● ONLINE`, `Temp: 22.8°C`). | *"Each terminal continuously streams hardware telemetry: ambient bay temperature, network connectivity, and lock states."* | Highlights IoT integration. |
| **2:22** — Point to Bay #1. Explain the badges: Solenoid Lock icon, IR break-beam sensor (`ITEM`), and 5V/3A USB-C power continuity (`CHG`). | *"Every individual compartment features an infrared break-beam sensor verifying hardware presence, plus intelligent USB-C power continuity ensuring adapters are fully charged before checkout."* | Reassures that equipment works. |
| **2:35** — Move to the right-hand **Tactile Keypad Console**. Click the numeric digits of the PIN generated in Scene 2 (e.g. `4`, `0`, `1`, `8`, `2`, `1`). Each click triggers an authentic mechanical click sound. | *"The employee enters their 6-digit reservation PIN on the tactile numeric keypad..."* | Let the keypad clicks be heard clearly. |
| **2:48** — Click the vibrant blue **ENTER** button. Bay #1 border illuminates and displays **"Door Unlocked!"**. | *"...and presses ENTER. The solenoid lock actuates instantly, and the physical compartment door pops open!"* | Highlight the instantaneous reaction. |
| **2:58** — Click **"Take Device (IR Break)"**. Bay #1 status transitions to `CHECKED_OUT`, break-beam changes to `CLEAR`, charging drops to `OFF`. | *"When the employee removes the device, the IR break-beam sensor immediately detects hardware extraction, transitioning the compartment to Checked-Out mode and stopping unnecessary charging current."* | Demonstrates real-time sensor feedback. |
| **3:08** — Point to the **Multi-Factor Verification** section. Click **"Tap Corporate RFID Badge (RFID-EMP-8821)"**. | *"For recurring personnel, the terminal supports zero-click corporate RFID badge authentication for instant multi-factor access."* | Fast-track enterprise option. |
| **3:18** — Click **"Simulate Foreign BadUSB"** on a test bay. A red flashing alarm triggers, and the compartment enters `MAINTENANCE_QUARANTINE`. | *"Even more critically: if a rogue employee or intruder attempts to plug an unauthorized device into the locker, our built-in endpoint defense flags the invalid Vendor ID, triggers a security alarm, and places the bay into immediate Maintenance Quarantine!"* | Powerful cybersecurity feature. |

---

### Scene 4: ITAM, Compliance & FinOps Command Center
**Timestamp:** `3:30 – 5:15`  
**Route:** [`/admin`](file:///d:/PROJECTS/Ricoz%20Internship/Project%201/src/app/admin/page.tsx)  
**Primary Focus:** Indian Customs Landed-Cost Engine, Zero-Trust Asset Whitelisting, FinOps Restocking & ERP auto-posting, 360° Anomaly Detection, and ITSM Webhooks.

| Visual Cue / On-Screen Action | Word-for-Word Voiceover Script | Speaker Notes & Tips |
| :--- | :--- | :--- |
| **3:30** — Click **Command Center** in the navbar. Page loads `/admin`. Notice the amber warning: *"You are currently viewing as Aarav Sharma (EMPLOYEE)..."*. | *"Next, let's step into the Enterprise Command Center. As an employee, write operations are strictly restricted by server-side RBAC."* | Demonstrates security rigor. |
| **3:42** — Click **"Switch to IT Admin (Priya Patel)"**. Page refreshes into elevated IT Admin mode. | *"Let's escalate to Priya Patel, our Enterprise Infrastructure Administrator."* | Smooth role switch. |
| **3:50** — **Tab 1: Zero-Trust & Indian Customs Landed-Cost Engine**. Highlight the statutory formula badge: `Va(1.01) + BCD(20%) + SWS(2%) + IGST(21.96% Va / 22.18% CIF) = 44.40%`. | *"Tab 1 hosts our ADR D6 Statutory Landed-Cost & Customs Duty Calculator. Unlike generic inventory tools, KioskDrop incorporates actual Indian statutory customs tariffs."* | Highlight regulatory specialization. |
| **4:02** — Type `7500` into CIF Purchase Value (INR). Select HSN `85437099`. Click **"Compute Statutory Breakdown"**. | *"Entering a CIF value of ₹7,500 instantly computes the complete statutory tax stack: 1% assessable landing charges, 20% Basic Customs Duty, 2% Social Welfare Surcharge, and 18% Integrated GST, giving enterprise procurement exact landed cost figures."* | Walk through the exact numbers on screen. |
| **4:16** — Scroll down to **Cryptographic VID/PID & Regulatory Whitelist**. Click the **WHITELISTED / BLOCKED** toggle on the first asset. | *"Below the calculator is our Zero-Trust Asset Registry, where administrators can selectively whitelist or block specific USB Vendor IDs and Product IDs to prevent hardware spoofing across the entire fleet."* | Show immediate visual state change. |
| **4:28** — Click **Tab 2: FinOps & Restocking**. Highlight quick metrics: ₹1,42,850 Total Wholesale Savings, Happay card limit locked to MCC 5045, and 100% ERP Sync. | *"In Tab 2, our FinOps dashboard tracks wholesale B2B savings versus emergency courier retail purchases, complete with corporate purchasing card category locks and automated ERP posting into SAP S/4HANA and Zoho Books."* | Financial and ERP integration. |
| **4:43** — Click **Tab 3: 360° Telemetry & Anomalies**. Show the red banner: *"⚠️ Consumption Anomaly Detected: Executive Boardroom 4B (Floor 4)"*. | *"Tab 3 provides operational intelligence. Our anomaly engine detects meeting rooms with abnormal consumption — such as Boardroom 4B losing 6 adapters in 14 days — and issues automated retrieval orders before stockouts occur."* | Predictive asset loss prevention. |
| **4:58** — Scroll down to the interactive Recharts bar graph. Hover over the bars to show the dynamic dark-themed tooltip. | *"Our interactive financial charts compare wholesale bulk procurement against retail replacement costs avoided, giving CFOs transparent ROI visibility."* | Hover to trigger the Recharts tooltip. |
| **5:07** — Click **Tab 4: ITSM Webhooks**. Highlight the ServiceNow and Zendesk delivery logs. Click **"Replay Event"**. | *"Finally, Tab 4 provides full audit observability with bi-directional ServiceNow and Zendesk webhook event delivery and zero-downtime payload replay."* | Highlights integration readiness. |

---

### Scene 5: Summary & Strategic Enterprise Impact
**Timestamp:** `5:15 – 6:00`  
**Route:** Return to [`/`](file:///d:/PROJECTS/Ricoz%20Internship/Project%201/src/app/page.tsx)  
**Primary Focus:** Executive summary, enterprise ROI, contact and deployment call-to-action.

| Visual Cue / On-Screen Action | Word-for-Word Voiceover Script | Speaker Notes & Tips |
| :--- | :--- | :--- |
| **5:15** — Click the brand shield in the navbar to navigate back to the home page. Smoothly scroll down the page. | *"To summarize: KioskDrop Enterprise replaces chaotic conference room AV scrambles with a dependable 60-second micro-logistics pipeline."* | High energy, conclusive summary. |
| **5:30** — Cursor hovers over the 3 primary value pillars: Zero-Trust Hardware Security, Real-Time IoT Telemetry, and Statutory FinOps Reconciliation. | *"By combining zero-trust hardware whitelisting, physical IoT smart locker automation, statutory landed-cost compliance, and automated ITSM synchronization, KioskDrop transforms meeting room reliability from an IT vulnerability into an enterprise competitive advantage."* | Tie all pillars together. |
| **5:48** — Center the screen on the hero banner. Let the luxury dark theme glow. | *"Thank you for watching this demonstration of KioskDrop Enterprise. Visit our live deployment or connect with our team to learn more."* | Clean closing sign-off. |

---

## 4. Technical Feature Breakdown

Use this quick-reference table during client pitches, investor calls, or evaluation reviews:

| Pillar | Technical Implementation | Enterprise Benefit |
| :--- | :--- | :--- |
| **Last-Meter AV Triage** | Next.js 14 App Router, dynamic room context, symptom-to-SKU mapping. | Reduces meeting downtime from 45 min to <60 sec. |
| **Physical IoT Locker Bank** | 12-bay grid simulator, solenoid lock actuation, IR break-beam sensor modeling, 5V/3A USB-C charging continuity. | Guarantees device presence and battery charge before checkout. |
| **Authentication & Multi-Factor** | 6-digit dynamic OTP with 10-minute TTL countdown timer, Corporate RFID badge verification (`RFID-EMP-8821`). | Eliminates shared keys; complete chain of custody. |
| **Cybersecurity Defense** | Real-time USB VID/PID inspection (`0x16C0 / 0x05DF` BadUSB detection), instant quarantine lockout. | Prevents keystroke injection exploits via conference room ports. |
| **Statutory FinOps Engine** | ADR D6 Indian Customs Tariff formula: `Va(1.01) + BCD(20%) + SWS(2%) + IGST(18% on assessable value)`. | Accurate landed-cost forecasting for enterprise IT procurement. |
| **ERP & ITSM Integration** | Bi-directional ServiceNow / Zendesk Webhooks with HMAC SHA-256 verification and replay capabilities; SAP S/4HANA ledger posting. | Zero manual ticket creation; automated finance reconciliation. |
| **Real-time Telemetry** | Server-Sent Events (SSE) `/api/telemetry/stream` with live visual heartbeat. | Continuous fleet visibility without expensive polling. |
| **Modern UX & Styling** | Tailwind CSS with curated Obsidian & Electric Sapphire palette, View Transitions circular ripple theme switch. | Executive-ready design aesthetics with zero FOUC. |

---

## 5. Audio & Video Polish Checklist

Before recording your official video:

- [ ] **Display Resolution:** Set your monitor or recording canvas to **1920 × 1080** (Full HD) at 100% DPI scaling (disable Windows 125% or 150% scaling for razor-sharp text).
- [ ] **Browser Cleanliness:** Hide the Chrome bookmarks bar (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd>), zoom level at 100% (<kbd>Ctrl</kbd> + <kbd>0</kbd>), and close unrelated tabs.
- [ ] **Dev Server Active:** Verify `npm run dev` is running and `http://localhost:3000` loads with status 200.
- [ ] **Audio Quality:** Use a dedicated USB condenser or dynamic microphone (avoid laptop built-in mics). Keep your mouth 4–6 inches from the microphone with a pop filter.
- [ ] **Pacing:** Speak at a measured pace (~130 to 140 words per minute). Allow 1 to 2 seconds of pause after major UI transitions (like the theme ripple or solenoid door unlock) so viewers can appreciate the visual cues.
- [ ] **Cursor Movement:** Move the cursor deliberately. Avoid erratic circular jiggling. Let the cursor guide the viewer's eyes to the exact element being discussed.
