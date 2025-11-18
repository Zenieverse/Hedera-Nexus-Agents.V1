
import React from 'react';
import type { TaskStep } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

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

interface WorkflowVisualizerProps {
  steps: TaskStep[];
}

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ steps }) => {
  return (
    <div className="space-y-2 overflow-y-auto pr-2">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center space-x-4 transition-all duration-500">
            <StatusIcon status={step.status} />
            <div className="flex-1">
              <p className={`font-bold ${step.status !== 'pending' ? 'text-cyan-300' : 'text-gray-400'}`}>
                {step.name}
              </p>
              <p className={`text-sm ${step.status !== 'pending' ? 'text-gray-300' : 'text-gray-500'}`}>
                {step.description}
              </p>
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
