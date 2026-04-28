import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Image as ImageIcon, Video, Sparkles, Wand2, Zap, Settings, Menu, X } from 'lucide-react';
import { WritingAssistant } from './components/WritingAssistant';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { cn } from './lib/utils';

type Tab = 'writing' | 'image' | 'video' | 'home';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('writing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const tabs = [
    { 
      id: 'writing', 
      name: 'Theory Lab', 
      icon: PenLine, 
      label: 'Summarizer', 
      index: '01'
    },
    { 
      id: 'image', 
      name: 'Visuals', 
      icon: ImageIcon, 
      label: 'Art Forge', 
      index: '02'
    },
    { 
      id: 'video', 
      name: 'Motion', 
      icon: Video, 
      label: 'Forge', 
      index: '03'
    },
  ];

  return (
    <div className="flex h-screen bg-[#080808] text-white font-sans selection:bg-neon selection:text-black overflow-hidden relative">
      {/* Immersive Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Sidebar - ChatGPT Style */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        className="flex flex-col z-50 shrink-0 bg-[#0d0d0d] relative border-r border-white/5"
      >
        <div className="h-16 flex items-center px-6 justify-between border-b border-white/5">
          <button 
            onClick={() => setActiveTab('home' as any)}
            className="flex items-center gap-2 font-display text-xl tracking-tighter"
          >
            STJ<span className="text-neon">.</span>STUDIO
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Tools</span>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative",
                activeTab === tab.id ? "bg-white/5 text-white" : "text-white/40 hover:bg-white/[0.02] hover:text-white"
              )}
            >
              <div className={cn(
                "w-8 h-8 flex items-center justify-center shrink-0 border transition-all duration-300 rounded-md",
                activeTab === tab.id 
                  ? "border-neon text-neon bg-neon/10" 
                  : "border-white/10 text-white/30 group-hover:border-white/30"
              )}>
                <tab.icon className="w-4 h-4" />
              </div>

              <div className="flex flex-col items-start overflow-hidden whitespace-nowrap">
                <span className="font-medium text-sm tracking-tight">{tab.name}</span>
              </div>
            </button>
          ))}

          <div className="px-3 pt-6 mb-2 mt-4 border-t border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Recent Sessions</span>
          </div>
          {/* Placeholder for history */}
          <div className="space-y-1">
            {['Quantum Physics Summary', 'App Logo Design', 'Lecture Notes'].map((item, i) => (
              <button key={i} className="w-full text-left px-3 py-2 text-xs text-white/20 hover:text-white/40 truncate rounded-md hover:bg-white/[0.01]">
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 space-y-2">
           <button className="w-full flex items-center gap-3 p-3 text-xs text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-[10px]">SJ</span>
              </div>
              <span>Settings</span>
           </button>
        </div>
      </motion.aside>

      {/* Toggle Sidebar Button (Floating) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-[60] w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-neon hover:text-black transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-20 overflow-hidden bg-[#080808]">
        {/* Minimalist Header */}
        <header className="h-16 flex items-center justify-between px-10 border-b border-white/5">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn("p-2 text-white/30 hover:text-white transition-all hidden md:block", isSidebarOpen && "text-white/60")}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-medium text-white/60">
                {tabs.find(t => t.id === activeTab)?.name}
              </h2>
           </div>
           
           <div className="flex items-center gap-6">
              <button className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
                Share
              </button>
              <button className="bg-neon text-black px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-all">
                Upgrade
              </button>
           </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto custom-scrollbar"
            >
              <div className="max-w-3xl mx-auto w-full h-full px-6 py-12">
                {activeTab === 'writing' && <WritingAssistant />}
                {activeTab === 'image' && <ImageGenerator />}
                {activeTab === 'video' && <VideoGenerator />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <footer className="h-8 flex items-center justify-between px-6 text-[8px] font-mono uppercase tracking-[0.2em] text-white/20 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-neon/40" />
            <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
          <div className="flex gap-4">
            <span>Server: ASIA-SOUTH-1</span>
            <span className="text-neon/30">Stable v1.0.4</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
