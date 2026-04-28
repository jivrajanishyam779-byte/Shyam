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
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setNeedsKey(true);
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setProgressMsg('Initializing specialized video engine...');

    try {
      const apiKey = (process.env.GEMINI_API_KEY || process.env.API_KEY) as string;
      const ai = new GoogleGenAI({ apiKey });
      
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
        'Simulating physics...',
        'Rendering frames...',
        'Synthesizing gradients...'
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
    <div className="flex flex-col min-h-full max-w-4xl mx-auto pb-48">
      {/* Video Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <AnimatePresence mode="wait">
          {videoUrl || isGenerating ? (
            <motion.div
              key={videoUrl || 'generating'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="relative w-full max-w-4xl px-4"
            >
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-[#080808]/80 backdrop-blur-sm z-10">
                     <div className="w-24 h-24 border-l-2 border-neon animate-[spin_1.5s_linear_infinite] rounded-full" />
                     <div className="text-center space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-neon animate-pulse">{progressMsg}</span>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest">Veo Generation in progress</p>
                     </div>
                  </div>
                ) : (
                  <div className="group relative">
                    <video 
                      src={videoUrl!} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full aspect-video bg-black"
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = videoUrl!;
                          a.download = `stj-motion-${Date.now()}.mp4`;
                          a.click();
                        }}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-neon transition-all shadow-xl"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="text-center space-y-8 opacity-20 filter grayscale hover:opacity-30 transition-opacity">
              <div className="w-32 h-32 border border-dashed border-white/20 rounded-full mx-auto flex items-center justify-center">
                 <Video className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <h2 className="text-5xl font-display uppercase tracking-tighter text-white">Motion Forge.</h2>
                <p className="text-xs font-mono uppercase tracking-[0.4em]">Temporal artifact synthesizer engine.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Controller (ChatGPT style) */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
        <div className="bg-[#151515] border border-white/5 rounded-2xl shadow-2xl p-2">
          {/* Reference Image Attachment */}
          <div className="flex items-center gap-4 p-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-14 h-14 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center transition-all group overflow-hidden relative",
                image && "border-solid border-neon/50 bg-neon/10"
              )}
            >
              {image ? (
                <img src={image} className="w-full h-full object-cover opacity-50" alt="ref" />
              ) : (
                <Upload className="w-4 h-4 text-white/20 group-hover:text-neon" />
              )}
              {!image && <span className="text-[7px] uppercase font-bold text-white/10 mt-1">Ref</span>}
            </button>
            
            <div className="flex-1 flex flex-col justify-center overflow-hidden">
               {image && (
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-[9px] font-mono text-neon uppercase">Reference_Locked</span>
                   <button onClick={() => setImage(null)} className="text-[9px] text-white/20 hover:text-white">× Remove</button>
                 </div>
               )}
               <div className="text-[10px] font-mono opacity-20 uppercase tracking-widest truncate">
                 {image ? "Reference image active" : "Optional: Add reference image"}
               </div>
            </div>
            
            <div className="flex items-center gap-2 pr-4 text-[9px] font-mono whitespace-nowrap opacity-20 uppercase tracking-widest text-right">
              Resolution<br/>720p / 16:9
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex items-center gap-2 p-2 border-t border-white/5 mt-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the cinematic motion..."
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-white/10"
            />
            {needsKey ? (
              <button
                type="button"
                onClick={handleOpenKeySelector}
                className="px-4 h-11 bg-neon text-black rounded-xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-white transition-all"
              >
                <Key className="w-3 h-3" /> Fix Key
              </button>
            ) : (
              <button
                type="submit"
                disabled={isGenerating || !prompt}
                className="w-11 h-11 bg-white text-black rounded-xl flex items-center justify-center hover:bg-neon transition-all disabled:opacity-20 disabled:bg-white/5 disabled:text-white/20"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
        <p className="text-center text-[9px] text-white/20 mt-4 uppercase tracking-[0.2em]">Cinematic Rendering may take up to 2 minutes.</p>
      </div>
    </div>
  );
}
