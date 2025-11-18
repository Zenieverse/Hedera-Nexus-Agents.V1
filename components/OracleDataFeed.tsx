import React from 'react';
import type { OracleData } from '../types.ts';
import { OracleIcon } from './OracleIcon.tsx';

interface OracleDataFeedProps {
  data: OracleData;
}

const getSentimentColor = (sentiment: OracleData['marketSentiment']) => {
    switch(sentiment) {
        case 'bullish': return 'text-green-400';
        case 'bearish': return 'text-red-400';
        default: return 'text-yellow-400';
    }
}

const OracleDataFeed: React.FC<OracleDataFeedProps> = ({ data }) => {
  return (
    <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4">
      <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
        <OracleIcon className="w-5 h-5 mr-2" />
        Oracle Data Feed
      </h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
            <span className="text-gray-400">HBAR Price (USD):</span>
            <span className="font-mono text-white">${data.hbarPrice.toFixed(5)}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-gray-400">Market Sentiment:</span>
            <span className={`font-bold ${getSentimentColor(data.marketSentiment)}`}>{data.marketSentiment.charAt(0).toUpperCase() + data.marketSentiment.slice(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default OracleDataFeed;
