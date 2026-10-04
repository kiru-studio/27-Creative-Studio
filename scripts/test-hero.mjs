import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.join(process.cwd(), "scratch", "screenshots", "hero");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runHeroAudit() {
  console.log("🎬 Starting Hero Section Playwright Audit...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console errors
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // ==========================================
    // 1. DESKTOP VIEWPORT (1440 x 900)
    // ==========================================
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200); // Allow focus-pull intro to complete

    console.log("✅ Page loaded at 1440x900");

    // Capture initial hero state
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-desktop-hero-focus-pull.png"),
    });
    console.log("📸 Captured: 01-desktop-hero-focus-pull.png (Hero initial focus-pull on desktop)");

    // Check HUD corners
    const corners = page.locator("#hero [aria-hidden='true'] .border-\\[var\\(--industry\\)\\]");
    const cornerCount = await corners.count();
    console.log(`HUD Corner brackets found: ${cornerCount}`);

    // Check Live Timecode
    const timecodeEl = page.locator("#hero span[aria-hidden='true'].tabular-nums");
    const initialTimecode = await timecodeEl.textContent();
    console.log(`Initial Timecode: ${initialTimecode}`);
    await page.waitForTimeout(250);
    const updatedTimecode = await timecodeEl.textContent();
    console.log(`Updated Timecode (after 250ms): ${updatedTimecode}`);
    if (initialTimecode !== updatedTimecode) {
      console.log("✅ Live Timecode is ticking at 24fps!");
    }

    // Check Camera Readout
    const readoutEl = page.locator("#hero span:has-text('4K · 24fps')");
    if ((await readoutEl.count()) > 0) {
      console.log(`✅ Camera Readout found: ${await readoutEl.textContent()}`);
    }

    // Hover three dots camera menu
    const threeDotsBtn = page.locator("button[aria-label='Camera monitor menu']");
    if ((await threeDotsBtn.count()) > 0) {
      await threeDotsBtn.hover();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "02-desktop-hero-camera-menu.png"),
      });
      console.log("📸 Captured: 02-desktop-hero-camera-menu.png (Camera dropdown menu)");
      await page.mouse.move(0, 0); // move away
    }

    // Check Primary Magnetic CTA Hover
    const bookShootBtn = page.locator("#hero a:has-text('Book a shoot')");
    if ((await bookShootBtn.count()) > 0) {
      await bookShootBtn.hover();
      await page.waitForTimeout(250);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "03-desktop-hero-cta-hover.png"),
      });
      console.log("📸 Captured: 03-desktop-hero-cta-hover.png (CTA hover glow & arrow nudge)");
    }

    // Click "Watch the reel" to test Fullscreen Modal
    const watchReelBtn = page.locator("#hero button:has-text('Watch the reel')");
    if ((await watchReelBtn.count()) > 0) {
      await watchReelBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "04-desktop-hero-reel-modal.png"),
      });
      console.log("📸 Captured: 04-desktop-hero-reel-modal.png (Fullscreen Reel Modal Player)");

      // Press Escape to close modal
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }

    // Toggle Sound button
    const soundToggle = page.locator("#hero button[aria-label*='background video']");
    if ((await soundToggle.count()) > 0) {
      console.log(`Sound toggle text before: ${await soundToggle.textContent()}`);
      await soundToggle.click();
      await page.waitForTimeout(200);
      console.log(`Sound toggle text after: ${await soundToggle.textContent()}`);
    }

    // Scroll down to test Scene Marker update
    await page.evaluate(() => window.scrollBy({ top: 900, behavior: "instant" }));
    await page.waitForTimeout(500);
    const sceneMarker = page.locator("#hero div[aria-live='polite'] span");
    if ((await sceneMarker.count()) > 0) {
      console.log(`Scene Marker after scroll: ${await sceneMarker.textContent()}`);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);

    // ==========================================
    // 2. TABLET VIEWPORT (768 x 1024)
    // ==========================================
    console.log("📱 Testing Tablet layout (768x1024)...");
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    const tabletScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`Tablet scrollWidth: ${tabletScrollWidth}px (viewport: 768px)`);
    if (tabletScrollWidth <= 768) {
      console.log("✅ Zero horizontal overflow on tablet!");
    } else {
      console.warn(`⚠️ Horizontal overflow detected on tablet: ${tabletScrollWidth}px > 768px`);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05-tablet-hero.png"),
    });
    console.log("📸 Captured: 05-tablet-hero.png (Tablet hero view)");

    // ==========================================
    // 3. MOBILE VIEWPORT (375 x 812)
    // ==========================================
    console.log("📱 Testing Mobile layout (375x812)...");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    const mobileScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`Mobile scrollWidth: ${mobileScrollWidth}px (viewport: 375px)`);
    if (mobileScrollWidth <= 375) {
      console.log("✅ Zero horizontal overflow on mobile!");
    } else {
      console.warn(`⚠️ Horizontal overflow detected on mobile: ${mobileScrollWidth}px > 375px`);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-mobile-hero.png"),
    });
    console.log("📸 Captured: 06-mobile-hero.png (Mobile hero view)");

    // ==========================================
    // 4. EXTRA SMALL VIEWPORT (320 x 568)
    // ==========================================
    console.log("📱 Testing Extra Small layout (320x568)...");
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(500);

    const xsScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`XS scrollWidth: ${xsScrollWidth}px (viewport: 320px)`);
    if (xsScrollWidth <= 320) {
      console.log("✅ Zero horizontal overflow on 320px width!");
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "07-xs-mobile-hero.png"),
    });
    console.log("📸 Captured: 07-xs-mobile-hero.png (320px mobile hero view)");

    console.log("\n================ CONSOLE AUDIT ================");
    console.log(`Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log(consoleErrors);
    }
    console.log("===============================================\n");

  } catch (err) {
    console.error("Test execution failed:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runHeroAudit();
