const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '.ui_audit_screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const PAGES_TO_TEST = [
  { url: '/', name: 'homepage' },
  { url: '/login', name: 'login' },
  { url: '/request?room=Boardroom-4B&floor=4', name: 'request' },
  { url: '/kiosk-simulator', name: 'kiosk-simulator' },
  { url: '/admin', name: 'admin-employee' },
];

async function runAudit() {
  console.log('🔍 Starting Comprehensive UI & Theme Audit with Playwright...');
  
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  const auditLog = {
    consoleErrors: [],
    failedRequests: [],
    themeBugs: [],
    results: [],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      auditLog.consoleErrors.push({ text: msg.text(), location: msg.location() });
    }
  });

  page.on('requestfailed', (req) => {
    auditLog.failedRequests.push({ url: req.url(), failure: req.failure() });
  });

  for (const item of PAGES_TO_TEST) {
    console.log(`\nTesting Page: ${item.name} (${item.url})`);
    
    // Visit page with domcontentloaded (SSE keeps network active)
    await page.goto(`${BASE_URL}${item.url}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // Dismiss splash screen if present by pressing Escape or setting sessionStorage
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 1. Capture Dark Theme Screenshot
    const darkBg = await page.evaluate(() => {
      const body = document.body;
      const main = document.querySelector('main') || document.querySelector('div');
      return {
        htmlClass: document.documentElement.className,
        bodyBg: window.getComputedStyle(body).backgroundColor,
        mainBg: main ? window.getComputedStyle(main).backgroundColor : 'none',
      };
    });
    
    const darkScreenshotPath = path.join(SCREENSHOTS_DIR, `${item.name}_dark.png`);
    await page.screenshot({ path: darkScreenshotPath, fullPage: true });
    console.log(`  📸 Dark screenshot: ${darkScreenshotPath}`);

    // 2. Toggle Theme to Light
    const toggleButton = page.locator('button[aria-label*="theme"]').first();
    const toggleExists = await toggleButton.count() > 0;
    
    let lightBg = null;
    if (toggleExists) {
      await toggleButton.click();
      await page.waitForTimeout(500); // wait for view transition / style change
      
      lightBg = await page.evaluate(() => {
        const body = document.body;
        const main = document.querySelector('main') || document.querySelector('div');
        return {
          htmlClass: document.documentElement.className,
          bodyBg: window.getComputedStyle(body).backgroundColor,
          mainBg: main ? window.getComputedStyle(main).backgroundColor : 'none',
        };
      });

      const lightScreenshotPath = path.join(SCREENSHOTS_DIR, `${item.name}_light.png`);
      await page.screenshot({ path: lightScreenshotPath, fullPage: true });
      console.log(`  📸 Light screenshot: ${lightScreenshotPath}`);

      // Check if light mode actually changed background or is stuck in dark
      const isHtmlDark = lightBg.htmlClass.includes('dark');
      if (isHtmlDark) {
        auditLog.themeBugs.push(`${item.name}: HTML tag still contains 'dark' class after toggle.`);
      }
      
      // If the main background is still black/very dark (#070A10 = rgb(7, 10, 16) or #0B0F17)
      if (lightBg.mainBg.includes('rgb(7, 10, 16)') || lightBg.bodyBg.includes('rgb(7, 10, 16)')) {
        auditLog.themeBugs.push(`${item.name}: Background remains dark (#070A10 / rgb(7, 10, 16)) even in light mode!`);
      }

      // Toggle back to dark for consistency or next test
      await toggleButton.click();
      await page.waitForTimeout(300);
    } else {
      auditLog.themeBugs.push(`${item.name}: Theme toggle button not found on page.`);
    }

    auditLog.results.push({
      page: item.name,
      url: item.url,
      darkBg,
      lightBg,
    });
  }

  // Also test Admin page as IT_ADMIN persona to see internal dashboard in light and dark
  console.log(`\nTesting Admin Dashboard as IT_ADMIN Persona...`);
  await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.keyboard.press('Escape');

  // Switch persona using the dropdown or escalate button
  const escalateBtn = page.locator('button:has-text("Escalate to IT Admin Persona")');
  if (await escalateBtn.count() > 0) {
    await escalateBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_itadmin_dark.png'), fullPage: true });
    
    // Toggle theme to light on admin
    const toggleButton = page.locator('button[aria-label*="theme"]').first();
    if (await toggleButton.count() > 0) {
      await toggleButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_itadmin_light.png'), fullPage: true });
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(SCREENSHOTS_DIR, 'audit_report.json'),
    JSON.stringify(auditLog, null, 2)
  );

  console.log('\n========================================');
  console.log('AUDIT REPORT SUMMARY:');
  console.log('Console Errors:', auditLog.consoleErrors.length);
  auditLog.consoleErrors.forEach((e) => console.log('  ❌ Console Error:', e.text));
  console.log('Failed Requests:', auditLog.failedRequests.length);
  auditLog.failedRequests.forEach((r) => console.log('  ❌ Failed Request:', r.url, r.failure));
  console.log('Theme Bugs Identified:', auditLog.themeBugs.length);
  auditLog.themeBugs.forEach((b) => console.log('  ⚠️  Theme Bug:', b));
  console.log('========================================\n');
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});

