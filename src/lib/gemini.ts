import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY || '';

// Handle missing API key gracefully
if (!API_KEY || API_KEY === 'MY_GEMINI_API_KEY') {
  console.warn('VITE_GEMINI_API_KEY is missing. Please set it in your environment variables.');
}

export const ai = new GoogleGenAI({ 
  apiKey: API_KEY
});

export const MODELS = {
  WRITING: "gemini-2.0-flash",
  IMAGE: "gemini-2.0-flash",
};
