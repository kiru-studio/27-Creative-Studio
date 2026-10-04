import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = path.resolve("scratch/screenshots/cases");
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runCasesAudit() {
  console.log("🎬 Starting CasesSection Playwright Audit...");
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

  // Scroll to cases section (#about)
  const casesSection = page.locator(".cases-section");
  await casesSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800); // Allow scroll entrance

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "01-cases-scroll-in.png"),
  });
  console.log("📸 Captured: 01-cases-scroll-in.png");

  // Verify rows
  const caseRows = page.locator(".case-card");
  const count = await caseRows.count();
  console.log(`Found ${count} case study rows`);

  if (count >= 3) {
    // 1. Hover on row 0 (closed) to test title shift, cursor preview, lime line, dimming
    const row0 = caseRows.nth(0);
    const box = await row0.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "02-case-0-hovered.png"),
      });
      console.log("📸 Captured: 02-case-0-hovered.png (Cursor preview + row hover)");
    }

    // 2. Click row 0 to open
    const button0 = row0.locator("button#case-header-case-0-north-co");
    await button0.click();
    await page.waitForTimeout(700); // Wait for accordion open and brackets to lock

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-case-0-open.png"),
    });
    console.log("📸 Captured: 03-case-0-open.png (Open accordion panel + film frame)");

    // 3. Hover row 1 while row 0 is open -> verify row 0 never dims!
    const row1 = caseRows.nth(1);
    const box1 = await row1.boundingBox();
    if (box1) {
      await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
      await page.waitForTimeout(400);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "04-hover-row1-while-row0-open.png"),
      });
      console.log("📸 Captured: 04-hover-row1-while-row0-open.png (Open row never dims)");
    }

    // 4. Click row 1 -> verify row 0 closes and row 1 opens (only one open at a time)
    const button1 = row1.locator("button#case-header-case-1-good-day");
    await button1.click();
    await page.waitForTimeout(700);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "05-case-1-open-case-0-closed.png"),
    });
    console.log("📸 Captured: 05-case-1-open-case-0-closed.png (Single accordion row open)");

    // 5. Click row 1 again to close it
    await button1.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "06-all-cases-closed.png"),
    });
    console.log("📸 Captured: 06-all-cases-closed.png");
  }

  // Test mobile layout
  console.log("📱 Testing mobile layout (375x812)...");
  const mobilePage = await context.newPage();
  await mobilePage.setViewportSize({ width: 375, height: 812 });
  await mobilePage.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await mobilePage.locator(".cases-section").scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(600);

  // Click row 0 on mobile to verify responsive stacked layout
  const mobileButton0 = mobilePage.locator(".case-card button").first();
  await mobileButton0.click();
  await mobilePage.waitForTimeout(600);

  await mobilePage.screenshot({
    path: path.join(SCREENSHOT_DIR, "07-cases-mobile-open.png"),
  });
  console.log("📸 Captured: 07-cases-mobile-open.png");

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

runCasesAudit().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
