import React, { useState, useRef, useEffect } from 'react';
import { Layout } from './components/Layout';
import { PerspectiveCard } from './components/PerspectiveCard';
import { EngineStatus, PerspectiveNode } from './types';
import * as GeminiService from './services/geminiService';
import { Sparkles, AlertCircle, RefreshCw, ArrowRight, Command } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [task, setTask] = useState('');
  const [status, setStatus] = useState<EngineStatus>(EngineStatus.IDLE);
  const [perspectives, setPerspectives] = useState<PerspectiveNode[]>([]);
  const [masterSolution, setMasterSolution] = useState('');
  const [error, setError] = useState<string | null>(null);

  const synthesisRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to synthesis when it starts
  useEffect(() => {
    if (status === EngineStatus.SYNTHESIZING && synthesisRef.current) {
      synthesisRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status]);

  const runEngine = async () => {
    if (!task.trim()) return;
    
    setStatus(EngineStatus.ANALYZING);
    setPerspectives([]);
    setMasterSolution('');
    setError(null);

    try {
      const rawPerspectives = await GeminiService.identifyPerspectives(task);
      
      const initialNodes: PerspectiveNode[] = rawPerspectives.map((p, idx) => ({
        id: `p-${idx}`,
        name: p.name,
        description: p.description,
        initialThought: null,
        audit: null,
        refinedThought: null,
        status: 'pending'
      }));
      setPerspectives(initialNodes);

      setStatus(EngineStatus.BRANCHING);
      
      const branchPromises = initialNodes.map(async (node, index) => {
        updateNodeStatus(index, 'loading');
        
        const thought = await GeminiService.generateThoughtFromPerspective(task, node.name, node.description);
        updateNodeData(index, { initialThought: thought });

        const audit = await GeminiService.auditThought(task, thought, node.name);
        updateNodeData(index, { audit });

        let finalContent = thought;

        if (audit.status === 'DUMB') {
          updateNodeStatus(index, 'refining');
          const refined = await GeminiService.refineThought(task, node.name, thought, audit.reasoning);
          updateNodeData(index, { refinedThought: refined, status: 'success' });
          finalContent = refined;
        } else {
          updateNodeStatus(index, 'success');
        }
        
        return { name: node.name, content: finalContent };
      });

      const finalThoughts = await Promise.all(branchPromises);

      setStatus(EngineStatus.SYNTHESIZING);
      
      const stream = await GeminiService.synthesizeConsensus(task, finalThoughts);
      
      for await (const chunk of stream) {
        const text = chunk.text; 
        if (text) {
          setMasterSolution(prev => prev + text);
        }
      }
      
      setStatus(EngineStatus.COMPLETE);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred.");
      setStatus(EngineStatus.ERROR);
    }
  };

  const updateNodeData = (index: number, data: Partial<PerspectiveNode>) => {
    setPerspectives(prev => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], ...data };
      return newArr;
    });
  };

  const updateNodeStatus = (index: number, status: PerspectiveNode['status']) => {
    setPerspectives(prev => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], status };
      return newArr;
    });
  };

  return (
    <Layout>
      {/* Input Section */}
      <section className="mt-12 mb-20">
        <div className="flex flex-col items-center text-center mb-8">
           <h2 className="text-4xl font-bold tracking-tight text-white mb-3">
             Solve the unsolvable.
           </h2>
           <p className="text-subtle text-sm max-w-md">
             An AI consensus engine that explores multiple perspectives to synthesize a master solution.
           </p>
        </div>

        <div className="max-w-2xl mx-auto w-full relative group">
           <div className={`
             relative bg-black rounded-lg border transition-all duration-200
             ${status === EngineStatus.IDLE ? 'border-border hover:border-gray-500' : 'border-border opacity-50 cursor-not-allowed'}
           `}>
             <textarea
               value={task}
               onChange={(e) => setTask(e.target.value)}
               disabled={status !== EngineStatus.IDLE}
               placeholder="Describe a complex problem (e.g., 'How should a startup allocate a limited budget?')"
               className="w-full bg-transparent text-white placeholder-neutral-600 p-4 text-base outline-none resize-none min-h-[120px] font-sans"
             />
             <div className="flex justify-between items-center px-4 py-3 border-t border-border/50 bg-surface/50 rounded-b-lg">
                <div className="flex gap-2">
                   {/* Optional: Add small icons or helpers here later */}
                </div>
                <button 
                  onClick={runEngine}
                  disabled={!task.trim() || status !== EngineStatus.IDLE}
                  className={`
                    flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-all
                    ${status === EngineStatus.IDLE 
                      ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                      : 'bg-border text-subtle cursor-not-allowed'}
                  `}
                >
                  {status === EngineStatus.IDLE ? (
                    <>Generate Consensus <ArrowRight size={14} /></>
                  ) : (
                    <span className="font-mono text-xs uppercase">{status}...</span>
                  )}
                </button>
             </div>
           </div>
           {/* Visual Flair behind input */}
           <div className="absolute -inset-[1px] -z-10 rounded-lg bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mb-12 p-4 border border-red-900/50 bg-red-900/10 rounded text-red-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
             <AlertCircle size={16} />
             {error}
          </div>
          <button onClick={() => setStatus(EngineStatus.IDLE)} className="hover:text-white underline decoration-red-400/30">Reset</button>
        </div>
      )}

      {/* Grid of Perspectives */}
      {perspectives.length > 0 && (
        <section className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-2">
            <h3 className="text-sm font-medium text-white">Analysis Nodes</h3>
            <span className="text-[10px] font-mono text-subtle">TREE_OF_THOUGHT</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {perspectives.map((node) => (
              <PerspectiveCard key={node.id} node={node} />
            ))}
          </div>
        </section>
      )}

      {/* Master Synthesis */}
      {(status === EngineStatus.SYNTHESIZING || status === EngineStatus.COMPLETE) && (
        <section ref={synthesisRef} className="animate-in fade-in duration-700">
           <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-6">
                 <div className="p-1 bg-white rounded-sm">
                   <Sparkles size={14} className="text-black" />
                 </div>
                 <h2 className="text-lg font-semibold text-white">Synthesis</h2>
              </div>
              
              <div className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300">
                 <ReactMarkdown 
                   components={{
                     h1: ({node, ...props}) => <h1 className="text-white text-2xl font-bold mt-8 mb-4 tracking-tight" {...props} />,
                     h2: ({node, ...props}) => <h2 className="text-white text-xl font-semibold mt-6 mb-3 tracking-tight border-b border-border pb-2" {...props} />,
                     h3: ({node, ...props}) => <h3 className="text-white text-lg font-medium mt-4 mb-2" {...props} />,
                     p: ({node, ...props}) => <p className="leading-7 mb-4 text-gray-300" {...props} />,
                     ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-4 text-gray-400" {...props} />,
                     li: ({node, ...props}) => <li className="mb-1" {...props} />,
                     strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                   }}
                 >
                   {masterSolution}
                 </ReactMarkdown>
                 {status === EngineStatus.SYNTHESIZING && (
                   <span className="inline-block w-1.5 h-4 ml-1 bg-white animate-pulse align-middle"></span>
                 )}
              </div>

              {status === EngineStatus.COMPLETE && (
                <div className="mt-12 pt-8 border-t border-border flex justify-center">
                   <button 
                     onClick={() => {
                       setTask('');
                       setStatus(EngineStatus.IDLE);
                       setPerspectives([]);
                       setMasterSolution('');
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                     }}
                     className="flex items-center gap-2 text-sm text-subtle hover:text-white transition-colors group"
                   >
                     <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> 
                     Analyze New Task
                   </button>
                </div>
              )}
           </div>
        </section>
      )}
    </Layout>
  );
}