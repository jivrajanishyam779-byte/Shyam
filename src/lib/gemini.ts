import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
// Note: In AI Studio, process.env.GEMINI_API_KEY is automatically provided via vite define
export const ai = new GoogleGenAI({ 
  apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
});

export const MODELS = {
  WRITING: "gemini-2.0-flash",
  IMAGE: "gemini-2.0-flash-exp",
};
