import Prompt from "@models/prompt";
import { connectToDB } from "@utils/database";

export const dynamic = 'force-dynamic';  // Force dynamic rendering

export const GET = async (request) => {
  try {
    // Ensure the database is connected
    await connectToDB();

    // Fetch prompts and populate the creator field
    const prompts = await Prompt.find({}).populate('creator');

    // Set cache control headers to ensure fresh data
    const headers = {
      "Cache-Control": "no-store",  // Prevent caching
      "Content-Type": "application/json",  // Ensure the response is treated as JSON
    };

    return new Response(JSON.stringify(prompts), { status: 200, headers });
  } catch (error) {
    console.error(error);  // Log the error for debugging
    return new Response("Failed to fetch all prompts", { status: 500 });
  }
};