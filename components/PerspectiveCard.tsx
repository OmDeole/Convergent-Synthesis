import React from 'react';
import { PerspectiveNode } from '../types';
import { Loader2, Check, X, ArrowRight, RefreshCw, ScanEye, BrainCircuit, ShieldAlert } from 'lucide-react';

interface Props {
  node: PerspectiveNode;
}

export const PerspectiveCard: React.FC<Props> = ({ node }) => {
  const isPending = node.status === 'pending';
  // Detailed state derivation
  const isGenerating = node.status === 'loading' && !node.initialThought;
  const isAuditing = node.status === 'loading' && node.initialThought && !node.audit;
  const isRefining = node.status === 'refining';
  const isSuccess = node.status === 'success';
  const isFailed = node.status === 'failed';

  return (
    <div className={`
      relative flex flex-col p-5 rounded-lg border transition-all duration-300 overflow-hidden h-full
      ${isPending ? 'border-border/30 opacity-30 bg-transparent' : 'border-border bg-surface'}
      ${isSuccess ? 'border-border hover:border-white/20' : ''}
      ${isFailed ? 'border-red-900/50' : ''}
    `}>
      {/* Header */}
      <div className="flex flex-col gap-1 mb-4 z-10">
        <div className="flex items-center justify-between">
           <h3 className="font-semibold text-sm text-white flex items-center gap-2">
             {node.name}
           </h3>
           {/* Status Icons */}
           <div className="flex gap-2">
             {isGenerating && <Loader2 size={14} className="animate-spin text-subtle" />}
             {isAuditing && <ScanEye size={14} className="animate-pulse text-white" />}
             {isRefining && <RefreshCw size={14} className="animate-spin text-white" />}
             {isSuccess && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>}
             {isFailed && <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>}
           </div>
        </div>
        <p className="text-[11px] text-subtle leading-tight h-8 line-clamp-2">{node.description}</p>
      </div>

      {/* Body Content */}
      <div className="flex-1 text-sm leading-relaxed text-gray-300 font-mono flex flex-col z-10 relative">
        
        {/* State: Pending */}
        {isPending && (
          <div className="flex-1 flex items-center justify-center text-subtle/50 text-[10px] uppercase tracking-widest">
            Pending...
          </div>
        )}

        {/* State: Generating */}
        {isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300 py-8">
            <BrainCircuit size={20} className="text-subtle animate-pulse" />
            <span className="text-[10px] text-subtle uppercase tracking-widest animate-pulse">Synthesizing...</span>
          </div>
        )}

        {/* State: Content Available */}
        {(node.initialThought || isRefining || isSuccess) && !isGenerating && !isPending && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-2">
            
            {/* Initial Thought */}
            <div className={`relative transition-opacity duration-300 ${node.refinedThought ? 'opacity-40 grayscale' : ''}`}>
              <div className="text-[11px] leading-5 text-gray-300 pl-2 border-l border-white/10">
                {node.initialThought}
              </div>
              
              {/* Rejected Badge */}
              {node.refinedThought && (
                 <div className="absolute top-0 right-0 -mt-1 -mr-1">
                   <ShieldAlert size={12} className="text-red-500" />
                 </div>
              )}
            </div>

            {/* Auditing State Overlay */}
            {isAuditing && (
              <div className="flex flex-col gap-2 py-2 border-t border-white/5 mt-2 animate-in fade-in duration-300">
                 <div className="flex items-center gap-2 text-white">
                   <ScanEye size={12} className="animate-pulse" />
                   <span className="text-[10px] font-semibold uppercase tracking-wider">Auditing...</span>
                 </div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-white/50 w-1/3 animate-progress-indeterminate"></div>
                 </div>
              </div>
            )}

            {/* Audit Result */}
            {node.audit && (
              <div className={`group flex flex-col gap-1.5 text-[10px] border-t border-white/5 pt-2 mt-1 ${isAuditing ? 'hidden' : 'block'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-subtle font-medium">AUDIT VERDICT</span>
                  <span className={`font-bold px-1.5 py-px rounded-[2px] text-[9px] ${
                    node.audit.status === 'SMART' 
                      ? 'bg-white text-black border border-white' 
                      : 'bg-transparent text-red-400 border border-red-900'
                  }`}>
                    {node.audit.status}
                  </span>
                </div>
                <span className="text-gray-500 leading-4">{node.audit.reasoning}</span>
              </div>
            )}

            {/* Refining State */}
            {isRefining && (
              <div className="pt-2 flex flex-col gap-2 animate-in fade-in duration-300">
                 <div className="flex items-center gap-2 text-white/80">
                   <Loader2 size={12} className="animate-spin" />
                   <span className="text-[10px] font-medium uppercase tracking-wider">Self-Correcting...</span>
                 </div>
              </div>
            )}

            {/* Refined Thought */}
            {node.refinedThought && (
               <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="flex items-center gap-1.5 text-[10px] text-white mb-2 font-bold uppercase tracking-wider">
                   <RefreshCw size={10} /> 
                   <span>Refined Logic</span>
                 </div>
                 <div className="text-[11px] leading-5 text-white bg-white/5 border border-white/10 p-2.5 rounded-sm">
                    {node.refinedThought}
                 </div>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Generating Progress Bar (Bottom) */}
      {isGenerating && (
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5 overflow-hidden">
          <div className="h-full bg-white/40 w-full animate-progress-indeterminate origin-left"></div>
        </div>
      )}
    </div>
  );
};