import React, { useState } from 'react';
import { SearchParams } from '../types';
import { Search, BookOpen, GraduationCap, FileText, Layers, ArrowRight } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (params: SearchParams) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [formData, setFormData] = useState<SearchParams>({
    exam: '',
    level: '',
    subject: '',
    chapter: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.exam && formData.subject && formData.chapter) {
      onAnalyze(formData);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 relative z-10">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* Header Strip */}
        <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
          <h2 className="text-slate-800 font-bold text-base flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            Analysis Configuration
          </h2>
          <span className="text-slate-500 text-[10px] uppercase tracking-wider font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            Historical Scanner
          </span>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div className="space-y-2 group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
              <GraduationCap className="w-3.5 h-3.5" />
              Examination Name
            </label>
            <input
              type="text"
              name="exam"
              value={formData.exam}
              onChange={handleChange}
              placeholder="e.g. NEET PG, CA Foundation"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
              <Layers className="w-3.5 h-3.5" />
              Level / Year
            </label>
            <input
              type="text"
              name="level"
              value={formData.level}
              onChange={handleChange}
              placeholder="e.g. Final Year, Class 12"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Physics, Law, Anatomy"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 group-focus-within:text-blue-600 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Chapter / Unit
            </label>
            <input
              type="text"
              name="chapter"
              value={formData.chapter}
              onChange={handleChange}
              placeholder="e.g. Thermodynamics, Contract Act"
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
              required
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-base text-white shadow-lg shadow-slate-200 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-slate-900 hover:bg-slate-800 hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing Analysis...</span>
                </>
              ) : (
                <>
                  Generate Trend Report
                  <ArrowRight className="w-4 h-4 opacity-80" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};