import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "d:/Ram/scratch/screenshots/testimonials";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTestimonialsAudit() {
  console.log("🎬 Starting TestimonialsSection Playwright Audit...");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  try {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    console.log("✅ Page loaded successfully");

    const section = page.locator(".testimonials-section");
    await section.waitFor({ state: "visible" });

    // 1. Scroll testimonials section so Card 0 (SC / 01) is active
    await section.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      window.scrollBy({ top: rect.top - 80, behavior: "instant" });
    });
    await page.waitForTimeout(600); // Allow entrance animations to play

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-testimonials-scroll-in.png"),
    });
    console.log("📸 Captured: 01-testimonials-scroll-in.png (Entrance + first quote SC / 01 active)");

    const cards = section.locator(".testimonial-card");
    const count = await cards.count();
    console.log(`Found ${count} testimonial cards`);

    // 2. Hover over card 1 (second quote)
    const card1 = cards.nth(1);
    const box1 = await card1.boundingBox();
    if (box1) {
      await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
      await page.waitForTimeout(400); // Allow hover transition and hairline color animation

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "02-hover-card-1.png"),
      });
      console.log("📸 Captured: 02-hover-card-1.png (Hover quote shift x:6px + hairline lime)");
    }

    // 3. Scroll down so Card 1 becomes closest to viewport center (Active Quote Spotlight)
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(600);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-card-1-spotlight-active.png"),
    });
    console.log("📸 Captured: 03-card-1-spotlight-active.png (Quote 2 SC / 02 active spotlight + progress update)");

    // 4. Scroll down so Card 2 (third quote) becomes closest to viewport center
    await page.mouse.wheel(0, 220);
    await page.waitForTimeout(600);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04-card-2-spotlight-active.png"),
    });
    console.log("📸 Captured: 04-card-2-spotlight-active.png (Quote 3 SC / 03 active spotlight + progress update)");

    // 5. Test Mobile viewport (375x812)
    console.log("📱 Testing mobile layout (375x812)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://localhost:3000", { waitUntil: "networkidle" });
    const mobileSection = mobilePage.locator(".testimonials-section");
    await mobileSection.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      window.scrollBy({ top: rect.top - 60, behavior: "instant" });
    });
    await mobilePage.waitForTimeout(700);

    await mobilePage.screenshot({
      path: path.join(SCREENSHOT_DIR, "05-testimonials-mobile.png"),
    });
    console.log("📸 Captured: 05-testimonials-mobile.png (Mobile layout)");

    console.log("\n================ CONSOLE AUDIT ================");
    if (consoleLogs.length === 0) {
      console.log("✅ Zero console warnings or errors detected!");
    } else {
      console.log("Console messages:", consoleLogs);
    }
    console.log("===============================================\n");

  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    await browser.close();
  }
}

runTestimonialsAudit();
