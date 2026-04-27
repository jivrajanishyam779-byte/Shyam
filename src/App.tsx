import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Image as ImageIcon, Video, Sparkles, Wand2, Zap, Settings, Menu, X } from 'lucide-react';
import { WritingAssistant } from './components/WritingAssistant';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { cn } from './lib/utils';

type Tab = 'writing' | 'image' | 'video';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('writing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const tabs = [
    { id: 'writing', name: 'Pen', icon: PenLine, label: 'Draft Mode', index: '01' },
    { id: 'image', name: 'Canvas', icon: ImageIcon, label: 'Visual Studio', index: '02' },
    { id: 'video', name: 'Motion', icon: Video, label: 'Action Studio', index: '03' },
  ];

  return (
    <div className="flex h-screen bg-[#080808] text-white font-sans selection:bg-neon selection:text-black overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="grid-line-r flex flex-col z-50 shrink-0 bg-[#080808]"
      >
        <div className="h-20 grid-line-b flex items-center px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key="logo"
              className="flex items-center gap-2 font-display text-2xl tracking-tighter"
            >
              STJ<span className="text-neon">.</span>
              {isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>STUDIO</motion.span>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Vertical Label */}
          <div className="w-12 grid-line-r flex items-center justify-center">
            <span className="vertical-text text-[10px] uppercase font-bold tracking-[0.3em] text-white/30">
              NAVIGATION
            </span>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="w-full flex flex-col gap-1 text-left group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 border flex items-center justify-center font-display text-sm transition-all duration-300",
                    activeTab === tab.id 
                      ? "border-neon text-neon shadow-[0_0_15px_rgba(223,255,0,0.1)]" 
                      : "border-white/10 text-white/40 group-hover:border-white/30"
                  )}>
                    {tab.index}
                  </div>
                  {isSidebarOpen && (
                    <div className="flex flex-col">
                      <span className={cn(
                        "font-display text-sm uppercase tracking-wider transition-colors",
                        activeTab === tab.id ? "text-white" : "text-white/40 group-hover:text-white/60"
                      )}>
                        {tab.name}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-white/20 font-bold">
                        {tab.label}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 grid-line-t">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 border border-white/5 hover:border-white/20 transition-all group"
          >
            <Menu className={cn("w-5 h-5 text-white/20 group-hover:text-neon transition-colors", !isSidebarOpen && "rotate-90")} />
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-20 grid-line-b flex items-center justify-between px-10 z-40 bg-[#080808]/80 backdrop-blur-xl">
           <div className="flex items-center gap-8">
              <h2 className="font-display text-3xl uppercase tracking-tighter">
                {tabs.find(t => t.id === activeTab)?.name} Studio
                <span className="text-neon">.</span>
              </h2>
              <div className="h-6 w-px bg-white/10" />
              <div className="hidden md:flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-white/30">Buffer_Status</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-[2px] bg-white/5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "84%" }}
                        className="h-full bg-neon"
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neon">84%</span>
                  </div>
                </div>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">System_Node</span>
                <span className="text-xs font-mono text-white/80">AIS-ASIA-SE1</span>
              </div>
              <button className="bg-neon text-black px-6 py-2 font-display text-sm uppercase tracking-wide hover:bg-white transition-all transform active:scale-95">
                Upgrade Plan
              </button>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#080808]">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col relative z-10"
            >
              {activeTab === 'writing' && <WritingAssistant />}
              {activeTab === 'image' && <ImageGenerator />}
              {activeTab === 'video' && <VideoGenerator />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="h-10 grid-line-t flex items-center justify-between px-10 text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 z-40 bg-[#080808]">
          <div>&COPY; 2026 STJ CREATIVE SYSTEMS</div>
          <div className="flex gap-6">
            <span>REGION: US-EAST-1</span>
            <span className="text-neon/60">VERSION: 0.1.4-BETA</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
