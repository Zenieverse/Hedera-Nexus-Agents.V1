export interface TaskStep {
  name: string;
  description: string;
  type: string;
  status: 'pending' | 'in-progress' | 'completed';
  transactionId?: string;
  cost?: number;
}

export interface ActivityLog {
  message: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error';
  agentId?: string;
}

export interface Agent {
  id: string;
  taskDescription: string;
  status: 'initializing' | 'running' | 'completed' | 'error';
  steps: TaskStep[];
  hbarBalance: number;
}

export interface NetworkStatsData {
    tps: number;
    activeAgents: number;
    consensusTime: number;
    totalFees: number;
}

export interface TransactionDetails {
  id: string;
  status: 'SUCCESS' | 'FAILURE';
  consensusTimestamp: string;
  memo: string;
  transfers: { account: string; amount: string }[];
  fee: string;
}
