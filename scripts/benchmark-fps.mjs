import { chromium } from "playwright";

async function measureSmoothness() {
  console.log("⏱️ Starting High-Fidelity FPS Benchmark...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--enable-gpu",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // Scroll to About section and wait for scroll-in to settle
  const aboutSection = page.locator("#team");
  await aboutSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // Install high-precision rAF timing tracker
  await page.evaluate(() => {
    window.__fpsRecorder = {
      deltas: [],
      start: performance.now(),
      running: true,
    };

    let prev = performance.now();
    function step() {
      if (!window.__fpsRecorder.running) return;
      const now = performance.now();
      window.__fpsRecorder.deltas.push(now - prev);
      prev = now;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  // Perform continuous interactive stress test over 3 seconds:
  // 1. Hover Person 1
  const personCards = page.locator(".person-card");
  await personCards.nth(0).hover();
  await page.waitForTimeout(400);

  // 2. Hover Person 2
  await personCards.nth(1).hover();
  await page.waitForTimeout(400);

  // 3. Hover BTS tiles 0 -> 1 -> 2 -> 3
  const btsTiles = page.locator(".bts-tile-btn");
  for (let i = 0; i < 4; i++) {
    await btsTiles.nth(i).hover();
    await page.waitForTimeout(200);
  }

  // 4. Smooth scroll jiggle (simulating active scrolling over the section)
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(60);
    await page.mouse.wheel(0, -40);
    await page.waitForTimeout(60);
  }

  // Stop recording
  const results = await page.evaluate(() => {
    window.__fpsRecorder.running = false;
    const deltas = window.__fpsRecorder.deltas;
    // Discard the very first frame warmup
    const cleanDeltas = deltas.slice(2);
    const totalFrames = cleanDeltas.length;
    const totalTime = cleanDeltas.reduce((a, b) => a + b, 0);
    const avgDelta = totalTime / totalFrames;
    const avgFps = 1000 / avgDelta;

    // A frame taking > 28ms means dropping below 35 FPS
    const droppedFrames = cleanDeltas.filter((d) => d > 28).length;
    // 95th percentile frame time
    const sorted = [...cleanDeltas].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const maxDelta = sorted[sorted.length - 1] || 0;

    return {
      totalFrames,
      avgFps: Math.round(avgFps * 10) / 10,
      avgFrameTimeMs: Math.round(avgDelta * 10) / 10,
      p95FrameTimeMs: Math.round(p95 * 10) / 10,
      maxFrameTimeMs: Math.round(maxDelta * 10) / 10,
      droppedFrames,
      dropPercentage: `${((droppedFrames / totalFrames) * 100).toFixed(1)}%`,
    };
  });

  console.log("📊 Smoothness Benchmark Results:", results);
  await browser.close();
}

measureSmoothness().catch(console.error);
