import React from 'react';
import { TopicPrediction } from '../types';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface ProbabilityCardProps {
  prediction: TopicPrediction;
}

export const ProbabilityCard: React.FC<ProbabilityCardProps> = ({ prediction }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
      case 'down': return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
      default: return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getProbabilityStyles = (prob: number) => {
    if (prob >= 80) return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        bar: 'bg-emerald-500',
        ring: 'ring-emerald-100'
    };
    if (prob >= 50) return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        bar: 'bg-amber-500',
        ring: 'ring-amber-100'
    };
    return {
        text: 'text-slate-600',
        bg: 'bg-slate-50',
        bar: 'bg-slate-400',
        ring: 'ring-slate-200'
    };
  };

  const styles = getProbabilityStyles(prediction.probability);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-3">
          <h4 className="font-bold text-slate-800 text-base leading-tight mb-2">{prediction.topic}</h4>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {getTrendIcon(prediction.trend)}
            {prediction.trend} Trend
          </span>
        </div>
        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl ring-1 ${styles.ring} ${styles.bg}`}>
            <span className={`text-sm font-black ${styles.text}`}>{prediction.probability}%</span>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${styles.bar}`} 
          style={{ width: `${prediction.probability}%` }}
        ></div>
      </div>

      <div className="flex gap-2.5 items-start">
        <Info className="w-4 h-4 min-w-[16px] mt-0.5 text-slate-300" />
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {prediction.logic}
        </p>
      </div>
    </div>
  );
};