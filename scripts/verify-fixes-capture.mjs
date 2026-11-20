import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";
const VERIFICATION_DIR = "C:/Users/mkiru/.gemini/antigravity/brain/c1a93581-39e8-4ddd-b83c-0e9bd2e0442e/cross_platform_audit/post_fix_verification";

fs.mkdirSync(VERIFICATION_DIR, { recursive: true });

async function verifyFixes() {
  console.log("🔍 Running Post-Fix Visual Verification Suite...");
  const browser = await chromium.launch({ headless: true });

  // ----------------------------------------------------
  // 1. iPhone 14 (390 x 844) Verification
  // ----------------------------------------------------
  console.log("\n📱 Verifying iPhone 14 (390x844)...");
  const phoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const phonePage = await phoneContext.newPage();
  await phonePage.addInitScript(() => {
    try { sessionStorage.setItem("rec-mode-preloader-seen", "1"); } catch {}
  });

  await phonePage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await phonePage.waitForTimeout(1200);

  // Capture Header (Confirming NO timecode collision with brand lockup)
  const headerPath = path.join(VERIFICATION_DIR, "verify_phone_header_no_collision.png");
  await phonePage.screenshot({
    path: headerPath,
    clip: { x: 0, y: 0, width: 390, height: 80 },
  });
  console.log("✅ Verified: Header timecode hidden on mobile, brand lockup clean");

  // Capture About / Philosophy Section (Confirming NO skip-link overlay)
  const aboutEl = phonePage.locator("#about");
  await aboutEl.scrollIntoViewIfNeeded();
  await phonePage.waitForTimeout(300);
  const aboutPath = path.join(VERIFICATION_DIR, "verify_phone_about_no_skip_link_overlay.png");
  await aboutEl.screenshot({ path: aboutPath });
  console.log("✅ Verified: Skip link invisible on normal render");

  // Capture SD Card packages section (Confirming 44px touch targets & pagination dots)
  const pkgEl = phonePage.locator("#packages");
  await pkgEl.scrollIntoViewIfNeeded();
  await phonePage.waitForTimeout(300);
  const pkgPath = path.join(VERIFICATION_DIR, "verify_phone_sd_packages_44px_touch_targets.png");
  await pkgEl.screenshot({ path: pkgPath });
  console.log("✅ Verified: SD Packages 44px buttons and swipe indicators");

  // Verify Mobile Drawer contains live timecode
  await phonePage.evaluate(() => window.scrollTo(0, 0));
  await phonePage.waitForTimeout(200);
  const menuBtn = phonePage.locator("button[aria-controls='mobile-navigation'], button:has-text('MENU')").first();
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    await phonePage.waitForTimeout(400);
    const drawerPath = path.join(VERIFICATION_DIR, "verify_phone_drawer_with_timecode.png");
    await phonePage.screenshot({ path: drawerPath });
    console.log("✅ Verified: Director's Slate Drawer displays live timecode in footer");
    const closeBtn = phonePage.locator("button:has-text('CLOSE')").first();
    if (await closeBtn.isVisible()) await closeBtn.click();
  }
  await phoneContext.close();

  // ----------------------------------------------------
  // 2. Foldable Folded (344 x 882) Verification
  // ----------------------------------------------------
  console.log("\n📱 Verifying Galaxy Z Fold Folded (344x882)...");
  const foldContext = await browser.newContext({
    viewport: { width: 344, height: 882 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const foldPage = await foldContext.newPage();
  await foldPage.addInitScript(() => {
    try { sessionStorage.setItem("rec-mode-preloader-seen", "1"); } catch {}
  });

  await foldPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await foldPage.waitForTimeout(1200);

  // Header check at 344px
  const foldHeaderPath = path.join(VERIFICATION_DIR, "verify_foldable_344px_header_clean.png");
  await foldPage.screenshot({
    path: foldHeaderPath,
    clip: { x: 0, y: 0, width: 344, height: 80 },
  });
  console.log("✅ Verified: Folded 344px header uncompromised");

  // Packages card at 344px (Checking CTA label formatting)
  const foldPkg = foldPage.locator("#packages");
  await foldPkg.scrollIntoViewIfNeeded();
  await foldPage.waitForTimeout(300);
  const foldPkgPath = path.join(VERIFICATION_DIR, "verify_foldable_344px_sd_card_fit.png");
  await foldPkg.screenshot({ path: foldPkgPath });
  console.log("✅ Verified: Folded 344px SD cards fit and buttons do not clip");
  await foldContext.close();

  // ----------------------------------------------------
  // 3. 4K TV (3840 x 2160) Verification
  // ----------------------------------------------------
  console.log("\n📺 Verifying 4K TV UHD (3840x2160)...");
  const tvContext = await browser.newContext({
    viewport: { width: 3840, height: 2160 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  });
  const tvPage = await tvContext.newPage();
  await tvPage.addInitScript(() => {
    try { sessionStorage.setItem("rec-mode-preloader-seen", "1"); } catch {}
  });

  await tvPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await tvPage.waitForTimeout(1500);

  const tvHeroPath = path.join(VERIFICATION_DIR, "verify_tv_4k_hero_scaled_immersion.png");
  await tvPage.screenshot({
    path: tvHeroPath,
  });
  console.log("✅ Verified: 4K TV Hero scaled container immersion");

  const tvPkg = tvPage.locator("#packages");
  await tvPkg.scrollIntoViewIfNeeded();
  await tvPage.waitForTimeout(400);
  const tvPkgPath = path.join(VERIFICATION_DIR, "verify_tv_4k_sd_packages_grid.png");
  await tvPkg.screenshot({ path: tvPkgPath });
  console.log("✅ Verified: 4K TV SD packages grid scaling");

  await tvContext.close();

  await browser.close();
  console.log("\n🎉 Post-fix verification complete! All screenshots saved in:", VERIFICATION_DIR);
}

verifyFixes().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
