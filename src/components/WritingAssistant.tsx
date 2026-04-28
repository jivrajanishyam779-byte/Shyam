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
    <div className="flex flex-col min-h-full max-w-2xl mx-auto pb-32">
      {/* Header Info */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-display uppercase tracking-tighter mb-4">Theory Lab</h1>
        <p className="text-white/40 text-sm">Synthesize complex concepts into clear digital insights.</p>
      </div>

      {/* Main Thread */}
      <div className="space-y-12">
        {/* User Input Area (The "Document") */}
        <section className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 relative group">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
             <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest font-bold">Source_Material</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="TYPE OR PASTE YOUR THEORY HERE..."
            className="w-full bg-transparent resize-none focus:outline-none text-lg leading-relaxed text-white/80 placeholder:text-white/5 font-sans custom-scrollbar min-h-[150px]"
          />
          
          <div className="mt-4 flex items-center justify-end">
            <button
              onClick={() => setContent('')}
              className="text-[10px] font-mono text-white/10 hover:text-white/30 tracking-widest uppercase transition-colors"
            >
              /Clear_Buffer
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
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neon/10 flex items-center justify-center text-neon border border-neon/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neon">Assistant</span>
              </div>

              <div className="pl-11 pr-4">
                <div className="markdown-body text-white/80 leading-relaxed font-sans prose prose-invert">
                  <ReactMarkdown>{aiResponse}</ReactMarkdown>
                  {isGenerating && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-1.5 h-4 bg-neon ml-2 translate-y-0.5"
                    />
                  )}
                </div>

                {aiResponse && !isGenerating && (
                  <div className="mt-8 flex items-center gap-4">
                    <button
                      onClick={() => copyToClipboard(aiResponse)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border text-[10px] uppercase tracking-widest transition-all",
                        copied ? "border-white bg-white text-black" : "border-white/10 text-white/40 hover:border-neon hover:text-neon"
                      )}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy to Clipboard"}
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
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50">
        <div className="bg-[#151515] border border-white/5 rounded-2xl shadow-2xl p-2">
          <div className="flex flex-wrap gap-2 mb-2 p-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => handleGenerate(s.type)}
                disabled={!content || isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-[10px] uppercase font-bold tracking-widest text-white/40 disabled:opacity-20"
              >
                <s.icon className="w-3 h-3" />
                {s.label}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate('general');
            }}
            className="flex items-center gap-2 p-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Assistant anything..."
              className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder:text-white/10"
            />
            <button
              type="submit"
              disabled={!prompt || isGenerating}
              className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center hover:bg-neon transition-all disabled:opacity-20 disabled:bg-white/5 disabled:text-white/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
        <p className="text-center text-[9px] text-white/20 mt-4 uppercase tracking-[0.2em]">STJ Studio AI can make mistakes. Verify important info.</p>
      </div>
    </div>
  );
}
