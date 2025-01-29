import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

export const maxDuration = 60; // Ensures Vercel allows 60s execution time

const url = 'https://timesofindia.indiatimes.com/news';

export const GET = async () => {
  try {
    const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

    const browser = await puppeteer.launch({
      args: isLocal ? puppeteer.defaultArgs() : chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v132.0.0/chromium-v132.0.0-pack.tar'),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Increase timeout to 55s (slightly lower than Vercel's 60s limit)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 55000 });

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
