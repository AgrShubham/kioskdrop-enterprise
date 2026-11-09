const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { name: 'iphone_14', width: 390, height: 844, deviceScaleFactor: 2 },
  { name: 'android_galaxy', width: 360, height: 800, deviceScaleFactor: 2 },
  { name: 'compact_small', width: 320, height: 600, deviceScaleFactor: 2 },
  { name: 'tablet_portrait', width: 768, height: 1024, deviceScaleFactor: 2 },
];

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/request', name: 'request' },
  { path: '/kiosk-simulator', name: 'kiosk' },
  { path: '/admin', name: 'admin' },
];

const OUTPUT_DIR = path.join(__dirname, '..', '.mobile_audit');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function audit() {
  console.log('🚀 Starting Mobile Responsiveness Audit...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const report = {
    timestamp: new Date().toISOString(),
    viewportsTested: VIEWPORTS.map(v => `${v.name} (${v.width}x${v.height})`),
    pageAudits: [],
  };

  for (const vp of VIEWPORTS) {
    console.log(`\n📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    });

    const page = await context.newPage();

    for (const p of PAGES) {
      const url = `${BASE_URL}${p.path}`;
      console.log(`  🔍 Auditing ${p.name} at ${url}...`);

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (err) {
        console.warn(`    ⚠️ Network idle timeout, proceeding anyway: ${err.message}`);
      }

      // Allow animations & dynamic client telemetry to settle
      await page.waitForTimeout(1000);

      // Check overflow and layout metrics
      const metrics = await page.evaluate(() => {
        const docElem = document.documentElement;
        const body = document.body;
        const winWidth = window.innerWidth;
        const scrollWidth = Math.max(docElem.scrollWidth, body.scrollWidth);
        const hasHorizontalOverflow = scrollWidth > winWidth + 1; // 1px tolerance for rounding

        // Find elements that overflow beyond window width
        const overflowingElements = [];
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          // Skip elements that are hidden or script/style
          if (rect.width === 0 && rect.height === 0) return;
          if (['SCRIPT', 'STYLE', 'SVG', 'PATH'].includes(el.tagName)) return;

          if (rect.right > winWidth + 2) {
            // Check if it has overflow auto/scroll inside a container
            let parent = el.parentElement;
            let isInsideScrollable = false;
            while (parent && parent !== document.body) {
              const overflowX = window.getComputedStyle(parent).overflowX;
              if (['auto', 'scroll', 'hidden'].includes(overflowX)) {
                isInsideScrollable = true;
                break;
              }
              parent = parent.parentElement;
            }

            overflowingElements.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || null,
              className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 100) : '',
              textSnippet: el.innerText ? el.innerText.slice(0, 50).trim() : '',
              rectRight: Math.round(rect.right),
              rectWidth: Math.round(rect.width),
              isInsideScrollable,
            });
          }
        });

        // Touch target check for buttons and links
        const interactiveTargets = [];
        const buttons = document.querySelectorAll('button, a[href], input, select, [role="button"]');
        buttons.forEach(btn => {
          const rect = btn.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top <= window.innerHeight) {
            if (rect.height < 36 || rect.width < 36) {
              interactiveTargets.push({
                tag: btn.tagName.toLowerCase(),
                text: btn.innerText ? btn.innerText.slice(0, 30).trim() : (btn.getAttribute('aria-label') || ''),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                className: (btn.className && typeof btn.className === 'string') ? btn.className.slice(0, 60) : '',
              });
            }
          }
        });

        return {
          windowWidth: winWidth,
          scrollWidth: scrollWidth,
          hasHorizontalOverflow: hasHorizontalOverflow,
          overflowDelta: scrollWidth - winWidth,
          overflowingElementsCount: overflowingElements.length,
          overflowingElementsUncontained: overflowingElements.filter(e => !e.isInsideScrollable).slice(0, 5),
          smallTouchTargetsCount: interactiveTargets.length,
          smallTouchTargets: interactiveTargets.slice(0, 5),
        };
      });

      console.log(`    Result: scrollWidth=${metrics.scrollWidth} vs winWidth=${metrics.windowWidth} -> Overflow: ${metrics.hasHorizontalOverflow ? `YES (+${metrics.overflowDelta}px) ❌` : 'NO (Perfect) ✅'}`);
      if (metrics.overflowingElementsUncontained.length > 0) {
        console.log(`    ⚠️ Uncontained overflowing elements:`, metrics.overflowingElementsUncontained);
      }

      // Save screenshot for standard mobile (iPhone 14) and compact (320px)
      if (vp.name === 'iphone_14' || vp.name === 'compact_small') {
        const screenshotPath = path.join(SCREENSHOTS_DIR, `${p.name}_${vp.name}_dark.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`    📸 Captured viewport screenshot: ${path.basename(screenshotPath)}`);
      }

      report.pageAudits.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        page: p.name,
        path: p.path,
        metrics,
      });
    }

    await context.close();
  }

  // Also test light mode on iPhone 14
  console.log(`\n☀️ Testing Light Mode theme on iPhone 14 (390x844)...`);
  const lightContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const lightPage = await lightContext.newPage();
  await lightPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await lightPage.waitForTimeout(500);

  // Toggle to light mode
  const toggleBtn = await lightPage.$('button[aria-label*="theme" i], button:has(svg.lucide-sun), button:has(svg.lucide-moon)');
  if (toggleBtn) {
    await toggleBtn.click();
    await lightPage.waitForTimeout(600);
    const lightScreenshot = path.join(SCREENSHOTS_DIR, `home_iphone_14_light.png`);
    await lightPage.screenshot({ path: lightScreenshot, fullPage: false });
    console.log(`  📸 Captured Light mode screenshot: ${path.basename(lightScreenshot)}`);
  }
  await lightContext.close();

  await browser.close();

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'audit_results.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n✨ Audit complete! Results written to .mobile_audit/audit_results.json`);
}

audit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
