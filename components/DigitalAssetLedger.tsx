
import React from 'react';
import type { Ledger, Agent } from '../types.ts';
import { WalletIcon } from './WalletIcon.tsx';

interface DigitalAssetLedgerProps {
    ledger: Ledger;
    agents: Agent[];
}

const DigitalAssetLedger: React.FC<DigitalAssetLedgerProps> = ({ ledger, agents }) => {
    const sortedAgents = [...agents].sort((a, b) => {
        const aNum = parseInt(a.id.split('-')[1]);
        const bNum = parseInt(b.id.split('-')[1]);
        return aNum - bNum;
    });

    return (
        <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 h-full flex flex-col">
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center flex-shrink-0">
                <WalletIcon className="w-5 h-5 mr-2" />
                Digital Asset Ledger
            </h2>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 text-xs custom-scrollbar">
                {agents.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Ledger is empty.
                    </div>
                ) : (
                    sortedAgents.map(agent => {
                        const holdings = ledger[agent.id];
                        if (!holdings) return null;
                        
                        return (
                            <div key={agent.id} className="bg-gray-900/50 p-2 rounded-md">
                                <h3 className="font-bold text-cyan-300/80 text-sm mb-2">{agent.id}</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-gray-400 font-semibold mb-1">Fungible Tokens (FTs)</p>
                                        {holdings.fts.length > 0 ? (
                                            holdings.fts.map(ft => (
                                                <div key={ft.id} className="flex justify-between items-center pl-2">
                                                    <span className="text-gray-300">{ft.id}</span>
                                                    <span className="font-mono text-green-400">{ft.amount.toLocaleString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 pl-2">None</p>
                                        )}
                                        {/* Staked display */}
                                        {holdings.stakedNexGov > 0 && (
                                            <div className="flex justify-between items-center pl-2 mt-1 bg-cyan-900/20 rounded p-1">
                                                <span className="text-cyan-400">NEX-GOV (Staked)</span>
                                                <span className="font-mono text-cyan-300">{holdings.stakedNexGov.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-semibold mb-1">Non-Fungible Tokens (NFTs)</p>
                                        {holdings.nfts.length > 0 ? (
                                            holdings.nfts.map(nft => (
                                                <div key={nft.id} className="flex justify-between items-center pl-2">
                                                    <span className="text-gray-300 truncate" title={nft.id}>{nft.id}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 pl-2">None</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DigitalAssetLedger;
