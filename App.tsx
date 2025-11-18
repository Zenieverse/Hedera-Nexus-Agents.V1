
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import AgentControlPanel from './components/AgentControlPanel';
import LiveActivityFeed from './components/LiveActivityFeed';
import NetworkStats from './components/NetworkStats';
import WorkflowVisualizer from './components/WorkflowVisualizer';
import { generateTaskWorkflow } from './services/geminiService';
import type { TaskStep, ActivityLog } from './types';
import { CubeIcon } from './components/icons/CubeIcon';

const App: React.FC = () => {
  const [taskSteps, setTaskSteps] = useState<TaskStep[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setActivityLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
  }, []);

  useEffect(() => {
    if (taskSteps.length > 0 && activeStepIndex === null) {
      setActiveStepIndex(0);
      addLog(`Workflow initiated for Agent Nexus-${Math.floor(Math.random() * 900) + 100}.`);
    }
  }, [taskSteps, activeStepIndex, addLog]);

  useEffect(() => {
    if (activeStepIndex !== null && activeStepIndex < taskSteps.length) {
      const currentStep = taskSteps[activeStepIndex];
      
      const timer = setTimeout(() => {
        setTaskSteps(prev => prev.map((step, index) => 
          index === activeStepIndex ? { ...step, status: 'in-progress' } : step
        ));
        addLog(`Executing: ${currentStep.name}...`);

        const completionTimer = setTimeout(() => {
          setTaskSteps(prev => prev.map((step, index) => 
            index === activeStepIndex ? { ...step, status: 'completed' } : step
          ));
          addLog(`${currentStep.description}`, 'success');
          
          if (activeStepIndex < taskSteps.length - 1) {
            setActiveStepIndex(activeStepIndex + 1);
          } else {
             addLog('All tasks completed. Agent entering standby mode.');
             setActiveStepIndex(null);
          }
        }, 1500 + Math.random() * 1000);
        
        return () => clearTimeout(completionTimer);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [activeStepIndex, taskSteps, addLog]);

  const handleDeployAgent = async (taskDescription: string) => {
    setIsLoading(true);
    setError(null);
    setTaskSteps([]);
    setActivityLogs([]);
    setActiveStepIndex(null);

    addLog('Receiving task description...');
    addLog('Contacting Nexus AI Coordinator...');

    try {
      const steps = await generateTaskWorkflow(taskDescription);
      addLog('AI Coordinator responded. Generating workflow...', 'success');
      setTaskSteps(steps.map(step => ({ ...step, status: 'pending' })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate workflow: ${errorMessage}`);
      addLog(`Workflow generation failed. ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-mono flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          <div className="lg:col-span-4 space-y-6">
            <AgentControlPanel onDeploy={handleDeployAgent} isLoading={isLoading} />
            <NetworkStats />
          </div>
          <div className="lg:col-span-8 space-y-6 flex flex-col min-h-[60vh]">
            <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 flex-grow flex flex-col h-1/2">
                <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                    <CubeIcon className="w-5 h-5 mr-2" />
                    Agent Task Workflow
                </h2>
                {isLoading && !taskSteps.length ? (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-cyan-300">AI analyzing task...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex-grow flex items-center justify-center text-red-400">{error}</div>
                ) : taskSteps.length > 0 ? (
                    <WorkflowVisualizer steps={taskSteps} />
                ) : (
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-gray-400">Deploy an agent to see its workflow.</p>
                    </div>
                )}
            </div>
            <LiveActivityFeed logs={activityLogs} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
