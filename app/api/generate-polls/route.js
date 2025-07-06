// File: /app/api/generate-polls/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { newsItems } = await request.json();
    
    // Use the updated model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const polls = [];
    
    for (const newsItem of newsItems) {
      const prompt = `
        Create a public opinion poll based on this news headline: "${newsItem.news}"
        Description: "${newsItem.tag}"
        
        Generate a poll with:
        1. A clear, engaging question about public opinion on this topic
        2. 2-3 balanced answer options that represent different viewpoints
        3. Keep options concise (max 50 characters each)
        
        Return ONLY valid JSON in this exact format (no markdown, no extra text):
        {
          "question": "Your poll question here",
          "options": ["Option 1", "Option 2", "Option 3"],
          "sourceNews": "Brief news title",
          "newsId": "${newsItem._id}"
        }
      `;
      
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        let cleanedText = text.trim();
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        cleanedText = cleanedText.trim();
        
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }
        
        const pollData = JSON.parse(cleanedText);
        
        if (pollData.question && pollData.options && Array.isArray(pollData.options)) {
          polls.push({
            question: pollData.question,
            options: pollData.options,
            sourceNews: pollData.sourceNews || newsItem.news,
            newsId: pollData.newsId || newsItem._id
          });

        } else {
          throw new Error("Invalid poll data structure");
        }
        
      } catch (parseError) {
        console.error("Error parsing Gemini response for news item:", newsItem.news, parseError);
        
        // Fallback poll if parsing fails
        polls.push({
          question: `What's your opinion on: ${newsItem.news}?`,
          options: ["Strongly Support", "Neutral", "Strongly Oppose"],
          sourceNews: newsItem.news,
          newsId: newsItem._id
        });
      }
    }

    // ✅ Log the generated polls at the end
    console.log("Generated Polls:", JSON.stringify(polls, null, 2));

    return new Response(JSON.stringify(polls), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error generating polls:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate polls", details: error.message }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
