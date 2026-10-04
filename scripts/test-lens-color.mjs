import { chromium } from "playwright";
import path from "node:path";

async function main() {
  console.log("🔍 Testing camera lens color on load and step transitions...");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Initial Load Test
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1600); // Wait for preloader

  await page.locator("#process").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  // Take screenshot of Step 0 (Brief) right on load
  const camera = page.locator("#process .aspect-\\[1\\.38\\/1\\]");
  await camera.screenshot({ path: "scratch/lens-01-brief-onload.png" });

  // 2. Check for any stuck white elements inside the lens
  const whiteElements = await page.evaluate(() => {
    const lens = document.querySelector("#process .aspect-square");
    if (!lens) return [];
    const elements = lens.querySelectorAll("*");
    const stuck = [];
    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      const opacity = parseFloat(style.opacity || "1");
      if ((bg.includes("255, 255, 255") || bg.includes("rgba(255, 255, 255")) && opacity > 0.05) {
        stuck.push({
          tag: el.tagName,
          class: el.className,
          bg,
          opacity
        });
      }
    });
    return stuck;
  });

  console.log("White elements with opacity > 0.05 on Step 0 (Brief):", whiteElements);
  if (whiteElements.length > 0) {
    console.error("FAIL: Stuck white element detected in lens on load!");
    process.exit(1);
  } else {
    console.log("✅ Step 0 (Brief): Lens is clean, dark, and proper color on load!");
  }

  // 3. Test rapid switching between Shoot (Step 1) and Brief (Step 0)
  console.log("Testing rapid switching Shoot -> Brief...");
  await page.locator("#step-tab-shoot").click();
  await page.waitForTimeout(100); // Click Brief while flash timer is active
  await page.locator("#step-tab-brief").click();
  await page.waitForTimeout(400);

  const whiteElementsAfterRapid = await page.evaluate(() => {
    const lens = document.querySelector("#process .aspect-square");
    if (!lens) return [];
    const elements = lens.querySelectorAll("*");
    const stuck = [];
    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      const opacity = parseFloat(style.opacity || "1");
      if ((bg.includes("255, 255, 255") || bg.includes("rgba(255, 255, 255")) && opacity > 0.05) {
        stuck.push({
          tag: el.tagName,
          class: el.className,
          bg,
          opacity
        });
      }
    });
    return stuck;
  });

  console.log("White elements after rapid switch to Brief:", whiteElementsAfterRapid);
  if (whiteElementsAfterRapid.length > 0) {
    console.error("FAIL: Rapid switch left stuck white element in lens!");
    process.exit(1);
  } else {
    console.log("✅ Rapid switch test PASSED: Lens returned to proper dark color cleanly!");
  }

  await camera.screenshot({ path: "scratch/lens-02-brief-after-rapid.png" });

  // 4. Capture all 4 steps
  await page.locator("#step-tab-shoot").click();
  await page.waitForTimeout(500);
  await camera.screenshot({ path: "scratch/lens-03-shoot.png" });

  await page.locator("#step-tab-edit").click();
  await page.waitForTimeout(500);
  await camera.screenshot({ path: "scratch/lens-04-edit.png" });

  await page.locator("#step-tab-delivered").click();
  await page.waitForTimeout(500);
  await camera.screenshot({ path: "scratch/lens-05-delivered.png" });

  console.log("🎉 All lens color verification tests completed successfully!");
  await browser.close();
}

main().catch((err) => {
  console.error("Error in lens test:", err);
  process.exit(1);
});
