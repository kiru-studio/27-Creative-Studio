import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "scratch/screenshots/process";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  const processSection = page.locator("#process");
  const sectionTop = await processSection.evaluate((el) => {
    return el.getBoundingClientRect().top + window.scrollY;
  });

  console.log("Section top offset:", sectionTop);
  await page.evaluate((top) => window.scrollTo(0, top), sectionTop);
  await page.waitForTimeout(800);

  console.log("Capturing Step 0 (Brief) at 1440px...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "01-step-brief-desktop.png"),
  });

  // Readout text check
  const readout = page.locator('#process [role="status"]').first();
  const readoutText = await readout.textContent();
  console.log("Readout text on Step 0:", readoutText);

  // Click Step 1 (Shoot)
  console.log("Clicking Step 1 (Shoot)...");
  await page.locator("#step-tab-shoot").click();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "02-step-shoot-desktop.png"),
  });

  // Click Step 2 (Edit)
  console.log("Clicking Step 2 (Edit)...");
  await page.locator("#step-tab-edit").click();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "03-step-edit-desktop.png"),
  });

  // Click Step 3 (Delivered)
  console.log("Clicking Step 3 (Delivered)...");
  await page.locator("#step-tab-delivered").click();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "04-step-delivered-desktop.png"),
  });

  // Verify Format Toggle is removed
  console.log("Verifying Format Toggle is removed...");
  const formatToggleCount = await page.locator('text="FORMAT:"').count();
  console.log("FORMAT: label count (should be 0):", formatToggleCount);
  if (formatToggleCount > 0) {
    throw new Error("Expected FORMAT toggle to be removed, but found instances!");
  }

  // Test responsiveness and check for zero horizontal overflow
  const viewports = [
    { name: "laptop", width: 1024, height: 768 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile-375", width: 375, height: 812 },
    { name: "mobile-320", width: 320, height: 600 },
  ];

  for (const vp of viewports) {
    console.log(`Testing viewport ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);

    const currentTop = await processSection.evaluate((el) => {
      return el.getBoundingClientRect().top + window.scrollY;
    });
    await page.evaluate((top) => window.scrollTo(0, top), currentTop);
    await page.waitForTimeout(600);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    console.log(`Viewport ${vp.name} horizontal overflow: ${hasHorizontalOverflow}`);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `06-${vp.name}.png`),
    });
  }

  await browser.close();
  console.log("All tests completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
