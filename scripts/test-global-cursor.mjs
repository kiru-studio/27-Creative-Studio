import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "scratch/screenshots/cursor";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  console.log("🎬 Starting Global Viewfinder Cursor Audit across the whole app...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Move mouse to Hero to activate viewfinder cursor
  console.log("Testing cursor on Hero...");
  await page.mouse.move(500, 300);
  await page.waitForTimeout(400);

  const cursorContainer = page.locator(".pointer-events-none.fixed.top-0.left-0.z-\\[9999\\]");
  const count = await cursorContainer.count();
  console.log(`Global cursor elements found: ${count} (expected: 1)`);
  if (count !== 1) {
    throw new Error(`Expected exactly 1 global cursor, found ${count}`);
  }

  // Check initial cursor size at rest (should be ~24px)
  const cursorBoxRest = await cursorContainer.locator("> div").boundingBox();
  console.log(`Cursor size at rest: width=${cursorBoxRest.width.toFixed(1)}px, height=${cursorBoxRest.height.toFixed(1)}px (expected ~24px)`);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "01-hero-cursor-rest.png"),
  });

  // 2. Hover over Hero CTA ("Book a shoot ↗")
  console.log("Hovering over Hero CTA...");
  const heroCta = page.locator("#hero a:has-text('Book a shoot')");
  await heroCta.hover();
  await page.waitForTimeout(400);

  const cursorBoxCta = await cursorContainer.locator("> div").boundingBox();
  console.log(`Cursor size over Hero CTA: width=${cursorBoxCta.width.toFixed(1)}px, height=${cursorBoxCta.height.toFixed(1)}px (expected ~48px)`);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "02-hero-cursor-hover-cta.png"),
  });

  // 3. Scroll to Reels section (#work) and test cursor hover
  console.log("Testing cursor in Reels section (#work)...");
  await page.evaluate(() => document.querySelector("#work")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(500);

  const reelCard = page.locator("#work .reel-card").first();
  await reelCard.hover();
  await page.waitForTimeout(400);

  const cursorBoxReel = await cursorContainer.locator("> div").boundingBox();
  console.log(`Cursor size over Reel card: width=${cursorBoxReel.width.toFixed(1)}px (expected ~48px)`);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "03-reels-cursor-hover.png"),
  });

  // 4. Scroll to Process section (#process) and test cursor hover
  console.log("Testing cursor in Process section (#process)...");
  await page.evaluate(() => document.querySelector("#process")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(500);

  const processTab = page.locator("#process button:has-text('Shoot')").first();
  if ((await processTab.count()) > 0) {
    await processTab.hover();
    await page.waitForTimeout(400);

    const cursorBoxProcess = await cursorContainer.locator("> div").boundingBox();
    console.log(`Cursor size over Process step tab: width=${cursorBoxProcess.width.toFixed(1)}px (expected ~48px)`);
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "04-process-cursor-hover.png"),
  });

  // 5. Scroll to Cases section (#cases) and test cursor hover
  console.log("Testing cursor in Cases section (#cases)...");
  await page.evaluate(() => document.querySelector("#cases")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(500);

  const caseRow = page.locator("#cases .case-row-trigger").first();
  if ((await caseRow.count()) > 0) {
    await caseRow.hover();
    await page.waitForTimeout(400);

    const cursorBoxCase = await cursorContainer.locator("> div").boundingBox();
    console.log(`Cursor size over Case Study trigger: width=${cursorBoxCase.width.toFixed(1)}px (expected ~48px)`);
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "05-cases-cursor-hover.png"),
  });

  // 6. Scroll to FAQ section (#faq) and test cursor hover
  console.log("Testing cursor in FAQ section (#faq)...");
  await page.evaluate(() => document.querySelector("#faq")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(500);

  const faqSummary = page.locator("#faq button[aria-expanded]").first();
  if ((await faqSummary.count()) > 0) {
    await faqSummary.hover();
    await page.waitForTimeout(400);

    const cursorBoxFaq = await cursorContainer.locator("> div").boundingBox();
    console.log(`Cursor size over FAQ question: width=${cursorBoxFaq.width.toFixed(1)}px (expected ~48px)`);
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "06-faq-cursor-hover.png"),
  });

  // 7. Scroll to Contact section (#contact) and test cursor hover
  console.log("Testing cursor in Contact section (#contact)...");
  await page.evaluate(() => document.querySelector("#contact")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(500);

  const contactBtn = page.locator("#contact button:has-text('Send brief')").first();
  if ((await contactBtn.count()) > 0) {
    await contactBtn.hover();
    await page.waitForTimeout(400);

    const cursorBoxContact = await cursorContainer.locator("> div").boundingBox();
    console.log(`Cursor size over Contact Send brief button: width=${cursorBoxContact.width.toFixed(1)}px (expected ~48px)`);
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "07-contact-cursor-hover.png"),
  });

  // 8. Test Floating WhatsApp button hover
  console.log("Testing cursor over WhatsApp FAB...");
  const whatsappFab = page.locator("a.whatsapp-fab");
  if ((await whatsappFab.count()) > 0 && (await whatsappFab.isVisible())) {
    await whatsappFab.hover();
    await page.waitForTimeout(400);

    const cursorBoxFab = await cursorContainer.locator("> div").boundingBox();
    console.log(`Cursor size over WhatsApp FAB: width=${cursorBoxFab.width.toFixed(1)}px (expected ~48px)`);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "08-whatsapp-fab-hover.png"),
    });
  }

  // 9. Test Shutter click feedback
  console.log("Testing shutter click feedback on mouse down...");
  await page.mouse.move(700, 450);
  await page.waitForTimeout(200);
  await page.mouse.down();
  await page.waitForTimeout(100);

  const cursorBoxDown = await cursorContainer.locator("> div").boundingBox();
  console.log(`Cursor width on mousedown: ${cursorBoxDown.width.toFixed(1)}px (scaled down for tactile shutter click)`);

  await page.mouse.up();
  await page.waitForTimeout(200);

  // 10. Verify Touch screen devices do not show custom cursor
  console.log("Testing Mobile Viewport (Touch device)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(500);

  const mobileCursor = mobilePage.locator(".pointer-events-none.fixed.top-0.left-0.z-\\[9999\\]");
  const mobileCursorCount = await mobileCursor.count();
  console.log(`Cursor on touch device: ${mobileCursorCount} (expected: 0, disabled for touch)`);
  if (mobileCursorCount !== 0) {
    throw new Error(`Custom cursor should be disabled on touch devices, but found ${mobileCursorCount}`);
  }

  await mobileContext.close();
  await browser.close();
  console.log("🎉 All Global Viewfinder Cursor audits completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
