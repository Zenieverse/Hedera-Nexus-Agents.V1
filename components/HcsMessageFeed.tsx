
import React from 'react';
import type { HcsMessage } from '../types.ts';
import { RssIcon } from './RssIcon.tsx';

interface HcsMessageFeedProps {
  messages: HcsMessage[];
}

const HcsMessageFeed: React.FC<HcsMessageFeedProps> = ({ messages }) => {
  return (
    <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 flex-grow flex flex-col">
      <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center flex-shrink-0">
        <RssIcon className="w-5 h-5 mr-2" />
        Hive-Mind HCS Feed
      </h2>
      <div className="flex-grow overflow-y-auto space-y-3 pr-2 text-xs flex flex-col-reverse custom-scrollbar">
        {messages.length === 0 ? (
            <div className="flex-grow flex items-center justify-center h-full text-gray-500">
                No HCS messages broadcast.
            </div>
        ) : (
            <div>
                {messages.map((msg, index) => (
                    <div key={index} className="bg-gray-900/40 p-2 rounded-md animate-fade-in">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-cyan-300/80">{msg.agentId}</span>
                            <span className="text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <p className="text-gray-300 whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default HcsMessageFeed;
