import News from "@models/news";
import { connectToDB } from "@utils/database";

export const dynamic = 'force-dynamic';  // Force dynamic rendering
export const revalidate = 0;  // Disable revalidation

export async function GET() {
  try {
    await connectToDB();
    
    const news = await News.find({})
      .select('-__v')  // Exclude version key
      .lean();  // Convert to plain JS objects for better performance
    
    return new Response(JSON.stringify(news), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return new Response(JSON.stringify({
      message: "Failed to fetch news",
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}