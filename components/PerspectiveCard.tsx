import React from 'react';
import { PerspectiveNode } from '../types';
import { Loader2, Check, X, ArrowRight, RefreshCw } from 'lucide-react';

interface Props {
  node: PerspectiveNode;
}

export const PerspectiveCard: React.FC<Props> = ({ node }) => {
  const isPending = node.status === 'pending';
  const isLoading = node.status === 'loading' || node.status === 'refining';
  
  return (
    <div className={`
      relative flex flex-col p-6 rounded-lg border transition-all duration-300
      ${isPending ? 'border-border/40 opacity-40' : 'border-border bg-surface'}
      ${node.status === 'success' && !isPending ? 'hover:border-white/40' : ''}
      ${node.status === 'failed' ? 'border-red-900' : ''}
    `}>
      {/* Header */}
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex items-center justify-between">
           <h3 className="font-semibold text-sm text-white">{node.name}</h3>
           {/* Status Indicator */}
           {isLoading && <Loader2 size={14} className="animate-spin text-subtle" />}
           {node.status === 'success' && <div className="w-2 h-2 rounded-full bg-white"></div>}
           {node.status === 'failed' && <div className="w-2 h-2 rounded-full bg-red-500"></div>}
        </div>
        <p className="text-xs text-subtle">{node.description}</p>
      </div>

      {/* Body Content */}
      <div className="flex-1 min-h-[140px] text-sm leading-relaxed text-gray-300 font-mono">
        {isLoading && !node.initialThought ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-subtle animate-pulse">Computing perspective...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* The Thought */}
            <div className={`text-xs ${node.refinedThought ? 'opacity-50 line-through decoration-subtle' : ''}`}>
               {node.initialThought || "..."}
            </div>

            {/* Audit Result */}
            {node.audit && (
              <div className="flex items-center gap-2 text-[10px] border-t border-border pt-3 mt-2">
                <span className={`font-bold ${node.audit.status === 'SMART' ? 'text-white' : 'text-subtle'}`}>
                  AUDIT: {node.audit.status}
                </span>
                <span className="text-subtle truncate">— {node.audit.reasoning}</span>
              </div>
            )}

            {/* Refined Thought (If Audit Failed) */}
            {node.refinedThought && (
               <div className="pt-2 animate-in fade-in duration-500">
                 <div className="flex items-center gap-1 text-[10px] text-accent mb-1 font-bold">
                   <RefreshCw size={10} /> REFINED LOGIC
                 </div>
                 <div className="text-xs text-white border-l-2 border-accent pl-3">
                    {node.refinedThought}
                 </div>
               </div>
            )}
            
            {/* Loading State for refinement */}
            {node.status === 'refining' && (
              <div className="text-[10px] text-subtle flex items-center gap-2">
                <Loader2 size={10} className="animate-spin" /> Self-correcting...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};