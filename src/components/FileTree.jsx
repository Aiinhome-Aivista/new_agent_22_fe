import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function FileTree({ manifest }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!manifest || !manifest.files) return <div className="text-gray-500 italic">No files available</div>;

  return (
    <div className="bg-gray-50 p-4 rounded border border-border-light space-y-2">
      {manifest.files.map((file, idx) => {
        const isExpanded = expandedIndex === idx;
        return (
          <div key={idx} className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
            <div 
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
              title="Click to view file logic details"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400">📄</span>
                <span className="font-mono text-sm font-bold text-slate-700">{file.filename}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-48 truncate hidden sm:block" title={file.purpose}>{file.purpose}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  file.status === 'generated' ? 'bg-green-100 text-green-700' : 
                  file.status === 'planned' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {file.status || 'planned'}
                </span>
                {isExpanded ? (
                  <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Expandable Description Area */}
            {isExpanded && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 animate-fade-in-up">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">File Logic & Purpose</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {file.purpose}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
