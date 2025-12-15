import React, { useState } from 'react';
import { Key, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
  onCancel?: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave, onCancel }) => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  const isUpdateMode = !!onCancel;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl shadow-lg shadow-blue-500/20">
            <Key className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isUpdateMode ? 'Update API Key' : 'Welcome to README.gen'}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {isUpdateMode 
              ? 'Enter your new Google Gemini API Key below.' 
              : 'Enter your Google Gemini API Key to start generating documentation. Your key is stored locally in your browser.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
              API Key
            </label>
            <div className="relative group">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm group-hover:border-slate-600 pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                title={showKey ? "Hide API Key" : "Show API Key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!key.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              {isUpdateMode ? 'Update Key' : 'Get Started'}
              <ArrowRight className="w-4 h-4" />
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {!isUpdateMode && (
          <div className="mt-8 text-center pt-6 border-t border-slate-800/50">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-400 transition-colors"
            >
              Don't have a key? Get one from Google AI Studio
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyInput;