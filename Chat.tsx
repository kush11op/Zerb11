
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, User, Bot, Loader2, CheckCircle2, Package, Activity, ExternalLink } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  isGenerating: boolean;
  onOpenWorkspace: () => void;
  isWorkspaceOpen: boolean;
}

const Chat: React.FC<ChatProps> = ({ messages, onSend, isGenerating, onOpenWorkspace, isWorkspaceOpen }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSend(input);
      setInput('');
    }
  };

  const isTaskMessage = (m: ChatMessage) => {
    return (m.updatedFiles && m.updatedFiles.length > 0) || m.content.toLowerCase().startsWith('plan:');
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-r border-neutral-100">
      <header className="p-4 md:p-6 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight flex items-center gap-2">
            Zerb <span className="text-neutral-400 font-light">Architect</span>
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
              {isGenerating ? 'Processing' : 'Standby'}
            </span>
          </div>
        </div>
        <div className="hidden sm:block">
           <Activity size={18} className={`${isGenerating ? 'text-blue-500' : 'text-neutral-200'} transition-colors`} />
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 md:px-10">
            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-neutral-100">
              <Bot size={28} className="text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold mb-3 tracking-tight">System Online.</h2>
            <p className="text-[14px] text-neutral-500 leading-relaxed max-w-sm">
              Greeting, I am Zerb. I can handle general inquiries or full-scale architectural tasks.
            </p>
          </div>
        )}
        
        {messages.map((m, idx) => {
          const isTask = m.role === 'assistant' && isTaskMessage(m);
          
          return (
            <div key={m.id} className={`flex gap-4 md:gap-5 transition-all duration-300 ${isTask ? 'bg-neutral-50/40 -mx-4 md:-mx-6 px-4 md:px-6 py-6 md:py-8 border-y border-neutral-100/50' : 'px-1 py-2'}`}>
              <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 ${m.role === 'assistant' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'} ${isGenerating && m.role === 'assistant' && idx === messages.length - 1 ? 'ring-4 ring-black/5 scale-105' : ''}`}>
                {m.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                {isTask && (
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Package size={12} />
                    Architectural Plan
                  </div>
                )}
                
                <p className={`text-[14px] md:text-[15px] leading-relaxed break-words whitespace-pre-wrap ${m.role === 'assistant' ? 'text-neutral-800' : 'text-neutral-700'}`}>
                  {m.content}
                  {isGenerating && idx === messages.length - 1 && m.role === 'assistant' && (
                     <span className="inline-block w-2 h-4 ml-1 bg-blue-500/30 animate-pulse rounded-sm align-middle"></span>
                  )}
                </p>
                
                {isTask && m.updatedFiles && m.updatedFiles.length > 0 && (
                  <div className="mt-6 border-t border-neutral-100 pt-5 animate-in fade-in slide-in-from-top-2">
                     <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Execution Success</div>
                        {!isWorkspaceOpen && (
                          <button 
                            onClick={onOpenWorkspace}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                          >
                            View Code <ExternalLink size={12} />
                          </button>
                        )}
                     </div>
                     <div className="flex flex-wrap gap-2">
                      {m.updatedFiles.map(file => (
                        <div key={file} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.02)] text-[11px] font-bold text-neutral-700 transition-all hover:border-black/10">
                          <span className="opacity-80 font-mono">{file}</span>
                          <CheckCircle2 size={14} className="text-green-500" />
                          <span className="text-[9px] text-green-600 font-extrabold uppercase">Done</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isGenerating && messages[messages.length-1]?.role === 'user' && (
          <div className="flex gap-4 animate-pulse px-1 py-2">
            <div className="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
              <Loader2 size={18} className="text-neutral-400 animate-spin" />
            </div>
            <div className="flex-1 pt-2 space-y-3">
              <div className="h-2 w-24 bg-neutral-100 rounded-full"></div>
              <div className="h-2 w-full bg-neutral-50 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 bg-white border-t border-neutral-100">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or describe a task..."
            className="w-full pl-5 pr-14 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-4 focus:ring-black/5 focus:bg-white focus:border-neutral-200 outline-none transition-all text-[15px] placeholder:text-neutral-400 shadow-sm"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="absolute right-2.5 top-2.5 p-2.5 bg-black text-white rounded-xl disabled:bg-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">
            Zerb Engine v3.7 • Optional Workspace
          </p>
          <div className="flex gap-3">
            <span className="text-[9px] text-neutral-300 font-medium">Auto-Detection Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
