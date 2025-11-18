
import React from 'react';
import { HederaIcon } from './icons/HederaIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <HederaIcon className="w-8 h-8 text-cyan-400 animate-pulse-glow" />
            <h1 className="text-2xl font-bold text-gray-100 tracking-wider">
              Hedera-Nexus-Agents
            </h1>
          </div>
          <div className="flex items-center">
             <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="ml-2 text-sm text-green-400">Network Optimal</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
