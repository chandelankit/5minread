import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

export const maxDuration = 60; // Ensure 60s execution time in Vercel

const url = 'https://timesofindia.indiatimes.com/news';

async function safeGoto(page, url, timeout = 55000) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  } catch (error) {
    console.warn('First attempt failed, retrying...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  }
}

export const GET = async () => {
  try {
    const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar'),
      headless: 'new',
    });

    const page = await browser.newPage();

    // Speed up page loading by blocking images, fonts, and tracking scripts
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media', 'script'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate with retry mechanism
    await safeGoto(page, url);

    const newsData = await page.evaluate(() => {
      const newsDivs = Array.from(document.querySelectorAll('.HytnJ li'));
      return newsDivs.slice(0, 10).map((newsDiv) => ({
        title: newsDiv.querySelector('.UreF0 .CRKrj')?.innerText.trim() || 'No title',
        desc: newsDiv.querySelector('.UreF0 .W4Hjm')?.innerText.trim() || 'No description',
      }));
    });

    await browser.close();
    return new Response(JSON.stringify(newsData), { status: 200 });
  } catch (error) {
    console.error('Error scraping data:', error);
    return new Response(JSON.stringify({ error: 'Failed to scrape news' }), { status: 500 });
  }
};
