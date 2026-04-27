import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: In AI Studio, process.env.GEMINI_API_KEY is automatically provided via vite define
export const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY as string 
});

export const MODELS = {
  WRITING: "gemini-3-flash-preview",
  IMAGE: "gemini-2.5-flash-image",
  VIDEO: "veo-3.1-lite-generate-preview",
};
