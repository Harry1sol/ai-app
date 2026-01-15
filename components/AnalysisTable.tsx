import React from 'react';
import { YearData } from '../types';
import { FileText, Tag } from 'lucide-react';

interface AnalysisTableProps {
  data: YearData[];
}

export const AnalysisTable: React.FC<AnalysisTableProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => b.year - a.year);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Detailed Breakdown
        </h3>
        <span className="text-xs text-slate-500 font-medium">Last 7 Years</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-slate-500 text-[10px] uppercase tracking-widest font-bold w-24">Year</th>
              <th className="px-6 py-3 text-slate-500 text-[10px] uppercase tracking-widest font-bold text-center w-24">Volume</th>
              <th className="px-6 py-3 text-slate-500 text-[10px] uppercase tracking-widest font-bold">Extracted Concepts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((row) => (
              <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">
                  {row.year}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
                    row.questionCount > 2 
                        ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' 
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    {row.questionCount}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {row.topics.map((topic, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-600">
                        <Tag className="w-3 h-3 text-slate-300" />
                        {topic}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};