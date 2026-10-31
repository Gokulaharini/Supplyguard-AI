/**
 * SupplyGuard AI - Automated Evaluation & Benchmark Testing Centre
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { EvaluationScenario } from '../shared/types.ts';
import { EvaluationReport } from '../server/evaluation/test.runner.ts';
import {
  CheckSquare,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export function EvaluationPage() {
  const [scenarios, setScenarios] = useState<EvaluationScenario[]>([]);
  const [report, setReport] = useState<EvaluationReport['summary'] | null>(null);
  const [running, setRunning] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  const loadScenarios = async () => {
    try {
      const res = await api.getEvaluations();
      setScenarios(res.scenarios);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadScenarios();
  }, []);

  const handleRunAll = async () => {
    setRunning(true);
    try {
      const res = await api.runEvaluations();
      setReport(res.report.summary);
      setScenarios(res.report.results);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const handleRunSingle = async (scenarioId: string) => {
    setRunningId(scenarioId);
    try {
      const res = await api.runEvaluations(scenarioId);
      setScenarios((prev) =>
        prev.map((s) => (s.id === scenarioId ? res.result : s))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Evaluation & Benchmark Testing Centre</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic test harness executing 10 canonical supply chain stress benchmarks and verifying mathematical invariants.
          </p>
        </div>

        <button
          onClick={handleRunAll}
          disabled={running}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 rounded-xl transition-colors shadow-lg shadow-cyan-950/50 flex items-center gap-2 shrink-0"
        >
          <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Executing Test Suite...' : 'Run All 10 Benchmark Tests'}</span>
        </button>
      </div>

      {/* Aggregate Scorecard Banner */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Test Pass Rate</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {report.passedCount} / {report.totalScenarios} Passed
            </div>
            <span className="text-[10px] text-slate-400">100% Invariant Validation</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Feasibility Check</span>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {report.feasibilityCheckPassRate}%
            </div>
            <span className="text-[10px] text-slate-400">Rank #1 Plans Verified</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Avg SLA Preservation</span>
            <div className="text-2xl font-bold font-mono text-white">
              {report.averageSlaPreservation}%
            </div>
            <span className="text-[10px] text-slate-400">Contract Shield Efficacy</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Compute Latency</span>
            <div className="text-2xl font-bold font-mono text-cyan-300">
              {report.averageComputeLatencyMs} ms
            </div>
            <span className="text-[10px] text-slate-400">Ultra-Fast Deterministic Math</span>
          </div>
        </div>
      )}

      {/* Benchmark Scenarios List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Predefined Benchmark Scenarios ({scenarios.length})
        </h3>

        <div className="space-y-3">
          {scenarios.map((sc, idx) => {
            const hasRun = !!sc.evaluationMetrics;
            const passed = sc.evaluationMetrics?.passed;

            return (
              <div
                key={sc.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      {sc.id}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-bold text-white">{sc.name}</span>
                    {hasRun && (
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                          passed
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : 'bg-rose-950 text-rose-400 border border-rose-800/40'
                        }`}
                      >
                        {passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{passed ? 'PASSED' : 'FAILED'}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{sc.description}</p>

                  {/* Verification Notes if Run */}
                  {hasRun && sc.evaluationMetrics && (
                    <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1 border-t border-slate-800/80">
                      <div>{sc.evaluationMetrics.verificationNotes}</div>
                      <div className="flex items-center gap-4 text-cyan-400/90 pt-0.5">
                        <span>Latency: {sc.evaluationMetrics.runDurationMs}ms</span>
                        <span>·</span>
                        <span>SLA Protected: {sc.evaluationMetrics.computedSlaPreservation}%</span>
                        <span>·</span>
                        <span>Recovery Spend: ${sc.evaluationMetrics.computedRecoveryCost.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleRunSingle(sc.id)}
                    disabled={runningId === sc.id || running}
                    className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-950 border border-slate-700 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Play className={`w-3.5 h-3.5 ${runningId === sc.id ? 'animate-spin' : ''}`} />
                    <span>{runningId === sc.id ? 'Evaluating...' : 'Run Test'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
