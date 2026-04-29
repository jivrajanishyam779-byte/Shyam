import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Image as ImageIcon, Sparkles, Wand2, Zap, Settings, Menu, X, MoreVertical, Share2, Crown, Check } from 'lucide-react';
import { WritingAssistant } from './components/WritingAssistant';
import { ImageGenerator } from './components/ImageGenerator';
import { cn } from './lib/utils';

type Tab = 'writing' | 'image' | 'logic' | 'research';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('writing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'STJ.STUDIO',
        text: 'Synthesize your digital vision.',
        url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    }
  };

  const tabs = [
    { 
      id: 'writing', 
      name: 'Theory Lab', 
      icon: PenLine, 
      label: 'Synthesizer',
      desc: 'Compress complexity into clarity'
    },
    { 
      id: 'logic', 
      name: 'Logic Forge', 
      icon: Wand2, 
      label: 'Architect',
      desc: 'Build structures and code'
    },
    { 
      id: 'research', 
      name: 'Deep Search', 
      icon: Sparkles, 
      label: 'Explorer',
      desc: 'Uncover hidden connections'
    },
    { 
      id: 'image', 
      name: 'Art Forge', 
      icon: ImageIcon, 
      label: 'Visualizer',
      desc: 'Generate visual artifacts'
    },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-[#080808] text-white font-sans selection:bg-neon selection:text-black overflow-hidden relative">
      {/* Immersive Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-20 overflow-hidden bg-[#080808]">
        {/* Minimalist Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#080808]/50 backdrop-blur-xl z-50">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('writing')}
                className="flex items-center gap-2 font-display text-xl tracking-tighter hover:text-neon transition-colors"
              >
                STJ<span className="text-neon">.</span>STUDIO
              </button>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                {tabs.find(t => t.id === activeTab)?.name}
              </h2>
           </div>
           
           <div className="flex items-center gap-2 relative" ref={menuRef}>
              <button 
                onClick={handleShare}
                className={cn(
                  "hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all mr-2 transition-all",
                  isShared 
                    ? "bg-neon border-neon text-black" 
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white border"
                )}
              >
                {isShared ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                {isShared ? 'Copied' : 'Share'}
              </button>
              
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                  "p-2.5 rounded-lg transition-all border",
                  isMenuOpen 
                    ? "bg-neon border-neon text-black" 
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                )}
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
                  >
                    <div className="px-3 py-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Select Engine</span>
                    </div>
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as Tab);
                          setIsMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                          activeTab === tab.id ? "bg-white/10 text-neon" : "text-white/40 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-lg border shrink-0 transition-colors",
                          activeTab === tab.id ? "border-neon/40 bg-neon/10" : "border-white/5 bg-white/5"
                        )}>
                          <tab.icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start overflow-hidden">
                          <span className="font-medium text-sm">{tab.name}</span>
                          <span className="text-[9px] text-white/20 uppercase tracking-widest truncate">{tab.label}</span>
                        </div>
                      </button>
                    ))}
                    
                    <div className="mt-2 pt-2 border-t border-white/5">
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all">
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl text-neon bg-neon/5 hover:bg-neon/10 transition-all mt-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-bold uppercase tracking-wider text-[10px]">Upgrade to Pro</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 overflow-y-auto custom-scrollbar"
            >
              <div className={cn(
                "w-full h-full",
                activeTab === 'writing' || activeTab === 'logic' || activeTab === 'research' ? "" : "max-w-5xl mx-auto px-6 py-12"
              )}>
                {(activeTab === 'writing' || activeTab === 'logic' || activeTab === 'research') && (
                  <WritingAssistant mode={activeTab as any} />
                )}
                {activeTab === 'image' && <ImageGenerator />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Status Bar - Minimal */}
        <footer className="h-6 flex items-center justify-between px-6 text-[7px] font-mono uppercase tracking-[0.2em] text-white/10 border-t border-white/5 z-40 bg-[#080808]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-neon/20 animate-pulse" />
            <span>ENGINE_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
          <div className="flex gap-4">
             <span className="text-neon/20 font-bold">READY // v1.0.4</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
