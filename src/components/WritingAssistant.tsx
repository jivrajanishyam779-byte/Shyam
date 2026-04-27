import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Wand2, Copy, Check, RotateCcw, PenTool, Type, List, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ai, MODELS } from '../lib/gemini';
import { cn } from '../lib/utils';

export function WritingAssistant() {
  const [content, setContent] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('');
  const responseEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiResponse]);

  const handleGenerate = async (type: 'improve' | 'expand' | 'summarize' | 'general') => {
    if (!content && type !== 'general') return;
    if (type === 'general' && !prompt) return;

    setIsGenerating(true);
    setAiResponse('');

    try {
      let finalPrompt = '';
      if (type === 'improve') finalPrompt = `Improve the following text for clarity, engagement, and professional tone:\n\n${content}`;
      else if (type === 'expand') finalPrompt = `Expand on this text to provide more detail and context, maintaining the same tone:\n\n${content}`;
      else if (type === 'summarize') finalPrompt = `Summarize the following text into concise bullet points:\n\n${content}`;
      else finalPrompt = prompt;

      const responseStream = await ai.models.generateContentStream({
        model: MODELS.WRITING,
        contents: finalPrompt,
        config: {
          systemInstruction: "You are a professional writing assistant. Provide helpful, concise, and high-quality writing suggestions, completions, and edits. Use markdown for better formatting.",
        }
      });

      for await (const chunk of responseStream) {
        setAiResponse(prev => prev + (chunk.text || ''));
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setAiResponse('Sorry, I encountered an error while writing. Please try again.');
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const suggestions = [
    { label: 'Improve Style', type: 'improve' as const, icon: Wand2 },
    { label: 'Expand Content', type: 'expand' as const, icon: Sparkles },
    { label: 'Summarize', type: 'summarize' as const, icon: List },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Editor Area */}
      <div className="flex-1 flex flex-col p-10 grid-line-r">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-neon animate-pulse" />
            <span className="font-display text-sm uppercase tracking-widest text-white/40">Drafting_Session</span>
          </div>
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
            {content.length} chars / {content.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="ENTER TEXT TO PROCESS..."
          className="flex-1 bg-transparent resize-none focus:outline-none text-2xl leading-relaxed text-white placeholder:text-white/5 font-display uppercase tracking-tight custom-scrollbar"
        />

        <div className="mt-8 flex flex-wrap gap-4 pt-8 grid-line-t">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => handleGenerate(s.type)}
              disabled={!content || isGenerating}
              className="flex items-center gap-3 px-6 py-3 border border-white/10 bg-white/5 hover:bg-neon hover:text-black transition-all hover:border-neon font-display uppercase text-xs tracking-widest disabled:opacity-20"
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setContent('')}
            className="ml-auto w-10 h-10 border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-colors"
            title="Clear text"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Assistant Area */}
      <div className="w-full lg:w-[450px] flex flex-col bg-[#050505]">
        <div className="h-20 flex items-center gap-4 px-8 grid-line-b">
          <div className="text-neon">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-display text-xl uppercase tracking-tighter">Assistant Core</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
          <AnimatePresence mode="wait">
            {aiResponse || isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="group relative"
              >
                <div className="markdown-body font-sans text-sm leading-8">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                  {isGenerating && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-neon ml-2 translate-y-0.5"
                    />
                  )}
                </div>
                
                {aiResponse && !isGenerating && (
                  <div className="mt-8 flex items-center justify-end">
                    <button
                      onClick={() => copyToClipboard(aiResponse)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 border font-display text-[10px] uppercase tracking-widest transition-all",
                        copied ? "border-white text-white" : "border-white/10 text-white/40 hover:border-neon hover:text-neon"
                      )}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy Buffer"}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-start justify-center h-full space-y-6 opacity-20 filter grayscale">
                <div className="p-6 border border-dashed border-white/20">
                  <Type className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <p className="font-display text-2xl uppercase tracking-tighter">Standby Mode</p>
                  <p className="text-[10px] font-mono tracking-widest uppercase">Waiting for input stream...</p>
                </div>
              </div>
            )}
          </AnimatePresence>
          <div ref={responseEndRef} />
        </div>

        {/* Action Bar */}
        <div className="p-8 grid-line-t bg-[#0a0a0a]">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate('general');
            }}
            className="flex items-center gap-4"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="COMMANDS_ONLY..."
              className="flex-1 bg-transparent border-b border-white/10 px-0 py-3 text-sm font-mono focus:outline-none focus:border-neon transition-all"
            />
            <button
              type="submit"
              disabled={!prompt || isGenerating}
              className="w-12 h-12 bg-white/5 border border-white/10 hover:bg-neon hover:text-black hover:border-neon flex items-center justify-center transition-all disabled:opacity-20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
