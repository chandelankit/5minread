import { connectToDB } from "@utils/database";
import Poll from "@models/poll";

export async function GET(request) {
  try {
    await connectToDB();
    
    const polls = await Poll.find({})
      .populate("userId", "username email image")
      .sort({ createdAt: -1 });
    
    return new Response(JSON.stringify(polls), { status: 200 });
  } catch (error) {
    console.error("Error fetching polls:", error);
    return new Response("Failed to fetch polls", { status: 500 });
  }
}