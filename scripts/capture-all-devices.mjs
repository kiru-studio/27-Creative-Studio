import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const AUDIT_ROOT = "C:/Users/mkiru/.gemini/antigravity/brain/c1a93581-39e8-4ddd-b83c-0e9bd2e0442e/cross_platform_audit";

// Device configurations
const DEVICE_CONFIGS = [
  // 1. Phone
  {
    category: "phone",
    name: "iPhone 14",
    prefix: "phone_iphone14",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    isPhoneLike: true,
  },
  // 2. Foldable - Unfolded & Folded
  {
    category: "foldable",
    name: "Galaxy Z Fold (Unfolded)",
    prefix: "foldable_unfolded_768x1072",
    viewport: { width: 768, height: 1072 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 13; SM-F946B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    isPhoneLike: false,
  },
  {
    category: "foldable",
    name: "Galaxy Z Fold (Folded)",
    prefix: "foldable_folded_344x882",
    viewport: { width: 344, height: 882 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (Linux; Android 13; SM-F946B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
    isPhoneLike: true,
  },
  // 3. Tab - iPad Air/Pro
  {
    category: "tab",
    name: "iPad Air/Pro",
    prefix: "tab_ipad_820x1180",
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    isPhoneLike: false,
  },
  // 4. PC - Desktop Standard & FHD
  {
    category: "pc",
    name: "Desktop Standard (1440x900)",
    prefix: "pc_standard_1440x900",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    isPhoneLike: false,
  },
  {
    category: "pc",
    name: "Desktop FHD (1920x1080)",
    prefix: "pc_fhd_1920x1080",
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    isPhoneLike: false,
  },
  // 5. TV - Large Screen / 4K TV
  {
    category: "tv",
    name: "TV Large Screen QHD (2560x1440)",
    prefix: "tv_qhd_2560x1440",
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    isPhoneLike: false,
  },
  {
    category: "tv",
    name: "TV 4K UHD (3840x2160)",
    prefix: "tv_4k_3840x2160",
    viewport: { width: 3840, height: 2160 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    isPhoneLike: false,
  },
];

// Helper to prime Framer Motion & lazy images
async function primePageAnimations(page) {
  // Step through the page to trigger all in-view triggers
  const sections = ["#hero", "#work", "#films", "#process", "#cases", "#about", "#quotes", "#packages", "#faq", "#contact", "footer"];
  for (const sel of sections) {
    try {
      const el = page.locator(sel).first();
      if (await el.count() > 0) {
        await el.scrollIntoViewIfNeeded({ timeout: 2000 });
        await page.waitForTimeout(200);
      }
    } catch {}
  }
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

async function captureDevice(browser, dev) {
  console.log(`\n======================================================`);
  console.log(`📱 Running Capture for: ${dev.name} [${dev.category}]`);
  console.log(`Dimensions: ${dev.viewport.width}x${dev.viewport.height} @ DPR ${dev.deviceScaleFactor}`);
  console.log(`======================================================`);

  const outDir = path.join(AUDIT_ROOT, dev.category);
  fs.mkdirSync(outDir, { recursive: true });

  const context = await browser.newContext({
    viewport: dev.viewport,
    deviceScaleFactor: dev.deviceScaleFactor,
    isMobile: dev.isMobile,
    hasTouch: dev.hasTouch,
    userAgent: dev.userAgent,
  });

  const page = await context.newPage();

  // Ensure preloader is bypassed
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("rec-mode-preloader-seen", "1");
    } catch {}
  });

  const captureLog = [];

  const recordCapture = (fileName, description) => {
    const fullPath = path.join(outDir, fileName);
    const size = fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 0;
    captureLog.push({ fileName, fullPath, description, size });
    console.log(`  📸 [${dev.category}] ${fileName} (${(size / 1024).toFixed(1)} KB) - ${description}`);
  };

  try {
    // ----------------------------------------------------
    // MAIN PAGE: http://localhost:3000
    // ----------------------------------------------------
    console.log(`Loading home page...`);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Warm up page animations so all sections are hydrated
    await primePageAnimations(page);

    // 1. Full Page Screenshot
    const fullPageName = `${dev.prefix}_00_fullpage.png`;
    await page.screenshot({
      path: path.join(outDir, fullPageName),
      fullPage: true,
    });
    recordCapture(fullPageName, "Complete Full Page View");

    // 2. Hero & Brand Lockup
    const heroName = `${dev.prefix}_01_hero_brand_lockup.png`;
    try {
      const heroEl = page.locator("#hero");
      await heroEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await heroEl.screenshot({ path: path.join(outDir, heroName) });
      recordCapture(heroName, "Hero Section with Brand Lockup & HUD Corners");
    } catch (e) {
      console.warn(`  ⚠️ Hero capture fallback:`, e.message);
    }

    // 2b. Initial Hero Viewport (What user sees above the fold)
    const foldName = `${dev.prefix}_01b_above_the_fold.png`;
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(outDir, foldName) });
    recordCapture(foldName, "Initial Viewport (Above the Fold)");

    // 3. Reels Grid
    const reelsName = `${dev.prefix}_02_reels_grid.png`;
    try {
      const reelsEl = page.locator("#work");
      await reelsEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await reelsEl.screenshot({ path: path.join(outDir, reelsName) });
      recordCapture(reelsName, "Vertical Reels Grid (9:16) with Filter Chips");
    } catch (e) {
      console.warn(`  ⚠️ Reels capture error:`, e.message);
    }

    // 4. Speed / Process Stages
    const processName = `${dev.prefix}_03_speed_process.png`;
    try {
      const procEl = page.locator("#process");
      await procEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await procEl.screenshot({ path: path.join(outDir, processName) });
      recordCapture(processName, "Speed & Process 4-Stage Timeline");
    } catch (e) {
      console.warn(`  ⚠️ Process capture error:`, e.message);
    }

    // 5. Film Section
    const filmsName = `${dev.prefix}_04_film_section.png`;
    try {
      const filmsEl = page.locator("#films");
      await filmsEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await filmsEl.screenshot({ path: path.join(outDir, filmsName) });
      recordCapture(filmsName, "16:9 Cinematic Film Showcase");
    } catch (e) {
      console.warn(`  ⚠️ Film capture error:`, e.message);
    }

    // 6. SD Card Packages Section (with Swipe States for mobile/foldable)
    try {
      const pkgEl = page.locator("#packages");
      await pkgEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      if (dev.isPhoneLike) {
        // Mobile / Folded swipe states:
        // State 1: Card 1 active
        const swipe1Name = `${dev.prefix}_05_sd_packages_swipe1.png`;
        await pkgEl.screenshot({ path: path.join(outDir, swipe1Name) });
        recordCapture(swipe1Name, "SD Card Packages: Swipe State 1 (WAY / 01)");

        // State 2: Scroll to Card 2
        try {
          // Scroll container to second card or click next dot
          await page.evaluate(() => {
            const container = document.querySelector("#packages [role='region']");
            if (container) {
              const cards = container.children;
              if (cards.length > 1) {
                cards[1].scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" });
              }
            }
          });
          await page.waitForTimeout(350);
          const swipe2Name = `${dev.prefix}_05_sd_packages_swipe2.png`;
          await pkgEl.screenshot({ path: path.join(outDir, swipe2Name) });
          recordCapture(swipe2Name, "SD Card Packages: Swipe State 2 (WAY / 02)");
        } catch (e) {
          console.warn(`  ⚠️ Swipe 2 error:`, e.message);
        }

        // State 3: Scroll to Card 3
        try {
          await page.evaluate(() => {
            const container = document.querySelector("#packages [role='region']");
            if (container) {
              const cards = container.children;
              if (cards.length > 2) {
                cards[2].scrollIntoView({ behavior: "instant", inline: "center", block: "nearest" });
              }
            }
          });
          await page.waitForTimeout(350);
          const swipe3Name = `${dev.prefix}_05_sd_packages_swipe3.png`;
          await pkgEl.screenshot({ path: path.join(outDir, swipe3Name) });
          recordCapture(swipe3Name, "SD Card Packages: Swipe State 3 (WAY / 03)");
        } catch (e) {
          console.warn(`  ⚠️ Swipe 3 error:`, e.message);
        }
      } else {
        // Desktop / Tab / TV: All 3 SD Cards side-by-side
        const pkgName = `${dev.prefix}_05_sd_packages.png`;
        await pkgEl.screenshot({ path: path.join(outDir, pkgName) });
        recordCapture(pkgName, "3-Card Cinematic SD-Card Grid (All Tiers)");
      }
    } catch (e) {
      console.warn(`  ⚠️ Packages capture error:`, e.message);
    }

    // 7. Philosophy & About
    const aboutName = `${dev.prefix}_06_philosophy_about.png`;
    try {
      const aboutEl = page.locator("#about");
      await aboutEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await aboutEl.screenshot({ path: path.join(outDir, aboutName) });
      recordCapture(aboutName, "Philosophy, Sony FX3 Gear Spec & Crew Passes");
    } catch (e) {
      console.warn(`  ⚠️ About capture error:`, e.message);
    }

    // 8. FAQ Section
    const faqName = `${dev.prefix}_07a_faq.png`;
    try {
      const faqEl = page.locator("#faq");
      await faqEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await faqEl.screenshot({ path: path.join(outDir, faqName) });
      recordCapture(faqName, "FAQ Accordion Section");
    } catch (e) {
      console.warn(`  ⚠️ FAQ capture error:`, e.message);
    }

    // 9. Contact & Footer
    const contactName = `${dev.prefix}_07b_contact_footer.png`;
    try {
      const contactEl = page.locator("#contact");
      await contactEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await contactEl.screenshot({ path: path.join(outDir, contactName) });
      recordCapture(contactName, "Contact Form with WhatsApp & Direct Booking");
    } catch (e) {
      console.warn(`  ⚠️ Contact capture error:`, e.message);
    }

    const footerName = `${dev.prefix}_07c_footer.png`;
    try {
      const footerEl = page.locator("footer.footer");
      await footerEl.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await footerEl.screenshot({ path: path.join(outDir, footerName) });
      recordCapture(footerName, "Studio Legal, Navigation & Address Footer");
    } catch (e) {
      console.warn(`  ⚠️ Footer capture error:`, e.message);
    }

    // Mobile Drawer Navigation (if mobile header menu is present)
    if (dev.isMobile) {
      try {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);
        const menuBtn = page.locator("button[aria-controls='mobile-navigation'], button:has-text('MENU')").first();
        if (await menuBtn.isVisible()) {
          await menuBtn.click();
          await page.waitForTimeout(400);
          const drawerName = `${dev.prefix}_08_mobile_nav_drawer.png`;
          await page.screenshot({ path: path.join(outDir, drawerName) });
          recordCapture(drawerName, "Mobile Director's Slate Navigation Drawer");
          // Close drawer
          const closeBtn = page.locator("button:has-text('CLOSE')").first();
          if (await closeBtn.isVisible()) await closeBtn.click();
          await page.waitForTimeout(200);
        }
      } catch (e) {
        console.warn(`  ⚠️ Mobile drawer capture:`, e.message);
      }
    }

    // ----------------------------------------------------
    // SECONDARY PAGE: /terms
    // ----------------------------------------------------
    console.log(`Loading /terms...`);
    await page.goto(`${BASE_URL}/terms`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const termsName = `${dev.prefix}_09_page_terms.png`;
    await page.screenshot({
      path: path.join(outDir, termsName),
      fullPage: true,
    });
    recordCapture(termsName, "Terms of Service Agreement Page");

    // ----------------------------------------------------
    // SECONDARY PAGE: /admin
    // ----------------------------------------------------
    console.log(`Loading /admin...`);
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const adminName = `${dev.prefix}_10_page_admin.png`;
    await page.screenshot({
      path: path.join(outDir, adminName),
      fullPage: true,
    });
    recordCapture(adminName, "Admin Control Room & Studio Auth Screen");

  } catch (err) {
    console.error(`❌ Error capturing device ${dev.name}:`, err);
  } finally {
    await context.close();
  }

  return { device: dev, captures: captureLog };
}

async function runAll() {
  console.log("🚀 Starting Cross-Platform Visual Capture Suite...");
  console.log(`Output Root: ${AUDIT_ROOT}`);

  const browser = await chromium.launch({ headless: true });
  const allResults = [];

  for (const dev of DEVICE_CONFIGS) {
    const result = await captureDevice(browser, dev);
    allResults.push(result);
  }

  await browser.close();

  // Generate an audit index manifest
  const manifestPath = path.join(AUDIT_ROOT, "audit_manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(allResults, null, 2), "utf8");
  console.log(`\n🎉 All device formats successfully captured!`);
  console.log(`Manifest written to: ${manifestPath}`);

  // Summary counts
  let totalImages = 0;
  allResults.forEach(r => {
    console.log(`- ${r.device.name}: ${r.captures.length} screenshots saved in /${r.device.category}/`);
    totalImages += r.captures.length;
  });
  console.log(`Total captured images: ${totalImages}`);
}

runAll().catch(err => {
  console.error("Fatal audit error:", err);
  process.exit(1);
});
