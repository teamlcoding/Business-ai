import React, { useState } from 'react';
import { Sparkles, Search, Send, X, ArrowRight, CornerDownLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { ModuleType, BusinessType, UserRole, AiCommandResponse } from '../types';

interface AiCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  businessType: BusinessType;
  activeRole: UserRole;
  onNavigateModule: (module: ModuleType) => void;
  isDarkMode: boolean;
}

const SUGGESTIONS = [
  "Show today's sales and net profit",
  "Generate GST report for this quarter",
  "Create a new GST invoice for Nexus Digital",
  "Send salary slip reminders on WhatsApp",
  "Check low stock items in Primary Warehouse",
  "Who has unpaid pending balances?",
];

export const AiCommandPalette: React.FC<AiCommandPaletteProps> = ({
  isOpen,
  onClose,
  businessType,
  activeRole,
  onNavigateModule,
  isDarkMode
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiCommandResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          businessType,
          activeRole
        }),
      });

      const data: AiCommandResponse = await res.json();
      setAiResult(data);

      // Auto-navigate module if requested by AI
      if (data.targetModule) {
        setTimeout(() => {
          onNavigateModule(data.targetModule!);
        }, 1200);
      }
    } catch (err) {
      console.error('Command palette error:', err);
      setAiResult({
        response: 'Failed to execute command. Please try again.',
        targetModule: 'dashboard'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (query: string) => {
    setPrompt(query);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
      }`}>
        
        {/* Command Input Area */}
        <form onSubmit={handleSubmit} className="relative p-4 border-b border-neutral-800/60 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
          <input
            type="text"
            placeholder={`Ask BusinessOS AI or type a command for ${businessType}...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-neutral-100 focus:outline-none placeholder:text-neutral-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* AI Processing / Results Area */}
        {isLoading && (
          <div className="p-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">BusinessOS AI is analyzing your business intent & executing workflow...</p>
          </div>
        )}

        {aiResult && !isLoading && (
          <div className="p-5 bg-blue-500/5 border-b border-neutral-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>AI OS Action Executed</span>
              </div>
              {aiResult.targetModule && (
                <button
                  onClick={() => {
                    onNavigateModule(aiResult.targetModule!);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                >
                  Jump to {aiResult.targetModule} module <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <p className="text-sm text-neutral-200 leading-relaxed font-medium">
              {aiResult.response}
            </p>

            {aiResult.highlights && aiResult.highlights.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">Executive Insights</span>
                <ul className="space-y-1">
                  {aiResult.highlights.map((h, idx) => (
                    <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Suggested Quick Prompts */}
        <div className="p-4 space-y-3">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Suggested Commands
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-left transition-all ${
                  isDarkMode 
                    ? 'bg-neutral-800/60 border-neutral-700/80 text-neutral-300 hover:border-blue-500/50 hover:text-blue-400' 
                    : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-neutral-950/50 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Powered by Gemini 3.6 Flash Server-Side Proxy</span>
          <span className="flex items-center gap-1 font-mono">
            Press <kbd className="px-1 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-400">ESC</kbd> to exit
          </span>
        </div>

      </div>
    </div>
  );
};
