
import React, { useState, useMemo } from 'react';
import { AIModel } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Layers, Zap, Calculator as CalcIcon, AlertTriangle, Download, FileText, Video, Database, Coins } from 'lucide-react';

interface ManualCalculatorProps {
  models: AIModel[];
}

const ManualCalculator: React.FC<ManualCalculatorProps> = ({ models }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');
  
  // Basic Text Inputs
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(500);
  const [requestCount, setRequestCount] = useState<number>(1);
  
  // Media Inputs
  const [audioMinutes, setAudioMinutes] = useState<number>(0);
  const [videoMinutes, setVideoMinutes] = useState<number>(0);
  const [generatedImages, setGeneratedImages] = useState<number>(0);

  // Caching Inputs
  const [isCached, setIsCached] = useState<boolean>(false);
  const [storageHours, setStorageHours] = useState<number>(0);
  
  // Budget
  const [budget, setBudget] = useState<number>(10.00);

  // Helper
  const [wordCount, setWordCount] = useState<number>(0);

  const selectedModel = models.find(m => m.id === selectedModelId) || models[0];

  React.useEffect(() => {
    if (!models.find(m => m.id === selectedModelId)) {
      setSelectedModelId(models[0]?.id || '');
    }
  }, [models, selectedModelId]);

  // Conversion Rates (Approximate for Gemini)
  const VIDEO_TOKENS_PER_MIN = 258 * 60; 
  const AUDIO_TOKENS_PER_MIN = 32 * 60;

  const calculateCostDetails = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (!model) return { inputCost: 0, outputCost: 0, storageCost: 0, total: 0, imageGenCost: 0, videoGenCost: 0 };

    // 1. Calculate Total Input Tokens
    let totalInputTokens = inputTokens;
    if (model.type === 'multimodal' || model.type === 'text') {
      totalInputTokens += (audioMinutes * AUDIO_TOKENS_PER_MIN);
      totalInputTokens += (videoMinutes * VIDEO_TOKENS_PER_MIN);
    }

    // 2. Determine Pricing Tier (Cached vs Standard)
    const inputPrice = (isCached && model.pricing.cachedInputPricePerMillion) 
      ? model.pricing.cachedInputPricePerMillion 
      : model.pricing.inputPricePerMillion;

    // 3. Calculate Operation Costs
    const inputCost = (totalInputTokens / 1_000_000) * inputPrice;
    const outputCost = (outputTokens / 1_000_000) * model.pricing.outputPricePerMillion;
    
    // 4. Generation Costs
    const imageGenCost = generatedImages * (model.pricing.pricePerImage || 0);
    const videoGenCost = 0; // Placeholder if video generation pricing is added later

    // 5. Storage Costs (if Cached)
    const storageCost = isCached && model.pricing.contextCachingStoragePerMillionPerHour
      ? (totalInputTokens / 1_000_000) * model.pricing.contextCachingStoragePerMillionPerHour * storageHours
      : 0;

    const costPerRequest = inputCost + outputCost + imageGenCost + videoGenCost;
    const totalOpsCost = costPerRequest * requestCount;

    return {
      inputCost: inputCost * requestCount,
      outputCost: outputCost * requestCount,
      imageGenCost: imageGenCost * requestCount,
      videoGenCost: videoGenCost * requestCount,
      storageCost,
      total: totalOpsCost + storageCost
    };
  };

  const convertWordsToTokens = () => {
    const estimated = Math.ceil(wordCount * 1.35);
    setInputTokens(estimated);
  };

  const chartData = useMemo(() => {
    return models.map(model => ({
      name: model.name,
      cost: calculateCostDetails(model.id).total,
      isCustom: model.isCustom
    }));
  }, [inputTokens, outputTokens, requestCount, audioMinutes, videoMinutes, generatedImages, isCached, storageHours, models]);

  const details = selectedModel ? calculateCostDetails(selectedModel.id) : { inputCost: 0, outputCost: 0, storageCost: 0, total: 0, imageGenCost: 0, videoGenCost: 0 };
  const currentCost = details.total;
  
  const isOverBudget = currentCost > budget;
  const budgetPercentage = Math.min((currentCost / budget) * 100, 100);

  const formatCurrency = (val: number) => {
    if (val === 0) return '$0.00';
    if (val < 0.01) return `$${val.toFixed(7)}`;
    return `$${val.toFixed(4)}`;
  };

  const handleExportCSV = () => {
    const headers = ["Model", "Total Cost", "Input Cost", "Output Cost", "Storage Cost", "Cached"];
    const rows = models.map(m => {
      const d = calculateCostDetails(m.id);
      return [
        m.name,
        d.total.toFixed(6),
        d.inputCost.toFixed(6),
        d.outputCost.toFixed(6),
        d.storageCost.toFixed(6),
        isCached ? "Yes" : "No"
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gemini_cost_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!selectedModel) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Settings Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
            <Layers className="w-5 h-5" />
            إعدادات الحساب
          </h2>

          <div className="space-y-6">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">النموذج (Model)</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.releaseDate ? `(${m.releaseDate})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Helper: Words to Tokens */}
            <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600/50 flex items-center gap-2">
              <CalcIcon className="w-4 h-4 text-yellow-400" />
              <input 
                type="number" 
                placeholder="عدد الكلمات..." 
                value={wordCount || ''}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 placeholder-slate-500"
              />
              <button 
                onClick={convertWordsToTokens}
                className="text-xs bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded text-white"
              >
                تحويل لتوكنز
              </button>
            </div>

            {/* Basic Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Input Tokens</label>
                <input
                  type="number"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Output Tokens</label>
                <input
                  type="number"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Media Inputs */}
            {selectedModel.type !== 'image' && (
              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4" /> الوسائط المتعددة (Multimodal)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">فيديو (دقائق)</label>
                    <input
                      type="number"
                      min="0"
                      value={videoMinutes}
                      onChange={(e) => setVideoMinutes(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">صوت (دقائق)</label>
                    <input
                      type="number"
                      min="0"
                      value={audioMinutes}
                      onChange={(e) => setAudioMinutes(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Generation Inputs (if supported) */}
            {(selectedModel.type === 'image' || selectedModel.id.includes('imagen')) && (
              <div className="border-t border-slate-700 pt-4">
                 <label className="block text-sm font-medium text-slate-400 mb-2">توليد الصور (عدد الصور)</label>
                 <input
                    type="number"
                    min="0"
                    value={generatedImages}
                    onChange={(e) => setGeneratedImages(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:border-pink-500"
                  />
              </div>
            )}

            {/* Caching & Requests */}
            <div className="border-t border-slate-700 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <label className="text-sm text-slate-300">Context Caching</label>
                </div>
                <input 
                  type="checkbox" 
                  checked={isCached} 
                  onChange={(e) => setIsCached(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 accent-emerald-500"
                />
              </div>
              
              {isCached && (
                 <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs text-slate-400 mb-1">مدة التخزين (ساعات)</label>
                    <input
                      type="number"
                      min="0"
                      value={storageHours}
                      onChange={(e) => setStorageHours(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white"
                    />
                    <p className="text-[10px] text-emerald-400/80 mt-1">
                       * يتم تطبيق سعر الكاش المخفض على المدخلات، وتضاف تكلفة التخزين بالساعة.
                    </p>
                 </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-1">عدد الطلبات (Requests)</label>
                <input
                  type="number"
                  min="1"
                  value={requestCount}
                  onChange={(e) => setRequestCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Cost & Budget Card */}
        <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all ${isOverBudget ? 'bg-red-950/30 border-red-500/50' : 'bg-gradient-to-br from-blue-900/40 to-slate-900/40 border-blue-500/30'}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-slate-400 font-medium mb-1">التكلفة الإجمالية التقديرية</h3>
              <div className={`text-5xl font-bold font-mono ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
                {formatCurrency(currentCost)}
              </div>
              
              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs text-slate-400 border-t border-slate-700/50 pt-3">
                 <div className="flex flex-col">
                    <span className="mb-1">Input</span>
                    <span className="text-slate-200 font-mono">{formatCurrency(details.inputCost)}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="mb-1">Output</span>
                    <span className="text-slate-200 font-mono">{formatCurrency(details.outputCost)}</span>
                 </div>
                 {isCached && (
                    <div className="flex flex-col text-emerald-400">
                        <span className="mb-1">Storage</span>
                        <span className="font-mono">{formatCurrency(details.storageCost)}</span>
                    </div>
                 )}
                 {details.imageGenCost > 0 && (
                    <div className="flex flex-col text-pink-400">
                        <span className="mb-1">Images</span>
                        <span className="font-mono">{formatCurrency(details.imageGenCost)}</span>
                    </div>
                 )}
              </div>
            </div>
            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700">
               <Coins className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* Budget Progress */}
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">الميزانية: {formatCurrency(budget)}</span>
              <span className={isOverBudget ? "text-red-400 font-bold" : "text-emerald-400"}>
                {budgetPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-4">
            <div className="flex-1">
               <label className="text-xs text-slate-500 block mb-1">ضبط الميزانية</label>
               <input 
                 type="number" 
                 value={budget} 
                 onChange={(e) => setBudget(Number(e.target.value))}
                 className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-xs text-white"
               />
            </div>
          </div>
        </div>

        {/* Charts & Actions */}
        <div className="grid grid-cols-1 gap-6">
           <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 h-[350px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> مقارنة النماذج
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"
                >
                  <Download className="w-3 h-3" /> CSV
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"
                >
                  <FileText className="w-3 h-3" /> Print
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  interval={0}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  formatter={(value: number) => [formatCurrency(value), 'التكلفة']}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === selectedModel.name ? '#3b82f6' : (entry.isCustom ? '#8b5cf6' : '#475569')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualCalculator;
