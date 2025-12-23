import React, { ReactNode } from 'react';
import { Layers } from 'lucide-react';

interface Props {
  children: ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-background selection:bg-accent selection:text-white">
      <nav className="w-full max-w-6xl px-6 py-6 flex items-center justify-between border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full">
             <Layers size={16} className="text-black" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-white">Consensus Engine</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <a href="#" className="text-sm text-subtle hover:text-white transition-colors">Docs</a>
           <div className="text-[10px] font-mono font-medium text-subtle border border-border px-2 py-0.5 rounded-full">
             PROTOTYPE
          </div>
        </div>
      </nav>
      
      <main className="w-full max-w-6xl px-6 pb-24 flex-1 mt-12">
        {children}
      </main>
      
      <footer className="w-full border-t border-border py-8 mt-auto">
         <div className="max-w-6xl mx-auto px-6 text-center text-subtle text-xs">
           Powered by Gemini 1.5 Pro • <span className="hover:text-white cursor-pointer transition-colors">View Source</span>
         </div>
      </footer>
    </div>
  );
};