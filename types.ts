
export interface FungibleToken {
  id: string; // e.g., 'NEX-GOV'
  amount: number;
}

export interface NonFungibleToken {
  id: string; // e.g., 'NFT-ART-123'
  name: string;
}

export interface AssetHoldings {
  fts: FungibleToken[];
  nfts: NonFungibleToken[];
  stakedNexGov: number; // Amount of NEX-GOV tokens staked for voting power
}

export type Ledger = Record<string, AssetHoldings>; // Maps agentId to their asset holdings

export interface AssetTransfer {
  assetId: string;
  from: string; // agentId or 'MINT'
  to: string; // agentId
  amount?: number; // for FTs
}

export interface OracleData {
  hbarPrice: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface HcsMessage {
  agentId: string;
  message: string;
  timestamp: Date;
}

export interface GovernanceProposal {
    id: string;
    title: string;
    description: string;
    votesFor: number;
    votesAgainst: number;
    createdAt: Date;
    expiresAt: Date;
    status: 'active' | 'passed' | 'failed' | 'executed';
    effect: {
        type: 'fee_multiplier';
        value: number; // e.g., 0.5 (low fees) or 2.0 (high fees)
    };
}

export interface NetworkEvent {
    id: string;
    title: string;
    description: string;
    type: 'congestion' | 'upgrade' | 'anomaly';
    multiplier: number; // Effect on fees
    duration: number; // ms
}
  
export interface ActiveNetworkEvent extends NetworkEvent {
    expiresAt: Date;
}

export interface TaskStep {
  name: string;
  description: string;
  type: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  transactionId?: string;
  cost?: number;
  
  // Token service specific properties
  tokenAction?: 'mint_nft' | 'transfer_ft';
  assetId?: string;
  assetAmount?: number;
  targetAgent?: string;
  assetTransfers?: AssetTransfer[];
  
  // Synapse Project properties
  oracleKey?: keyof OracleData;
  message?: string;
  condition?: {
      key: keyof OracleData;
      operator: 'gt' | 'lt';
      value: number;
  };

  // Governance properties
  governanceAction?: 'stake' | 'vote';
  stakeAmount?: number;
  voteOption?: 'yes' | 'no';
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
  memory: Partial<Record<keyof OracleData, number | string>>;
  xp: number;
  level: number;
  nextActionAt?: number; // Timestamp for next scheduled action
}

export interface NetworkStatsData {
    tps: number;
    activeAgents: number;
    consensusTime: number;
    totalFees: number;
    feeMultiplier: number; // 1.0 is base
    totalStaked: number;
}

export interface TransactionDetails {
  id: string;
  status: 'SUCCESS' | 'FAILURE';
  consensusTimestamp: string;
  memo: string;
  fee: string;
  assetTransfers?: AssetTransfer[];
}
