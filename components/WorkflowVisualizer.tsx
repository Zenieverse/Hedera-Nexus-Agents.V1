import React from 'react';
import type { TaskStep } from '../types.ts';
import { CheckCircleIcon } from './CheckCircleIcon.tsx';
import { HcsIcon } from './HcsIcon.tsx';
import { SmartContractIcon } from './SmartContractIcon.tsx';
import { TokenServiceIcon } from './TokenServiceIcon.tsx';
import { VerificationIcon } from './VerificationIcon.tsx';
import { CubeIcon } from './CubeIcon.tsx';

const StatusIcon: React.FC<{ status: TaskStep['status'] }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    case 'in-progress':
      return (
        <div className="w-5 h-5 rounded-full bg-cyan-500 animate-pulse-glow flex items-center justify-center">
            <div className="w-2 h-2 bg-cyan-200 rounded-full"></div>
        </div>
      );
    case 'pending':
    default:
      return <div className="w-5 h-5 rounded-full border-2 border-gray-500"></div>;
  }
};

const StepTypeIcon: React.FC<{ type: string }> = ({ type }) => {
    const className = "w-4 h-4 text-cyan-300/70";
    switch(type?.toLowerCase()) {
        case 'hcs':
            return <HcsIcon className={className} />;
        case 'smart contract':
            return <SmartContractIcon className={className} />;
        case 'token service':
            return <TokenServiceIcon className={className} />;
        case 'verification':
            return <VerificationIcon className={className} />;
        default:
            return <CubeIcon className={className} />;
    }
};

interface WorkflowVisualizerProps {
  steps: TaskStep[];
  onTransactionClick: (step: TaskStep) => void;
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ steps, onTransactionClick }) => {
  return (
    <div className="space-y-2 overflow-y-auto pr-2">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center space-x-4 transition-all duration-500">
            <StatusIcon status={step.status} />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                  <p className={`font-bold flex items-center gap-2 ${step.status !== 'pending' ? 'text-cyan-300' : 'text-gray-400'}`}>
                    <StepTypeIcon type={step.type} />
                    {step.name}
                  </p>
                  {step.cost && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${step.status === 'completed' ? 'bg-gray-700 text-gray-300' : 'bg-gray-700/50 text-gray-400'}`}>
                          ~Ħ{step.cost.toFixed(6)}
                      </span>
                  )}
              </div>
              <p className={`text-sm ${step.status !== 'pending' ? 'text-gray-300' : 'text-gray-500'}`}>
                {step.description}
              </p>
              {step.status === 'completed' && step.transactionId && (
                  <button onClick={() => onTransactionClick(step)} className="text-xs text-cyan-400 hover:text-cyan-200 hover:underline mt-1 transition-colors">
                      TxID: {step.transactionId}
                  </button>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="ml-2 h-6 w-px bg-gray-600 my-1"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WorkflowVisualizer;
