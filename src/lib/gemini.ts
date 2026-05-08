import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (process as any).env?.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({ 
  apiKey: API_KEY
});

export const MODELS = {
  WRITING: "gemini-2.0-flash",
  IMAGE: "gemini-2.0-flash",
};
