import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Wand2, Copy, Check, RotateCcw, PenTool, Type, List, FileText, Image as ImageIcon, X, Plus, Info, Paperclip, MessageSquarePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ai, MODELS } from '../lib/gemini';
import { cn } from '../lib/utils';

interface WritingAssistantProps {
  mode: 'writing' | 'logic' | 'research';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachment?: string | null;
  type?: 'general' | 'improve' | 'expand' | 'summarize';
}

export function WritingAssistant({ mode }: WritingAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const responseEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const modeConfig = {
    writing: {
      title: 'Theory Lab',
      desc: 'Synthesize complex digital concepts into crystalline structural summaries.',
      instruction: "You are a professional writing assistant and theoretical synthesizer. Provide helpful, concise, and high-quality analysis and edits. Use markdown for better formatting.",
      placeholder: "Type or paste your theoretical core here...",
      emptyLabel: "Theory Synthesis",
      emptyDesc: "Paste complex text above or upload a diagram. Select synthesis mode from the toolbar to begin extraction."
    },
    logic: {
      title: 'Logic Forge',
      desc: 'Architectural structural logic and binary problem solving.',
      instruction: "You are an expert system architect and logic engineer. Help build robust structures, write clean code, and solve complex logical puzzles. Be precise and technical.",
      placeholder: "Describe the architectural logic or code snippet you need...",
      emptyLabel: "Logic Engineering",
      emptyDesc: "Input a technical problem or code fragment. Force structural integrity through binary logic."
    },
    research: {
      title: 'Deep Search',
      desc: 'Explorer of hidden connections and technical deep dives.',
      instruction: "You are a high-level research explorer. Dig deep into subjects, find connections, and provide comprehensive insights. Use a structured, investigative tone.",
      placeholder: "What subject shall we deep dive into?",
      emptyLabel: "Deep Investigation",
      emptyDesc: "Submit a topic for exploration. Uncover technical layers and hidden systemic relations."
    }
  };

  const currentMode = modeConfig[mode];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (type: 'improve' | 'expand' | 'summarize' | 'general' = 'general') => {
    const userQuery = type === 'general' ? prompt : `Action: ${type}`;
    if (!userQuery && !attachment && !content) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userQuery || (content ? `Using Source Material: ${content.substring(0, 50)}...` : "Analyze this context"),
      attachment: attachment,
      type
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsGenerating(true);
    setPrompt('');
    
    // Use a reference index for the new assistant message
    const currentMessagesCount = messages.length;
    
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      let finalPrompt = '';
      if (type === 'improve') finalPrompt = `Improve the following for clarity and professional tone:\n\n${content}`;
      else if (type === 'expand') finalPrompt = `Provide more detail and depth for the following:\n\n${content}`;
      else if (type === 'summarize') finalPrompt = `Synthesize this into core essence and key points:\n\n${content}`;
      else finalPrompt = userQuery;

      const contents: any[] = [{ role: 'user', parts: [{ text: finalPrompt }] }];
      
      if (attachment) {
        contents[0].parts.push({
          inlineData: {
            mimeType: attachment.split(';')[0].split(':')[1],
            data: attachment.split(',')[1]
          }
        });
      }

      if (content && type !== 'general') {
        contents[0].parts.unshift({ text: `Context Material:\n${content}\n\nTask:` });
      } else if (content) {
        contents[0].parts.unshift({ text: `Project Background:\n${content}\n\nQuestion:` });
      }

      // Call the server-side proxy
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: currentMode.instruction,
          model: MODELS.WRITING
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server Synthesis Failure');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullText += chunk;
          setMessages(prev => {
            const updated = [...prev];
            const assistantIndex = currentMessagesCount + 1;
            if (updated[assistantIndex]) {
              updated[assistantIndex] = { role: 'assistant', content: fullText };
            }
            return updated;
          });
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => {
        const updated = [...prev];
        const assistantIndex = currentMessagesCount + 1;
        if (updated[assistantIndex]) {
           updated[assistantIndex] = { 
             role: 'assistant', 
             content: `[System Error]: ${error.message || 'Connection failure. Verify AI Studio settings.'}` 
           };
        }
        return updated;
      });
    } finally {
      setIsGenerating(false);
      setAttachment(null);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const suggestions = [
    { label: 'Synthesize', type: 'summarize' as const, icon: List },
    { label: 'Refine', type: 'improve' as const, icon: Wand2 },
    { label: 'Expand', type: 'expand' as const, icon: Sparkles },
  ];

  const clearSession = () => {
    setContent('');
    setAttachment(null);
    setMessages([]);
    setPrompt('');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto relative bg-[#0d0d0d]">
      {/* Header Info - ChatGPT Style */}
      <div className="flex flex-col items-center justify-center pt-24 pb-8 px-6">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <Sparkles className="w-6 h-6 text-neon" />
        </div>
        <h1 className="text-3xl font-display uppercase tracking-[0.3em] mb-2 text-white/90">{currentMode.title}</h1>
        <p className="text-white/20 text-[10px] font-mono tracking-[0.2em] max-w-sm text-center uppercase leading-relaxed">{currentMode.desc}</p>
      </div>

      {/* Main Conversation Thread */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-10 space-y-12 pb-64 custom-scrollbar">
        {/* Persistent Context Block */}
        <section className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 relative group hover:bg-white/[0.04] transition-all duration-500 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
               <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.4em] font-bold">Source_Nucleus</span>
            </div>
            <button 
              onClick={() => setContent('')}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-mono text-white/20 hover:text-red-400 uppercase tracking-widest"
            >
              [ Flush_Buffer ]
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={currentMode.placeholder}
            className="w-full bg-transparent resize-none focus:outline-none text-base leading-relaxed text-white/80 placeholder:text-white/5 font-sans min-h-[140px]"
          />
        </section>

        {/* Message History */}
        <div className="space-y-12">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col gap-4",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] px-6 py-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-white/[0.05] border border-white/10 text-white/80" 
                  : "bg-transparent text-white/90"
              )}>
                {msg.attachment && (
                  <div className="mb-4 w-32 h-32 rounded-lg overflow-hidden border border-white/10">
                    <img src={msg.attachment} alt="Context" className="w-full h-full object-cover" />
                  </div>
                )}
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {isGenerating && idx === messages.length - 1 && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-1.5 h-4 bg-neon ml-1 translate-y-0.5"
                      />
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {msg.role === 'assistant' && msg.content && (
                <div className="flex items-center gap-3 pl-2">
                  <button
                    onClick={() => copyToClipboard(msg.content, idx)}
                    className="p-2 text-white/20 hover:text-white transition-colors"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-neon" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center pt-12 pb-32 px-6 text-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 relative"
                >
                  <div className="absolute inset-0 rounded-full bg-neon/10 animate-ping opacity-20" />
                  <Sparkles className="w-6 h-6 text-neon" />
                </motion.div>
                
                <h3 className="text-xl font-display uppercase tracking-[0.2em] mb-3 text-white/80">{currentMode.emptyLabel}</h3>
                <p className="text-xs text-white/30 max-w-sm font-mono tracking-widest uppercase mb-12">{currentMode.emptyDesc}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
                  {[
                    { title: "Deep Dive", prompt: "Explain the systemic architecture of..." },
                    { title: "Structural Analysis", prompt: "Evaluate the logic behind..." },
                    { title: "Theoretical Core", prompt: "Synthesize the fundamental principles of..." },
                    { title: "Rapid Refinement", prompt: "Refactor this concept for clarity:" }
                  ].map((starter, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(starter.prompt)}
                      className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                    >
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-neon transition-colors mb-1">{starter.title}</h4>
                      <p className="text-[10px] text-white/40 leading-relaxed font-mono">{starter.prompt}</p>
                    </button>
                  ))}
                </div>
             </div>
          )}
        </div>
        <div ref={responseEndRef} />
      </div>

      {/* Floating ChatGPT-style Input */}
      <div className="fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/95 to-transparent pointer-events-none z-40" />
      
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
        <div className="bg-[#1a1a1a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl p-2 relative pointer-events-auto">
          {attachment && (
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-4">
               <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                 <img src={attachment} className="w-full h-full object-cover" alt="attachment" />
                 <button 
                  onClick={() => setAttachment(null)}
                  className="absolute top-0 right-0 p-1 bg-black/60 text-white hover:text-neon transition-colors"
                 >
                   <X className="w-3 h-3" />
                 </button>
               </div>
               <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">Context Attached</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 px-3 py-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => handleGenerate(s.type)}
                disabled={(!content && !attachment) || isGenerating}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all text-[9px] uppercase font-bold tracking-[0.2em] text-white/40 disabled:opacity-10"
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
            <div className="flex items-center pl-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white transition-colors group relative"
              >
                <Plus className="w-5 h-5" />
                <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity font-bold uppercase tracking-widest shadow-xl">Add Media</span>
              </button>
              <button
                type="button"
                onClick={clearSession}
                className="w-10 h-10 flex items-center justify-center text-white/10 hover:text-white transition-colors"
                title="Flush Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Message ${currentMode.title.split(' ')[0]} Assistant...`}
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-white/10 text-white/80"
            />

            <button
              type="submit"
              disabled={(!prompt && !attachment && !content) || isGenerating}
              className="w-11 h-11 bg-white text-black rounded-[1.25rem] flex items-center justify-center hover:bg-neon transition-all disabled:opacity-5 disabled:bg-white/5 disabled:text-white shadow-xl"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
        <p className="text-center text-[8px] text-white/10 mt-6 uppercase tracking-[0.4em] font-mono">Synthesized Intelligence // STJ Studio v1.0.4</p>
      </div>
    </div>
  );
}
