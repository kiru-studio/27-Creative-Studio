import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve("scratch/screenshots");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPerformanceAndVisualAudit() {
  console.log("🚀 Starting Playwright Performance and Visual Audit...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  const consoleLogs = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    }
  });

  page.on("pageerror", (err) => {
    consoleLogs.push({ type: "pageerror", text: err.message });
  });

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  console.log("✅ Page loaded successfully");

  // Inject FPS tracker
  await page.evaluate(() => {
    window.__fpsData = { frames: [], longFrames: 0, totalFrames: 0 };
    let lastTime = performance.now();
    function track() {
      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;
      window.__fpsData.totalFrames++;
      if (delta > 25) {
        window.__fpsData.longFrames++;
      }
      window.__fpsData.frames.push(delta);
      if (window.__fpsData.frames.length > 300) window.__fpsData.frames.shift();
      requestAnimationFrame(track);
    }
    requestAnimationFrame(track);
  });

  // Scroll to About section
  const aboutSection = page.locator("#team");
  await aboutSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800); // Allow scroll-in animations to complete

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "01-about-scroll-in.png"),
  });
  console.log("📸 Captured: 01-about-scroll-in.png");

  // Hover over Person 1
  const personCards = page.locator(".person-card");
  const count = await personCards.count();
  console.log(`Found ${count} person cards`);

  if (count >= 2) {
    const card1 = personCards.nth(0);
    const card2 = personCards.nth(1);

    await card1.hover();
    await page.waitForTimeout(400); // Wait for spring animation
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "02-person-1-hovered.png"),
    });
    console.log("📸 Captured: 02-person-1-hovered.png");

    await card2.hover();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-person-2-hovered.png"),
    });
    console.log("📸 Captured: 03-person-2-hovered.png");

    // Move mouse away to reset
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);
  }

  // Hover over BTS Tile 1
  const btsTiles = page.locator(".bts-tile-btn");
  const btsCount = await btsTiles.count();
  console.log(`Found ${btsCount} BTS tiles`);

  if (btsCount > 0) {
    await btsTiles.nth(0).hover();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04-bts-hovered.png"),
    });
    console.log("📸 Captured: 04-bts-hovered.png");

    // Click BTS Tile 1 to open Lightbox
    await btsTiles.nth(0).click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05-lightbox-open.png"),
    });
    console.log("📸 Captured: 05-lightbox-open.png");

    // Press ArrowRight to test navigation
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-lightbox-next.png"),
    });
    console.log("📸 Captured: 06-lightbox-next.png");

    // Press Escape to close
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
  }

  // Check Gear Ticker
  const gearTicker = page.locator(".gear-ticker-wrapper");
  const hasTicker = (await gearTicker.count()) > 0;
  console.log(`Gear ticker present: ${hasTicker}`);

  // Measure FPS stats
  const fpsStats = await page.evaluate(() => {
    const data = window.__fpsData;
    const avgDelta =
      data.frames.reduce((a, b) => a + b, 0) / (data.frames.length || 1);
    const avgFps = Math.round(1000 / avgDelta);
    return {
      avgFps,
      totalFrames: data.totalFrames,
      longFrames: data.longFrames,
      longFramePercentage: (
        (data.longFrames / (data.totalFrames || 1)) *
        100
      ).toFixed(2),
    };
  });
  console.log("📊 FPS Statistics during interaction:", fpsStats);

  // Test Mobile Viewport
  console.log("📱 Testing mobile viewport (375x812)...");
  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 812 });
  await mobilePage.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await mobilePage.locator("#team").scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(600);

  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, "07-about-mobile.png"),
  });
  console.log("📸 Captured: 07-about-mobile.png");

  await browser.close();

  console.log("\n================ CONSOLE AUDIT ================");
  if (consoleLogs.length === 0) {
    console.log("✅ Zero console warnings or errors detected!");
  } else {
    console.log(`⚠️ Found ${consoleLogs.length} console messages:`);
    consoleLogs.forEach((log) => console.log(`[${log.type}] ${log.text}`));
  }
  console.log("===============================================\n");
}

runPerformanceAndVisualAudit().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
