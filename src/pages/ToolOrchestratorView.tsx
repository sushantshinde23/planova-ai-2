import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import { apiClient } from '../services/api';
import { ToolDefinition } from '../types';
import {
  Wrench,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Cpu,
  Activity,
  ArrowRight,
  Database,
  Radio,
  FileCode,
  Sparkles,
} from 'lucide-react';

export const ToolOrchestratorView: React.FC = () => {
  const { tools, activeMission } = useMission();

  const safeTools = Array.isArray(tools) ? tools : [];
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | undefined>(safeTools[0]);
  const activeTool = selectedTool || safeTools[0];
  const [executing, setExecuting] = useState<boolean>(false);
  const [executionOutput, setExecutionOutput] = useState<any>(null);
  const [testReason, setTestReason] = useState<string>('Determine route safety to Shelter 2 via Causeway');

  const handleExecuteTool = async () => {
    if (!activeTool) return;
    setExecuting(true);
    try {
      const result = await apiClient.executeTool(
        activeTool.id,
        {
          originCoordinates: '19.0760, 72.8777',
          targetCorridor: 'Route R2 Causeway vs Route R4 Bypass',
          payloadAcuity: 'High-Risk Oxygen ICU Patient Convoy',
        },
        testReason,
        activeMission?.id
      );
      setExecutionOutput(result);
    } catch (err) {
      console.error('Tool execution error:', err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <span>DYNAMIC TOOL ORCHESTRATION & GROUNDING</span>
          <span aria-hidden="true">·</span>
          <span>EMPIRICAL API DISPATCH</span>
        </div>
        <h1 className="text-xl font-black text-zinc-950 dark:text-white tracking-tight">
          Tool Orchestration & Live Reasoning Engine
        </h1>
        <p className="text-xs text-zinc-500 max-w-2xl mt-1">
          PLANOVA AI dynamically binds specialized geospatial, weather Doppler, government registry, and Google Workspace integrations to satisfy task dependencies.
        </p>
      </div>

      {/* Main Grid: Tool Registry on Left, Execution Console on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool Catalog */}
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-zinc-500" />
              Connected Tool Services
            </span>
            <span className="text-[10px] font-mono text-zinc-400">{safeTools.length} active</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[540px]">
            {safeTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  setSelectedTool(tool);
                  setExecutionOutput(null);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activeTool?.id === tool.id
                    ? 'border-zinc-950 dark:border-white bg-zinc-50 dark:bg-zinc-800 ring-1 ring-zinc-950 dark:ring-white'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {tool.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {tool.status}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span>Latency: {tool.latencyMs}ms</span>
                  <span>Success: {tool.successRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Tool Reasoning & Execution Inspector */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">
                TOOL EXECUTION REASONING INSPECTOR
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {activeTool?.name || 'Tool Inspector'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">
                {activeTool?.executionsCount ?? 0} Invocations logged
              </span>
            </div>
          </div>

          {/* Reasoning Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              Agent Tool-Use Justification (Why is this tool being invoked?)
            </label>
            <input
              type="text"
              value={testReason}
              onChange={(e) => setTestReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
            />
          </div>

          {/* Test Dispatch Button */}
          <button
            onClick={handleExecuteTool}
            disabled={executing}
            className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {executing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Invoking Tool API...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Diagnostic Tool Call</span>
              </>
            )}
          </button>

          {/* Live Output Payloads (Requirement 12) */}
          <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-zinc-500" />
              <span>Input & Output Telemetry Payload</span>
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-zinc-950 text-zinc-100 rounded-lg border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Dispatched Request Parameters
                </span>
                <pre className="text-[11px] overflow-x-auto text-emerald-400">
                  {JSON.stringify(
                    {
                      toolEndpoint: activeTool?.endpoint || '/api/tools/execute',
                      timestamp: '2026-10-01T22:42:15Z',
                      origin: '19.0760, 72.8777',
                      corridor: 'Route R2 Causeway vs R4 Elevated Bypass',
                      reason: testReason,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="p-3 bg-zinc-950 text-zinc-100 rounded-lg border border-zinc-800 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Empirical Response Telemetry
                </span>
                <pre className="text-[11px] overflow-x-auto text-amber-300">
                  {JSON.stringify(
                    executionOutput
                      ? executionOutput.outputPayload
                      : {
                          status: 'COMPLETED',
                          routeR2Status: 'UNAVAILABLE - Submerged (+0.92m)',
                          alternateRouteR4: 'CLEAR - Elevated (+12m) Toll Bypass',
                          deltaEta: '+9 minutes',
                          confidence: '99.4%',
                        },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
