import React from 'react';
import { SavedAnalysis } from '../types';
import { Trash2, Clock, ChevronRight, Bookmark } from 'lucide-react';

interface SavedAnalysesListProps {
  items: SavedAnalysis[];
  onLoad: (item: SavedAnalysis) => void;
  onDelete: (id: string) => void;
}

export const SavedAnalysesList: React.FC<SavedAnalysesListProps> = ({ items, onLoad, onDelete }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 animate-fade-in relative z-10">
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <Bookmark className="w-4 h-4 text-slate-400" />
        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest">Saved Reports</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex justify-between items-center group"
            onClick={() => onLoad(item)}
          >
            <div className="flex-1 pr-4">
              <h4 className="font-bold text-slate-800 text-sm mb-1.5 truncate">{item.params.chapter}</h4>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wide">
                    {item.params.subject}
                 </span>
                 <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                 </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Report"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-2 text-slate-300 group-hover:text-blue-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};