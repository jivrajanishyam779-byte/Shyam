import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Download, RefreshCcw, Image as ImageIcon, Wand2, Maximize2, Share2, Layers } from 'lucide-react';
import { ai, MODELS } from '../lib/gemini';
import { cn } from '../lib/utils';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setError(null);

    try {
      // CALL FRONTEND SDK DIRECTLY
      const response = await ai.models.generateContent({
        model: MODELS.IMAGE,
        contents: prompt,
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          }
        }
      });

      let foundImageUrl = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          foundImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (foundImageUrl) {
        setGeneratedImageUrl(foundImageUrl);
        setHistory(prev => [foundImageUrl, ...prev].slice(0, 10));
      } else {
        throw new Error('Model returned no image artifacts.');
      }
    } catch (err: any) {
      console.error('Error generating image:', err);
      setError(err.message || 'Interface Connection Failure');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `stj-studio-${Date.now()}.png`;
    link.click();
  };

  const ratios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

  return (
    <div className="flex flex-col min-h-full max-w-4xl mx-auto pb-48">
      {/* Visual Workspace Stage */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl px-6 py-12 bg-white/[0.02] border border-red-500/10 rounded-[2.5rem] text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-display uppercase tracking-widest text-white/80 mb-4">Manifestation Restricted</h3>
              <p className="text-[13px] text-white/40 leading-relaxed font-mono uppercase tracking-wider mb-8">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="px-6 py-2 rounded-full border border-white/10 hover:border-white/20 text-[10px] uppercase font-bold tracking-widest text-white/30 hover:text-white transition-all"
              >
                [ Reset Flux ]
              </button>
            </motion.div>
          ) : generatedImageUrl || isGenerating ? (
            <motion.div
              key={generatedImageUrl || 'generating'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="relative w-full max-w-2xl px-4"
            >
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative aspect-square md:aspect-auto">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-[#080808]/80 backdrop-blur-sm z-10">
                     <RefreshCcw className="w-10 h-10 text-neon animate-spin" />
                     <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-neon animate-pulse">Rendering Artifacts...</span>
                  </div>
                ) : (
                  <div className="group relative">
                    <img 
                      src={generatedImageUrl!} 
                      className="w-full h-auto object-contain max-h-[60vh] mx-auto" 
                      alt="Generated"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                       <button onClick={downloadImage} title="Download" className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-neon transition-all">
                          <Download className="w-5 h-5" />
                       </button>
                       <button title="Share" className="w-12 h-12 rounded-full bg-white/20 text-white backdrop-blur-md flex items-center justify-center hover:bg-white/40 transition-all">
                          <Share2 className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                )}
              </div>

              {!isGenerating && generatedImageUrl && (
                <div className="mt-6 flex justify-between items-center text-[10px] font-mono tracking-widest text-white/20 uppercase">
                  <span>Artifact Sync Complete</span>
                  <span className="text-neon/40">Latent_Space_Coord: {Math.random().toString(16).slice(2, 10)}</span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center space-y-8 opacity-20 filter grayscale hover:opacity-30 transition-opacity">
              <div className="w-32 h-32 border border-dashed border-white/20 rounded-full mx-auto flex items-center justify-center">
                 <ImageIcon className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <h2 className="text-5xl font-display uppercase tracking-tighter">Art Forge.</h2>
                <p className="text-xs font-mono uppercase tracking-[0.4em]">Ready to synthesize from text description.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel (ChatGPT Style) */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
        <div className="bg-[#151515] border border-white/5 rounded-2xl shadow-2xl p-2">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex items-center gap-2 p-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image artifact to manifest..."
              className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder:text-white/10"
            />
            <button
              type="submit"
              disabled={!prompt || isGenerating}
              className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-neon transition-all disabled:opacity-20 disabled:bg-white/5 disabled:text-white/20"
            >
              <Wand2 className="w-4 h-4" />
            </button>
          </form>
        </div>
        
        {/* Gallery Thumbnails Overlay */}
        {history.length > 0 && (
          <div className="absolute top-0 right-full mr-6 hidden xl:block">
            <div className="flex flex-col gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
              {history.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => setGeneratedImageUrl(url)}
                  className={cn(
                    "w-12 h-12 rounded-lg overflow-hidden border transition-all",
                    generatedImageUrl === url ? "border-neon scale-105" : "border-white/5 hover:border-white/20"
                  )}
                >
                  <img src={url} className="w-full h-full object-cover" alt="history" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-center text-[9px] text-white/20 mt-4 uppercase tracking-[0.2em]">STJ Visual Forge Synthesizer</p>
      </div>
    </div>
  );
}
