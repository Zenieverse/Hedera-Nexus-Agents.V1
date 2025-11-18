
import React, { useEffect, useState } from 'react';
import type { ActiveNetworkEvent } from '../types.ts';
import { LightningBoltIcon } from './LightningBoltIcon.tsx';

interface NetworkEventBannerProps {
    event: ActiveNetworkEvent;
}

const NetworkEventBanner: React.FC<NetworkEventBannerProps> = ({ event }) => {
    const [width, setWidth] = useState(100);

    useEffect(() => {
        const totalDuration = event.duration;
        const interval = setInterval(() => {
            const timeLeft = event.expiresAt.getTime() - new Date().getTime();
            const newWidth = Math.max(0, (timeLeft / totalDuration) * 100);
            setWidth(newWidth);
        }, 100);

        return () => clearInterval(interval);
    }, [event]);

    const getEventColor = (type: string) => {
        switch(type) {
            case 'congestion': return 'from-orange-600 to-red-600';
            case 'upgrade': return 'from-green-600 to-emerald-600';
            case 'anomaly': return 'from-purple-600 to-pink-600';
            default: return 'from-blue-600 to-cyan-600';
        }
    };

    return (
        <div className={`w-full bg-gradient-to-r ${getEventColor(event.type)} text-white relative overflow-hidden shadow-lg`}>
            <div className="container mx-auto px-4 py-3 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                    <LightningBoltIcon className="w-6 h-6 animate-pulse" />
                    <div>
                        <h3 className="font-bold text-sm sm:text-base uppercase tracking-wider">{event.title}</h3>
                        <p className="text-xs sm:text-sm opacity-90">{event.description}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-lg">{event.multiplier < 1 ? `FEES ${((1 - event.multiplier) * 100).toFixed(0)}% OFF` : `FEES +${((event.multiplier - 1) * 100).toFixed(0)}%`}</div>
                </div>
            </div>
            <div 
                className="absolute bottom-0 left-0 h-1 bg-white/50 transition-all duration-100 ease-linear"
                style={{ width: `${width}%` }}
            ></div>
        </div>
    );
};

export default NetworkEventBanner;
