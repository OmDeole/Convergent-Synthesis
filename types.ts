export enum EngineStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',   // Identifying perspectives
  BRANCHING = 'BRANCHING',   // Generating initial thoughts
  AUDITING = 'AUDITING',     // Checking thoughts
  REFINING = 'REFINING',     // Fixing "DUMB" thoughts
  SYNTHESIZING = 'SYNTHESIZING', // Merging into master solution
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AuditResult {
  status: 'SMART' | 'DUMB';
  reasoning: string;
}

export interface PerspectiveNode {
  id: string;
  name: string;
  description: string;
  initialThought: string | null;
  audit: AuditResult | null;
  refinedThought: string | null;
  status: 'pending' | 'loading' | 'success' | 'refining' | 'failed';
}

export interface ConsensusState {
  task: string;
  status: EngineStatus;
  perspectives: PerspectiveNode[];
  masterSolution: string;
  error?: string;
}
