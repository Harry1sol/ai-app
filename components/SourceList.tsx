import React from 'react';
import { SourceDocument } from '../types';
import { Download, FileText, ExternalLink, Link2 } from 'lucide-react';

interface SourceListProps {
  documents: SourceDocument[];
}

export const SourceList: React.FC<SourceListProps> = ({ documents }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-slate-800 font-bold text-sm flex items-center gap-2">
          <Link2 className="w-4 h-4 text-slate-400" />
          Source References
        </h3>
      </div>
      
      <div className="p-4 space-y-2">
        {documents.map((doc, index) => (
          <div key={index} className="p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group flex items-center justify-between cursor-default">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 font-bold text-xs shadow-sm">
                {doc.year}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">{doc.examName}</h4>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{doc.sourceLabel}</p>
              </div>
            </div>
            
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="View Source"
              onClick={(e) => {
                  e.preventDefault();
                  alert("This is a demo application. In a production environment, this would initiate a file download.");
              }}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
        {documents.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs italic">
                No specific source documents available.
            </div>
        )}
      </div>
    </div>
  );
};