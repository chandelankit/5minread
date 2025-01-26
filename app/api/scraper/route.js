import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';

const url = 'https://timesofindia.indiatimes.com/news';

export const GET = async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Go to the target URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the news container to load
    await page.waitForSelector('.HytnJ');

    // Scrape the data
    const newsData = await page.evaluate(() => {
      // Select all news containers
      const newsDivs = Array.from(document.querySelectorAll('.HytnJ li'));

      // Map over the first 10 containers
      return newsDivs.slice(0, 10).map((newsDiv) => {
        const titleElement = newsDiv.querySelector('.UreF0 .CRKrj');
        const descElement = newsDiv.querySelector('.UreF0 .W4Hjm');

        return {
          title: titleElement?.innerText.trim() || 'No title',
          desc: descElement?.innerText.trim() || 'No description',
        };
      });
    })

    await browser.close();

    return NextResponse.json(newsData);
  } catch (error) {
    console.error('Error scraping data:', error);
    return NextResponse.json({ error: 'Failed to scrape news' }, { status: 500 });
  }
};
