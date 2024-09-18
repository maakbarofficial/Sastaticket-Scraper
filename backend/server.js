const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");
const app = express();
const port = 3000;

// Middleware to handle CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Adjust this to your frontend URL
  })
);

// Global variable to store the browser instance
let browser;

const startBrowser = async () => {
  if (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
        defaultViewport: null, // Adjust viewport size if needed
      });
    } catch (error) {
      console.error("Error launching Puppeteer:", error.message);
      throw error;
    }
  }
  return browser;
};

// API endpoint to search for flights
app.get("/api/flights", async (req, res) => {
  const {
    departureDate,
    origin,
    destination,
    numAdult,
    numChild = 0,
    numInfant = 0,
  } = req.query;

  if (!departureDate || !origin || !destination || !numAdult) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  let page;
  try {
    const browser = await startBrowser();
    page = await browser.newPage();

    const url = `https://www.sastaticket.pk/air/search?cabinClass={"code":"Y","label":"Economy"}&legs[]={"departureDate":"${departureDate}","origin":"${origin}","destination":"${destination}"}&routeType=ONEWAY&travelerCount={"numAdult":${numAdult},"numChild":${numChild},"numInfant":${numInfant}}`;

    console.log("Navigating to URL:", url);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector(
      'div[data-test="search-flight-card-container"]',
      { visible: true, timeout: 60000 }
    );

    const flightData = await page.evaluate(() => {
      const flightCards = document.querySelectorAll(
        'div[data-test="search-flight-card-container"]'
      );
      const results = [];
      flightCards.forEach((card) => {
        const airline = card
          .querySelector("span.ant-typography.font-secondary.text-sm")
          ?.textContent.trim();
        const flightNumber = card
          .querySelector("span.ant-typography.text-gray-7.text-sm")
          ?.textContent.trim();
        const departureTime = card
          .querySelector('span[data-test="search-flight-card-start-time"]')
          ?.textContent.trim();
        const arrivalTime = card
          .querySelector('span[data-test="search-flight-card-end-time"]')
          ?.textContent.trim();
        const price = card
          .querySelector(
            'button[data-test="search-flight-card-price-button-main"] span'
          )
          ?.textContent.trim();
        results.push({
          airline,
          flightNumber,
          departureTime,
          arrivalTime,
          price,
        });
      });
      return results;
    });

    res.json(flightData);
  } catch (error) {
    console.error("Error occurred:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.error("Error closing page:", closeError.message);
      }
    }
    // Do not close the browser here if you want to keep it alive for subsequent requests
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
