import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "scratch/screenshots/reels";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/#work...");
  await page.goto("http://localhost:3000/#work", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const reelsSection = page.locator("#work");
  const sectionTop = await reelsSection.evaluate((el) => {
    return el.getBoundingClientRect().top + window.scrollY;
  });
  await page.evaluate((top) => window.scrollTo(0, top - 30), sectionTop);
  await page.waitForTimeout(600);

  console.log("Capturing initial reels section (Card 0 active)...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "01-reels-card0-active.png"),
  });

  // Verify all 6 cards exist
  const cards = reelsSection.locator("ul.reels-grid > li");
  const count = await cards.count();
  console.log(`Reels count: ${count} (expected: 6)`);
  if (count !== 6) {
    throw new Error(`Expected 6 reel cards, found ${count}`);
  }

  // Check card 0 dimensions: should match portrait width ratio (~324px on 1440px desktop)
  const card0Box = await cards.nth(0).boundingBox();
  console.log(`Active Card 0 width: ${card0Box.width.toFixed(1)}px, height: ${card0Box.height.toFixed(1)}px`);
  // Height is 576px (36rem). Aspect ratio: 324 / 576 = 0.5625 (9:16)
  const ratio = card0Box.width / card0Box.height;
  console.log(`Aspect ratio of active card: ${ratio.toFixed(4)} (expected: ~0.5625)`);

  // Hover Card 2 (Good Day)
  console.log("Hovering Card 2 (Good Day)...");
  const card2 = cards.nth(2);
  await card2.hover();
  await page.waitForTimeout(600);

  const card2Box = await card2.boundingBox();
  console.log(`Hovered Card 2 width: ${card2Box.width.toFixed(1)}px`);

  console.log("Capturing Card 2 active...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "02-reels-card2-hovered.png"),
  });

  // Hover Card 4 (North / Co 05)
  console.log("Hovering Card 4 (North / Co 05)...");
  const card4 = cards.nth(4);
  await card4.hover();
  await page.waitForTimeout(600);

  console.log("Capturing Card 4 active...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "03-reels-card4-hovered.png"),
  });

  // Click Card 4 to test lightbox modal
  console.log("Clicking Card 4 to open lightbox...");
  await card4.click();
  await page.waitForTimeout(500);

  const lightbox = page.locator(".reel-viewer[role='dialog']");
  const isLightboxVisible = await lightbox.isVisible();
  console.log(`Lightbox visible: ${isLightboxVisible}`);

  console.log("Capturing Lightbox open state...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "04-reels-lightbox-open.png"),
  });

  // Close lightbox
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // Mobile testing (375x812)
  console.log("Testing mobile viewport 375x812...");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);

  console.log("Capturing mobile initial reels...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "05-mobile-reels-initial.png"),
  });

  // Tap card 3
  console.log("Tapping Card 3 on mobile...");
  const mobileCard3 = cards.nth(3);
  await mobileCard3.click();
  await page.waitForTimeout(600);

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  console.log(`Mobile horizontal overflow: ${scrollWidth > clientWidth} (expected: false)`);

  await browser.close();
  console.log("All reels section tests completed successfully!");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
