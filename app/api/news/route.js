import News from "@models/news";
import { connectToDB } from "@utils/database";

export const GET = async (request) => {
  try {
    // Ensure the database is connected
    await connectToDB();

    // Fetch news from the database
    const news = await News.find({});

    // Set cache control headers to ensure fresh data
    const headers = {
      "Cache-Control": "no-store",  // Prevent caching
      "Content-Type": "application/json",  // Ensure the response is treated as JSON
    };

    return new Response(JSON.stringify(news), { status: 200, headers });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return new Response("Failed to fetch all news", { status: 500 });
  }
};
