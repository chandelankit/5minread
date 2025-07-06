// File: /app/api/test-models/route.js
// This is a temporary endpoint to check available models
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET(request) {
  try {
    const models = await genAI.listModels();
    
    const availableModels = models.map(model => ({
      name: model.name,
      displayName: model.displayName,
      supportedGenerationMethods: model.supportedGenerationMethods
    }));
    
    return new Response(JSON.stringify(availableModels, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error listing models:", error);
    return new Response(
      JSON.stringify({ error: "Failed to list models", details: error.message }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}