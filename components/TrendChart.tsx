import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { YearData } from '../types';
import { BarChart3 } from 'lucide-react';

interface TrendChartProps {
  data: YearData[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.year - b.year);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[380px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            Question Frequency Distribution
        </h3>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Count per Year</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="year" 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                axisLine={false}
                tickLine={false}
                dy={10}
            />
            <YAxis 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tickCount={5}
            />
            <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#ffffff',
                    padding: '8px 12px',
                    color: '#1e293b',
                    fontSize: '12px',
                    fontWeight: '600'
                }}
            />
            <Bar 
                dataKey="questionCount" 
                name="Questions" 
                radius={[4, 4, 4, 4]} 
                barSize={32}
            >
                {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.questionCount > 3 ? '#1e293b' : '#cbd5e1'} />
                ))}
            </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};