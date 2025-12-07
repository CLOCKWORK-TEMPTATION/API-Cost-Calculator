import React, { useState, useEffect } from 'react';
import { GitBranch, AlertTriangle, TrendingUp, DollarSign, Code, FileText, ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { PullRequestCostAnalysis, FileCostChange, APICallChange, CostImpact, CostRecommendation } from '../types';

const PRCostDiff: React.FC = () => {
  const [analysis, setAnalysis] = useState<PullRequestCostAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [repoUrl, setRepoUrl] = useState('');
  const [prNumber, setPrNumber] = useState('');
  const [baseBranch, setBaseBranch] = useState('main');
  const [headBranch, setHeadBranch] = useState('feature/branch');

  const mockAnalysis: PullRequestCostAnalysis = {
    id: 'pr-123',
    title: 'Add AI-powered chat feature with cost optimization',
    baseBranch: 'main',
    headBranch: 'feature/ai-chat',
    filesChanged: [
      {
        filePath: 'src/components/ChatInterface.tsx',
        changeType: 'added',
        addedLines: 245,
        deletedLines: 0,
        apiCallChanges: [
          {
            line: 45,
            type: 'added',
            newCall: 'const response = await gemini.generateContent(prompt);',
            modelChange: 'gemini-2.5-flash',
            tokenEstimate: { input: 150, output: 80 },
            costDelta: 0.0125
          },
          {
            line: 78,
            type: 'added',
            newCall: 'const embedding = await textEmbedding.embed(content);',
            modelChange: 'text-embedding-004',
            tokenEstimate: { input: 200, output: 0 },
            costDelta: 0.005
          }
        ],
        costImpact: 0.0175,
        riskFactors: ['New API endpoints', 'No caching implemented', 'High token usage']
      },
      {
        filePath: 'src/services/api.ts',
        changeType: 'modified',
        addedLines: 67,
        deletedLines: 23,
        apiCallChanges: [
          {
            line: 112,
            type: 'modified',
            oldCall: 'gemini-2.0-flash',
            newCall: 'gemini-2.5-pro',
            modelChange: 'gemini-2.5-pro',
            tokenEstimate: { input: 300, output: 150 },
            costDelta: 0.045
          }
        ],
        costImpact: 0.045,
        riskFactors: ['Model upgrade to premium tier', 'Increased token usage']
      },
      {
        filePath: 'src/utils/cost-monitor.ts',
        changeType: 'added',
        addedLines: 89,
        deletedLines: 0,
        apiCallChanges: [],
        costImpact: -0.008,
        riskFactors: ['Monitoring overhead']
      }
    ],
    totalCostImpact: {
      estimatedDailyCost: 2.45,
      estimatedMonthlyCost: 73.50,
      costChangePercentage: 15.8,
      confidenceLevel: 0.87
    },
    riskLevel: 'medium',
    recommendations: [
      {
        id: 'rec-1',
        title: 'Implement response caching',
        description: 'Cache chat responses for 30 minutes to reduce repeated API calls',
        category: 'caching',
        estimatedSavings: 35.2,
        implementationDifficulty: 'medium',
        codeSuggestion: `// Add caching layer
const cache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCachedResponse(prompt: string): string | null {
  const cached = cache.get(prompt);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }
  return null;
}`,
        priority: 1
      },
      {
        id: 'rec-2',
        title: 'Use batch embedding generation',
        description: 'Batch multiple text embeddings into single API call',
        category: 'batching',
        estimatedSavings: 22.8,
        implementationDifficulty: 'easy',
        codeSuggestion: `// Batch embeddings
const embeddings = await textEmbedding.embedBatch(texts);
// Instead of individual calls for each text`,
        priority: 2
      }
    ],
    timestamp: new Date().toISOString()
  };

  const simulateAnalysis = () => {
    setLoading(true);
    setTimeout(() => {
      setAnalysis(mockAnalysis);
      setLoading(false);
    }, 2000);
  };

  const toggleFileExpansion = (filePath: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath);
    } else {
      newExpanded.add(filePath);
    }
    setExpandedFiles(newExpanded);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-800';
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!analysis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <GitBranch className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Git-aware Cost Diff</h2>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            Pull Request Cost Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                PR Number
              </label>
              <input
                type="text"
                value={prNumber}
                onChange={(e) => setPrNumber(e.target.value)}
                placeholder="123"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Base Branch
              </label>
              <input
                type="text"
                value={baseBranch}
                onChange={(e) => setBaseBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Head Branch
              </label>
              <input
                type="text"
                value={headBranch}
                onChange={(e) => setHeadBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={simulateAnalysis}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing changes...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Analyze PR Cost Impact
              </>
            )}
          </button>
        </div>

        <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
          <h4 className="font-medium mb-2 text-slate-300">How it works:</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Analyzes code changes in your Pull Request</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Detects API calls and model usage patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Estimates cost impact before merging</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Provides optimization recommendations</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GitBranch className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">PR Cost Analysis</h2>
        </div>
        <button
          onClick={() => setAnalysis(null)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
        >
          New Analysis
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Daily Cost Impact</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${analysis.totalCostImpact.estimatedDailyCost.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {analysis.totalCostImpact.costChangePercentage > 0 ? '+' : ''}{analysis.totalCostImpact.costChangePercentage.toFixed(1)}% change
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Monthly Impact</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${analysis.totalCostImpact.estimatedMonthlyCost.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            30-day projection
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Risk Level</span>
            {getRiskIcon(analysis.riskLevel)}
          </div>
          <div className={`text-lg font-bold px-2 py-1 rounded border ${getRiskColor(analysis.riskLevel)}`}>
            {analysis.riskLevel.toUpperCase()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {(analysis.totalCostImpact.confidenceLevel * 100).toFixed(0)}% confidence
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Files Changed</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {analysis.filesChanged.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {analysis.filesChanged.reduce((sum, f) => sum + f.addedLines + f.deletedLines, 0)} total lines
          </div>
        </div>
      </div>

      {/* Files Analysis */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">File-by-File Analysis</h3>
        <div className="space-y-3">
          {analysis.filesChanged.map((file) => (
            <div key={file.filePath} className="border border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFileExpansion(file.filePath)}
                className="w-full px-4 py-3 bg-slate-900/50 hover:bg-slate-900/70 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {expandedFiles.has(file.filePath) ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-medium text-white">{file.filePath}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    file.changeType === 'added' ? 'bg-green-900/30 text-green-400' :
                    file.changeType === 'modified' ? 'bg-blue-900/30 text-blue-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {file.changeType}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-400">
                    +{file.addedLines} -{file.deletedLines}
                  </span>
                  <span className={`text-sm font-medium ${
                    file.costImpact > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {file.costImpact > 0 ? '+' : ''}${file.costImpact.toFixed(4)}
                  </span>
                </div>
              </button>

              {expandedFiles.has(file.filePath) && (
                <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700">
                  {/* API Call Changes */}
                  {file.apiCallChanges.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-2">API Call Changes</h4>
                      <div className="space-y-2">
                        {file.apiCallChanges.map((change, idx) => (
                          <div key={idx} className="bg-slate-900/50 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-400">Line {change.line}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                change.type === 'added' ? 'bg-green-900/30 text-green-400' :
                                change.type === 'modified' ? 'bg-blue-900/30 text-blue-400' :
                                'bg-red-900/30 text-red-400'
                              }`}>
                                {change.type}
                              </span>
                            </div>
                            {change.oldCall && (
                              <div className="text-xs text-red-400 mb-1 font-mono">- {change.oldCall}</div>
                            )}
                            {change.newCall && (
                              <div className="text-xs text-green-400 mb-2 font-mono">+ {change.newCall}</div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                              <span>Input: {change.tokenEstimate.input} tokens</span>
                              <span>Output: {change.tokenEstimate.output} tokens</span>
                              <span className={`font-medium ${
                                change.costDelta > 0 ? 'text-red-400' : 'text-green-400'
                              }`}>
                                Δ${change.costDelta.toFixed(4)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {file.riskFactors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Risk Factors</h4>
                      <div className="flex flex-wrap gap-2">
                        {file.riskFactors.map((factor, idx) => (
                          <span key={idx} className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Optimization Recommendations</h3>
        <div className="space-y-4">
          {analysis.recommendations.map((rec) => (
            <div key={rec.id} className="border border-slate-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white mb-1">{rec.title}</h4>
                  <p className="text-sm text-slate-400">{rec.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    ${rec.estimatedSavings.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500">potential savings</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                <span className={`px-2 py-1 rounded text-xs ${
                  rec.category === 'caching' ? 'bg-blue-900/30 text-blue-400' :
                  rec.category === 'batching' ? 'bg-purple-900/30 text-purple-400' :
                  'bg-gray-900/30 text-gray-400'
                }`}>
                  {rec.category}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  rec.implementationDifficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                  rec.implementationDifficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-red-900/30 text-red-400'
                }`}>
                  {rec.implementationDifficulty}
                </span>
                <span className="text-xs text-slate-500">Priority: {rec.priority}</span>
              </div>

              {rec.codeSuggestion && (
                <div className="bg-slate-900/50 rounded p-3">
                  <h5 className="text-xs font-medium text-slate-400 mb-2">Implementation Example:</h5>
                  <pre className="text-xs text-green-400 font-mono overflow-x-auto">
                    {rec.codeSuggestion}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PRCostDiff;
