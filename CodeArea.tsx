
import React, { useState } from 'react';
import { ProjectState, WorkspaceTab, FileNode } from '../types';
import FileTree from './FileTree';
import Editor from './Editor';
import Preview from './Preview';
import { Copy, Download, Play, Terminal, Monitor, Code, Menu, X, Cpu } from 'lucide-react';

interface CodeAreaProps {
  project: ProjectState;
  setProject: React.Dispatch<React.SetStateAction<ProjectState>>;
  isSyncing?: boolean;
  onClose?: () => void;
}

const CodeArea: React.FC<CodeAreaProps> = ({ project, setProject, isSyncing, onClose }) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(WorkspaceTab.CODE);
  const [isFileTreeVisible, setIsFileTreeVisible] = useState(false);

  const activeFile = project.files.find(f => f.name === project.activeFileName) || project.files[0];

  const handleContentChange = (newContent: string) => {
    setProject(prev => ({
      ...prev,
      files: prev.files.map(f => f.name === prev.activeFileName ? { ...f, content: newContent } : f)
    }));
  };

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
    }
  };

  const toggleFileTree = () => setIsFileTreeVisible(!isFileTreeVisible);

  return (
    <div className="flex h-full overflow-hidden bg-white relative">
      {/* Sidebar: File Tree */}
      <aside className={`
        fixed md:relative z-40 h-full w-64 md:w-52 border-r border-neutral-100 bg-white flex flex-col shrink-0 transition-transform duration-300
        ${isFileTreeVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Architect Explorer</span>
          <button onClick={toggleFileTree} className="md:hidden p-1 text-neutral-400">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <FileTree 
            files={project.files} 
            activeFile={project.activeFileName} 
            onSelect={(name) => {
              setProject(p => ({ ...p, activeFileName: name }));
              setIsFileTreeVisible(false);
            }} 
          />
        </div>
      </aside>

      {/* Backdrop */}
      {isFileTreeVisible && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={toggleFileTree} />
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Toolbar */}
        <header className="h-14 md:h-12 border-b border-neutral-100 bg-white flex items-center justify-between px-3 md:px-4 shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={toggleFileTree} className="p-2 text-neutral-500 md:hidden hover:bg-neutral-50 rounded">
              <Menu size={20} />
            </button>
            
            <button 
              onClick={() => setActiveTab(WorkspaceTab.CODE)}
              className={`px-2.5 md:px-3 py-2 md:py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === WorkspaceTab.CODE ? 'bg-neutral-100 text-black' : 'text-neutral-400'}`}
            >
              <Code size={16} /> <span className="hidden sm:inline">Editor</span>
            </button>
            <button 
              onClick={() => setActiveTab(WorkspaceTab.PREVIEW)}
              className={`px-2.5 md:px-3 py-2 md:py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === WorkspaceTab.PREVIEW ? 'bg-neutral-100 text-black' : 'text-neutral-400'}`}
            >
              <Monitor size={16} /> <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-lg animate-pulse">
                <Cpu size={12} className="animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-[0.15em]">Architecting...</span>
              </div>
            )}
            <button onClick={handleCopy} className="p-2 text-neutral-400 hover:text-black transition-colors" title="Copy Code">
              <Copy size={16} />
            </button>
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded hover:bg-neutral-800 transition-colors shadow-sm">
              <Play size={12} fill="currentColor" /> Run
            </button>
          </div>
        </header>

        {/* Display Pane */}
        <div className={`flex-1 overflow-hidden relative transition-opacity duration-300`}>
          {activeTab === WorkspaceTab.CODE && (
            <Editor 
              content={activeFile.content} 
              language={activeFile.language} 
              onChange={handleContentChange} 
            />
          )}
          {activeTab === WorkspaceTab.PREVIEW && <Preview files={project.files} />}
          
          {/* Subtle Live Overlay */}
          {isSyncing && activeTab === WorkspaceTab.CODE && (
            <div className="absolute top-4 right-4 z-10">
               <div className="px-3 py-1 bg-white/80 backdrop-blur-md border border-neutral-100 rounded-full shadow-lg flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Syncing Stream</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeArea;
