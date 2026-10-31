/**
 * SupplyGuard AI - Gemini AI Decision Assistant
 * Multi-Agent Interactive Consultation Console
 */

import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { AgentRole, AgentResponse } from '../server/agents/orchestrator.agent.ts';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Flame,
  ShieldCheck,
  SlidersHorizontal,
  FileText,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';

export function AIAssistantPage() {
  const [activeRole, setActiveRole] = useState<AgentRole>('orchestrator');
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'agent'; text: string; data?: AgentResponse }[]
  >([
    {
      sender: 'agent',
      text: 'SupplyGuard AI Multi-Agent Console online. I am initialized with current Digital Twin state, real-time inventory buffers, and deterministic Pareto optimization models. Select a specialized agent or enter an operational query.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const agents: { id: AgentRole; name: string; roleDesc: string; icon: any }[] = [
    {
      id: 'orchestrator',
      name: 'Master Orchestrator',
      roleDesc: 'Holistic autonomous triage & crisis orchestration',
      icon: Bot,
    },
    {
      id: 'disruption',
      name: 'Disruption Intelligence',
      roleDesc: 'Upstream supply tiers, smelter & foundry vulnerabilities',
      icon: ShieldAlert,
    },
    {
      id: 'impact',
      name: 'Downstream Blast Radius',
      roleDesc: 'Stockout calculations, line idle costs & SLA damages',
      icon: Flame,
    },
    {
      id: 'recovery',
      name: 'Recovery Formulation',
      roleDesc: 'Actionable procurement, buffer reallocation & rescheduling',
      icon: ShieldCheck,
    },
    {
      id: 'optimization',
      name: 'Optimization Specialist',
      roleDesc: 'Multi-criteria trade-offs, Pareto frontier & weights',
      icon: SlidersHorizontal,
    },
    {
      id: 'explanation',
      name: 'Executive Transparency',
      roleDesc: 'Plain-English debriefs for VP of Supply Chain & C-Suite',
      icon: FileText,
    },
  ];

  const quickPrompts: Record<AgentRole, string[]> = {
    orchestrator: [
      'Provide full situational report on current supply chain crises.',
      'What is the recommended operational recovery path?',
      'Summarize total financial exposure and critical orders at risk.',
    ],
    disruption: [
      'Analyze root cause of S1 Lumina Display cleanroom fab outage in Gumi.',
      'What happens if secondary supplier S2 in Osaka also fails?',
      'Identify geographic concentration vulnerabilities across Tier-1 suppliers.',
    ],
    impact: [
      'Calculate exact stockout timeline for Shenzhen Factory F1.',
      'Which customers face liquidated SLA damages and what is the penalty?',
      'Audit unabsorbed overhead from factory line stalls.',
    ],
    recovery: [
      'Explain specific action items in Plan D Hybrid Recovery.',
      'Can we reroute safety stock from Austin F3 without breaching safety floors?',
      'What are the lead times and expedite costs for secondary OLED display panels?',
    ],
    optimization: [
      'Explain why Plan D is ranked #1 over Plan A and Plan B.',
      'How sensitive is the ranking if SLA weight increases to 50%?',
      'Verify why Plan A becomes physically infeasible during dual failure.',
    ],
    explanation: [
      'Generate a 4-bullet executive briefing for the Board of Directors.',
      'List all known facts versus simulation assumptions in current estimate.',
      'Explain why autonomous recommendation requires human authorization.',
    ],
  };

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || inputMessage;
    if (!text.trim() || loading) return;

    setInputMessage('');
    setChatHistory((prev) => [...prev, { sender: 'user', text }]);
    setLoading(true);

    try {
      const response = await api.sendAiQuery(activeRole, text);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: response.response,
          data: response,
        },
      ]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Operational query failed: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Gemini AI Decision Assistant</h1>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous multi-agent council grounded directly in Digital Twin state and deterministic business logic.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Model:</span>
          <span className="text-cyan-300 font-semibold">Gemini 3.8 Flash / Deterministic Fallback</span>
        </div>
      </div>

      {/* Specialized Agent Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {agents.map((ag) => {
          const Icon = ag.icon;
          const isActive = activeRole === ag.id;

          return (
            <button
              key={ag.id}
              onClick={() => setActiveRole(ag.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-xs font-bold text-white truncate">{ag.name}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 mt-1.5 leading-snug">
                {ag.roleDesc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Chat Interface */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[560px] overflow-hidden shadow-xl">
        {/* Chat History Viewport */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {chatHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[10px] font-mono text-slate-500 mb-1">
                {item.sender === 'user' ? 'Supply Chain Operator' : item.data?.agentName || 'SupplyGuard Agent'}
              </div>

              <div
                className={`max-w-3xl p-4 rounded-2xl text-xs leading-relaxed ${
                  item.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none space-y-3'
                }`}
              >
                <div className="whitespace-pre-wrap">{item.text}</div>

                {/* Evidence & Metric Citations Card if agent provided */}
                {item.data && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Source Grounding:</span>
                      <span className="text-cyan-400">{item.data.modelUsed}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {Object.entries(item.data.keyMetrics || {}).map(([k, v]) => (
                        <div key={k} className="p-2 bg-slate-900 rounded border border-slate-800">
                          <span className="text-[9px] text-slate-500 block uppercase">{k}</span>
                          <span className="text-white font-bold">{v}</span>
                        </div>
                      ))}
                    </div>

                    {item.data.evidenceCitations?.length > 0 && (
                      <div className="text-[10px] text-slate-400 space-y-0.5 pt-1">
                        <span className="text-slate-500 uppercase block">Evidence Citations:</span>
                        {item.data.evidenceCitations.map((cit, cIdx) => (
                          <div key={cIdx} className="text-slate-300">· {cit}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>{agents.find((a) => a.id === activeRole)?.name} is synthesizing digital twin state...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Strip */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono text-slate-500 uppercase whitespace-nowrap pl-2">
            Suggested Queries:
          </span>
          {quickPrompts[activeRole].map((p, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(p)}
              className="px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            placeholder={`Ask ${agents.find((a) => a.id === activeRole)?.name} about supply bottlenecks, trade-offs, or recovery...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-950/50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Consult</span>
          </button>
        </div>
      </div>
    </div>
  );
}
