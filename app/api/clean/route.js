// Define a delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const { news } = await req.json();

    if (!news || !Array.isArray(news)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: "news" must be an array' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const cleanedNews = [];

    for (const item of news) {
      const prompt = item.tag
        ? `Rewrite the following description into exactly 10 lines. Make it easy to understand and sound professional:\n\n"${item.tag}"`
        : `Generate a professional and easy-to-understand 10-line description for the news headline:\n\n"${item.news}".`;

      const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const result = await mistralResponse.json();
      console.log('API Response:', result);

      if (result.choices && result.choices.length > 0) {
        const content = result.choices[0].message.content;
        cleanedNews.push({
          ...item,
          tag: content.trim(),
        });
      } else {
        console.warn('No choices returned from Mistral API for item:', item);
      }

      // Delay to respect rate limits (e.g., 200ms between requests)
      await delay(200);
    }

    return new Response(JSON.stringify(cleanedNews), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Mistral API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
