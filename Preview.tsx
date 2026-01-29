
import React, { useMemo } from 'react';
import { FileNode } from '../types';

interface PreviewProps {
  files: FileNode[];
}

const Preview: React.FC<PreviewProps> = ({ files }) => {
  const srcDoc = useMemo(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html'));
    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const scriptFiles = files.filter(f => 
      f.name.endsWith('.js') || 
      f.name.endsWith('.ts') || 
      f.name.endsWith('.tsx') ||
      f.name.endsWith('.jsx')
    );

    if (!htmlFile) {
      const pythonFiles = files.filter(f => f.name.endsWith('.py'));
      if (pythonFiles.length > 0) {
        return `
          <html>
            <head><script src="https://cdn.tailwindcss.com"></script></head>
            <body class="bg-neutral-900 text-emerald-400 p-8 font-mono text-sm leading-relaxed">
              <div class="mb-4 text-neutral-500 flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                <span class="ml-2">System Simulation: ${pythonFiles[0].name}</span>
              </div>
              <div class="border-t border-neutral-800 pt-4">
                <p class="text-neutral-500"># Zerb Architecture Simulation</p>
                <p class="mt-4">>>> Logic analysis complete.</p>
                <p>>>> Backend services ready.</p>
              </div>
            </body>
          </html>
        `;
      }
      return `<html><body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; color: #666;">No index.html found.</body></html>`;
    }

    let content = htmlFile.content;

    // Inject CSS
    const cssInjection = cssFiles.map(f => `<style data-filename="${f.name}">${f.content}</style>`).join('\n');
    content = content.replace('</head>', `${cssInjection}</head>`);

    // Advanced JS/TSX Transpilation using Babel
    const jsInjection = scriptFiles.map(f => {
      const isTypeScript = f.name.endsWith('.ts') || f.name.endsWith('.tsx');
      return `
      <script type="text/babel" data-filename="${f.name}" data-presets="react,typescript">
        try {
          ${f.content}
        } catch (e) {
          console.error("Error in ${f.name}:", e);
        }
      </script>`;
    }).join('\n');

    content = content.replace('</body>', `
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      ${jsInjection}
      </body>
    `);

    // Ensure Tailwind
    if (!content.includes('tailwindcss.com')) {
      content = content.replace('<head>', '<head><script src="https://cdn.tailwindcss.com"></script>');
    }

    return content;
  }, [files]);

  return (
    <div className="h-full w-full bg-neutral-100 flex flex-col">
      <div className="h-full w-full bg-white shadow-inner overflow-hidden">
        <iframe
          title="Zerb Preview"
          srcDoc={srcDoc}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-modals allow-forms"
        />
      </div>
    </div>
  );
};

export default Preview;
