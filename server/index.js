const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer-core");
const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForSlideToLoad(page) {
  // Wait for the canvas wrapper to be present
  await page.waitForSelector(".canvas-precision-wrapper", { timeout: 30000 });
  // Extra wait for animations/rendering
  await sleep(800);
}

async function captureSlide(page) {
  const element = await page.$(".canvas-precision-wrapper");
  if (!element) return null;

  const screenshot = await element.screenshot({
    type: "png",
    encoding: "base64",
  });
  return screenshot;
}

async function downloadPitchPDF(presentationUrl) {
  // Find Chromium executable - check Playwright cache first, then fallback locations
  const chromiumPaths = [
    "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ];
  const fs = require("fs");
  const executablePath = chromiumPaths.find((p) => {
    try { return fs.existsSync(p); } catch { return false; }
  });
  if (!executablePath) {
    throw new Error("No Chromium/Chrome browser found. Please install Chromium.");
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();

  // Set a realistic viewport matching 1920x1080 slides
  await page.setViewport({ width: 1920, height: 1080 });

  // Set user agent to avoid bot detection
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  try {
    console.log(`Navigating to: ${presentationUrl}`);
    await page.goto(presentationUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for the first slide to load
    await waitForSlideToLoad(page);

    const slideWidthMM = 1920 * 0.264583;
    const slideHeightMM = 1080 * 0.264583;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [slideWidthMM, slideHeightMM],
      compress: true,
    });

    let isFirstSlide = true;
    let slideCount = 0;

    while (true) {
      console.log(`Capturing slide ${slideCount + 1}...`);

      const imgData = await captureSlide(page);
      if (!imgData) {
        console.log("No slide found, stopping.");
        break;
      }

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const aspectRatio = 1920 / 1080;

      let imgWidth = pdfWidth;
      let imgHeight = imgWidth / aspectRatio;

      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = imgHeight * aspectRatio;
      }

      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;

      if (!isFirstSlide) {
        pdf.addPage();
      }

      pdf.addImage(
        `data:image/png;base64,${imgData}`,
        "PNG",
        xOffset,
        yOffset,
        imgWidth,
        imgHeight
      );

      isFirstSlide = false;
      slideCount++;

      // Check if there's a next slide button that's enabled
      const nextDisabled = await page.evaluate(() => {
        const btn = document.querySelector('[aria-label="next"]');
        if (!btn) return true;
        return btn.disabled || btn.getAttribute("disabled") !== null;
      });

      if (nextDisabled) {
        console.log("Reached last slide.");
        break;
      }

      // Click next slide
      await page.click('[aria-label="next"]');
      await waitForSlideToLoad(page);
    }

    console.log(`Total slides captured: ${slideCount}`);

    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));
    return { buffer: pdfBuffer, slideCount };
  } finally {
    await browser.close();
  }
}

app.post("/api/download-pdf", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (!url.includes("pitch.com")) {
    return res.status(400).json({ error: "URL must be from pitch.com" });
  }

  try {
    console.log(`Processing download for: ${url}`);
    const { buffer, slideCount } = await downloadPitchPDF(url);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="presentation.pdf"'
    );
    res.setHeader("X-Slide-Count", slideCount);
    res.send(buffer);
  } catch (error) {
    console.error("Error generating PDF:", error.message);
    res.status(500).json({ error: error.message || "Failed to generate PDF" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Pitch PDF Downloader server running on port ${PORT}`);
});
