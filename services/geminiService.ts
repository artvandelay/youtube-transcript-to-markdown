
import { GoogleGenAI } from "@google/genai";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
// This variable is assumed to be pre-configured and accessible in the execution context.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    // console.log("Gemini AI SDK initialized successfully."); // Optional: for debugging
  } catch (error) {
    console.error("Failed to initialize Gemini AI SDK:", error);
    // The app's core transcript functionality does not depend on Gemini, so it can proceed.
  }
} else {
  // This warning is for development; in a production environment, API_KEY should always be set.
  console.warn(
    "Gemini API_KEY environment variable not set. " +
    "Gemini API related functionalities will be unavailable. " +
    "This app's core transcript feature will still work with mock data."
  );
}

// Export the initialized instance (or null if initialization failed/API_KEY missing)
// This allows other parts of an application to potentially use it,
// though this specific transcript app does not.
export const geminiAIInstance = ai;

// Example of a function that might use the Gemini AI instance.
// This function is not called by the current YouTube transcript application.
export const generateTextWithGemini = async (prompt: string): Promise<string | null> => {
  if (!geminiAIInstance) {
    console.error("Gemini AI SDK not initialized. Cannot generate text.");
    return "Gemini AI not available. Check API_KEY.";
  }
  try {
    const response = await geminiAIInstance.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17', // Use a valid model
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    if (error instanceof Error) {
        return `Error from Gemini: ${error.message}`;
    }
    return "An unknown error occurred while using Gemini.";
  }
};
