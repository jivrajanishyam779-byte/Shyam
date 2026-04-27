import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Sparkles, Upload, Play, RefreshCcw, Download, Info, AlertCircle, Key } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { MODELS } from '../lib/gemini';
import { cn } from '../lib/utils';

// Extending Window interface for AI Studio helpers
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    // Check for API Key selection (required for Veo)
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setNeedsKey(true);
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setProgressMsg('Initializing specialized video engine...');

    try {
      // Create new instance to ensure up-to-date key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const imageParts = image ? {
        imageBytes: image.split(',')[1],
        mimeType: image.split(';')[0].split(':')[1],
      } : undefined;

      setProgressMsg('Crafting your cinematic sequence...');
      
      let operation = await ai.models.generateVideos({
        model: MODELS.VIDEO,
        prompt: prompt || 'A cinematic masterpiece based on the provided image.',
        image: imageParts,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      const loadingMessages = [
        'Interpreting visual metadata...',
        'Simulating physics and fluid dynamics...',
        'Rendering high-fidelity frames...',
        'Sampling temporal consistency...',
        'Synthesizing final composition...',
        'Polishing cinematic gradients...'
      ];
      
      let msgIndex = 0;

      while (!operation.done) {
        setProgressMsg(loadingMessages[msgIndex % loadingMessages.length]);
        msgIndex++;
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setProgressMsg('Fetching generated media...');
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': (process.env.API_KEY || process.env.GEMINI_API_KEY) as string,
          },
        });
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      }
    } catch (error: any) {
      console.error('Video generation error:', error);
      if (error.message?.includes("Requested entity was not found")) {
        setNeedsKey(true);
      }
      setProgressMsg('An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenKeySelector = async () => {
    await window.aistudio.openSelectKey();
    setNeedsKey(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Controls Area */}
      <div className="w-full lg:w-[450px] grid-line-r p-10 flex flex-col overflow-y-auto custom-scrollbar bg-[#050505]">
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-[1px] bg-neon" />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neon">Kinetic_Core</span>
          </div>
          <h3 className="text-5xl font-display uppercase tracking-tighter leading-none">Motion Forge.</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest leading-relaxed">Animating static states into temporal sequences.</p>
        </div>

        <div className="space-y-8 flex-1">
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Reference Pattern</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full aspect-video border-2 border-dashed border-white/5 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center relative hover:border-neon hover:bg-neon/5",
                image && "border-solid border-white/10"
              )}
            >
              {image ? (
                <>
                  <img src={image} className="w-full h-full object-cover grayscale opacity-50 contrast-125" alt="Upload" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-xs font-display uppercase tracking-widest flex items-center gap-2"><RefreshCcw className="w-4 h-4" /> Reset Frame</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/10 mb-2" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/20">Binary_Stream_Input</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Movement Parameters</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="DEFINE_TRAJECTORY..."
              className="w-full h-24 bg-white/5 border border-white/10 p-5 text-sm font-mono focus:outline-none focus:border-neon transition-all resize-none placeholder:text-white/10"
            />
          </div>

          {needsKey ? (
            <div className="space-y-4">
              <div className="p-5 border border-neon/20 bg-neon/5 flex gap-4 text-[10px] uppercase font-bold tracking-widest text-neon leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Veo engine requires authentication. Ensure a valid API Key is mapped to the current session.</p>
              </div>
              <button
                onClick={handleOpenKeySelector}
                className="w-full bg-white text-black h-16 font-display text-xl uppercase tracking-widest hover:bg-neon transition-all active:scale-[0.98]"
              >
                Launch Key_Socket
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-neon text-black h-16 font-display text-xl uppercase tracking-widest hover:bg-white transition-all disabled:opacity-20 active:scale-[0.98]"
            >
              {isGenerating ? (
                <RefreshCcw className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                <span>Execute Render</span>
              )}
            </button>
          )}

          <div className="p-6 border border-white/5 bg-white/2 flex gap-4">
             <Info className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
             <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">
               Render time: 60s - 180s. Define trajectory vectors for high-fidelity interpolation.
             </p>
          </div>
        </div>
      </div>

      {/* Viewing Area */}
      <div className="flex-1 p-16 flex items-center justify-center bg-[#080808] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {videoUrl ? (
            <motion.div
              key="video-player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-full max-w-5xl flex flex-col"
            >
              <div className="border border-white/10 p-1 bg-white/5">
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full aspect-video bg-black grayscale group-hover:grayscale-0 transition-all shadow-2xl"
                />
              </div>
              <div className="mt-6 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">STREAM_BUFFER</span>
                    <span className="text-xs font-mono text-neon">COMPLETED_SUCCESSFULLY</span>
                 </div>
                 <button 
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = videoUrl;
                    a.download = `forge-motion-${Date.now()}.mp4`;
                    a.click();
                  }}
                  className="w-14 h-14 flex items-center justify-center border border-white/10 hover:border-white text-white transition-all"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ) : isGenerating ? (
            <div className="text-center space-y-10">
              <div className="relative flex justify-center">
                <div className="w-40 h-40 border-l-2 border-neon animate-[spin_1.5s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-10 h-10 text-white/20" />
                </div>
              </div>
              <div className="space-y-4">
                <p className="font-display text-3xl uppercase tracking-tighter text-white">{progressMsg}</p>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-neon"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-start space-y-8 max-w-md opacity-20 filter grayscale">
              <div className="w-24 h-24 border border-dashed border-white/20 flex items-center justify-center">
                 <Video className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h4 className="font-display text-5xl uppercase tracking-tighter leading-none">Motion<br />Synthesis.</h4>
                <p className="text-xs font-mono tracking-widest uppercase leading-relaxed tracking-[0.2em]">Temporal engine ready. Upload source frame and movement vectors to process.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
