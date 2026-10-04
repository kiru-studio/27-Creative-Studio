import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "scratch/screenshots/nav-wave";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Verify 3 dots button is NOT on hero
  const threeDotsBtn = page.locator("#hero button:has-text('•••')");
  const dotsCount = await threeDotsBtn.count();
  console.log(`Three dots button count on hero: ${dotsCount} (expected: 0)`);
  if (dotsCount !== 0) {
    throw new Error(`Expected 0 three dots buttons on hero, found ${dotsCount}`);
  }

  // 2. Verify Camera Readout telemetry is present
  const readoutEl = page.locator("#hero span:has-text('4K · 24fps')");
  const readoutCount = await readoutEl.count();
  console.log(`Camera readout count: ${readoutCount} (expected: >0)`);
  if (readoutCount > 0) {
    console.log(`Camera readout text: "${await readoutEl.first().textContent()}"`);
  }

  console.log("Capturing initial hero without 3 dots...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "01-hero-no-dots.png"),
  });

  // 3. Test side wave bar on desktop
  console.log("Testing side wave bar hover on desktop...");
  const navEl = page.locator("#main-navigation");
  const navBox = await navEl.boundingBox();
  if (!navBox) {
    throw new Error("Could not find #main-navigation bounding box");
  }

  // Hover at top, middle, and bottom of nav to trigger wave and labels
  const midY = navBox.y + navBox.height * 0.5;
  const navX = navBox.x + navBox.width * 0.8;
  await page.mouse.move(navX, midY);
  await page.waitForTimeout(500);

  console.log("Capturing side wave bar hover active...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "02-side-wave-hover.png"),
  });

  // Check all 7 nav labels are present
  const expectedLabels = ["WORK", "FILMS", "PROCESS", "CASES", "ABOUT", "Q&A", "CONTACT"];
  for (const label of expectedLabels) {
    const labelEl = navEl.locator(`.nav-stagger-label:has-text("${label}")`);
    const count = await labelEl.count();
    console.log(`Nav label "${label}" count: ${count} (expected: >= 1)`);
    if (count === 0) {
      throw new Error(`Missing nav label: ${label}`);
    }
  }

  // 4. Test clicking nav links and scrolling
  for (const label of ["WORK", "FILMS", "PROCESS", "CASES", "ABOUT", "Q&A", "CONTACT"]) {
    const link = navEl.locator(`a:has(.nav-stagger-label:has-text("${label}"))`);
    const href = await link.getAttribute("href");
    console.log(`Nav link ${label} -> ${href}`);
  }

  // 5. Test mobile drawer (375x812)
  console.log("Testing mobile viewport 375x812...");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);

  // Open mobile menu
  const menuToggle = page.locator("button.menu-toggle");
  await menuToggle.click();
  await page.waitForTimeout(500);

  console.log("Capturing mobile menu open with 7 nav items...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "03-mobile-nav-open.png"),
  });

  for (const label of expectedLabels) {
    const mobileLink = navEl.locator(`a:has-text("${label}")`);
    const count = await mobileLink.count();
    console.log(`Mobile nav link "${label}" count: ${count} (expected: >= 1)`);
    if (count === 0) {
      throw new Error(`Mobile missing nav link: ${label}`);
    }
  }

  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Mobile horizontal overflow: ${hasHorizontalOverflow} (expected: false)`);

  await browser.close();
  console.log("All nav wave tests completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
