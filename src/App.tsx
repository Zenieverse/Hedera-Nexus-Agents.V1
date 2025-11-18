
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
import GovernancePanel from './components/GovernancePanel.tsx';
import NetworkEventBanner from './components/NetworkEventBanner.tsx';
import { generateTaskWorkflow } from './services/geminiService.ts';
import type { TaskStep, ActivityLog, NetworkStatsData, TransactionDetails, Agent, Ledger, AssetTransfer, OracleData, HcsMessage, GovernanceProposal, AssetHoldings, ActiveNetworkEvent } from './types.ts';
import { CubeIcon } from './components/CubeIcon.tsx';

const SAVED_STATE_KEY = 'hederaNexusAgentsState_v4';

const App: React.FC = () => {
  const [initialStateLoaded, setInitialStateLoaded] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [networkStats, setNetworkStats] = useState<NetworkStatsData>({
    tps: 12456, activeAgents: 0, consensusTime: 2.1, totalFees: 0, feeMultiplier: 1.0, totalStaked: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ledger, setLedger] = useState<Ledger>({});
  const [oracleData, setOracleData] = useState<OracleData>({
    hbarPrice: 0.08 + (Math.random() - 0.5) * 0.01,
    marketSentiment: 'neutral',
  });
  const [hcsMessages, setHcsMessages] = useState<HcsMessage[]>([]);
  const [activeProposal, setActiveProposal] = useState<GovernanceProposal | null>(null);
  const [activeNetworkEvent, setActiveNetworkEvent] = useState<ActiveNetworkEvent | null>(null);

  // Load state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(SAVED_STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        setAgents((parsed.agents || []).map((a: any) => ({...a, xp: a.xp || 0, level: a.level || 1})));
        setSelectedAgentId(parsed.selectedAgentId || null);
        setActivityLogs((parsed.activityLogs || []).map((log: any) => ({...log, timestamp: new Date(log.timestamp)})));
        setNetworkStats(parsed.networkStats || { tps: 12456, activeAgents: 0, consensusTime: 2.1, totalFees: 0, feeMultiplier: 1.0, totalStaked: 0 });
        setLedger(parsed.ledger || {});
        setHcsMessages((parsed.hcsMessages || []).map((msg: any) => ({...msg, timestamp: new Date(msg.timestamp)})));
        if (parsed.activeProposal) {
            setActiveProposal({
                ...parsed.activeProposal,
                createdAt: new Date(parsed.activeProposal.createdAt),
                expiresAt: new Date(parsed.activeProposal.expiresAt)
            });
        }
        if (parsed.activeNetworkEvent) {
             const expiresAt = new Date(parsed.activeNetworkEvent.expiresAt);
             if (expiresAt > new Date()) {
                setActiveNetworkEvent({ ...parsed.activeNetworkEvent, expiresAt });
             }
        }
      }
    } catch (error) {
      console.error("Failed to load saved state:", error);
    }
    setInitialStateLoaded(true);
  }, []);

  // Save state
  useEffect(() => {
    if (!initialStateLoaded) return;
    try {
      const stateToSave = { agents, selectedAgentId, activityLogs, networkStats, ledger, hcsMessages, activeProposal, activeNetworkEvent };
      localStorage.setItem(SAVED_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }, [agents, selectedAgentId, activityLogs, networkStats, ledger, hcsMessages, activeProposal, activeNetworkEvent, initialStateLoaded]);


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

  // Oracle Simulation
  useEffect(() => {
    const oracleInterval = setInterval(() => {
      setOracleData(prev => ({
        hbarPrice: Math.max(0.05, prev.hbarPrice + (Math.random() - 0.5) * 0.005),
        marketSentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as OracleData['marketSentiment'],
      }));
    }, 5000);
    return () => clearInterval(oracleInterval);
  }, []);

  // Network Event Loop
  useEffect(() => {
      if (!initialStateLoaded) return;
      
      // Event Generation
      if (!activeNetworkEvent) {
          const timer = setTimeout(() => {
              const events = [
                  { id: 'EVT-1', title: 'Network Congestion', description: 'High traffic volume. Transaction fees increased.', type: 'congestion', multiplier: 1.5, duration: 30000 },
                  { id: 'EVT-2', title: 'Consensus Upgrade', description: 'Network optimization. Transaction fees reduced.', type: 'upgrade', multiplier: 0.7, duration: 45000 },
                  { id: 'EVT-3', title: 'HCS Anomaly', description: 'Message bus delays. Minor fee fluctuation.', type: 'anomaly', multiplier: 1.1, duration: 20000 },
              ] as const;
              const evt = events[Math.floor(Math.random() * events.length)];
              setActiveNetworkEvent({ ...evt, expiresAt: new Date(Date.now() + evt.duration) });
              addLog(`NETWORK EVENT: ${evt.title} - ${evt.description}`, 'info');
          }, 40000 + Math.random() * 40000);
          return () => clearTimeout(timer);
      }

      // Event Expiry
      const checkInterval = setInterval(() => {
          if (activeNetworkEvent && new Date() > activeNetworkEvent.expiresAt) {
              addLog(`Network Event Ended: ${activeNetworkEvent.title}`, 'info');
              setActiveNetworkEvent(null);
          }
      }, 1000);
      return () => clearInterval(checkInterval);

  }, [activeNetworkEvent, addLog, initialStateLoaded]);

  // Combined Fee Multiplier Calculation (DAO + Event)
  useEffect(() => {
      if (!initialStateLoaded) return;
      let multiplier = 1.0;
      
      // Apply DAO Governance
      if (activeProposal && activeProposal.status === 'executed') {
          multiplier = activeProposal.effect.value;
      } else if (networkStats.feeMultiplier !== 1.0 && (!activeProposal || activeProposal.status !== 'executed')) {
          // Keep persistent DAO change if no active proposal overwriting, or retrieve from stats
          // Actually, let's assume networkStats.feeMultiplier holds the "base" DAO policy
          multiplier = networkStats.feeMultiplier; 
      }

      // Apply Network Event
      if (activeNetworkEvent) {
          multiplier *= activeNetworkEvent.multiplier;
      }

      // Update logic would technically go here, but since we use `networkStats.feeMultiplier` as base,
      // we should calculate EFFECTIVE multiplier during execution, rather than updating state constantly to avoid loops.
      // We will compute `effectiveMultiplier` inside the execution loop.

  }, [activeNetworkEvent, activeProposal, networkStats.feeMultiplier, initialStateLoaded]);


  // Governance Proposal Generation and Lifecycle
  useEffect(() => {
    if (!initialStateLoaded) return;

    if (!activeProposal) {
        const timer = setTimeout(() => {
            const types = [
                { title: "NIP-42: Reduce Network Fees", desc: "Lower transaction fees by 20% to stimulate activity.", val: 0.8 },
                { title: "NIP-43: Increase Validator Rewards", desc: "Increase fees by 20% to secure the network.", val: 1.2 },
                { title: "NIP-44: Optimization Patch", desc: "Slight fee reduction for optimized smart contracts.", val: 0.95 }
            ];
            const selected = types[Math.floor(Math.random() * types.length)];
            const newProposal: GovernanceProposal = {
                id: `PROP-${Math.floor(Math.random() * 1000)}`,
                title: selected.title,
                description: selected.desc,
                votesFor: 0,
                votesAgainst: 0,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 60000 * 2), 
                status: 'active',
                effect: { type: 'fee_multiplier', value: selected.val }
            };
            setActiveProposal(newProposal);
            addLog(`New Governance Proposal Created: ${newProposal.title}`, 'info');
        }, 60000 + Math.random() * 60000); 
        return () => clearTimeout(timer);
    }

    const checkInterval = setInterval(() => {
        if (activeProposal && activeProposal.status === 'active') {
            if (new Date() > activeProposal.expiresAt) {
                const passed = activeProposal.votesFor > activeProposal.votesAgainst;
                const newStatus = passed ? 'passed' : 'failed';
                setActiveProposal(prev => prev ? ({ ...prev, status: newStatus }) : null);
                
                if (passed) {
                    addLog(`Proposal ${activeProposal.id} PASSED. Executing changes...`, 'success');
                    setTimeout(() => {
                        setNetworkStats(prev => ({ ...prev, feeMultiplier: activeProposal.effect.value }));
                        setActiveProposal(prev => prev ? ({ ...prev, status: 'executed' }) : null);
                        addLog(`Network Fee Multiplier updated to ${activeProposal.effect.value}x`, 'success');
                        setTimeout(() => setActiveProposal(null), 10000);
                    }, 2000);
                } else {
                    addLog(`Proposal ${activeProposal.id} FAILED.`, 'error');
                     setTimeout(() => setActiveProposal(null), 10000);
                }
            }
        }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [activeProposal, addLog, initialStateLoaded]);


  // Network Stats Updates
  useEffect(() => {
    const interval = setInterval(() => {
        const currentTotalStaked = Object.values(ledger).reduce((sum, holdings: AssetHoldings) => sum + (holdings.stakedNexGov || 0), 0);
        
        setNetworkStats(prevStats => ({
            ...prevStats,
            activeAgents: agents.filter(a => a.status === 'running').length,
            tps: Math.max(10000, Math.floor(prevStats.tps + (Math.random() - 0.4) * 100)),
            consensusTime: Math.max(1.5, parseFloat((prevStats.consensusTime + (Math.random() - 0.5) * 0.1).toFixed(2))),
            totalStaked: currentTotalStaked
        }));
    }, 2000);
    return () => clearInterval(interval);
  }, [agents, ledger]);

  // Agent Execution Loop
  useEffect(() => {
    const cleanupTimers: (() => void)[] = [];

    // Calculate effective fee multiplier (Base/DAO * Event)
    const eventMultiplier = activeNetworkEvent ? activeNetworkEvent.multiplier : 1.0;
    const effectiveFeeMultiplier = networkStats.feeMultiplier * eventMultiplier;

    agents.forEach(agent => {
        if (agent.status !== 'running') return;

        // Calculate execution speed based on Level
        // Level 1: 1500ms base. Level 10: 500ms base.
        const speedReduction = (agent.level - 1) * 100;
        const baseDelay = Math.max(500, (1500 - speedReduction) + Math.random() * 500);

        const inProgressIndex = agent.steps.findIndex(s => s.status === 'in-progress');
        if (inProgressIndex !== -1) {
            const timer = setTimeout(() => {
                const completedStep = agent.steps[inProgressIndex];
                let assetTransfers: AssetTransfer[] = [];
                let agentMemoryUpdate: Partial<Agent['memory']> = {};
                let cost = completedStep.cost || 0;

                const actualCost = cost * effectiveFeeMultiplier;

                // Handle Step Logic
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
                            const senderTokenIndex = senderFts.findIndex((t: any) => t.id === completedStep.assetId);
                            if (targetId && newLedger[targetId] && senderTokenIndex > -1 && senderFts[senderTokenIndex].amount >= completedStep.assetAmount) {
                                senderFts[senderTokenIndex].amount -= completedStep.assetAmount;
                                const receiverFts = newLedger[targetId].fts;
                                const receiverTokenIndex = receiverFts.findIndex((t: any) => t.id === completedStep.assetId);
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
                } else if (completedStep.type === 'Governance') {
                    if (completedStep.governanceAction === 'stake' && completedStep.stakeAmount) {
                        setLedger(currentLedger => {
                            const newLedger = JSON.parse(JSON.stringify(currentLedger));
                            const fts = newLedger[agent.id].fts;
                            const nexGovIndex = fts.findIndex((t: any) => t.id === 'NEX-GOV');
                            
                            const stakeAmount = completedStep.stakeAmount || 0;

                            if (nexGovIndex > -1 && fts[nexGovIndex].amount >= stakeAmount) {
                                fts[nexGovIndex].amount -= stakeAmount;
                                newLedger[agent.id].stakedNexGov = (newLedger[agent.id].stakedNexGov || 0) + stakeAmount;
                                addLog(`Staked ${stakeAmount} NEX-GOV for voting power.`, 'success', agent.id);
                            } else {
                                addLog(`Staking failed: Insufficient NEX-GOV.`, 'error', agent.id);
                            }
                            return newLedger;
                        });
                    } else if (completedStep.governanceAction === 'vote' && completedStep.voteOption) {
                        const votingPower: number = ledger[agent.id]?.stakedNexGov || 0;
                        if (votingPower > 0 && activeProposal && activeProposal.status === 'active') {
                            setActiveProposal((prev: GovernanceProposal | null) => {
                                if (!prev) return null;
                                return {
                                    ...prev,
                                    votesFor: completedStep.voteOption === 'yes' ? prev.votesFor + votingPower : prev.votesFor,
                                    votesAgainst: completedStep.voteOption === 'no' ? prev.votesAgainst + votingPower : prev.votesAgainst,
                                };
                            });
                            addLog(`Voted ${completedStep.voteOption.toUpperCase()} on ${activeProposal.id} with ${votingPower} power.`, 'success', agent.id);
                        } else {
                            addLog(`Voting failed: No active proposal or no staked tokens.`, 'error', agent.id);
                        }
                    }
                }
                
                setAgents(prev => prev.map(a => {
                    if (a.id !== agent.id) return a;
                    const transactionId = generateMockTransactionId();
                    addLog(`Step Complete: ${a.steps[inProgressIndex].name}. Cost: Ħ${actualCost.toFixed(6)}. TxID: ${transactionId}`, 'success', a.id);
                    
                    // XP Logic
                    const xpGain = 50 + Math.floor(Math.random() * 50);
                    const newXp = a.xp + xpGain;
                    const nextLevel = Math.floor(newXp / 500) + 1;
                    let levelUp = false;
                    if (nextLevel > a.level) {
                        addLog(`LEVEL UP! Agent ${a.id} reached Level ${nextLevel}. Efficiency increased.`, 'success', a.id);
                        levelUp = true;
                    }

                    const newSteps = a.steps.map((step, index) => 
                        index === inProgressIndex ? { ...step, status: 'completed', transactionId, assetTransfers } : step
                    );
                    const newBalance = a.hbarBalance - actualCost;
                    const newMemory = { ...a.memory, ...agentMemoryUpdate };
                    setNetworkStats(prev => ({ ...prev, totalFees: prev.totalFees + actualCost }));
                    return { ...a, steps: newSteps, hbarBalance: newBalance, memory: newMemory, xp: newXp, level: nextLevel };
                }));
            }, baseDelay);
            cleanupTimers.push(() => clearTimeout(timer));
            return;
        }

        const pendingIndex = agent.steps.findIndex(s => s.status === 'pending');
        if (pendingIndex !== -1) {
            const stepToExecute = agent.steps[pendingIndex];
            const stepCost = (stepToExecute.cost || 0) * effectiveFeeMultiplier;
            
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
                    return; 
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
  }, [agents, addLog, generateMockTransactionId, oracleData, networkStats.feeMultiplier, ledger, activeProposal, activeNetworkEvent]);

  const handleDeployAgent = async (taskDescription: string) => {
    setIsLoading(true);
    const agentId = `Nexus-${Math.floor(Math.random() * 900) + 100}`;
    const initialBalance = 50 + Math.random() * 50;
    const newAgent: Agent = { id: agentId, taskDescription, status: 'initializing', steps: [], hbarBalance: initialBalance, memory: {}, xp: 0, level: 1 };

    setAgents(prev => [...prev, newAgent]);
    setLedger(prev => ({ ...prev, [agentId]: { fts: [{id: 'NEX-GOV', amount: 1000}], nfts: [], stakedNexGov: 0 } }));
    setSelectedAgentId(agentId);
    
    addLog(`Deploying new agent ${agentId}...`);
    addLog(`[${agentId}] Wallet funded: Ħ${initialBalance.toFixed(4)}.`, 'info', agentId);
    addLog(`[${agentId}] Airdropped 1000 NEX-GOV tokens.`, 'info', agentId);

    try {
      const steps = await generateTaskWorkflow(taskDescription);
      addLog(`[${agentId}] Workflow generated. Mission Start.`, 'success', agentId);
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
      fee: `Ħ${((step.cost || 0) * networkStats.feeMultiplier).toFixed(6)}`,
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
      {activeNetworkEvent && (
          <NetworkEventBanner event={activeNetworkEvent} />
      )}
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
            <GovernancePanel proposal={activeProposal} />
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
