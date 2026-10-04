import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOT_DIR = "scratch/screenshots/contact";
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/#contact...");
  await page.goto("http://localhost:3000/#contact", { waitUntil: "networkidle" });

  const contactSection = page.locator("#contact");
  const sectionTop = await contactSection.evaluate((el) => {
    return el.getBoundingClientRect().top + window.scrollY;
  });

  await page.evaluate((top) => window.scrollTo(0, top - 40), sectionTop);
  await page.waitForTimeout(1000);

  console.log("Capturing initial contact section at 1440px...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "01-contact-initial-desktop.png"),
  });

  // Verify PROD fallback
  const prodText = await page.locator(".clapper-slate-header").textContent();
  console.log("Initial Slate Header text:", prodText);

  // Fill in form fields
  console.log("Filling form fields...");
  await page.fill("#name", "Elena Rostova");
  await page.fill("#phone", "+44 7911 123456");
  // Verify SCENE business name and category are removed
  const businessNameCount = await page.locator("#businessName").count();
  const categoryCount = await contactSection.locator('text="Category"').count();
  console.log("Business name input count (should be 0):", businessNameCount);
  console.log("Category label count (should be 0):", categoryCount);
  if (businessNameCount > 0 || categoryCount > 0) {
    throw new Error("Business name / Category block should be removed!");
  }

  // Verify availability pill is removed
  const pillCount = await contactSection.locator('text="Now booking for"').count();
  console.log("Availability pill count (should be 0):", pillCount);
  if (pillCount > 0) {
    throw new Error("Availability pill should be removed!");
  }

  // Click Event coverage deliverable chip
  await contactSection.locator('button[role="checkbox"]:has-text("Event coverage")').click();
  await page.waitForTimeout(200);

  // Type story
  await page.fill(
    "#story",
    "We are launching our new waterfront restaurant and cocktail lounge. We need a 60s hero film and 4 punchy reels capturing the sunset atmosphere, kitchen prep, and cocktail craft."
  );

  // Verify DATE and REF fields are removed
  const dateShortcutCount = await contactSection.locator('text="QUICK TIMELINE:"').count();
  const refLinkCount = await page.locator("#referenceLink").count();
  console.log("Date shortcuts count (should be 0):", dateShortcutCount);
  console.log("Reference link count (should be 0):", refLinkCount);
  if (dateShortcutCount > 0 || refLinkCount > 0) {
    throw new Error("Date field or reference link should be removed!");
  }

  console.log("Capturing filled contact form at 1440px...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "02-contact-filled-desktop.png"),
  });

  // Verify COPY buttons are removed
  const copyButtonCount = await contactSection.locator('button:has-text("COPY")').count();
  console.log("COPY button count (should be 0):", copyButtonCount);
  if (copyButtonCount > 0) {
    throw new Error("Expected COPY buttons to be removed!");
  }

  // Submit form (wait 2600ms to pass anti-bot minimum render time)
  console.log("Waiting for anti-bot timer and submitting brief...");
  await page.waitForTimeout(2600);
  const submitButton = contactSection.locator('button[type="submit"]');
  await submitButton.click();

  // Wait for submission animation and success state
  await page.waitForTimeout(1400);

  console.log("Capturing Success Wrap state...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "03-contact-success-wrap.png"),
  });

  // Click "Send another brief" to test reset
  console.log("Testing 'Send another brief' reset...");
  await contactSection.locator('button:has-text("Send another brief")').click();
  await page.waitForTimeout(800);

  console.log("Capturing reset form (TAKE #02)...");
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, "04-contact-reset-take02.png"),
  });

  // Test responsiveness and zero horizontal overflow
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

    const currentTop = await contactSection.evaluate((el) => {
      return el.getBoundingClientRect().top + window.scrollY;
    });
    await page.evaluate((top) => window.scrollTo(0, top - 20), currentTop);
    await page.waitForTimeout(600);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    console.log(`Viewport ${vp.name} horizontal overflow: ${hasHorizontalOverflow}`);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `05-${vp.name}.png`),
    });
  }

  await browser.close();
  console.log("All contact section tests completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
