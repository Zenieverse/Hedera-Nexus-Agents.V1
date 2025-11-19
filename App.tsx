
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
        const currentTotalStaked = Object.values(ledger).reduce((sum: number, holdings: AssetHoldings) => sum + (holdings.stakedNexGov || 0), 0);
        
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

  // ROBUST AGENT EXECUTION LOOP (Timestamp-based State Machine)
  useEffect(() => {
    if (!initialStateLoaded) return;

    const tick = setTimeout(() => {
        const now = Date.now();
        const eventMultiplier = activeNetworkEvent ? activeNetworkEvent.multiplier : 1.0;
        const effectiveFeeMultiplier = networkStats.feeMultiplier * eventMultiplier;

        let ledgerUpdated = false;
        let accumulatedLedger: Ledger = JSON.parse(JSON.stringify(ledger)); 
        let feesToAdd = 0;
        let hcsMessagesToAdd: HcsMessage[] = [];
        let logsToAdd: {msg: string, type: ActivityLog['type'], id: string}[] = [];
        let stateChanged = false;

        const newAgents = agents.map(agent => {
            if (agent.status !== 'running') return agent;

            // Level 1: ~1500ms base. Level 10: ~500ms base.
            const speedReduction = (agent.level - 1) * 100;
            const baseDelay = Math.max(500, (1500 - speedReduction) + Math.random() * 500);
            const stepStartDelay = 1000;

            const inProgressIndex = agent.steps.findIndex(s => s.status === 'in-progress');
            const pendingIndex = agent.steps.findIndex(s => s.status === 'pending');

            // --- LOGIC: COMPLETE IN-PROGRESS STEP ---
            if (inProgressIndex !== -1) {
                if (!agent.nextActionAt) {
                    stateChanged = true;
                    return { ...agent, nextActionAt: now + baseDelay };
                }
                
                if (now >= agent.nextActionAt) {
                    const step = agent.steps[inProgressIndex];
                    const actualCost = (step.cost || 0) * effectiveFeeMultiplier;
                    let assetTransfers: AssetTransfer[] = [];
                    let memoryUpdate: Partial<Agent['memory']> = {};
                    const transactionId = generateMockTransactionId();

                    if (step.type === 'Oracle') {
                        const value = oracleData[step.oracleKey!];
                        memoryUpdate[step.oracleKey!] = value;
                        logsToAdd.push({ msg: `Queried Oracle for '${step.oracleKey}': ${value}`, type: 'success', id: agent.id });
                    } else if (step.type === 'HCS' && step.message) {
                        let processedMessage = step.message;
                        Object.entries(agent.memory).forEach(([key, value]) => {
                           processedMessage = processedMessage.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
                        });
                        hcsMessagesToAdd.push({ agentId: agent.id, message: processedMessage, timestamp: new Date() });
                        logsToAdd.push({ msg: `Broadcast HCS message: "${processedMessage}"`, type: 'success', id: agent.id });
                    } else if (step.type === 'Token Service') {
                        ledgerUpdated = true;
                        if (!accumulatedLedger[agent.id]) accumulatedLedger[agent.id] = { fts: [], nfts: [], stakedNexGov: 0 };
                        
                        if (step.tokenAction === 'mint_nft' && step.assetId) {
                            const newNft = { id: `${step.assetId}-${Math.floor(Math.random() * 1000)}`, name: step.assetId };
                            accumulatedLedger[agent.id].nfts.push(newNft);
                            assetTransfers.push({ assetId: newNft.id, from: 'MINT', to: agent.id });
                            logsToAdd.push({ msg: `Minted NFT ${newNft.id}.`, type: 'success', id: agent.id });
                        } else if (step.tokenAction === 'transfer_ft' && step.assetId && step.assetAmount) {
                            let targetId = step.targetAgent;
                            if (targetId === 'ANOTHER_AGENT') {
                                const otherAgents = agents.filter(a => a.id !== agent.id && a.status !== 'error');
                                targetId = otherAgents.length > 0 ? otherAgents[Math.floor(Math.random() * otherAgents.length)].id : '';
                            }
                            const senderFts = accumulatedLedger[agent.id].fts;
                            const senderTokenIndex = senderFts.findIndex((t) => t.id === step.assetId);
                            if (targetId && accumulatedLedger[targetId] && senderTokenIndex > -1 && senderFts[senderTokenIndex].amount >= step.assetAmount) {
                                senderFts[senderTokenIndex].amount -= step.assetAmount;
                                const receiverFts = accumulatedLedger[targetId].fts;
                                const receiverTokenIndex = receiverFts.findIndex((t) => t.id === step.assetId);
                                if (receiverTokenIndex > -1) {
                                    receiverFts[receiverTokenIndex].amount += step.assetAmount;
                                } else {
                                    receiverFts.push({ id: step.assetId, amount: step.assetAmount });
                                }
                                assetTransfers.push({ assetId: step.assetId, amount: step.assetAmount, from: agent.id, to: targetId });
                                logsToAdd.push({ msg: `Transferred ${step.assetAmount} ${step.assetId} to ${targetId}.`, type: 'success', id: agent.id });
                            } else {
                                logsToAdd.push({ msg: `FT Transfer failed. Check balance or target.`, type: 'error', id: agent.id });
                            }
                        }
                    } else if (step.type === 'Governance') {
                        if (step.governanceAction === 'stake' && step.stakeAmount) {
                            ledgerUpdated = true;
                            const fts = accumulatedLedger[agent.id].fts;
                            const nexGovIndex = fts.findIndex((t) => t.id === 'NEX-GOV');
                            if (nexGovIndex > -1 && fts[nexGovIndex].amount >= step.stakeAmount) {
                                fts[nexGovIndex].amount -= step.stakeAmount;
                                accumulatedLedger[agent.id].stakedNexGov = (accumulatedLedger[agent.id].stakedNexGov || 0) + step.stakeAmount;
                                logsToAdd.push({ msg: `Staked ${step.stakeAmount} NEX-GOV.`, type: 'success', id: agent.id });
                            } else {
                                logsToAdd.push({ msg: `Staking failed: Insufficient NEX-GOV.`, type: 'error', id: agent.id });
                            }
                        } else if (step.governanceAction === 'vote' && step.voteOption) {
                             const votingPower: number = ledger[agent.id]?.stakedNexGov || 0;
                             if (votingPower > 0 && activeProposal && activeProposal.status === 'active') {
                                 logsToAdd.push({ msg: `Voted ${step.voteOption.toUpperCase()} on ${activeProposal.id}.`, type: 'success', id: agent.id });
                             } else {
                                 logsToAdd.push({ msg: `Voting failed.`, type: 'error', id: agent.id });
                             }
                        }
                    }

                    logsToAdd.push({ msg: `Step Complete: ${step.name}. Cost: Ħ${actualCost.toFixed(6)}. TxID: ${transactionId}`, type: 'success', id: agent.id });
                    feesToAdd += actualCost;

                    const xpGain = 50 + Math.floor(Math.random() * 50);
                    const newXp = agent.xp + xpGain;
                    const nextLevel = Math.floor(newXp / 500) + 1;
                    if (nextLevel > agent.level) {
                        logsToAdd.push({ msg: `LEVEL UP! Agent ${agent.id} reached Level ${nextLevel}.`, type: 'success', id: agent.id });
                    }

                    stateChanged = true;
                    return {
                        ...agent,
                        steps: agent.steps.map((s, i) => i === inProgressIndex ? { ...s, status: 'completed', transactionId, assetTransfers } : s),
                        hbarBalance: agent.hbarBalance - actualCost,
                        memory: { ...agent.memory, ...memoryUpdate },
                        xp: newXp,
                        level: nextLevel,
                        nextActionAt: undefined
                    };
                }
                return agent;
            }

            // --- LOGIC: START PENDING STEP ---
            if (pendingIndex !== -1) {
                if (!agent.nextActionAt) {
                    stateChanged = true;
                    return { ...agent, nextActionAt: now + stepStartDelay };
                }

                if (now >= agent.nextActionAt) {
                    const step = agent.steps[pendingIndex];
                    const stepCost = (step.cost || 0) * effectiveFeeMultiplier;
                    
                    if (step.condition) {
                        const { key, operator, value } = step.condition;
                        const memoryValue = agent.memory[key as keyof Agent['memory']];
                        let conditionMet = false;
                        if (typeof memoryValue === 'number') {
                            if (operator === 'gt' && memoryValue > value) conditionMet = true;
                            if (operator === 'lt' && memoryValue < value) conditionMet = true;
                        }
                        if (!conditionMet) {
                            logsToAdd.push({ msg: `Condition not met, skipping: "${step.name}"`, type: 'info', id: agent.id });
                            stateChanged = true;
                            return {
                                ...agent,
                                steps: agent.steps.map((s, i) => i === pendingIndex ? { ...s, status: 'skipped' } : s),
                                nextActionAt: undefined
                            };
                        }
                    }

                    if (agent.hbarBalance < stepCost) {
                        logsToAdd.push({ msg: `Execution failed: Insufficient funds.`, type: 'error', id: agent.id });
                        stateChanged = true;
                        return { ...agent, status: 'error' };
                    }

                    logsToAdd.push({ msg: `Executing: ${step.name} (Cost: ~Ħ${stepCost.toFixed(6)})`, type: 'info', id: agent.id });
                    stateChanged = true;
                    return {
                        ...agent,
                        steps: agent.steps.map((s, i) => i === pendingIndex ? { ...s, status: 'in-progress' } : s),
                        nextActionAt: undefined
                    };
                }
                return agent;
            }

            // --- LOGIC: ALL DONE ---
            if (agent.steps.length > 0 && agent.steps.every(s => s.status === 'completed' || s.status === 'skipped')) {
                stateChanged = true;
                logsToAdd.push({ msg: 'All tasks completed. Agent entering standby mode.', type: 'info', id: agent.id });
                return { ...agent, status: 'completed' };
            }

            return agent;
        });

        if (stateChanged) {
            setAgents(newAgents);
            if (ledgerUpdated) setLedger(accumulatedLedger);
            if (logsToAdd.length > 0) logsToAdd.forEach(l => addLog(l.msg, l.type, l.id));
            if (feesToAdd > 0) setNetworkStats(prev => ({ ...prev, totalFees: prev.totalFees + feesToAdd }));
            if (hcsMessagesToAdd.length > 0) setHcsMessages(prev => [...hcsMessagesToAdd, ...prev]);
            
             if (activeProposal && activeProposal.status === 'active') {
                 let votesForAdd = 0;
                 let votesAgainstAdd = 0;
                 newAgents.forEach((agent, idx) => {
                     const voteLogs = logsToAdd.filter(l => l.id === agent.id && l.msg.includes('Voted'));
                     voteLogs.forEach(log => {
                         const power = ledger[agent.id]?.stakedNexGov || 0;
                         if (log.msg.includes('YES')) votesForAdd += power;
                         if (log.msg.includes('NO')) votesAgainstAdd += power;
                     });
                 });

                 if (votesForAdd > 0 || votesAgainstAdd > 0) {
                     setActiveProposal(prev => prev ? ({
                         ...prev,
                         votesFor: prev.votesFor + votesForAdd,
                         votesAgainst: prev.votesAgainst + votesAgainstAdd
                     }) : null);
                 }
             }
        }

    }, 200);

    return () => clearTimeout(tick);
  }, [agents, ledger, oracleData, networkStats.feeMultiplier, activeNetworkEvent, activeProposal, initialStateLoaded, addLog, generateMockTransactionId]);

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

  const handleStopAgent = (agentId: string) => {
      if (window.confirm(`Are you sure you want to stop agent ${agentId}? This will halt its current mission.`)) {
          setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'error' } : a));
          addLog(`Agent ${agentId} manually stopped by user.`, 'error', agentId);
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
  const handleClearLogs = () => setActivityLogs([]);
  
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
            <AgentFleet 
                agents={agents} 
                selectedAgentId={selectedAgentId} 
                onSelectAgent={handleSelectAgent} 
                onStopAgent={handleStopAgent}
            />
            <NetworkStats stats={networkStats} />
          </div>
          <div className="lg:col-span-6 space-y-6 flex flex-col min-h-[60vh]">
            <div className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 flex-grow flex flex-col h-1/2">
                <h2 className="text-lg font-bold text-cyan-400 mb-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <CubeIcon className="w-5 h-5 mr-2" />
                        {selectedAgent ? `Agent ${selectedAgent.id} Workflow` : 'Agent Task Workflow'}
                    </div>
                    {selectedAgent?.status === 'error' && (
                        <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded border border-red-500/50 animate-pulse">
                            HALTED
                        </span>
                    )}
                </h2>
                {isLoading && !selectedAgent?.steps.length ? (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-cyan-300">AI analyzing task...</p>
                        </div>
                    </div>
                ) : selectedAgent?.steps.length ? (
                    <>
                        <div className={`relative flex-grow overflow-hidden flex flex-col ${selectedAgent.status === 'error' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                             <WorkflowVisualizer steps={selectedAgent.steps} onTransactionClick={handleOpenTransactionModal} />
                        </div>
                        {selectedAgent && Object.keys(selectedAgent.memory).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700/50">
                                <h3 className="text-xs font-bold text-cyan-400/70 mb-2 uppercase tracking-wider flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    Active Memory
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(selectedAgent.memory).map(([k, v]) => (
                                        <div key={k} className="bg-gray-900/50 px-2 py-1.5 rounded border border-gray-700 text-xs flex justify-between items-center">
                                            <span className="text-gray-400">{k}:</span>
                                            <span className="text-cyan-300 font-mono">{String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center">
                        <p className="text-gray-400">Deploy an agent to see its workflow.</p>
                    </div>
                )}
            </div>
            <LiveActivityFeed logs={activityLogs} onClear={handleClearLogs} />
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
