// File: /app/api/generate-polls/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add delay between requests to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Track requests to avoid hitting rate limits
let requestCount = 0;
let lastResetTime = Date.now();
const DAILY_LIMIT = 45; // Keep below the 50 limit for safety
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit() {
  const now = Date.now();
  
  // Reset counter if 24 hours have passed
  if (now - lastResetTime > RESET_INTERVAL) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  return requestCount < DAILY_LIMIT;
}

export async function POST(request) {
  try {
    const { newsItems } = await request.json();
    
    // Check if we have enough quota for the requests
    if (!checkRateLimit()) {
      console.log("Rate limit preventively hit, using fallback polls");
      const fallbackPolls = newsItems.map(newsItem => createFallbackPoll(newsItem));
      return new Response(JSON.stringify(fallbackPolls), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Use the updated model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const polls = [];
    
    for (let i = 0; i < newsItems.length; i++) {
      const newsItem = newsItems[i];
      
      // Check rate limit before each request
      if (!checkRateLimit()) {
        console.log(`Rate limit reached at item ${i}, using fallback for remaining items`);
        // Create fallback polls for remaining items
        for (let j = i; j < newsItems.length; j++) {
          const fallbackPoll = createFallbackPoll(newsItems[j]);
          polls.push(fallbackPoll);
        }
        break;
      }
      
      // Add delay between requests to avoid rate limiting
      if (i > 0) {
        await delay(2000); // 2 second delay between requests
      }
      
      const prompt = `
        Create a public opinion poll based on this news headline: "${newsItem.news}"
        Description: "${newsItem.tag}"
        
        Generate a poll with:
        1. A clear, engaging question about public opinion on this topic
        2. 2-3 balanced answer options that represent different viewpoints
        3. Keep options concise (max 50 characters each)
        
        Return ONLY valid JSON in this exact format:
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
        
        requestCount++; // Increment request count
        
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
        
        // Handle rate limiting specifically
        if (parseError.status === 429) {
          console.log("Rate limit hit, creating fallback poll for:", newsItem.news);
          
          // Create fallback polls for remaining items
          for (let j = i; j < newsItems.length; j++) {
            const fallbackPoll = createFallbackPoll(newsItems[j]);
            polls.push(fallbackPoll);
          }
          break;
        } else {
          // For other errors, create a generic fallback poll
          console.log("Creating fallback poll due to parsing error for:", newsItem.news);
          
          const fallbackPoll = createFallbackPoll(newsItem);
          polls.push(fallbackPoll);
        }
      }
    }

    // Log the generated polls at the end
    console.log("Generated Polls:", JSON.stringify(polls, null, 2));
    console.log(`Requests used today: ${requestCount}/${DAILY_LIMIT}`);

    return new Response(JSON.stringify(polls), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error generating polls:", error);
    
    // If there's a rate limit error, return fallback polls
    if (error.status === 429) {
      const { newsItems } = await request.json();
      const fallbackPolls = newsItems.map(newsItem => createFallbackPoll(newsItem));
      
      return new Response(JSON.stringify(fallbackPolls), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    return new Response(
      JSON.stringify({ error: "Failed to generate polls", details: error.message }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Enhanced helper function to create fallback polls when AI generation fails
function createFallbackPoll(newsItem) {
  const news = newsItem.news || "Unknown news";
  const tag = newsItem.tag || "";
  
  // Create contextual polls based on news content
  let question, options;
  
  const lowerNews = news.toLowerCase();
  const lowerTag = tag.toLowerCase();
  const combinedText = `${lowerNews} ${lowerTag}`;
  
  if (combinedText.includes('election') || combinedText.includes('voting') || combinedText.includes('political')) {
    question = `What's your view on this election development?`;
    options = ["Supports democracy", "Raises concerns", "Need more info"];
  } else if (combinedText.includes('economy') || combinedText.includes('market') || combinedText.includes('financial')) {
    question = `How do you view this economic development?`;
    options = ["Positive impact", "Negative impact", "Neutral/Mixed"];
  } else if (combinedText.includes('climate') || combinedText.includes('environment') || combinedText.includes('green')) {
    question = `What's your stance on this environmental issue?`;
    options = ["Strong action needed", "Moderate approach", "Current efforts sufficient"];
  } else if (combinedText.includes('technology') || combinedText.includes('ai') || combinedText.includes('tech')) {
    question = `How do you feel about this tech development?`;
    options = ["Exciting progress", "Cautious optimism", "Concerning trend"];
  } else if (combinedText.includes('health') || combinedText.includes('medical') || combinedText.includes('covid')) {
    question = `What's your view on this health development?`;
    options = ["Promising advancement", "Need more research", "Skeptical"];
  } else if (combinedText.includes('sport') || combinedText.includes('cricket') || combinedText.includes('football') || combinedText.includes('bumrah')) {
    question = `What's your take on this sports development?`;
    options = ["Exciting news", "Expected outcome", "Disappointing"];
  } else if (combinedText.includes('policy') || combinedText.includes('government') || combinedText.includes('modi') || combinedText.includes('minister')) {
    question = `How do you view this policy development?`;
    options = ["Strongly support", "Partially agree", "Oppose"];
  } else if (combinedText.includes('terrorism') || combinedText.includes('security') || combinedText.includes('brics')) {
    question = `What's your stance on this security issue?`;
    options = ["Strong action needed", "Diplomatic approach", "More dialogue required"];
  } else {
    // Generic fallback
    question = `What's your opinion on this news?`;
    options = ["Positive development", "Neutral stance", "Negative impact"];
  }
  
  return {
    question: question,
    options: options,
    sourceNews: news.substring(0, 50) + (news.length > 50 ? "..." : ""),
    newsId: newsItem._id
  };
}

// Function to get remaining quota estimate
export function getRemainingQuota() {
  const now = Date.now();
  
  // Reset counter if 24 hours have passed
  if (now - lastResetTime > RESET_INTERVAL) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  return Math.max(0, DAILY_LIMIT - requestCount);
}