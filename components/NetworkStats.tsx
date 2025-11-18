
import React from 'react';
import { LightningBoltIcon } from './LightningBoltIcon.tsx';
import { AgentIcon } from './AgentIcon.tsx';
import { ClockIcon } from './ClockIcon.tsx';
import { CoinIcon } from './CoinIcon.tsx';
import { GovernanceIcon } from './GovernanceIcon.tsx';
import type { NetworkStatsData } from '../types.ts';

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; unit: string }> = ({ icon, label, value, unit }) => (
    <div className="bg-gray-900/50 p-3 rounded-lg flex items-center">
        <div className="p-2 bg-gray-800 rounded-md mr-3 text-cyan-400">
            {icon}
        </div>
        <div>
            <div className="text-xs text-gray-400">{label}</div>
            <div className="text-lg font-bold text-white">
                {value} <span className="text-sm font-normal text-gray-300">{unit}</span>
            </div>
        </div>
    </div>
);

interface NetworkStatsProps {
    stats: NetworkStatsData;
}

const NetworkStats: React.FC<NetworkStatsProps> = ({ stats }) => {
    return (
        <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-4">Network Status</h2>
            <div className="space-y-3">
                <StatCard icon={<LightningBoltIcon className="w-5 h-5" />} label="Transactions/Second" value={stats.tps.toLocaleString()} unit="TPS" />
                <StatCard icon={<AgentIcon className="w-5 h-5" />} label="Active Agents" value={stats.activeAgents.toString()} unit="Agents" />
                <StatCard icon={<ClockIcon className="w-5 h-5" />} label="Avg. Consensus Time" value={stats.consensusTime.toString()} unit="seconds" />
                <StatCard icon={<CoinIcon className="w-5 h-5" />} label="Total Fees Collected" value={`Ħ${stats.totalFees.toFixed(4)}`} unit="HBAR" />
                <StatCard icon={<GovernanceIcon className="w-5 h-5" />} label="Total DAO Staked" value={stats.totalStaked.toLocaleString()} unit="NEX-GOV" />
            </div>
        </div>
    );
};

export default NetworkStats;
