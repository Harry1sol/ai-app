import React from 'react';

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-3 w-full">
          <div className="h-8 w-1/3 bg-slate-100 rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse shrink-0" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
             <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
             <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Skeleton */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[380px] flex flex-col">
             <div className="flex justify-between mb-8">
                <div className="h-5 w-48 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
             </div>
             <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-2">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-full bg-slate-100 rounded-t-sm animate-pulse" style={{ height: `${Math.random() * 50 + 30}%`, opacity: 0.6 }} />
                ))}
             </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between">
                <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
             </div>
             <div className="p-0">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex justify-between p-6 border-b border-slate-50 last:border-0">
                        <div className="h-4 w-12 bg-slate-100 rounded animate-pulse" />
                        <div className="h-8 w-8 bg-slate-100 rounded-lg animate-pulse" />
                        <div className="flex gap-2">
                             <div className="h-6 w-20 bg-slate-100 rounded animate-pulse" />
                             <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
             </div>
          </div>

          {/* Source List Skeleton */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
             </div>
             <div className="p-4 space-y-3">
                {[1, 2].map(i => (
                    <div key={i} className="h-14 w-full bg-slate-50 rounded-xl border border-slate-100 animate-pulse" />
                ))}
             </div>
           </div>
        </div>

        {/* Right Col */}
        <div className="lg:col-span-1 space-y-6">
           {/* Forecast Header Skeleton */}
           <div className="bg-slate-900 rounded-2xl p-6 h-48 shadow-xl shadow-slate-200/50 flex flex-col justify-center space-y-4">
               <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
               <div className="space-y-2">
                   <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                   <div className="h-3 w-4/5 bg-white/10 rounded animate-pulse" />
               </div>
           </div>

           {/* Cards Skeletons */}
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="space-y-2 w-2/3">
                        <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-12 w-12 bg-slate-100 rounded-xl animate-pulse" />
                 </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
                 <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
