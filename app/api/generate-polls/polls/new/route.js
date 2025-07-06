import { connectToDB } from "@utils/database";
import Poll from "@/models/poll";

export async function POST(request) {
  try {
    const { question, options, sourceNews, newsId, userId } = await request.json();
    
    await connectToDB();
    
    const newPoll = new Poll({
      question,
      options,
      sourceNews,
      newsId,
      userId,
      createdAt: new Date()
    });
    
    await newPoll.save();
    
    return new Response(JSON.stringify(newPoll), { status: 201 });
  } catch (error) {
    console.error("Error creating poll:", error);
    return new Response("Failed to create poll", { status: 500 });
  }
}