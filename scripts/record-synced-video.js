/**
 * KioskDrop Enterprise - Synchronized 1080p Video Recording & Merging Engine
 * Reads voiceover_timeline.json to execute visual interactions with exact frame-by-frame
 * timing matching the Indian Female Voiceover ('en-IN-NeerjaNeural').
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const RECORDINGS_DIR = path.join(__dirname, '..', 'recordings');
const TIMELINE_PATH = path.join(RECORDINGS_DIR, 'voiceover_timeline.json');

if (!fs.existsSync(TIMELINE_PATH)) {
  console.error('❌ voiceover_timeline.json not found! Run python scripts/generate-synced-voiceover.py first.');
  process.exit(1);
}

const timeline = JSON.parse(fs.readFileSync(TIMELINE_PATH, 'utf-8'));
const sceneMap = {};
timeline.scenes.forEach(s => { sceneMap[s.id] = s; });

// Get Python's full ffmpeg path via imageio_ffmpeg
function getFFmpegPath() {
  try {
    const out = execSync('python -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"', { encoding: 'utf-8' });
    return out.trim();
  } catch {
    return 'C:\\Users\\agshu\\AppData\\Local\\ms-playwright\\ffmpeg-1010\\ffmpeg-win64.exe';
  }
}

const FFMPEG_PATH = getFFmpegPath();

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
        background: rgba(56, 189, 248, 0.45);
        border: 2px solid #38bdf8;
        box-shadow: 0 0 12px rgba(56, 189, 248, 0.9), 0 0 24px rgba(59, 130, 246, 0.5);
        pointer-events: none;
        z-index: 9999999;
        transform: translate(-50%, -50%);
        transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
      `;
      document.body.appendChild(cursor);

      window.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });

      window.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
        cursor.style.background = 'rgba(239, 68, 68, 0.7)';
        cursor.style.borderColor = '#ef4444';
      });

      window.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = 'rgba(56, 189, 248, 0.45)';
        cursor.style.borderColor = '#38bdf8';
      });
    });
  });
}

async function smoothMove(page, selector) {
  const el = await page.$(selector);
  if (!el) return;
  const box = await el.boundingBox();
  if (!box) return;
  const targetX = box.x + box.width / 2;
  const targetY = box.y + box.height / 2;
  await page.mouse.move(targetX, targetY, { steps: 20 });
  await page.waitForTimeout(300);
}

async function smoothClick(page, selector) {
  await smoothMove(page, selector);
  await page.click(selector);
  await page.waitForTimeout(400);
}

async function runScene(sceneId, actionFn) {
  const scene = sceneMap[sceneId];
  if (!scene) {
    console.warn(`⚠️ Scene ${sceneId} not found in timeline!`);
    await actionFn();
    return;
  }

  const startTime = Date.now();
  console.log(`\n▶️ [${sceneId}] Duration: ${scene.duration_sec}s + Pause: ${scene.post_pause_sec}s = Total: ${scene.total_scene_sec}s`);
  console.log(`   Voice: "${scene.text.slice(0, 75)}..."`);

  // Execute the action
  await actionFn();

  // Wait remaining time for perfect sync
  const elapsedSec = (Date.now() - startTime) / 1000;
  const remainingSec = Math.max(0, scene.total_scene_sec - elapsedSec);
  if (remainingSec > 0) {
    await new Promise(r => setTimeout(r, remainingSec * 1000));
  }
}

async function recordAndMux() {
  console.log('🎥 Launching Google Chrome for Synchronized Recording...');
  console.log(`📊 Total Target Duration: ${timeline.total_duration_sec}s (~${(timeline.total_duration_sec/60).toFixed(1)} mins)`);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: false,
    args: ['--start-maximized', '--no-sandbox', '--disable-dev-shm-usage'],
  });

  const rawVideoDir = path.join(RECORDINGS_DIR, 'raw_video_neerja');
  if (!fs.existsSync(rawVideoDir)) fs.mkdirSync(rawVideoDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: rawVideoDir,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();
  await injectVisualCursor(page);

  let capturedPin = '401821';

  try {
    // Navigate initially to Home
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    // ==========================================
    // SCENE 1: HOME PAGE & GLOBAL NAVBAR
    // ==========================================
    await runScene('scene1_intro', async () => {
      await smoothMove(page, 'h1');
      await page.waitForTimeout(2000);
    });

    await runScene('scene1_problem', async () => {
      await page.mouse.wheel(0, 350);
      await page.waitForTimeout(2000);
      await page.mouse.wheel(0, -350);
      await page.waitForTimeout(1000);
    });

    await runScene('scene1_theme', async () => {
      const themeBtn = 'button[aria-label*="theme" i], button:has(svg.lucide-sun), button:has(svg.lucide-moon)';
      // Ripple to Light mode
      await smoothClick(page, themeBtn);
      await page.waitForTimeout(3500);
      // Ripple back to Obsidian Dark mode
      await smoothClick(page, themeBtn);
      await page.waitForTimeout(2000);
    });

    await runScene('scene1_persona', async () => {
      const personaBtn = 'button[aria-label="Switch User Persona"]';
      await smoothClick(page, personaBtn);
      await page.waitForTimeout(3000);
      await smoothClick(page, personaBtn); // close
    });

    // ==========================================
    // SCENE 2: EMPLOYEE RAPID-DROP
    // ==========================================
    await runScene('scene2_request_nav', async () => {
      await smoothClick(page, 'a[href^="/request"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      // Select Innovation Lab
      const roomBtn = 'button:has-text("Innovation Lab")';
      if (await page.$(roomBtn)) await smoothClick(page, roomBtn);
    });

    await runScene('scene2_symptom', async () => {
      const symptom1 = 'div:has-text("Display Not Recognized")';
      await smoothClick(page, symptom1);
      await page.waitForTimeout(2000);
      const portCheck = 'input[type="checkbox"]';
      if (await page.$(portCheck)) {
        await smoothClick(page, portCheck);
        await page.waitForTimeout(2500);
      }
    });

    await runScene('scene2_pin', async () => {
      const reserveBtn = 'button:has-text("Reserve & Generate 6-Digit PIN")';
      await smoothClick(page, reserveBtn);
      await page.waitForTimeout(2500);

      // Extract generated PIN
      try {
        const pinEl = await page.$('.font-mono.text-4xl, .tracking-widest.text-foreground');
        if (pinEl) {
          const text = (await pinEl.innerText()).trim();
          if (text.length === 6) capturedPin = text;
        }
      } catch {}

      // Highlight TTL countdown
      await smoothMove(page, 'div:has-text("TTL:")');
      await page.waitForTimeout(2500);
    });

    // ==========================================
    // SCENE 3: IOT SMART LOCKER SIMULATOR
    // ==========================================
    await runScene('scene3_kiosk_nav', async () => {
      await smoothClick(page, 'a[href="/kiosk-simulator"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Floor switcher demo
      const floor2Btn = 'button:has-text("Floor 2")';
      if (await page.$(floor2Btn)) await smoothClick(page, floor2Btn);
      await page.waitForTimeout(1500);
      const floor4Btn = 'button:has-text("Floor 4")';
      if (await page.$(floor4Btn)) await smoothClick(page, floor4Btn);
    });

    await runScene('scene3_keypad', async () => {
      console.log(`  🔢 Entering PIN ${capturedPin} on tactile keypad...`);
      for (const digit of capturedPin) {
        await smoothClick(page, `button:text-is("${digit}")`);
        await page.waitForTimeout(250);
      }
      await page.waitForTimeout(1000);
      // Press ENTER to pop door
      await smoothClick(page, 'button:text-is("ENTER")');
      await page.waitForTimeout(2000);
    });

    await runScene('scene3_sensor_rfid', async () => {
      const takeBtn = 'button:has-text("Take Device")';
      if (await page.$(takeBtn)) {
        await smoothClick(page, takeBtn);
        await page.waitForTimeout(2000);
      }
      const rfidBtn = 'button:has-text("Tap Corporate RFID Badge")';
      if (await page.$(rfidBtn)) {
        await smoothClick(page, rfidBtn);
        await page.waitForTimeout(2000);
      }
      const returnBtn = 'button:has-text("Return & Plug")';
      if (await page.$(returnBtn)) {
        await smoothClick(page, returnBtn);
      }
    });

    await runScene('scene3_badusb', async () => {
      const alarmBtn = 'button:has-text("Simulate Foreign BadUSB")';
      if (await page.$(alarmBtn)) {
        await smoothClick(page, alarmBtn);
        await page.waitForTimeout(3000);
      }
    });

    // ==========================================
    // SCENE 4: COMMAND CENTER (ADMIN & FINOPS)
    // ==========================================
    await runScene('scene4_admin_nav', async () => {
      await smoothClick(page, 'a[href="/admin"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      const switchToAdmin = 'button:has-text("Switch to IT Admin")';
      if (await page.$(switchToAdmin)) {
        await smoothClick(page, switchToAdmin);
        await page.waitForLoadState('networkidle');
      }
    });

    await runScene('scene4_customs', async () => {
      const cifInput = 'input[type="number"]';
      if (await page.$(cifInput)) {
        await page.fill(cifInput, '8500');
        await page.waitForTimeout(1000);
        await smoothClick(page, 'button:has-text("Compute Statutory Breakdown")');
        await page.waitForTimeout(2500);
      }
      // Toggle whitelist on first asset
      const whitelistToggle = 'table tbody tr:first-child button';
      if (await page.$(whitelistToggle)) {
        await smoothClick(page, whitelistToggle);
      }
    });

    await runScene('scene4_finops', async () => {
      await smoothClick(page, 'button:has-text("FinOps & Restocking")');
      await page.waitForTimeout(2000);
      await page.mouse.wheel(0, 350);
      await page.waitForTimeout(2500);
      await page.mouse.wheel(0, -350);
    });

    await runScene('scene4_analytics', async () => {
      await smoothClick(page, 'button:has-text("360° Telemetry & Anomalies")');
      await page.waitForTimeout(1500);
      await page.mouse.wheel(0, 450);
      await page.waitForTimeout(2000);
      const chartBar = '.recharts-bar-rectangles';
      if (await page.$(chartBar)) await smoothMove(page, chartBar);
      await page.waitForTimeout(2000);
      await page.mouse.wheel(0, -450);
    });

    await runScene('scene4_webhooks', async () => {
      await smoothClick(page, 'button:has-text("ITSM Webhooks")');
      await page.waitForTimeout(2000);
      const replayBtn = 'button:has-text("Replay Event")';
      if (await page.$(replayBtn)) {
        await smoothClick(page, replayBtn);
        await page.waitForTimeout(2500);
      }
    });

    // ==========================================
    // SCENE 5: FINALE & RETURN TO HOME
    // ==========================================
    await runScene('scene5_conclusion', async () => {
      await smoothClick(page, 'a[href="/"]');
      await page.waitForLoadState('networkidle');
      await smoothMove(page, 'h1');
      await page.waitForTimeout(3500);
    });

    console.log('✅ Synchronized Visual Actions Completed!');
  } catch (err) {
    console.error('❌ Error during synchronized recording:', err);
  } finally {
    await page.close();
    await context.close();
    await browser.close();

    // Identify recorded raw video
    const rawFiles = fs.readdirSync(rawVideoDir).filter(f => f.endsWith('.webm'));
    if (rawFiles.length === 0) {
      console.error('❌ No recorded video found in', rawVideoDir);
      return;
    }
    rawFiles.sort((a, b) => fs.statSync(path.join(rawVideoDir, b)).mtimeMs - fs.statSync(path.join(rawVideoDir, a)).mtimeMs);
    const rawVideoPath = path.join(rawVideoDir, rawFiles[0]);

    const audioPath = path.join(RECORDINGS_DIR, 'kioskdrop_indian_female_voiceover.mp3');
    const outMp4 = path.join(RECORDINGS_DIR, 'kioskdrop_enterprise_demo_synced_indian_female.mp4');
    const outWebm = path.join(RECORDINGS_DIR, 'kioskdrop_enterprise_demo_synced_indian_female.webm');

    console.log(`\n🎬 Muxing synchronized video with Indian Female Voiceover:`);
    console.log(`   Video: ${rawVideoPath}`);
    console.log(`   Audio: ${audioPath}`);

    // Output 1: MP4 (H.264 + AAC)
    const cmdMp4 = `"${FFMPEG_PATH}" -y -i "${rawVideoPath}" -i "${audioPath}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${outMp4}"`;
    execSync(cmdMp4, { stdio: 'inherit' });
    console.log(`\n🎉 Generated Voiced-Over MP4:\n   ${outMp4}`);

    // Output 2: WebM (VP8 + Opus)
    const cmdWebm = `"${FFMPEG_PATH}" -y -i "${rawVideoPath}" -i "${audioPath}" -c:v copy -c:a libopus -b:a 128k -shortest "${outWebm}"`;
    execSync(cmdWebm, { stdio: 'inherit' });
    console.log(`\n🎉 Generated Voiced-Over WebM:\n   ${outWebm}`);
  }
}

recordAndMux().catch(err => {
  console.error('Recording engine failed:', err);
  process.exit(1);
});

