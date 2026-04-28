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
    <div className="flex flex-col min-h-full max-w-4xl mx-auto pb-44 px-4 sm:px-10">
      {/* Header Info */}
      <div className="mb-12 pt-12 text-center">
        <h1 className="text-5xl font-display uppercase tracking-tighter mb-4 text-white">Theory Lab</h1>
        <p className="text-white/40 text-sm font-sans max-w-md mx-auto leading-relaxed">Synthesize complex digital concepts into crystalline structural summaries.</p>
      </div>

      {/* Main Thread */}
      <div className="space-y-16">
        {/* User Input Area (The "Document") */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 relative group hover:bg-white/[0.03] transition-all duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-white/10" />
               <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] font-bold">Binary_Inbound</span>
            </div>
            {content && (
              <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest">
                {content.length} chars / {content.split(/\s+/).filter(Boolean).length} words
              </span>
            )}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type or paste your theoretical core here..."
            className="w-full bg-transparent resize-none focus:outline-none text-xl leading-relaxed text-white/90 placeholder:text-white/5 font-sans custom-scrollbar min-h-[200px]"
          />
          
          <div className="mt-6 flex items-center justify-end">
            <button
              onClick={() => setContent('')}
              className="text-[9px] font-mono text-white/5 hover:text-neon/40 tracking-[0.4em] uppercase transition-all duration-300"
            >
              [ Flush_Buffer ]
            </button>
          </div>
        </section>

        {/* AI Response Bubble */}
        <AnimatePresence mode="wait">
          {(aiResponse || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-neon/5 flex items-center justify-center text-neon border border-neon/10">
                  <div className="text-neon">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-neon">Assistant_Core</span>
                  <span className="text-[8px] font-mono text-white/20 uppercase">Processing completed</span>
                </div>
              </div>

              <div className="pl-14 pr-4">
                <div className="markdown-body text-white/80 leading-relaxed font-sans prose prose-invert max-w-none text-lg">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                  {isGenerating && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2 h-5 bg-neon ml-2 translate-y-1"
                    />
                  )}
                </div>

                {aiResponse && !isGenerating && (
                  <div className="mt-12 flex items-center gap-4 pt-8 border-t border-white/5">
                    <button
                      onClick={() => copyToClipboard(aiResponse)}
                      className={cn(
                        "flex items-center gap-3 px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                        copied ? "border-neon bg-neon text-black shadow-[0_0_20px_rgba(223,255,0,0.2)]" : "border-white/10 text-white/40 hover:border-white hover:text-white"
                      )}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Synthesized" : "Copy to Analytics"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={responseEndRef} />

      {/* Floating Prompt Input (ChatGPT Style) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
        <div className="bg-[#121212]/90 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-2">
          <div className="flex flex-wrap gap-2 mb-2 p-2 focus-within:opacity-100 opacity-60 hover:opacity-100 transition-opacity">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => handleGenerate(s.type)}
                disabled={!content || isGenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] uppercase font-bold tracking-widest text-white/40 disabled:opacity-20"
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate('general');
            }}
            className="flex items-center gap-2 p-2 border-t border-white/5"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Assistant anything..."
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-white/10"
            />
            <button
              type="submit"
              disabled={!prompt || isGenerating}
              className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-neon transition-all disabled:opacity-20 disabled:bg-white/5 disabled:text-white/20 shadow-xl"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
        <p className="text-center text-[9px] text-white/10 mt-6 uppercase tracking-[0.3em]">STJ Studio AI can make mistakes. Verify important info.</p>
      </div>
    </div>
  );
}
