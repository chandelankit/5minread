import { connectToDB } from "@utils/database";
import Poll from "@models/poll";

export async function POST(request) {
  try {
    const { pollId, optionIndex, userId } = await request.json();
    
    await connectToDB();
    
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return new Response("Poll not found", { status: 404 });
    }
    
    // Check if user already voted
    const hasVoted = poll.voters && poll.voters.includes(userId);
    if (hasVoted) {
      return new Response("User already voted", { status: 400 });
    }
    
    // Update vote count
    if (!poll.options[optionIndex].votes) {
      poll.options[optionIndex].votes = 0;
    }
    poll.options[optionIndex].votes += 1;
    
    // Add user to voters list
    if (!poll.voters) {
      poll.voters = [];
    }
    poll.voters.push(userId);
    
    await poll.save();
    
    return new Response(JSON.stringify(poll), { status: 200 });
  } catch (error) {
    console.error("Error voting on poll:", error);
    return new Response("Failed to vote", { status: 500 });
  }
}