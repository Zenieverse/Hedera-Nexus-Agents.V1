
import React, { useState, useEffect } from 'react';
import type { GovernanceProposal } from '../types.ts';
import { GovernanceIcon } from './GovernanceIcon.tsx';

interface GovernancePanelProps {
    proposal: GovernanceProposal | null;
}

const GovernancePanel: React.FC<GovernancePanelProps> = ({ proposal }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (!proposal || proposal.status !== 'active') {
            setTimeLeft('');
            return;
        }
        const interval = setInterval(() => {
            const diff = proposal.expiresAt.getTime() - new Date().getTime();
            if (diff <= 0) {
                setTimeLeft('Ending...');
            } else {
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [proposal]);

    if (!proposal) {
        return (
            <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 flex items-center justify-center text-gray-500 text-sm min-h-[160px]">
                <div className="text-center">
                    <GovernanceIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No active governance proposals.</p>
                    <p className="text-xs mt-1">DAO in recess.</p>
                </div>
            </div>
        );
    }

    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    const yesPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
    const noPercent = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;

    return (
        <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 min-h-[160px]">
            <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-bold text-cyan-400 flex items-center">
                    <GovernanceIcon className="w-5 h-5 mr-2" />
                    DAO Governance
                </h2>
                {proposal.status === 'active' && (
                    <span className="text-xs font-mono bg-gray-900 px-2 py-1 rounded text-yellow-400 border border-yellow-500/30 animate-pulse">
                        Active: {timeLeft}
                    </span>
                )}
            </div>
            
            <div className="mb-3">
                <h3 className="text-white font-bold text-sm">{proposal.title}</h3>
                <p className="text-gray-400 text-xs mt-1">{proposal.description}</p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>Yes: {proposal.votesFor.toLocaleString()}</span>
                    <span>No: {proposal.votesAgainst.toLocaleString()}</span>
                </div>
                <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden flex">
                    <div style={{ width: `${yesPercent}%` }} className="h-full bg-green-500 transition-all duration-500"></div>
                    <div style={{ width: `${noPercent}%` }} className="h-full bg-red-500 transition-all duration-500"></div>
                </div>
                
                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-700/50 mt-2">
                     <span className={`px-2 py-0.5 rounded ${proposal.status === 'passed' ? 'bg-green-900 text-green-300' : proposal.status === 'failed' ? 'bg-red-900 text-red-300' : 'text-gray-500'}`}>
                        Status: {proposal.status.toUpperCase()}
                     </span>
                     <span className="text-gray-500">ID: {proposal.id}</span>
                </div>
            </div>
        </div>
    );
};

export default GovernancePanel;
