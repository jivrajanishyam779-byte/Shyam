import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Download, RefreshCcw, Image as ImageIcon, Wand2, Maximize2, Share2, Layers } from 'lucide-react';
import { ai, MODELS } from '../lib/gemini';
import { cn } from '../lib/utils';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    try {
      const response = await ai.models.generateContent({
        model: MODELS.IMAGE,
        contents: prompt,
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          }
        },
      });

      // Find the image part
      for (const candidate of response.candidates || []) {
        for (const part of candidate.content.parts || []) {
          if (part.inlineData) {
            const url = `data:image/png;base64,${part.inlineData.data}`;
            setGeneratedImageUrl(url);
            setHistory(prev => [url, ...prev].slice(0, 10));
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `lumina-ai-${Date.now()}.png`;
    link.click();
  };

  const ratios = ['1:1', '16:9', '9:16', '3:4', '4:3'];

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Controls Area */}
      <div className="w-full lg:w-[450px] grid-line-r p-10 flex flex-col overflow-y-auto custom-scrollbar bg-[#050505]">
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-[1px] bg-neon" />
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neon">Generation_Core</span>
          </div>
          <h3 className="text-5xl font-display uppercase tracking-tighter leading-none">Art Forge.</h3>
          <p className="text-white/40 text-xs uppercase tracking-widest leading-relaxed">Synthesizing visual artifacts from semantic prompts.</p>
        </div>

        <div className="space-y-8 flex-1">
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Layers className="w-3 h-3" /> System Ratio
            </label>
            <div className="grid grid-cols-3 gap-1">
              {ratios.map(r => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={cn(
                    "py-3 border font-display text-xs transition-all",
                    aspectRatio === r 
                      ? "bg-neon border-neon text-black" 
                      : "bg-white/5 border-white/10 text-white/40 hover:border-white/30"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Wand2 className="w-3 h-3" /> Semantic Input
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="DESCRIBE_ARTIFACT..."
              className="w-full h-40 bg-white/5 border border-white/10 p-5 text-sm font-mono focus:outline-none focus:border-neon transition-all resize-none placeholder:text-white/10"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className="w-full bg-neon text-black h-16 font-display text-xl uppercase tracking-widest hover:bg-white transition-all disabled:opacity-20 active:scale-[0.98]"
          >
            {isGenerating ? (
              <RefreshCcw className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              <span>Execute Render</span>
            )}
          </button>
        </div>

        {history.length > 0 && (
          <div className="mt-12 pt-8 grid-line-t">
            <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">Past Sequences</h4>
            <div className="grid grid-cols-5 gap-1">
              {history.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setGeneratedImageUrl(url)}
                  className="aspect-square overflow-hidden border border-white/10 hover:border-neon transition-all opacity-40 hover:opacity-100"
                >
                  <img src={url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt="history" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Viewing Area */}
      <div className="flex-1 p-16 flex items-center justify-center bg-[#080808] relative">
        <AnimatePresence mode="wait">
          {generatedImageUrl ? (
            <motion.div
              key={generatedImageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative max-w-full h-full flex flex-col group"
            >
              <div className="border border-white/10 p-1 bg-white/5 flex-1 flex">
                <img 
                  src={generatedImageUrl} 
                  className={cn(
                    "max-w-full max-h-[60vh] object-contain m-auto",
                    aspectRatio === '1:1' && 'aspect-square',
                    aspectRatio === '16:9' && 'aspect-video',
                  )} 
                  alt="Generated Art"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="mt-4 flex justify-between items-center px-2">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">ARTIFACT_ID</span>
                    <span className="text-xs font-mono text-neon">#{Math.random().toString(16).slice(2, 8).toUpperCase()}</span>
                 </div>
                 <div className="flex gap-1">
                    <button onClick={downloadImage} className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-white text-white transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-white text-white transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-start space-y-8 max-w-md opacity-20 filter grayscale">
              <div className="w-24 h-24 border border-dashed border-white/20 flex items-center justify-center">
                 <ImageIcon className="w-10 h-10" />
              </div>
              <div className="space-y-4">
                <h4 className="font-display text-5xl uppercase tracking-tighter leading-none">Awaiting<br />Impact.</h4>
                <p className="text-xs font-mono tracking-widest uppercase leading-relaxed tracking-[0.2em]">System initialized. Buffer empty. Feed semantic data to generate artifacts.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
