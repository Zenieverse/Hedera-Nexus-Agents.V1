
import React, { useRef, useEffect } from 'react';
import type { ActivityLog } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';

interface LiveActivityFeedProps {
    logs: ActivityLog[];
}

const LogIcon: React.FC<{ type: ActivityLog['type'] }> = ({ type }) => {
    switch (type) {
        case 'success':
            return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
        case 'error':
            return <svg className="w-4 h-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'info':
        default:
            return <svg className="w-4 h-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
};

const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ logs }) => {
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 flex flex-col h-1/2">
            <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Live Activity Feed
            </h2>
            <div ref={feedRef} className="flex-grow overflow-y-auto space-y-2 text-sm pr-2">
                {logs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Awaiting agent activity...
                    </div>
                ) : (
                    logs.map((log, index) => (
                        <div key={index} className="flex items-start animate-fade-in">
                            <span className="mr-2 mt-1"><LogIcon type={log.type} /></span>
                            <span className="text-gray-500 mr-2">{log.timestamp.toLocaleTimeString()}</span>
                            <span className={`flex-1 ${log.type === 'success' ? 'text-green-300' : log.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LiveActivityFeed;
