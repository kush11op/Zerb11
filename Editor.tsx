
import React from 'react';

interface EditorProps {
  content: string;
  language: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, language, onChange }) => {
  return (
    <div className="h-full w-full flex flex-col bg-white">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full h-full p-8 mono text-[13px] leading-relaxed resize-none outline-none bg-white text-neutral-800 border-none focus:ring-0 selection:bg-black/5"
        style={{ tabSize: 2 }}
      />
      
      {/* Footer Info */}
      <div className="h-10 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300"></div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">UTF-8</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{language.toUpperCase()}</span>
          </div>
        </div>
        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          Lines: {content.split('\n').length} • Chars: {content.length}
        </div>
      </div>
    </div>
  );
};

export default Editor;
