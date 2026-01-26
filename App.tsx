import React, { useState, useEffect } from 'react';
import { Github, Sparkles, Key } from 'lucide-react';
import { ProjectDetails, CustomSection } from './types';
import InputForm from './components/InputForm';
import ReadmeDisplay from './components/ReadmeDisplay';
import ApiKeyInput from './components/ApiKeyInput';
import { generateReadme } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isUpdatingKey, setIsUpdatingKey] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const [details, setDetails] = useState<ProjectDetails>({
    name: '',
    description: '',
    techStack: '',
    features: '',
    style: 'modern',
    fileType: 'md',
    imageUrl: '',
    customSections: [],
    customPrompt: ''
  });

  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing key in localStorage on mount
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
    setLoading(false);
  }, []);

  const handleSaveKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setIsUpdatingKey(false);
  };

  const handleUpdateKey = () => {
    setIsUpdatingKey(true);
  };

  const handleCancelUpdate = () => {
    setIsUpdatingKey(false);
  };

  const handleInputChange = (field: keyof ProjectDetails, value: any) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!apiKey) return;

    setIsGenerating(true);
    setError(null);
    try {
      const readme = await generateReadme(details, apiKey);
      setGeneratedMarkdown(readme);
    } catch (err: any) {
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return null;

  if (!apiKey || isUpdatingKey) {
    return (
      <ApiKeyInput
        onSave={handleSaveKey}
        onCancel={apiKey ? handleCancelUpdate : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-2 rounded-lg">
                <Github className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                README.gen
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex text-xs font-medium px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                Powered by Zodevs
              </span>

              <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block"></div>

              <button
                onClick={handleUpdateKey}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                title="Update API Key"
              >
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">Update Key</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)]">

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2 animate-fade-in">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full pb-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-4 h-full flex flex-col min-h-0">
            <div className="mb-2 flex items-center gap-2 text-slate-400 text-sm uppercase tracking-wider font-semibold flex-shrink-0">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Configuration
            </div>
            <div className="overflow-y-auto h-full pr-2">
              <InputForm
                details={details}
                onChange={handleInputChange}
                onSubmit={handleGenerate}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          {/* Right Column: Preview/Output */}
          <div className="lg:col-span-8 h-full flex flex-col min-h-0">
            <div className="mb-2 text-slate-400 text-sm uppercase tracking-wider font-semibold flex-shrink-0">
              Output
            </div>
            <div className="flex-grow min-h-0">
              <ReadmeDisplay markdown={generatedMarkdown} fileType={details.fileType} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;