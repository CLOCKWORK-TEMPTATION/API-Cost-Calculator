
import React, { useState, useEffect } from 'react';
import ManualCalculator from './components/ManualCalculator';
import LiveEstimator from './components/LiveEstimator';
import ModelManager from './components/ModelManager';
import Arena from './components/Arena';
import { CostShadow } from './components/CostShadow';
import { AIConsultant } from './components/AIConsultant';
import { BudgetManager } from './components/BudgetManager';
import { NAV_ITEMS, MODELS as DEFAULT_MODELS } from './constants';
import { Calculator, Zap, Gem, PlusCircle, SplitSquareHorizontal, TrendingUp, Lightbulb, DollarSign } from 'lucide-react';
import { AIModel } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [models, setModels] = useState<AIModel[]>(() => {
    const saved = localStorage.getItem('gemini_custom_models');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const customModels = parsed.filter((m: AIModel) => m.isCustom);
        return [...DEFAULT_MODELS, ...customModels];
      } catch (e) {
        return DEFAULT_MODELS;
      }
    }
    return DEFAULT_MODELS;
  });
  
  const [isModelManagerOpen, setIsModelManagerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('gemini_custom_models', JSON.stringify(models));
  }, [models]);

  const handleAddModel = (newModel: AIModel) => {
    setModels(prev => {
      if (prev.find(m => m.id === newModel.id)) return prev;
      return [...prev, newModel];
    });
  };

  const handleResetModels = () => {
    if (confirm('هل أنت متأكد من حذف النماذج المخصصة والعودة للوضع الافتراضي؟')) {
      setModels(DEFAULT_MODELS);
      localStorage.removeItem('gemini_custom_models');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans print:bg-white print:text-black">
      <ModelManager 
        isOpen={isModelManagerOpen} 
        onClose={() => setIsModelManagerOpen(false)} 
        onAddModel={handleAddModel} 
      />

      {/* Header - Hidden in Print */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Gemini Cost Calc
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">حاسبة تكاليف الذكاء الاصطناعي</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsModelManagerOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/50 text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-all"
                >
                  <PlusCircle className="w-3 h-3" />
                  إضافة نموذج
                </button>
                {models.length > DEFAULT_MODELS.length && (
                   <button
                    onClick={handleResetModels}
                    className="text-xs text-red-400 hover:text-red-300 underline px-2"
                  >
                    استعادة الافتراضي
                  </button>
                )}
             </div>

            <nav className="flex items-center bg-slate-800/80 p-1 rounded-lg gap-1 flex-wrap">
              {NAV_ITEMS.map((item) => {
                let Icon = Calculator;
                if (item.icon === 'Zap') Icon = Zap;
                if (item.icon === 'SplitSquareHorizontal') Icon = SplitSquareHorizontal;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${activeTab === item.id
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}

              <div className="w-full sm:w-auto sm:border-l border-slate-700 sm:pl-1 sm:ml-1 flex gap-1">
                <button
                  onClick={() => setActiveTab('shadow')}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200
                    ${activeTab === 'shadow'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }
                  `}
                  title="Cost Shadow Simulator"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden lg:inline">Shadow</span>
                </button>

                <button
                  onClick={() => setActiveTab('consultant')}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200
                    ${activeTab === 'consultant'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }
                  `}
                  title="AI Cost Consultant"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden lg:inline">AI</span>
                </button>

                <button
                  onClick={() => setActiveTab('budget')}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200
                    ${activeTab === 'budget'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }
                  `}
                  title="Budget Manager"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden lg:inline">Budget</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 print:p-0 print:w-full">
        <div className="max-w-6xl mx-auto print:max-w-none">
          {activeTab === 'calculator' && <ManualCalculator models={models} />}
          {activeTab === 'live' && <LiveEstimator models={models} />}
          {activeTab === 'arena' && <Arena models={models} />}
          {activeTab === 'shadow' && <CostShadow />}
          {activeTab === 'consultant' && <AIConsultant />}
          {activeTab === 'budget' && <BudgetManager />}
        </div>
      </main>

      {/* Footer - Hidden in Print */}
      <footer className="border-t border-slate-800 py-6 mt-auto print:hidden">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>
            تنويه: الأسعار تقريبية بناءً على البيانات الرسمية لـ Google Gemini API. قد تختلف الأسعار الفعلية.
          </p>
          <p className="mt-2 opacity-50 text-xs">Built with React & Gemini SDK</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
