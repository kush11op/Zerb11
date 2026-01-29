
import React, { useState, useCallback, useEffect } from 'react';
import Chat from './components/Chat';
import CodeArea from './components/CodeArea';
import { FileNode, ChatMessage, ProjectState } from './types';
import { streamZerbResponse } from './services/geminiService';
import { Layout, Code2, MessageSquare, ShieldAlert, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean>(!!process.env.API_KEY);
  
  const [project, setProject] = useState<ProjectState>({
    files: [
      { name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Zerb App</title>\n</head>\n<body class="bg-neutral-50 flex items-center justify-center h-screen font-sans">\n  <div class="text-center p-8 bg-white rounded-2xl shadow-sm border border-neutral-100">\n    <h1 class="text-2xl font-bold text-neutral-800">System Ready</h1>\n    <p class="text-neutral-500 mt-2">Architecture Engine is online and waiting for instructions.</p>\n  </div>\n</body>\n</html>' },
    ],
    activeFileName: 'index.html',
    logs: []
  });

  // Check for API key presence on mount
  useEffect(() => {
    const checkKey = async () => {
      if (process.env.API_KEY) {
        setIsKeyValid(true);
        return;
      }
      
      if (typeof window !== 'undefined' && window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeyValid(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per race condition guidelines
      setIsKeyValid(true);
    }
  };

  const toggleWorkspace = () => setIsWorkspaceOpen(!isWorkspaceOpen);
  const openWorkspace = () => setIsWorkspaceOpen(true);

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', content: text, id: Date.now().toString() };
    const currentHistory = [...messages];
    
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);
    
    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '', 
      id: assistantMsgId,
      updatedFiles: []
    }]);

    try {
      const stream = streamZerbResponse(text, currentHistory, project.files);
      
      for await (const update of stream) {
        setMessages(prev => prev.map(m => 
          m.id === assistantMsgId 
            ? { ...m, content: update.chatText, updatedFiles: update.completedFiles } 
            : m
        ));

        if (update.files.length > 0) {
          setProject(prev => {
            const newProjectFiles = [...prev.files];
            let newActiveFile = prev.activeFileName;

            update.files.forEach(streamedFile => {
              const idx = newProjectFiles.findIndex(f => f.name === streamedFile.name);
              if (idx !== -1) {
                newProjectFiles[idx] = streamedFile;
              } else {
                newProjectFiles.push(streamedFile);
                newActiveFile = streamedFile.name;
              }
            });

            return {
              ...prev,
              files: newProjectFiles,
              activeFileName: newActiveFile
            };
          });
        }
      }
    } catch (error: any) {
      console.error(error);
      const isAuthError = error.message?.includes("entity was not found") || error.message?.includes("API key");
      
      if (isAuthError) {
        setIsKeyValid(false);
      }

      setMessages(prev => prev.map(m => 
        m.id === assistantMsgId 
          ? { ...m, content: isAuthError ? 'Authentication lost. Please reconnect your API key.' : 'Error: Connection lost. Re-architecting...' } 
          : m
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-black overflow-hidden relative">
      {!isKeyValid && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-xl flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
          <div className="max-w-md w-full bg-white border border-neutral-100 p-10 rounded-[32px] shadow-2xl">
            <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-neutral-100">
              <Zap size={32} className="text-black" />
            </div>
            <h2 className="text-2xl font-semibold mb-3 tracking-tight">Connect Architect Engine</h2>
            <p className="text-[15px] text-neutral-500 mb-8 leading-relaxed px-4">
              To build with Zerb, you must link an active Gemini API Key from a paid project.
            </p>
            <button 
              onClick={handleConnectKey}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all mb-4"
            >
              Connect API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest hover:text-black transition-colors"
            >
              Billing Documentation
            </a>
          </div>
        </div>
      )}

      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        <button 
          onClick={toggleWorkspace}
          className={`p-2.5 rounded-full transition-all shadow-lg flex items-center gap-2 ${isWorkspaceOpen ? 'bg-black text-white' : 'bg-white text-black border border-neutral-200'}`}
        >
          {isWorkspaceOpen ? <MessageSquare size={18} /> : <Code2 size={18} />}
          <span className="hidden md:inline text-sm font-medium pr-1">
            {isWorkspaceOpen ? 'Chat' : 'Codes'}
          </span>
        </button>
      </div>

      <main className="flex w-full h-full relative">
        <section className={`
          flex-1 transition-all duration-300 ease-in-out 
          ${isWorkspaceOpen ? 'hidden md:flex md:max-w-[40%]' : 'flex w-full'}
        `}>
          <Chat 
            messages={messages} 
            onSend={handleSendMessage} 
            isGenerating={isGenerating}
            onOpenWorkspace={openWorkspace}
            isWorkspaceOpen={isWorkspaceOpen}
          />
        </section>

        {isWorkspaceOpen && (
          <section className="
            flex-1 md:w-[60%] border-l border-neutral-200 bg-neutral-50 flex flex-col h-full 
            animate-in slide-in-from-right md:slide-in-from-none duration-300
          ">
            <CodeArea 
              project={project}
              setProject={setProject}
              isSyncing={isGenerating}
              onClose={() => setIsWorkspaceOpen(false)}
            />
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
