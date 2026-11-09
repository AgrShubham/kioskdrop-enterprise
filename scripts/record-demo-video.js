/**
 * KioskDrop Enterprise - Automated 1080p Screen Capture Video Generator
 * Uses Playwright with system Google Chrome to perform a complete interactive walkthrough
 * of every page and feature, recording a high-definition video artifact.
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const RECORDINGS_DIR = path.join(__dirname, '..', 'recordings');

if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// Helper: inject a visible glowing cursor into the browser so the video shows pointer actions clearly
async function injectVisualCursor(page) {
  await page.addInitScript(() => {
    window.addEventListener('DOMContentLoaded', () => {
      const cursor = document.createElement('div');
      cursor.id = 'demo-visual-cursor';
      cursor.style.cssText = `
        position: fixed;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(56, 189, 248, 0.4);
        border: 2px solid #38bdf8;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.8), 0 0 24px rgba(59, 130, 246, 0.4);
        pointer-events: none;
        z-index: 9999999;
        transform: translate(-50%, -50%);
        transition: transform 0.08s ease, width 0.15s ease, height 0.15s ease, background 0.15s ease;
      `;
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });

      window.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
        cursor.style.background = 'rgba(239, 68, 68, 0.6)';
        cursor.style.borderColor = '#ef4444';
      });

      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = 'rgba(56, 189, 248, 0.4)';
        cursor.style.borderColor = '#38bdf8';
      });
    });
  });
}

// Helper: Smooth mouse move
async function smoothMove(page, selector) {
  const el = await page.$(selector);
  if (!el) return;
  const box = await el.boundingBox();
  if (!box) return;
  const targetX = box.x + box.width / 2;
  const targetY = box.y + box.height / 2;
  await page.mouse.move(targetX, targetY, { steps: 25 });
  await page.waitForTimeout(350);
}

// Helper: Click with smooth move
async function smoothClick(page, selector) {
  await smoothMove(page, selector);
  await page.click(selector);
  await page.waitForTimeout(600);
}

async function recordDemo() {
  console.log('🎥 Starting KioskDrop Enterprise Video Recording...');
  console.log(`🌐 Base URL: ${BASE_URL}`);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: false, // Set to false to allow smooth GPU rendering & view transitions
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: RECORDINGS_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  await injectVisualCursor(page);

  try {
    // ==========================================
    // SCENE 1: HOME PAGE & GLOBAL NAVBAR
    // ==========================================
    console.log('🎬 [Scene 1] Home Page & Global Navbar Features...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Showcase hero title & platform badge
    await smoothMove(page, 'h1');
    await page.waitForTimeout(1000);

    // Showcase Theme Toggle (Smooth View Transition Ripple)
    console.log('  🌓 Demonstrating View Transitions Ripple Theme Toggle...');
    const themeBtn = 'button[aria-label*="theme" i], button:has(svg.lucide-sun), button:has(svg.lucide-moon)';
    await smoothClick(page, themeBtn);
    await page.waitForTimeout(1800); // Admire light mode

    // Toggle back to Luxury Dark Theme
    await smoothClick(page, themeBtn);
    await page.waitForTimeout(1500); // Admire dark mode

    // Showcase Persona Switcher Dropdown
    console.log('  👤 Demonstrating RBAC Multi-Persona Switcher...');
    const personaBtn = 'button[aria-label="Switch User Persona"]';
    await smoothClick(page, personaBtn);
    await page.waitForTimeout(1200);
    // Close dropdown
    await smoothClick(page, personaBtn);
    await page.waitForTimeout(800);

    // Scroll through Home Page features
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(1500);
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(1500);
    await page.mouse.wheel(0, -900);
    await page.waitForTimeout(1000);

    // ==========================================
    // SCENE 2: EMPLOYEE RAPID-DROP REQUEST FLOW
    // ==========================================
    console.log('🎬 [Scene 2] Employee Rapid-Drop Request & Diagnostic Triage...');
    await smoothClick(page, 'a[href^="/request"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Switch Meeting Rooms
    console.log('  🏢 Selecting Innovation Lab room context...');
    const roomBtn = 'button:has-text("Innovation Lab")';
    if (await page.$(roomBtn)) {
      await smoothClick(page, roomBtn);
      await page.waitForTimeout(1000);
    }

    // Select Symptom: Display Not Recognized BYOD
    console.log('  ⚡ Selecting BYOD Laptop No Signal symptom...');
    const symptom1 = 'div:has-text("Display Not Recognized")';
    await smoothClick(page, symptom1);
    await page.waitForTimeout(1000);

    // Toggle Damaged Port detection (triggers 4K Wireless HDMI fallback)
    console.log('  🔌 Triggering degraded port checkbox (4K Wireless HDMI fallback)...');
    const portCheck = 'input[type="checkbox"]';
    if (await page.$(portCheck)) {
      await smoothClick(page, portCheck);
      await page.waitForTimeout(1500);
    }

    // Click "Reserve & Generate 6-Digit PIN"
    console.log('  🎫 Generating Instant Access PIN...');
    const reserveBtn = 'button:has-text("Reserve & Generate 6-Digit PIN")';
    await smoothClick(page, reserveBtn);
    await page.waitForTimeout(2000);

    // Extract generated PIN for next scene
    let generatedPin = '401821';
    try {
      const pinEl = await page.$('.font-mono.text-4xl, .tracking-widest.text-foreground');
      if (pinEl) {
        const text = await pinEl.innerText();
        if (text && text.trim().length === 6) {
          generatedPin = text.trim();
          console.log(`  🔑 Captured Generated PIN: ${generatedPin}`);
        }
      }
    } catch {
      // Use fallback pin
    }

    // Highlight TTL Countdown Timer
    await smoothMove(page, 'div:has-text("TTL:")');
    await page.waitForTimeout(1500);

    // ==========================================
    // SCENE 3: IOT SMART LOCKER HARDWARE SIMULATOR
    // ==========================================
    console.log('🎬 [Scene 3] Smart Locker Hardware Bank & Tactile Keypad...');
    await smoothClick(page, 'a[href="/kiosk-simulator"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Showcase Floor Hub Switcher
    console.log('  📍 Switching between Floor 4 and Floor 2 Hubs...');
    const floor2Btn = 'button:has-text("Floor 2")';
    if (await page.$(floor2Btn)) {
      await smoothClick(page, floor2Btn);
      await page.waitForTimeout(1200);
    }
    const floor4Btn = 'button:has-text("Floor 4")';
    if (await page.$(floor4Btn)) {
      await smoothClick(page, floor4Btn);
      await page.waitForTimeout(1200);
    }

    // Enter 6-Digit PIN on Tactile Numeric Keypad
    console.log(`  🔢 Entering PIN ${generatedPin} on Tactile Numeric Keypad...`);
    for (const digit of generatedPin) {
      const keyBtn = `button:text-is("${digit}")`;
      await smoothClick(page, keyBtn);
      await page.waitForTimeout(250);
    }

    // Press ENTER to actuate Solenoid Lock
    console.log('  🔓 Pressing ENTER to actuate Solenoid Lock...');
    await smoothClick(page, 'button:text-is("ENTER")');
    await page.waitForTimeout(2000);

    // Actuate: Take Device (IR Break-Beam trip)
    const takeBtn = 'button:has-text("Take Device")';
    if (await page.$(takeBtn)) {
      console.log('  📦 Removing device from unlocked bay...');
      await smoothClick(page, takeBtn);
      await page.waitForTimeout(2000);
    }

    // Simulate Corporate RFID Badge Fast-Track
    console.log('  💳 Simulating Corporate RFID Badge Tap authentication...');
    const rfidBtn = 'button:has-text("Tap Corporate RFID Badge")';
    if (await page.$(rfidBtn)) {
      await smoothClick(page, rfidBtn);
      await page.waitForTimeout(2000);
    }

    // Return & Plug the device
    const returnBtn = 'button:has-text("Return & Plug")';
    if (await page.$(returnBtn)) {
      console.log('  🔄 Returning & plugging asset...');
      await smoothClick(page, returnBtn);
      await page.waitForTimeout(1800);
    }

    // ==========================================
    // SCENE 4: COMMAND CENTER (ADMIN & FINOPS)
    // ==========================================
    console.log('🎬 [Scene 4] Enterprise ITAM, Compliance & FinOps Command Center...');
    await smoothClick(page, 'a[href="/admin"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Showcase RBAC warning and switch persona to IT Admin
    console.log('  🛡️ Demonstrating RBAC persona escalation to IT Admin...');
    const switchToAdmin = 'button:has-text("Switch to IT Admin")';
    if (await page.$(switchToAdmin)) {
      await smoothClick(page, switchToAdmin);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
    }

    // Tab 1: Statutory Landed-Cost & Duty Stack Calculator
    console.log('  🇮🇳 Testing Indian Customs Tariff Engine with custom CIF INR...');
    const cifInput = 'input[type="number"]';
    if (await page.$(cifInput)) {
      await page.fill(cifInput, '7500');
      await page.waitForTimeout(600);
      const computeBtn = 'button:has-text("Compute Statutory Breakdown")';
      await smoothClick(page, computeBtn);
      await page.waitForTimeout(1500);
    }

    // Toggle Whitelist state on an asset
    console.log('  🔐 Demonstrating Cryptographic VID/PID Whitelist Toggle...');
    const whitelistToggle = 'table tbody tr:first-child button';
    if (await page.$(whitelistToggle)) {
      await smoothClick(page, whitelistToggle);
      await page.waitForTimeout(1200);
    }

    // Tab 2: FinOps & Restocking
    console.log('  💰 Navigating to FinOps & Restocking Tab...');
    const finopsTab = 'button:has-text("FinOps & Restocking")';
    await smoothClick(page, finopsTab);
    await page.waitForTimeout(1500);

    // Scroll through FinOps metrics & ERP ledger
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(1500);
    await page.mouse.wheel(0, -350);
    await page.waitForTimeout(800);

    // Tab 3: 360° Telemetry & Anomalies
    console.log('  📊 Navigating to 360° Telemetry & Recharts Economics Tab...');
    const analyticsTab = 'button:has-text("360° Telemetry & Anomalies")';
    await smoothClick(page, analyticsTab);
    await page.waitForTimeout(1500);

    // Scroll to interactive Recharts financial chart
    await page.mouse.wheel(0, 450);
    await page.waitForTimeout(2000);

    // Hover over bar chart to trigger interactive Recharts tooltip
    const chartBar = '.recharts-bar-rectangles';
    if (await page.$(chartBar)) {
      await smoothMove(page, chartBar);
      await page.waitForTimeout(1500);
    }
    await page.mouse.wheel(0, -450);
    await page.waitForTimeout(1000);

    // Tab 4: ITSM Webhooks
    console.log('  📡 Navigating to ITSM Webhooks Monitor...');
    const webhooksTab = 'button:has-text("ITSM Webhooks")';
    await smoothClick(page, webhooksTab);
    await page.waitForTimeout(1500);

    // Trigger Webhook Event Replay test
    const replayBtn = 'button:has-text("Replay Event")';
    if (await page.$(replayBtn)) {
      console.log('  🔄 Replaying ServiceNow webhook event...');
      await smoothClick(page, replayBtn);
      await page.waitForTimeout(2000);
    }

    // ==========================================
    // SCENE 5: FINALE & RETURN TO HOME
    // ==========================================
    console.log('🎬 [Scene 5] Returning to Home for final wrap-up...');
    await smoothClick(page, 'a[href="/"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2500);

    console.log('✅ Interactive Demo Walkthrough Completed Successfully!');
  } catch (error) {
    console.error('❌ Error during demo recording:', error);
  } finally {
    // Gracefully close page and context to finalize video recording
    await page.close();
    await context.close();
    await browser.close();

    // Identify the saved video file
    const files = fs.readdirSync(RECORDINGS_DIR).filter(f => f.endsWith('.webm'));
    if (files.length > 0) {
      files.sort((a, b) => fs.statSync(path.join(RECORDINGS_DIR, b)).mtimeMs - fs.statSync(path.join(RECORDINGS_DIR, a)).mtimeMs);
      const latestVideo = path.join(RECORDINGS_DIR, files[0]);
      const targetVideo = path.join(RECORDINGS_DIR, 'kioskdrop_enterprise_demo.webm');
      try {
        if (fs.existsSync(targetVideo)) fs.unlinkSync(targetVideo);
        fs.renameSync(latestVideo, targetVideo);
        console.log(`\n🎉 Demo Video Recorded & Saved to:\n   ${targetVideo}`);
      } catch {
        console.log(`\n🎉 Demo Video Recorded & Saved to:\n   ${latestVideo}`);
      }
    }
  }
}

recordDemo();
