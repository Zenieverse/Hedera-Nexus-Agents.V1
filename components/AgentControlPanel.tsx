
import React, { useState } from 'react';
import { AgentIcon } from './icons/AgentIcon';

interface AgentControlPanelProps {
  onDeploy: (taskDescription: string) => void;
  isLoading: boolean;
}

const AgentControlPanel: React.FC<AgentControlPanelProps> = ({ onDeploy, isLoading }) => {
  const [task, setTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim() && !isLoading) {
      onDeploy(task);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4">
      <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
        <AgentIcon className="w-5 h-5 mr-2" />
        Agent Deployment
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task" className="block text-sm font-medium text-gray-300 mb-1">
            Task Directive
          </label>
          <textarea
            id="task"
            rows={4}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g., Securely transfer digital assets and log the transaction on-chain."
            className="w-full bg-gray-900/50 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-gray-200 p-2 transition duration-200"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !task.trim()}
          className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deploying...
            </>
          ) : (
            'Deploy Agent'
          )}
        </button>
      </form>
    </div>
  );
};

export default AgentControlPanel;
