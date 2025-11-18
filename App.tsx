import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import AgentControlPanel from './components/AgentControlPanel.tsx';
import LiveActivityFeed from './components/LiveActivityFeed.tsx';
import NetworkStats from './components/NetworkStats.tsx';
import WorkflowVisualizer from './components/WorkflowVisualizer.tsx';
import TransactionModal from './components/TransactionModal.tsx';
import AgentFleet from './components/AgentFleet.tsx';
import DigitalAssetLedger from './components/DigitalAssetLedger.tsx';
import OracleDataFeed from './components/OracleDataFeed.tsx';
import HcsMessageFeed from './components/HcsMessageFeed.tsx';
import { generateTaskWorkflow } from './services/geminiService.ts';
import type { TaskStep, ActivityLog, NetworkStatsData, TransactionDetails, Agent, Ledger, AssetTransfer, OracleData, HcsMessage } from './types.ts';
import { CubeIcon } from './components/CubeIcon.tsx';

const SAVED_STATE_KEY = 'hederaNexusAgentsState_v2';

const App: React.FC = () => {
  const [initialStateLoaded, setInitialStateLoaded] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [networkStats, setNetworkStats] = useState<NetworkStatsData>({
    tps: 12456, activeAgents: 0, consensusTime: 2.1, totalFees: 0,
  });
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ledger, setLedger] = useState<Ledger>({});
  const [oracleData, setOracleData] = useState<OracleData>({
    hbarPrice: 0.08 + (Math.random() - 0.5) * 0.01,
    marketSentiment: 'neutral',
  });
  const [hcsMessages, setHcsMessages] = useState<HcsMessage[]>([]);

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(SAVED_STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setAgents(parsed.agents || []);
        setSelectedAgentId(parsed.selectedAgentId || null);
        setActivityLogs((parsed.activityLogs || []).map((log: any) => ({...log, timestamp: new Date(log.timestamp)})));
        setNetworkStats(parsed.networkStats || { tps: 12456, activeAgents: 0, consensusTime: 2.1, totalFees: 0 });
        setLedger(parsed.ledger || {});
        setHcsMessages((parsed.hcsMessages || []).map((msg: any) => ({...msg, timestamp: new Date(msg.timestamp)})));
      }
    } catch (error) {
      console.error("Failed to load saved state:", error);
    }
    setInitialStateLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!initialStateLoaded) return;
    try {
      const stateToSave = { agents, selectedAgentId, activityLogs, networkStats, ledger, hcsMessages };
      localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }, [agents, selectedAgentId, activityLogs, networkStats, ledger, hcsMessages, initialStateLoaded]);


  const generateMockTransactionId = useCallback(() => {
    const shard = 0;
    const realm = 0;
    const num = Math.floor(Math.random() * 99999) + 10000;
    const seconds = Math.floor(Date.now() / 1000);
    const nanos = Math.floor(Math.random() * 999999999);
    return `${shard}.${realm}.${num}@${seconds}.${nanos}`;
  }, []);

  const addLog = useCallback((message: string, type: ActivityLog['type'] = 'info', agentId?: string) => {
    setActivityLogs(prev => [{ message, type, timestamp: new Date(), agentId }, ...prev.slice(0, 199)]);
  }, []);

  // Simulate Oracle data updates
  useEffect(() => {
    const oracleInterval = setInterval(() => {
      setOracleData(prev => ({
        hbarPrice: Math.max(0.05, prev.hbarPrice + (Math.random() - 0.5) * 0.005),
        marketSentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as OracleData['marketSentiment'],
      }));
    }, 5000);
    return () => clearInterval(oracleInterval);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
        setNetworkStats(prevStats => ({
            ...prevStats,
            activeAgents: agents.filter(a => a.status === 'running').length,
            tps: Math.max(10000, Math.floor(prevStats.tps + (Math.random() - 0.4) * 100)),
            consensusTime: Math.max(1.5, parseFloat((prevStats.consensusTime + (Math.random() - 0.5) * 0.1).toFixed(2)))
        }));
    }, 2000);
    return () => clearInterval(interval);
  }, [agents]);

  useEffect(() => {
    const cleanupTimers: (() => void)[] = [];

    agents.forEach(agent => {
        if (agent.status !== 'running') return;

        const inProgressIndex = agent.steps.findIndex(s => s.status === 'in-progress');
        if (inProgressIndex !== -1) {
            const timer = setTimeout(() => {
                const completedStep = agent.steps[inProgressIndex];
                let assetTransfers: AssetTransfer[] = [];
                let agentMemoryUpdate: Partial<Agent['memory']> = {};

                // Handle special step types
                if (completedStep.type === 'Oracle') {
                    const value = oracleData[completedStep.oracleKey!];
                    agentMemoryUpdate[completedStep.oracleKey!] = value;
                    addLog(`Queried Oracle for '${completedStep.oracleKey}': ${value}`, 'success', agent.id);
                } else if (completedStep.type === 'HCS' && completedStep.message) {
                    let processedMessage = completedStep.message;
                    Object.entries(agent.memory).forEach(([key, value]) => {
                       processedMessage = processedMessage.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
                    });
                    const newHcsMessage: HcsMessage = { agentId: agent.id, message: processedMessage, timestamp: new Date() };
                    setHcsMessages(prev => [newHcsMessage, ...prev.slice(0, 49)]);
                    addLog(`Broadcast HCS message: "${processedMessage}"`, 'success', agent.id);
                } else if (completedStep.type === 'Token Service') {
                    setLedger(currentLedger => {
                        let newLedger = JSON.parse(JSON.stringify(currentLedger));
                        if (completedStep.tokenAction === 'mint_nft' && completedStep.assetId) {
                            const newNft = { id: `${completedStep.assetId}-${Math.floor(Math.random() * 1000)}`, name: completedStep.assetId };
                            newLedger[agent.id].nfts.push(newNft);
                            assetTransfers.push({ assetId: newNft.id, from: 'MINT', to: agent.id });
                            addLog(`Minted NFT ${newNft.id}.`, 'success', agent.id);
                        } else if (completedStep.tokenAction === 'transfer_ft' && completedStep.assetId && completedStep.assetAmount && completedStep.targetAgent) {
                            let targetId = completedStep.targetAgent;
                            if (targetId === 'ANOTHER_AGENT') {
                                const otherAgents = agents.filter(a => a.id !== agent.id && a.status !== 'error');
                                targetId = otherAgents.length > 0 ? otherAgents[Math.floor(Math.random() * otherAgents.length)].id : '';
                            }
                            const senderFts = newLedger[agent.id].fts;
                            const senderTokenIndex = senderFts.findIndex(t => t.id === completedStep.assetId);
                            if (targetId && newLedger[targetId] && senderTokenIndex > -1 && senderFts[senderTokenIndex].amount >= completedStep.assetAmount) {
                                senderFts[senderTokenIndex].amount -= completedStep.assetAmount;
                                const receiverFts = newLedger[targetId].fts;
                                const receiverTokenIndex = receiverFts.findIndex(t => t.id === completedStep.assetId);
                                if (receiverTokenIndex > -1) {
                                    receiverFts[receiverTokenIndex].amount += completedStep.assetAmount;
                                } else {
                                    receiverFts.push({ id: completedStep.assetId, amount: completedStep.assetAmount });
                                }
                                assetTransfers.push({ assetId: completedStep.assetId, amount: completedStep.assetAmount, from: agent.id, to: targetId });
                                addLog(`Transferred ${completedStep.assetAmount} ${completedStep.assetId} to ${targetId}.`, 'success', agent.id);
                            } else {
                                addLog(`FT Transfer failed. Check balance or target.`, 'error', agent.id);
                            }
                        }
                        return newLedger;
                    });
                }
                
                const stepCost = completedStep.cost || 0;
                setAgents(prev => prev.map(a => {
                    if (a.id !== agent.id) return a;
                    const transactionId = generateMockTransactionId();
                    addLog(`Step Complete: ${a.steps[inProgressIndex].name}. Cost: Ħ${stepCost.toFixed(6)}. TxID: ${transactionId}`, 'success', a.id);
                    const newSteps = a.steps.map((step, index) => 
                        index === inProgressIndex ? { ...step, status: 'completed', transactionId, assetTransfers } : step
                    );
                    const newBalance = a.hbarBalance - stepCost;
                    const newMemory = { ...a.memory, ...agentMemoryUpdate };
                    setNetworkStats(prev => ({ ...prev, totalFees: prev.totalFees + stepCost }));
                    return { ...a, steps: newSteps, hbarBalance: newBalance, memory: newMemory };
                }));
            }, 1500 + Math.random() * 1000);
            cleanupTimers.push(() => clearTimeout(timer));
            return;
        }

        const pendingIndex = agent.steps.findIndex(s => s.status === 'pending');
        if (pendingIndex !== -1) {
            const stepToExecute = agent.steps[pendingIndex];
            const stepCost = stepToExecute.cost || 0;
            
            // Conditional check
            if (stepToExecute.condition) {
                const { key, operator, value } = stepToExecute.condition;
                const memoryValue = agent.memory[key as keyof Agent['memory']];
                let conditionMet = false;
                if (typeof memoryValue === 'number') {
                    if (operator === 'gt' && memoryValue > value) conditionMet = true;
                    if (operator === 'lt' && memoryValue < value) conditionMet = true;
                }
                if (!conditionMet) {
                    addLog(`Condition not met, skipping step: "${stepToExecute.name}"`, 'info', agent.id);
                    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, steps: a.steps.map((s, i) => i === pendingIndex ? { ...s, status: 'skipped' } : s) } : a));
                    return; // Continue to next tick
                }
            }

            if (agent.hbarBalance < stepCost) {
                 addLog(`Execution failed: Insufficient funds. Required: ~Ħ${stepCost.toFixed(6)}, Balance: Ħ${agent.hbarBalance.toFixed(6)}`, 'error', agent.id);
                 setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'error' } : a));
                 return;
            }

            const timer = setTimeout(() => {
                addLog(`Executing: ${stepToExecute.name} (Cost: ~Ħ${stepCost.toFixed(6)})`, 'info', agent.id);
                setAgents(prev => prev.map(a => {
                    if (a.id !== agent.id) return a;
                    const newSteps = a.steps.map((step, index) => 
                        index === pendingIndex ? { ...step, status: 'in-progress' } : step
                    );
                    return { ...a, steps: newSteps };
                }));
            }, 1000);
            cleanupTimers.push(() => clearTimeout(timer));
            return;
        }

        if (agent.steps.length > 0 && agent.steps.every(s => s.status === 'completed' || s.status === 'skipped')) {
             if (agent.status !== 'completed') {
                setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'completed' } : a));
                addLog('All tasks completed. Agent entering standby mode.', 'info', agent.id);
            }
        }
    });

    return () => {
        cleanupTimers.forEach(cleanup => cleanup());
    };
  }, [agents, addLog, generateMockTransactionId, oracleData]);

  const handleDeployAgent = async (taskDescription: string) => {
    setIsLoading(true);
    const agentId = `Nexus-${Math.floor(Math.random() * 900) + 100}`;
    const initialBalance = 50 + Math.random() * 50;
    const newAgent: Agent = { id: agentId, taskDescription, status: 'initializing', steps: [], hbarBalance: initialBalance, memory: {} };

    setAgents(prev => [...prev, newAgent]);
    setLedger(prev => ({ ...prev, [agentId]: { fts: [{id: 'NEX-GOV', amount: 1000}], nfts: [] } }));
    setSelectedAgentId(agentId);
    
    addLog(`Deploying new agent ${agentId} for task: "${taskDescription}"...`);
    addLog(`[${agentId}] Wallet funded with Ħ${initialBalance.toFixed(4)}.`, 'info', agentId);
    addLog(`[${agentId}] Allocated 1000 NEX-GOV tokens.`, 'info', agentId);
    addLog(`[${agentId}] Contacting Nexus AI Coordinator...`, 'info', agentId);

    try {
      const steps = await generateTaskWorkflow(taskDescription);
      addLog(`[${agentId}] AI Coordinator responded. Generating workflow...`, 'success', agentId);
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'running', steps: steps.map(step => ({ ...step, status: 'pending' })) } : a));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      addLog(`[${agentId}] Workflow generation failed. ${errorMessage}`, 'error', agentId);
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'error' } : a));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTransactionModal = (step: TaskStep) => {
    if (!step.transactionId) return;
    setSelectedTransaction({
      id: step.transactionId,
      status: 'SUCCESS',
      consensusTimestamp: new Date().toISOString(),
      memo: step.name,
      fee: `Ħ${(step.cost || 0).toFixed(6)}`,
      assetTransfers: step.assetTransfers,
    });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => setIsModalOpen(false);
  const handleSelectAgent = (agentId: string) => setSelectedAgentId(agentId);
  
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-mono flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          <div className="lg:col-span-3 space-y-6">
            <AgentControlPanel onDeploy={handleDeployAgent} isLoading={isLoading} />
            <AgentFleet agents={agents} selectedAgentId={selectedAgentId} onSelectAgent={handleSelectAgent} />
            <NetworkStats stats={networkStats} />
          </div>
          <div className="lg:col-span-6 space-y-6 flex flex-col min-h-[60vh]">
            <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 flex-grow flex flex-col h-1/2">
                <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center">
                    <CubeIcon className="w-5 h-5 mr-2" />
                    {selectedAgent ? `Agent ${selectedAgent.id} Workflow` : 'Agent Task Workflow'}
                </h2>
                {isLoading && !selectedAgent?.steps.length ? (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-cyan-300">AI analyzing task...</p>
                        </div>
                    </div>
                ) : selectedAgent?.status === 'error' ? (
                    <div className="flex-grow flex items-center justify-center text-red-400">Failed to generate workflow for agent {selectedAgent.id}.</div>
                ) : selectedAgent?.steps.length ? (
                    <WorkflowVisualizer steps={selectedAgent.steps} onTransactionClick={handleOpenTransactionModal} />
                ) : (
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-gray-400">Deploy an agent to see its workflow.</p>
                    </div>
                )}
            </div>
            <LiveActivityFeed logs={activityLogs} />
          </div>
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            <OracleDataFeed data={oracleData} />
            <HcsMessageFeed messages={hcsMessages} />
            <DigitalAssetLedger ledger={ledger} agents={agents} />
          </div>
        </div>
      </main>
      {isModalOpen && selectedTransaction && (
        <TransactionModal transaction={selectedTransaction} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default App;