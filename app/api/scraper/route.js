import puppeteer from 'puppeteer';

const url = 'https://timesofindia.indiatimes.com/news';

export const GET = async () => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for serverless environments
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

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
