
import React from 'react';
import { HederaIcon } from './HederaIcon.tsx';

interface HeaderProps {
    networkStatus?: 'optimal' | 'congestion' | 'upgrade' | 'anomaly';
}

const Header: React.FC<HeaderProps> = ({ networkStatus = 'optimal' }) => {
  const getStatusConfig = () => {
      switch(networkStatus) {
          case 'congestion': 
            return { color: 'bg-red-500', text: 'text-red-400', label: 'Network Congested', ping: 'bg-red-400' };
          case 'upgrade': 
            return { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'Consensus Optimized', ping: 'bg-emerald-400' };
          case 'anomaly': 
            return { color: 'bg-purple-500', text: 'text-purple-400', label: 'HCS Instability', ping: 'bg-purple-400' };
          default: 
            return { color: 'bg-green-500', text: 'text-green-400', label: 'Network Optimal', ping: 'bg-green-400' };
      }
  };

  const config = getStatusConfig();

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
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.ping}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${config.color}`}></span>
            </span>
            <span className={`ml-2 text-sm ${config.text} font-medium transition-colors duration-500`}>{config.label}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
