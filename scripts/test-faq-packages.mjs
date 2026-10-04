import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "d:/Ram/scratch/screenshots/faq-packages";
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runFaqPackagesAudit() {
  console.log("🎬 Starting Full-Screen Packages & FAQ Playwright Audit...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  const consoleLogs = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  try {
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    console.log("✅ Page loaded successfully");

    // ==========================================
    // 1. FULL-SCREEN PACKAGES SECTION (#packages)
    // ==========================================
    const packagesSection = page.locator("#packages");
    await packagesSection.waitFor({ state: "visible" });

    await packagesSection.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      window.scrollBy({ top: rect.top, behavior: "instant" });
    });
    await page.waitForTimeout(600); // Allow entrance animations

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "01-fullscreen-packages-section.png"),
    });
    console.log("📸 Captured: 01-fullscreen-packages-section.png (Full-Screen 'Before we press record.' section)");

    // Hover over second card ("Content day")
    const packageCards = page.locator("#packages [role='article']");
    const cardCount = await packageCards.count();
    console.log(`Found ${cardCount} package cards in full-screen section`);
    if (cardCount > 1) {
      const card1 = packageCards.nth(1);
      const box1 = await card1.boundingBox();
      if (box1) {
        await page.mouse.move(box1.x + box1.width / 2, box1.y + box1.height / 2);
        await page.waitForTimeout(350);

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, "02-desktop-package-hover.png"),
        });
        console.log("📸 Captured: 02-desktop-package-hover.png (Card hover: lifts, lime border, sibling dim)");
      }
    }

    // ==========================================
    // 2. DEDICATED FAQ SECTION (#faq)
    // ==========================================
    const faqSection = page.locator("#faq");
    await faqSection.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      window.scrollBy({ top: rect.top - 40, behavior: "instant" });
    });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "03-desktop-faq-overview.png"),
    });
    console.log("📸 Captured: 03-desktop-faq-overview.png (Dedicated Q&A Section: Categories, Search & Items)");

    // Click first FAQ item ("Which option is right for me?") to expand
    const firstFaqTrigger = page.locator(".faq-list button[aria-expanded]").first();
    await firstFaqTrigger.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "04-desktop-faq-item-open.png"),
    });
    console.log("📸 Captured: 04-desktop-faq-item-open.png (Open FAQ panel with resolved tokens, lime bar, rising text)");

    // Verify active category tab has solid black text on lime background
    const activeTab = page.locator("button[role='tab'][aria-selected='true']");
    const activeTabColor = await activeTab.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        text: el.textContent.trim(),
      };
    });
    console.log(`Active tab "${activeTabColor.text}": text color = ${activeTabColor.color}, bg = ${activeTabColor.backgroundColor}`);

    const stillCuriousText = page.locator("#faq p:has-text('Still curious?')");

    // Category Filter Tab ("Packages")
    const packagesTab = page.locator("button[role='tab']:has-text('Packages')");
    if ((await packagesTab.count()) > 0) {
      await packagesTab.click();
      await page.waitForTimeout(300);

      const pkgsTabColor = await packagesTab.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
        };
      });
      console.log(`Packages tab when active: text color = ${pkgsTabColor.color}, bg = ${pkgsTabColor.backgroundColor}`);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "06-desktop-faq-category-process.png"),
      });
      console.log("📸 Captured: 06-desktop-faq-category-process.png (Category tab: Packages - Black text on lime)");

      await stillCuriousText.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "06b-desktop-faq-packages-still-curious.png"),
      });
      console.log("📸 Captured: 06b-desktop-faq-packages-still-curious.png (Packages category: Still curious prompt)");
    }

    // Switch back to "All"
    const allTab = page.locator("button[role='tab']:has-text('All')");
    await allTab.click();
    await page.waitForTimeout(300);

    // Verify JSON-LD Schema
    const jsonLdContent = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[type='application/ld+json']"));
      for (const script of scripts) {
        try {
          const parsed = JSON.parse(script.textContent);
          if (parsed["@type"] === "FAQPage") {
            return parsed;
          }
        } catch {
          // ignore
        }
      }
      return null;
    });
    if (jsonLdContent && jsonLdContent["@type"] === "FAQPage") {
      console.log(`✅ Valid JSON-LD FAQPage schema detected with ${jsonLdContent.mainEntity.length} questions!`);
    } else {
      console.warn("⚠️ JSON-LD schema not found or invalid");
    }

    // Verify Still curious prompt text and ensure no grey line above it
    if (await stillCuriousText.count() > 0) {
      await stillCuriousText.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const parentBorder = await stillCuriousText.evaluate((el) => {
        const parent = el.parentElement;
        const style = window.getComputedStyle(parent);
        return {
          borderTopWidth: style.borderTopWidth,
          borderTopStyle: style.borderTopStyle,
          borderTopColor: style.borderTopColor,
          className: parent.className,
        };
      });
      console.log(`Still curious prompt parent border-top: ${parentBorder.borderTopWidth} ${parentBorder.borderTopStyle} (class: ${parentBorder.className})`);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "05-desktop-faq-still-curious.png"),
      });
      console.log("📸 Captured: 05-desktop-faq-still-curious.png (Still curious prompt without grey line)");
    }

    // ==========================================
    // 3. TABLET & MOBILE VIEWPORTS
    // ==========================================
    console.log("📱 Testing tablet layout (768x1024)...");
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(400);

    await packagesSection.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      window.scrollBy({ top: rect.top, behavior: "instant" });
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "07-tablet-packages-cards.png"),
    });
    console.log("📸 Captured: 07-tablet-packages-cards.png (Tablet layout)");

    console.log("📱 Testing mobile layout (375x812)...");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(400);

    await packagesSection.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      window.scrollBy({ top: rect.top, behavior: "instant" });
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "08-mobile-packages-cards.png"),
    });
    console.log("📸 Captured: 08-mobile-packages-cards.png (Stacked cards in mobile section)");

    await faqSection.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      window.scrollBy({ top: rect.top - 20, behavior: "instant" });
    });
    await page.waitForTimeout(400);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "09-mobile-faq-list.png"),
    });
    console.log("📸 Captured: 09-mobile-faq-list.png (Mobile FAQ section)");

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

runFaqPackagesAudit();
