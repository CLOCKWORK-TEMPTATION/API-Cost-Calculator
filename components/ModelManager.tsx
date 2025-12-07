
import React, { useState } from 'react';
import { AIModel } from '../types';
import { findModelDetails } from '../services/geminiService';
import { Search, Save, X, Loader2, Database } from 'lucide-react';

interface ModelManagerProps {
  onAddModel: (model: AIModel) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ModelManager: React.FC<ModelManagerProps> = ({ onAddModel, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<AIModel>>({
    id: '',
    name: '',
    description: '',
    contextWindow: 128000,
    pricing: {
      inputPricePerMillion: 0,
      outputPricePerMillion: 0,
      cachedInputPricePerMillion: 0,
      contextCachingStoragePerMillionPerHour: 0
    }
  });

  const handleAutoFill = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const details = await findModelDetails(searchQuery);
      if (details) {
        setFormData(prev => ({
          ...prev,
          ...details,
          id: details.id || searchQuery.toLowerCase().replace(/\s+/g, '-'),
          pricing: {
            ...prev.pricing,
            ...details.pricing
          }
        }));
      }
    } catch (error) {
      alert("فشل البحث عن تفاصيل النموذج. يرجى الإدخال يدوياً.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id && formData.name && formData.pricing) {
      onAddModel({
        id: formData.id,
        name: formData.name,
        description: formData.description || 'Custom Model',
        contextWindow: formData.contextWindow || 128000,
        pricing: formData.pricing as any,
        isCustom: true,
        type: 'multimodal'
      });
      onClose();
      setFormData({
        id: '',
        name: '',
        description: '',
        contextWindow: 128000,
        pricing: { 
          inputPricePerMillion: 0, 
          outputPricePerMillion: 0,
          cachedInputPricePerMillion: 0,
          contextCachingStoragePerMillionPerHour: 0
        }
      });
      setSearchQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Database className="w-5 h-5 text-blue-400" />
            إضافة نموذج جديد
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Auto Search Section */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
            <label className="block text-sm font-medium text-blue-200 mb-2">
              البحث الذكي (تعبئة تلقائية)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="مثال: Gemini 1.5 Pro latest version"
                className="flex-1 bg-slate-950 border border-blue-500/30 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleAutoFill}
                disabled={loading || !searchQuery}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                بحث
              </button>
            </div>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">اسم النموذج (Name)</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">المعرف (Model ID)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., gemini-1.5-pro-002"
                  value={formData.id}
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase text-slate-500 font-bold mb-1">الوصف</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">سعر المدخلات ($/1M)</label>
                <input
                  required
                  type="number"
                  step="0.000001"
                  value={formData.pricing?.inputPricePerMillion}
                  onChange={e => setFormData({
                    ...formData, 
                    pricing: { ...formData.pricing!, inputPricePerMillion: parseFloat(e.target.value) }
                  })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">سعر المخرجات ($/1M)</label>
                <input
                  required
                  type="number"
                  step="0.000001"
                  value={formData.pricing?.outputPricePerMillion}
                  onChange={e => setFormData({
                    ...formData, 
                    pricing: { ...formData.pricing!, outputPricePerMillion: parseFloat(e.target.value) }
                  })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-slate-500 font-bold mb-1">نافذة السياق (Context)</label>
                <input
                  required
                  type="number"
                  value={formData.contextWindow}
                  onChange={e => setFormData({...formData, contextWindow: parseInt(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-blue-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Caching Pricing Inputs */}
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mt-2">
              <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
                <Database className="w-3 h-3 text-emerald-500" />
                أسعار التخزين المؤقت (Context Caching)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-bold mb-1">سعر الكاش (Cached Input $/1M)</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="e.g. 0.875"
                    value={formData.pricing?.cachedInputPricePerMillion || ''}
                    onChange={e => setFormData({
                      ...formData, 
                      pricing: { ...formData.pricing!, cachedInputPricePerMillion: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:border-emerald-500 outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-slate-500 font-bold mb-1">سعر التخزين (Storage $/1M/Hr)</label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="e.g. 4.50"
                    value={formData.pricing?.contextCachingStoragePerMillionPerHour || ''}
                    onChange={e => setFormData({
                      ...formData, 
                      pricing: { ...formData.pricing!, contextCachingStoragePerMillionPerHour: parseFloat(e.target.value) }
                    })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:border-emerald-500 outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-700 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <Save className="w-4 h-4" />
                حفظ النموذج
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModelManager;
