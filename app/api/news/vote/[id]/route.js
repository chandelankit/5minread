import News from "@/models/news";
import { connectToDB } from "@/utils/database";

export const PATCH = async (req, { params }) => {
  const { type, action, previousVote } = await req.json();
  const { id } = params;

  // Map singular vote types to schema field names
  const fieldMap = {
    upvote: "upvotes",
    downvote: "downvotes",
  };

  if (!fieldMap[type]) {
    return new Response("Invalid vote type", { status: 400 });
  }

  if (!["add", "remove", "switch"].includes(action)) {
    return new Response("Invalid action type", { status: 400 });
  }

  try {
    await connectToDB();

    const newsItem = await News.findById(id);
    if (!newsItem) {
      return new Response("News not found", { status: 404 });
    }

    // Initialize vote counts if they don't exist
    if (!newsItem.upvotes) newsItem.upvotes = 0;
    if (!newsItem.downvotes) newsItem.downvotes = 0;

    // Handle different actions
    switch (action) {
      case "add":
        // Simple increment for first-time voting
        newsItem[fieldMap[type]] = newsItem[fieldMap[type]] + 1;
        break;

      case "remove":
        // Decrement when user toggles off their vote
        newsItem[fieldMap[type]] = Math.max(0, newsItem[fieldMap[type]] - 1);
        break;

      case "switch":
        // User is switching from one vote type to another
        if (previousVote && fieldMap[previousVote]) {
          // Decrement the previous vote
          newsItem[fieldMap[previousVote]] = Math.max(0, newsItem[fieldMap[previousVote]] - 1);
        }
        // Increment the new vote
        newsItem[fieldMap[type]] = newsItem[fieldMap[type]] + 1;
        break;

      default:
        return new Response("Invalid action", { status: 400 });
    }

    await newsItem.save();

    // Return the updated vote counts
    return new Response(JSON.stringify({
      _id: newsItem._id,
      upvotes: newsItem.upvotes,
      downvotes: newsItem.downvotes
    }), { status: 200 });
  } catch (err) {
    console.error("Vote update failed:", err);
    return new Response("Failed to update vote", { status: 500 });
  }
};