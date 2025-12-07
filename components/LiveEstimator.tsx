import React, { useState } from 'react';
import { generateContentWithUsage } from '../services/geminiService';
import { AlertCircle, Loader2, Send, Terminal } from 'lucide-react';
import { AIModel } from '../types';

interface LiveEstimatorProps {
  models: AIModel[];
}

const LiveEstimator: React.FC<LiveEstimatorProps> = ({ models }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    text: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateContentWithUsage(selectedModelId, prompt);
      
      const model = models.find(m => m.id === selectedModelId)!;
      // Default pricing if missing (for very basic custom models)
      const inputPrice = model.pricing.inputPricePerMillion || 0;
      const outputPrice = model.pricing.outputPricePerMillion || 0;

      const inputCost = (response.usage.promptTokens / 1_000_000) * inputPrice;
      const outputCost = (response.usage.candidatesTokens / 1_000_000) * outputPrice;
      const totalCost = inputCost + outputCost;

      setResult({
        text: response.text,
        inputTokens: response.usage.promptTokens,
        outputTokens: response.usage.candidatesTokens,
        cost: totalCost
      });
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالـ API. تأكد من صحة المفتاح واتصال الإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in fade-in zoom-in-95 duration-500">
      
      {/* Input Section */}
      <div className="lg:col-span-1 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-400">
          <Terminal className="w-5 h-5" />
          اختبار النص
        </h2>
        
        <div className="mb-4">
           <label className="block text-sm font-medium text-slate-400 mb-2">اختر النموذج</label>
           <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.isCustom ? '(مخصص)' : ''}
                </option>
              ))}
            </select>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="أدخل النص هنا لتجربة النموذج وحساب التكلفة الفعلية..."
          className="flex-1 w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white resize-none focus:ring-2 focus:ring-purple-500 outline-none mb-4 min-h-[200px]"
        />

        <button
          onClick={handleTest}
          disabled={loading || !prompt.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              إرسال وحساب التكلفة
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2 space-y-6">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-300 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!result && !loading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl p-12">
            <Terminal className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">النتائج ستظهر هنا بعد الإرسال</p>
          </div>
        )}

        {result && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Input Tokens</div>
                <div className="text-2xl font-bold text-blue-400 font-mono">{result.inputTokens}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Output Tokens</div>
                <div className="text-2xl font-bold text-green-400 font-mono">{result.outputTokens}</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-xl border border-yellow-500/30">
                <div className="text-sm text-yellow-500/80 mb-1">Total Cost</div>
                <div className="text-2xl font-bold text-yellow-400 font-mono">${result.cost.toFixed(7)}</div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-sm font-bold text-slate-400 mb-4">رد النموذج:</h3>
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                  {result.text}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveEstimator;