import React, { useRef, useEffect } from 'react';
import type { ActivityLog } from '../types.ts';
import { CheckCircleIcon } from './CheckCircleIcon.tsx';
import { InformationCircleIcon } from './InformationCircleIcon.tsx';
import { ExclamationCircleIcon } from './ExclamationCircleIcon.tsx';
import { ClockIcon } from './ClockIcon.tsx';


interface LiveActivityFeedProps {
    logs: ActivityLog[];
}

const LogIcon: React.FC<{ type: ActivityLog['type'] }> = ({ type }) => {
    switch (type) {
        case 'success':
            return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
        case 'error':
            return <ExclamationCircleIcon className="w-4 h-4 text-red-400" />;
        case 'info':
        default:
            return <InformationCircleIcon className="w-4 h-4 text-cyan-400" />;
    }
};

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ logs }) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (feedRef.current && feedRef.current.scrollTop < 50) {
            feedRef.current.scrollTop = 0;
        }
    }, [logs]);

    return (
        <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 flex flex-col h-1/2">
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Live Activity Feed
            </h2>
            <div ref={feedRef} className="flex-grow overflow-y-auto space-y-2 text-sm pr-2 flex flex-col-reverse">
                {logs.length === 0 ? (
                     <div className="flex-grow flex items-center justify-center h-full text-gray-500">
                        Awaiting agent activity...
                    </div>
                ) : (
                    <div className="space-y-2">
                    {logs.map((log, index) => (
                        <div key={index} className="flex items-start animate-fade-in" style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}>
                            <span className="mr-2 mt-1"><LogIcon type={log.type} /></span>
                            <span className="text-gray-500 mr-2">{log.timestamp.toLocaleTimeString()}</span>
                            {log.agentId && <span className="text-cyan-400/70 mr-2 font-bold">[{log.agentId}]</span>}
                            <span className={`flex-1 ${log.type === 'success' ? 'text-green-300' : log.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveActivityFeed;
