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
    
      return newsDivs.slice(0, 10).map((newsDiv) => {
        const imgElement = newsDiv.querySelector('.Ng0mw .oo7Ma img');
    
        let newsImg = imgElement?.getAttribute('data-src') || imgElement?.getAttribute('src');
    
        // Ensure the extracted URL is not a placeholder
        if (newsImg?.includes("placeholdersrc")) {
          newsImg = 'https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop';
        }
    
        return {
          title: newsDiv.querySelector('.UreF0 .CRKrj')?.innerText.trim() || 'No title',
          desc: newsDiv.querySelector('.UreF0 .W4Hjm')?.innerText.trim() || 'No description',
          newsImg,
        };
      });
    });
    

    await browser.close();
    return new Response(JSON.stringify(newsData), { status: 200 });
  } catch (error) {
    console.error('Error scraping data:', error);
    return new Response(JSON.stringify({ error: 'Failed to scrape news' }), { status: 500 });
  }
};
