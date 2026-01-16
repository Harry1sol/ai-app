import React, { useState, useEffect, useMemo } from 'react';
import { InputSection } from './components/InputSection';
import { TrendChart } from './components/TrendChart';
import { AnalysisTable } from './components/AnalysisTable';
import { ProbabilityCard } from './components/ProbabilityCard';
import { SourceList } from './components/SourceList';
import { SavedAnalysesList } from './components/SavedAnalysesList';
import { generateAnalysis } from './services/apiClient';
import { AnalysisResult, SearchParams, SavedAnalysis } from './types';
import { Sparkles, Brain, AlertTriangle, Save, CheckCircle, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SearchParams | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Load saved analyses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('examTrendSaved');
    if (saved) {
      try {
        setSavedAnalyses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved analyses", e);
      }
    }
  }, []);

  // Check if the current analysis parameters are already in the saved list
  const isAlreadySaved = useMemo(() => {
    if (!params) return false;
    return savedAnalyses.some(item => 
      item.params.exam === params.exam &&
      item.params.level === params.level &&
      item.params.subject === params.subject &&
      item.params.chapter === params.chapter
    );
  }, [params, savedAnalyses]);

  const handleAnalyze = async (searchParams: SearchParams) => {
    setLoading(true);
    setError(null);
    setParams(searchParams);
    
    try {
      const data = await generateAnalysis(searchParams);
      setResult(data);
      setShowSaveSuccess(false); // Reset save state
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result || !params) return;
    
    // Prevent duplicates
    if (isAlreadySaved) {
      return;
    }

    const newSave: SavedAnalysis = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      params: params,
      result: result
    };

    const updatedList = [newSave, ...savedAnalyses];
    setSavedAnalyses(updatedList);
    localStorage.setItem('examTrendSaved', JSON.stringify(updatedList));
    
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    const updatedList = savedAnalyses.filter(item => item.id !== id);
    setSavedAnalyses(updatedList);
    localStorage.setItem('examTrendSaved', JSON.stringify(updatedList));
  };

  const handleLoad = (item: SavedAnalysis) => {
    setParams(item.params);
    setResult(item.result);
    setError(null);
    setShowSaveSuccess(false);
    
    // Smooth scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-blue-50/50 blur-3xl opacity-60"></div>
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-slate-100/50 blur-3xl opacity-60"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-900 p-2 rounded-lg text-white shadow-md shadow-slate-200">
                <Brain className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">ExamTrend AI</h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span>Historical Data</span>
            <span>Probability Cycles</span>
            <span>Predictive Logic</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Input Section */}
        <div className="flex flex-col items-center">
             {!result && (
               <div className="text-center mb-10 max-w-2xl animate-fade-in pt-8">
                  <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                      Predict Your <br className="hidden md:block"/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Next Exam Question</span>
                  </h2>
                  <p className="text-slate-500 text-lg leading-relaxed max-w-lg mx-auto">
                      Real analysis of 660+ UPSC papers, 170+ CBSE papers, and JEE Main archives to predict exam trends.
                  </p>
               </div>
             )}
             
             <InputSection onAnalyze={handleAnalyze} isLoading={loading} />
        </div>

        {/* Saved Analyses List (Only show if no result is active to keep UI clean) */}
        {!loading && savedAnalyses.length > 0 && !result && (
           <SavedAnalysesList items={savedAnalyses} onLoad={handleLoad} onDelete={handleDelete} />
        )}

        {/* Error Message */}
        {error && (
            <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 shadow-sm animate-fade-in">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
            </div>
        )}

        {/* Results Dashboard */}
        {result && params && (
          <div className="animate-fade-in space-y-6">
            
            {/* Result Header & Actions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        {params.chapter}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-500 font-medium">
                      <span>{params.exam}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span>{params.subject}</span>
                      {params.level && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{params.level}</span>
                        </>
                      )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={showSaveSuccess || isAlreadySaved}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all transform active:scale-95 border ${
                            showSaveSuccess || isAlreadySaved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 cursor-default' 
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                        }`}
                    >
                        {showSaveSuccess || isAlreadySaved ? (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                {showSaveSuccess ? 'Analysis Saved' : 'Saved'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Report
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Quick Stats - Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Dataset Volume</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-black text-slate-800">{result.totalQuestionsAnalyzed}</p>
                      <span className="text-sm font-medium text-slate-500">questions</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Dominant Topic</p>
                    <p className="text-lg font-bold text-slate-800 px-2 truncate w-full" title={result.mostFrequentTopic}>
                        {result.mostFrequentTopic}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Analysis Period</p>
                    <p className="text-2xl font-bold text-slate-800">
                        {Math.min(...result.yearWiseData.map(d => d.year))} <span className="text-slate-300 mx-1">–</span> {Math.max(...result.yearWiseData.map(d => d.year))}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Charts and Tables */}
              <div className="lg:col-span-2 space-y-6">
                <TrendChart data={result.yearWiseData} />
                <AnalysisTable data={result.yearWiseData} />
                <SourceList documents={result.sourceDocuments} />
              </div>

              {/* Right Column: Predictions */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-xl flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-indigo-300" />
                            AI Forecast
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed opacity-90">
                            Predictive modeling based on frequency cycles and historical gaps for <strong>{params.chapter}</strong>.
                        </p>
                    </div>
                    {/* Decorative Background */}
                    <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-20px] left-[-20px] w-24 h-24 bg-blue-500 opacity-20 rounded-full blur-2xl"></div>
                </div>

                <div className="space-y-4">
                    {result.predictions.map((pred, idx) => (
                        <ProbabilityCard key={idx} prediction={pred} />
                    ))}
                </div>
              </div>
            </div>
            
            {/* Saved list at bottom */}
            {savedAnalyses.length > 0 && (
                <div className="pt-8 border-t border-slate-200 mt-8">
                    <SavedAnalysesList items={savedAnalyses} onLoad={handleLoad} onDelete={handleDelete} />
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;