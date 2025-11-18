import React from 'react';
import type { Agent } from '../types.ts';
import { UsersIcon } from './UsersIcon.tsx';

const AgentStatusIndicator: React.FC<{ status: Agent['status'] }> = ({ status }) => {
    const baseClasses = "w-2.5 h-2.5 rounded-full";
    switch (status) {
        case 'running':
            return <div className={`${baseClasses} bg-cyan-400 animate-pulse`} title="Running"></div>;
        case 'completed':
            return <div className={`${baseClasses} bg-green-500`} title="Completed"></div>;
        case 'error':
            return <div className={`${baseClasses} bg-red-500`} title="Error"></div>;
        case 'initializing':
            return <div className={`${baseClasses} bg-yellow-500 animate-pulse`} title="Initializing"></div>;
        default:
            return <div className={`${baseClasses} bg-gray-600`} title="Idle"></div>;
    }
};


interface AgentFleetProps {
    agents: Agent[];
    selectedAgentId: string | null;
    onSelectAgent: (id: string) => void;
}

const AgentFleet: React.FC<AgentFleetProps> = ({ agents, selectedAgentId, onSelectAgent }) => {
    
    const getBalanceColor = (balance: number) => {
        if (balance < 10) return 'text-red-400';
        if (balance < 25) return 'text-yellow-400';
        return 'text-green-400';
    }

    return (
        <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                <UsersIcon className="w-5 h-5 mr-2" />
                Agent Fleet
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {agents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No agents deployed.</p>
                ) : (
                    [...agents].reverse().map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => onSelectAgent(agent.id)}
                            className={`w-full text-left p-2 rounded-md transition-colors duration-200 flex items-center space-x-3 ${selectedAgentId === agent.id ? 'bg-cyan-500/20' : 'bg-gray-900/50 hover:bg-gray-700/50'}`}
                        >
                            <AgentStatusIndicator status={agent.status} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-sm text-gray-200 truncate">{agent.id}</p>
                                    <p className={`text-xs font-medium ${getBalanceColor(agent.hbarBalance)}`}>Ħ{agent.hbarBalance.toFixed(4)}</p>
                                </div>
                                <p className="text-xs text-gray-400 truncate">{agent.taskDescription}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default AgentFleet;
