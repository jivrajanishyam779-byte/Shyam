import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API on server using the project's secret key
  // This ensures it works for "every phone" on the shared link
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // AI Generation Route (Proxy)
  app.post("/api/generate", async (req, res) => {
    if (!ai) {
      console.error("GEMINI_API_KEY is missing on server");
      return res.status(500).json({ error: "Gemini API key not configured on server. Please set it in AI Studio settings." });
    }

    try {
      const { contents, systemInstruction, model: modelName } = req.body;
      
      // Correct SDK usage for @google/genai
      const responseStream = await ai.models.generateContentStream({
        model: modelName || "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction
        }
      });
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of responseStream) {
        const text = chunk.text; // Property, not a method
        if (text) {
          res.write(text);
        }
      }
      res.end();
    } catch (error: any) {
      console.error("Server AI Generation error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error during AI generation" });
    }
  });

  // Image Generation Route (Proxy)
  app.post("/api/generate-image", async (req, res) => {
    if (!ai) {
       return res.status(500).json({ error: "Gemini API key not configured on server." });
    }

    try {
      const { prompt, aspectRatio } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          imageConfig: { aspectRatio: aspectRatio || "1:1" }
        }
      });

      let imageData = "";
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }
      
      if (!imageData) {
        return res.status(404).json({ error: "No image data returned from model." });
      }

      res.json({ data: imageData });
    } catch (error: any) {
      console.error("Server Image gen error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error during image generation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
