
import React from 'react';
import { FileNode } from '../types';
import { File, FileJson, FileCode, FileText, Database, Settings } from 'lucide-react';

interface FileTreeProps {
  files: FileNode[];
  activeFile: string | null;
  onSelect: (name: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, activeFile, onSelect }) => {
  const getIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'json': return <FileJson size={14} className="text-amber-400" />;
      case 'js':
      case 'ts': return <FileCode size={14} className="text-blue-400" />;
      case 'tsx':
      case 'jsx': return <FileCode size={14} className="text-cyan-400" />;
      case 'html': return <FileCode size={14} className="text-orange-500" />;
      case 'css': return <FileCode size={14} className="text-sky-400" />;
      case 'py': return <Database size={14} className="text-emerald-500" />;
      case 'md': return <FileText size={14} className="text-slate-400" />;
      case 'env':
      case 'yml':
      case 'yaml': return <Settings size={14} className="text-neutral-400" />;
      default: return <File size={14} className="text-neutral-300" />;
    }
  };

  return (
    <div className="py-2">
      {files.map((file) => (
        <button
          key={file.name}
          onClick={() => onSelect(file.name)}
          className={`w-full flex items-center gap-2.5 px-4 py-2 text-[13px] transition-all group ${
            activeFile === file.name 
              ? 'bg-neutral-100 text-black font-semibold border-r-2 border-black' 
              : 'text-neutral-500 hover:bg-neutral-50 hover:text-black'
          }`}
        >
          {getIcon(file.name)}
          <span className="truncate">{file.name}</span>
        </button>
      ))}
    </div>
  );
};

export default FileTree;
