
import React, { useState } from 'react';
import { AIModel } from '../types';
import { generateContentWithUsage } from '../services/geminiService';
import { SplitSquareHorizontal, Send, Loader2, Trophy } from 'lucide-react';

interface ArenaProps {
  models: AIModel[];
}

const Arena: React.FC<ArenaProps> = ({ models }) => {
  const [modelAId, setModelAId] = useState(models[0]?.id || '');
  const [modelBId, setModelBId] = useState(models[1]?.id || models[0]?.id || '');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [resultA, setResultA] = useState<any>(null);
  const [resultB, setResultB] = useState<any>(null);

  const handleCompare = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResultA(null);
    setResultB(null);

    // Run in parallel
    const p1 = generateContentWithUsage(modelAId, prompt).catch(e => ({ error: e.message, text: '' }));
    const p2 = generateContentWithUsage(modelBId, prompt).catch(e => ({ error: e.message, text: '' }));

    const [resA, resB] = await Promise.all([p1, p2]);

    setResultA(resA);
    setResultB(resB);
    setLoading(false);
  };

  const getCost = (modelId: string, usage: any) => {
    if (!usage) return 0;
    const m = models.find(mod => mod.id === modelId);
    if (!m) return 0;
    const input = (usage.promptTokens / 1_000_000) * m.pricing.inputPricePerMillion;
    const output = (usage.candidatesTokens / 1_000_000) * m.pricing.outputPricePerMillion;
    return input + output;
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-4 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">المتنافس الأول (Model A)</label>
          <select 
            value={modelAId} 
            onChange={(e) => setModelAId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
          >
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="flex items-center pb-2 text-slate-500 font-bold">VS</div>
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">المتنافس الثاني (Model B)</label>
          <select 
             value={modelBId} 
             onChange={(e) => setModelBId(e.target.value)}
             className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white"
          >
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="أدخل نص التحدي هنا..."
          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          onClick={handleCompare}
          disabled={loading || !prompt}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <SplitSquareHorizontal />}
          مقارنة
        </button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden min-h-0">
        {/* Result A */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
             <span className="font-bold text-blue-400">Model A</span>
             {resultA && !resultA.error && (
               <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                 ${getCost(modelAId, resultA.usage).toFixed(7)}
               </span>
             )}
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            {loading && <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-blue-500" /></div>}
            {resultA?.error && <div className="text-red-400 text-sm">{resultA.error}</div>}
            {resultA?.text && <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{resultA.text}</p>}
          </div>
        </div>

        {/* Result B */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-700 flex flex-col overflow-hidden relative">
          <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
             <span className="font-bold text-purple-400">Model B</span>
             {resultB && !resultB.error && (
               <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                 ${getCost(modelBId, resultB.usage).toFixed(7)}
               </span>
             )}
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
             {loading && <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-purple-500" /></div>}
             {resultB?.error && <div className="text-red-400 text-sm">{resultB.error}</div>}
             {resultB?.text && <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{resultB.text}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Arena;
