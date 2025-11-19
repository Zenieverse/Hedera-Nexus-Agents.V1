
import React from 'react';
import type { Agent } from '../types.ts';
import { UsersIcon } from './UsersIcon.tsx';
import { StopIcon } from './StopIcon.tsx';
import { TrashIcon } from './TrashIcon.tsx';
import { PlusIcon } from './PlusIcon.tsx';

const AgentStatusIndicator: React.FC<{ status: Agent['status'] }> = ({ status }) => {
    const baseClasses = "w-2.5 h-2.5 rounded-full flex-shrink-0";
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
    onStopAgent?: (id: string) => void;
    onDismissAgent?: (id: string) => void;
    onFundAgent?: (id: string) => void;
}

const AgentFleet: React.FC<AgentFleetProps> = ({ agents, selectedAgentId, onSelectAgent, onStopAgent, onDismissAgent, onFundAgent }) => {
    
    const getBalanceColor = (balance: number) => {
        if (balance < 10) return 'text-red-400';
        if (balance < 25) return 'text-yellow-400';
        return 'text-green-400';
    }

    const getLevelBadge = (level: number) => {
        if (level >= 10) return 'bg-purple-900 text-purple-200 border-purple-500';
        if (level >= 5) return 'bg-yellow-900 text-yellow-200 border-yellow-500';
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }

    const getRankTitle = (level: number) => {
        if (level >= 10) return 'Architect';
        if (level >= 5) return 'Operator';
        return 'Initiate';
    }

    return (
        <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                <UsersIcon className="w-5 h-5 mr-2" />
                Agent Fleet
            </h2>
            <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
                {agents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No agents deployed.</p>
                ) : (
                    [...agents].reverse().map(agent => {
                        // Calculate progress to next level (every 500 XP)
                        const progress = (agent.xp % 500) / 500 * 100;
                        
                        return (
                            <div
                                key={agent.id}
                                className={`w-full rounded-md transition-colors duration-200 relative overflow-hidden border border-transparent ${selectedAgentId === agent.id ? 'bg-cyan-900/30 border-cyan-500/30' : 'bg-gray-900/50 hover:bg-gray-800/80'}`}
                            >
                                <div className="p-2 flex items-center space-x-3 cursor-pointer" onClick={() => onSelectAgent(agent.id)}>
                                    <AgentStatusIndicator status={agent.status} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-2">
                                                <p className="font-bold text-sm text-gray-200 truncate">{agent.id}</p>
                                                <span className={`text-[10px] px-1 rounded border ${getLevelBadge(agent.level)}`} title={getRankTitle(agent.level)}>
                                                    LVL {agent.level}
                                                </span>
                                            </div>
                                            <p className={`text-xs font-medium ${getBalanceColor(agent.hbarBalance)}`}>Ħ{agent.hbarBalance.toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-between mt-0.5">
                                             <p className="text-xs text-gray-400 truncate max-w-[70%]">{agent.taskDescription}</p>
                                             <span className="text-[10px] text-gray-500 uppercase tracking-wider">{getRankTitle(agent.level)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {agent.status === 'running' && onFundAgent && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onFundAgent(agent.id); }}
                                                className="p-1 text-green-500 hover:text-green-300 transition-colors"
                                                title="Emergency Airdrop (+10 Ħ)"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                        {agent.status === 'running' && onStopAgent ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onStopAgent(agent.id); }}
                                                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                                title="Stop Agent"
                                            >
                                                <StopIcon className="w-4 h-4" />
                                            </button>
                                        ) : (agent.status === 'completed' || agent.status === 'error') && onDismissAgent ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDismissAgent(agent.id); }}
                                                className="p-1 text-gray-600 hover:text-gray-400 transition-colors"
                                                title="Dismiss Agent"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                                {/* XP Progress Bar */}
                                <div className="h-0.5 w-full bg-gray-800 absolute bottom-0 left-0">
                                    <div 
                                        className="h-full bg-cyan-500/50 transition-all duration-500" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AgentFleet;
