import React, { useState } from 'react';
import { Copy, Check, Download, Eye, FileCode } from 'lucide-react';
import { ViewMode, FileType } from '../types';

interface ReadmeDisplayProps {
  markdown: string;
  fileType?: FileType;
}

const ReadmeDisplay: React.FC<ReadmeDisplayProps> = ({ markdown, fileType = 'md' }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.EDIT);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const mimeType = fileType === 'md' ? 'text/markdown' : 'text/plain';
    const extension = fileType === 'md' ? 'README.md' : 'readme.txt';
    
    const file = new Blob([markdown], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = extension;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!markdown) {
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center bg-slate-800/30 border border-slate-700/50 rounded-xl border-dashed">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileCode className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-300">No Documentation Generated Yet</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Fill in the project details on the left and click "Generate" to create your documentation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-800/50 border border-slate-700 rounded-xl shadow-xl backdrop-blur-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button
            onClick={() => setViewMode(ViewMode.EDIT)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === ViewMode.EDIT 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Raw
          </button>
          <button
            onClick={() => setViewMode(ViewMode.PREVIEW)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === ViewMode.PREVIEW
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-auto relative bg-[#0d1117]">
        {viewMode === ViewMode.EDIT ? (
          <textarea
            readOnly
            value={markdown}
            className="w-full h-full p-6 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
            spellCheck="false"
          />
        ) : (
          <div className="w-full h-full p-8 bg-[#0d1117] text-slate-300">
             <SimpleRenderer content={markdown} />
          </div>
        )}
      </div>
    </div>
  );
};

// A lightweight, safe renderer component for preview visualization
const SimpleRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2 font-sans">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // --- Ignore HTML wrapper lines (for cleaner preview) ---
        // Skips lines that are just <p>, </p>, <a>, </a>, <div...>, </div>
        // This prevents "raw" HTML tags from appearing in the preview if the AI adds wrappers.
        if (trimmed.match(/^<\/?(p|a|div|center)[^>]*>$/i)) {
          return null;
        }

        // --- HTML Image Tags (for banners) ---
        // Matches <img src="..." ... /> anywhere in the line
        const imgMatch = trimmed.match(/<img\s+[^>]*src="([^"]+)"[^>]*>/i);
        if (imgMatch) {
            const src = imgMatch[1];
            // Try to extract alt text as well
            const altMatch = trimmed.match(/alt="([^"]+)"/i);
            const altText = altMatch ? altMatch[1] : 'Image';
            
            // Safety check: Don't render if src is invalid, missing, or 'None Provided'
            if (src && src !== 'None Provided' && src !== 'null' && src !== 'undefined' && src !== '{{PROJECT_IMAGE_SOURCE}}') {
                return (
                    <div key={index} className="my-6">
                        <img 
                            src={src} 
                            alt={altText} 
                            className="w-full h-auto rounded-lg"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                );
            } else {
              // Return null to render nothing if invalid
              return null;
            }
        }

        // --- WordPress / Text Style Headers ---
        // === H1 ===
        const wpH1 = trimmed.match(/^=== (.*) ===$/);
        if (wpH1) return <h1 key={index} className="text-3xl font-bold text-white mb-4 pb-2 border-b border-slate-700">{wpH1[1]}</h1>;

        // == H2 ==
        const wpH2 = trimmed.match(/^== (.*) ==$/);
        if (wpH2) return <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">{wpH2[1]}</h2>;

        // = H3 =
        const wpH3 = trimmed.match(/^= (.*) =$/);
        if (wpH3) return <h3 key={index} className="text-xl font-semibold text-slate-200 mt-6 mb-3">{wpH3[1]}</h3>;


        // --- Markdown Headers ---
        if (line.startsWith('# ')) return <h1 key={index} className="text-3xl font-bold text-white mb-4 pb-2 border-b border-slate-700">{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold text-white mt-8 mb-4">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={index} className="text-xl font-semibold text-slate-200 mt-6 mb-3">{line.slice(4)}</h3>;
        
        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***') return <hr key={index} className="border-slate-700 my-8" />;

        // Images (Markdown syntax)
        if (line.includes('![') && line.includes('](')) {
           const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
           const images = [];
           let match;
           while ((match = imageRegex.exec(line)) !== null) {
              images.push({ alt: match[1], src: match[2] });
           }
           
           if (images.length > 0) {
              return (
                <div key={index} className="flex flex-wrap gap-2 my-4">
                  {images.map((img, i) => (
                    <img key={i} src={img.src} alt={img.alt} className="max-h-8 w-auto" />
                  ))}
                </div>
              );
           }
        }

        // Unordered Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
             const content = trimmed.slice(2);
             const parts = content.split(/(\*\*.*?\*\*)/).map((part, i) => 
                part.startsWith('**') && part.endsWith('**') 
                  ? <strong key={i} className="text-slate-200 font-semibold">{part.slice(2, -2)}</strong> 
                  : part
             );
             return <li key={index} className="ml-4 list-disc text-slate-300 my-1">{parts}</li>;
        }

        // Numbered Lists
        if (/^\d+\.\s/.test(trimmed)) {
             const content = trimmed.replace(/^\d+\.\s/, '');
             const parts = content.split(/(\*\*.*?\*\*|`.*?`)/).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-slate-200 font-semibold">{part.slice(2, -2)}</strong>;
                if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-slate-800 px-1 py-0.5 rounded text-blue-300 text-sm font-mono">{part.slice(1, -1)}</code>;
                return part;
            });
             return <div key={index} className="ml-4 flex gap-2 text-slate-300 my-1"><span className="font-mono text-slate-500">{trimmed.match(/^\d+\./)?.[0]}</span><span>{parts}</span></div>;
        }

        // Code blocks boundaries (visual only)
        if (trimmed.startsWith('```')) {
            return <div key={index} className="h-px my-2 bg-slate-800/50" />; 
        }
        
        // Blockquotes
        if (trimmed.startsWith('> ')) {
            return <blockquote key={index} className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4">{trimmed.slice(2)}</blockquote>;
        }

        // WP Tags/Contributors lines (simple key-value highlighting)
        if (trimmed.startsWith('Tags:') || trimmed.startsWith('Contributors:') || trimmed.startsWith('Requires at least:') || trimmed.startsWith('Tested up to:') || trimmed.startsWith('Stable tag:') || trimmed.startsWith('License:')) {
            const splitIdx = trimmed.indexOf(':');
            const label = trimmed.slice(0, splitIdx + 1);
            const val = trimmed.slice(splitIdx + 1);
            return <div key={index} className="text-slate-400 my-1"><strong className="text-slate-300">{label}</strong>{val}</div>
        }

        // Empty lines
        if (!trimmed) return <div key={index} className="h-2" />;

        // Default Paragraph
        const parts = line.split(/(\*\*.*?\*\*|`.*?`)/).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-slate-200 font-semibold">{part.slice(2, -2)}</strong>;
            if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-slate-800 px-1 py-0.5 rounded text-blue-300 text-sm font-mono">{part.slice(1, -1)}</code>;
            return part;
        });

        return <p key={index} className="text-slate-400 leading-7">{parts}</p>;
      })}
    </div>
  );
};

export default ReadmeDisplay;