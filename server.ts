import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini API on server
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenAI(apiKey) : null;

  // AI Generation Route
  app.post("/api/generate", async (req, res) => {
    if (!genAI) {
      return res.status(500).json({ error: "Gemini API key not configured on server." });
    }

    try {
      const { contents, systemInstruction, model: modelName } = req.body;
      const model = genAI.getGenerativeModel({ 
        model: modelName || "gemini-3-flash-preview",
        systemInstruction: systemInstruction 
      });

      // We'll use streaming for better perception
      const result = await model.generateContentStream(contents);
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of result.stream) {
        const text = chunk.text();
        res.write(text);
      }
      res.end();
    } catch (error: any) {
      console.error("Generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Image Generation Route
  app.post("/api/generate-image", async (req, res) => {
    if (!genAI) {
      return res.status(500).json({ error: "Gemini API key not configured on server." });
    }

    try {
      const { prompt, aspectRatio } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          // @ts-ignore
          imageConfig: { aspectRatio }
        }
      });
      
      const response = await result.response;
      let imageData = "";
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageData = part.inlineData.data;
          break;
        }
      }
      
      res.json({ data: imageData });
    } catch (error: any) {
      console.error("Image gen error:", error);
      res.status(500).json({ error: error.message });
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
