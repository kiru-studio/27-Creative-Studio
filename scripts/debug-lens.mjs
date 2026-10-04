import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  await page.locator("#process").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const elements = await page.evaluate(() => {
    const process = document.querySelector("#process");
    if (!process) return [];
    const nodes = process.querySelectorAll("*");
    const results = [];
    nodes.forEach((n) => {
      const style = window.getComputedStyle(n);
      const bg = style.backgroundColor;
      const bgImg = style.backgroundImage;
      if (bg.includes("255") || bg.includes("white") || bgImg.includes("gradient") || style.filter.includes("invert")) {
        results.push({
          tag: n.tagName,
          class: n.className,
          bg,
          bgImg: bgImg.slice(0, 100),
          opacity: style.opacity,
          rect: n.getBoundingClientRect()
        });
      }
    });
    return results;
  });

  console.log("Elements with light bg or gradient in #process:", JSON.stringify(elements, null, 2));

  // Take screenshot of process camera
  const camera = page.locator("#process .aspect-\\[1\\.38\\/1\\]");
  await camera.screenshot({ path: "scratch/debug-camera-screenshot.png" });
  console.log("Saved scratch/debug-camera-screenshot.png");

  await browser.close();
}

main().catch(console.error);
