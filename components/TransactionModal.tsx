import React from 'react';
import type { TransactionDetails, AssetTransfer } from '../types.ts';
import { XIcon } from './XIcon.tsx';
import { HederaIcon } from './HederaIcon.tsx';

interface TransactionModalProps {
  transaction: TransactionDetails;
  onClose: () => void;
}

const AssetTransferRow: React.FC<{ transfer: AssetTransfer }> = ({ transfer }) => {
    return (
        <div className="flex justify-between items-center text-xs">
            <div className="flex flex-col">
                <span className="text-gray-400">From:</span>
                <span className="text-white font-mono">{transfer.from}</span>
            </div>
            <div className="text-center">
                <div className="text-cyan-400 font-bold">
                    {transfer.amount ? `${transfer.amount} ${transfer.assetId}` : `1x ${transfer.assetId}`}
                </div>
                <div className="text-gray-500">&rarr;</div>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-gray-400">To:</span>
                <span className="text-white font-mono">{transfer.to}</span>
            </div>
        </div>
    );
};


const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      style={{ animation: 'modal-fade-in 0.3s ease-out' }}
      onClick={onClose}
    >
      <div 
        className="bg-gray-800/80 border border-cyan-500/30 rounded-lg shadow-2xl w-full max-w-2xl text-gray-200 font-mono m-4"
        style={{ animation: 'modal-slide-up 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center">
            <HederaIcon className="w-6 h-6 mr-3" />
            Transaction Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
            <span className="text-gray-400">Transaction ID:</span>
            <span className="md:col-span-2 text-white break-all">{transaction.id}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
            <span className="text-gray-400">Status:</span>
            <span className={`md:col-span-2 font-bold ${transaction.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>
              {transaction.status}
            </span>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
            <span className="text-gray-400">Transaction Fee:</span>
            <span className="md:col-span-2 text-white">{transaction.fee}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
            <span className="text-gray-400">Consensus Time:</span>
            <span className="md:col-span-2 text-white">{transaction.consensusTimestamp}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
            <span className="text-gray-400">Memo:</span>
            <span className="md:col-span-2 text-white">{transaction.memo}</span>
          </div>

          {transaction.assetTransfers && transaction.assetTransfers.length > 0 && (
            <div className="pt-4">
              <h3 className="text-gray-400 mb-2 font-bold">Asset Transfers</h3>
              <div className="bg-gray-900/50 rounded-md p-3 space-y-3 border border-gray-700">
                  {transaction.assetTransfers.map((transfer, index) => (
                      <AssetTransferRow key={index} transfer={transfer} />
                  ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-700 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;