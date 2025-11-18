
import React, { useState, useEffect } from 'react';
import { LightningBoltIcon } from './icons/LightningBoltIcon';
import { AgentIcon } from './icons/AgentIcon';
import { ClockIcon } from './icons/ClockIcon';

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

const NetworkStats: React.FC = () => {
    const [stats, setStats] = useState({
        tps: 12456,
        activeAgents: 42,
        consensusTime: 2.1
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prevStats => ({
                tps: Math.floor(prevStats.tps + (Math.random() - 0.4) * 100),
                activeAgents: prevStats.activeAgents,
                consensusTime: parseFloat((prevStats.consensusTime + (Math.random() - 0.5) * 0.1).toFixed(2))
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-4">Network Status</h2>
            <div className="space-y-3">
                <StatCard icon={<LightningBoltIcon className="w-5 h-5" />} label="Transactions/Second" value={stats.tps.toLocaleString()} unit="TPS" />
                <StatCard icon={<AgentIcon className="w-5 h-5" />} label="Active Agents" value={stats.activeAgents.toString()} unit="Agents" />
                <StatCard icon={<ClockIcon className="w-5 h-5" />} label="Avg. Consensus Time" value={stats.consensusTime.toString()} unit="seconds" />
            </div>
        </div>
    );
};

export default NetworkStats;
