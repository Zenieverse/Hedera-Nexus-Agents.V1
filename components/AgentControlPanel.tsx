
import React, { useState } from 'react';
import { AgentIcon } from './AgentIcon.tsx';
import { ResetIcon } from './ResetIcon.tsx';

interface AgentControlPanelProps {
  onDeploy: (taskDescription: string) => void;
  isLoading: boolean;
}

const presetTasks = [
    "Mint a new NFT collection for a digital artist and verify on-chain.",
    "Query the Oracle for HBAR price. If > $0.08, broadcast 'Bullish' on HCS and transfer 100 NEX-GOV to ANOTHER_AGENT.",
    "Stake 500 NEX-GOV tokens. Then, query Oracle for HBAR price. If > $0.085, vote 'Yes' on the active DAO proposal.",
    "Power Leveling Protocol: Execute 5 rapid verification checks to maximize XP gain.",
];

const AgentControlPanel: React.FC<AgentControlPanelProps> = ({ onDeploy, isLoading }) => {
  const [task, setTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim() && !isLoading) {
      onDeploy(task);
      setTask('');
    }
  };
  
  const handlePresetClick = (preset: string) => {
    if (!isLoading) {
      setTask(preset);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the entire simulation? All agents and assets will be deleted.")) {
        localStorage.removeItem('hederaNexusAgentsState_v4');
        window.location.reload();
    }
  }

  return (
    <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-cyan-400 flex items-center">
          <AgentIcon className="w-5 h-5 mr-2" />
          Agent Deployment
        </h2>
        <button onClick={handleReset} title="Reset Simulation" className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-md">
            <ResetIcon className="w-5 h-5" />
        </button>
      </div>
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
        <div className="space-y-2">
            <p className="text-xs text-gray-400">Or try an example:</p>
            <div className="flex flex-wrap gap-2">
                {presetTasks.map((preset, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        disabled={isLoading}
                        className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-cyan-300 transition-colors duration-200 disabled:opacity-50 text-left"
                    >
                        Preset {index + 1}
                    </button>
                ))}
            </div>
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
