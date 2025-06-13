// /api/news/vote/[id].js
import News from "@/models/news";
import { connectToDB } from "@/utils/database";

export const PATCH = async (req, { params }) => {
  const { type } = await req.json();

  if (!["upvote", "downvote"].includes(type)) {
    return new Response("Invalid vote type", { status: 400 });
  }

  try {
    await connectToDB();
    const newsItem = await News.findById(params.id);

    if (!newsItem) {
      return new Response("News not found", { status: 404 });
    }

    newsItem[type] = (newsItem[type] || 0) + 1;
    await newsItem.save();

    return new Response(JSON.stringify(newsItem), { status: 200 });
  } catch (err) {
    return new Response("Failed to update vote", { status: 500 });
  }
};
