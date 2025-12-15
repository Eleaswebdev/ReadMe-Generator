import React, { useState, useRef } from 'react';
import { ProjectDetails, ReadmeStyle, FileType } from '../types';
import { Wand2, Code2, Layers, FileText, Palette, FileType as FileTypeIcon, Image as ImageIcon, Upload, Link as LinkIcon, X } from 'lucide-react';

interface InputFormProps {
  details: ProjectDetails;
  onChange: (field: keyof ProjectDetails, value: string) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ details, onChange, onSubmit, isGenerating }) => {
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    onChange('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm flex flex-col">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-400" />
        Project Details
      </h2>
      
      <div className="space-y-5 flex-grow">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Name</label>
          <input
            type="text"
            value={details.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g. W3C Auto-Fixer"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            Project Image <span className="text-slate-500 text-xs font-normal">(Optional)</span>
          </label>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 mb-2 w-fit">
            <button
              onClick={() => setImageMode('url')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                imageMode === 'url' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              URL
            </button>
            <button
              onClick={() => setImageMode('upload')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                imageMode === 'upload' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3 h-3" />
              Upload
            </button>
          </div>

          <div className="relative group">
            {imageMode === 'url' ? (
              <input
                type="text"
                value={details.imageUrl || ''}
                onChange={(e) => onChange('imageUrl', e.target.value)}
                placeholder="https://example.com/banner.png"
                disabled={details.imageUrl?.startsWith('data:')} // Disable text input if it's base64 data
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
              />
            ) : (
              <div className="relative">
                 <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 transition-all cursor-pointer"
                />
              </div>
            )}

            {details.imageUrl && (
               <button 
                  onClick={clearImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Clear Image"
               >
                 <X className="w-4 h-4" />
               </button>
            )}
          </div>
          {details.imageUrl && details.imageUrl.startsWith('data:') && imageMode === 'url' && (
             <p className="text-xs text-amber-500 mt-1">Image loaded via upload. Switch to Upload tab to change.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
          <textarea
            value={details.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Describe your project. If this is a WordPress plugin, mention it here to generate the correct format."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[120px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <FileTypeIcon className="w-4 h-4 text-slate-400" />
              Format
            </label>
            <div className="relative">
              <select
                value={details.fileType}
                onChange={(e) => onChange('fileType', e.target.value as FileType)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer"
              >
                <option value="md">Markdown (.md)</option>
                <option value="txt">Text (.txt)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-400" />
              Style
            </label>
            <div className="relative">
              <select
                value={details.style}
                onChange={(e) => onChange('style', e.target.value as ReadmeStyle)}
                disabled={details.fileType === 'txt'}
                className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer ${details.fileType === 'txt' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="modern">Modern 🚀</option>
                <option value="professional">Professional 💼</option>
                <option value="simple">Simple 📄</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            Tech Stack <span className="text-slate-500 text-xs font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={details.techStack}
            onChange={(e) => onChange('techStack', e.target.value)}
            placeholder="e.g. React, Tailwind, PHP"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-slate-400" />
            Key Features <span className="text-slate-500 text-xs font-normal">(Optional)</span>
          </label>
          <textarea
            value={details.features}
            onChange={(e) => onChange('features', e.target.value)}
            placeholder="List specific features or modules..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-h-[80px] resize-none"
          />
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onSubmit}
          disabled={isGenerating || !details.name || !details.description}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white shadow-lg transition-all
            ${isGenerating || !details.name || !details.description
              ? 'bg-slate-700 cursor-not-allowed text-slate-400'
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-[0.98]'
            }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate {details.fileType === 'md' ? 'README.md' : 'readme.txt'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;