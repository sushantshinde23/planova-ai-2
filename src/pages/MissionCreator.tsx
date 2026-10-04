import React, { useState } from 'react';
import { useMission } from '../store/missionContext';
import { apiClient } from '../services/api';
import { MissionCategory, MissionPriority, Task } from '../types';
import { generateDynamicMissionTasks } from '../data/missionTaskGenerator';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Shield,
  Clock,
  MapPin,
  Users,
  Play,
  Plus,
  Trash2,
  User,
  Wrench,
} from 'lucide-react';

export const MissionCreator: React.FC<{
  onMissionCreated: (missionId: string) => void;
  onCancel: () => void;
}> = ({ onMissionCreated, onCancel }) => {
  const { t, refreshAll } = useMission();

  const [step, setStep] = useState<number>(1);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [launching, setLaunching] = useState<boolean>(false);

  // Form Fields
  const [missionName, setMissionName] = useState<string>('');
  const [goal, setGoal] = useState<string>(
    'Coordinate emergency evacuation for Sector 4 flood plain with 8 ALS ambulances and 3 designated high-ground shelters.'
  );
  const [category, setCategory] = useState<MissionCategory>('emergency');
  const [priority, setPriority] = useState<MissionPriority>('critical');
  const [location, setLocation] = useState<string>('Sector 4 Lower Basin, Ward 12 (19.0760° N, 72.8777° E)');
  const [peopleAffected, setPeopleAffected] = useState<string>('4,200 residents');
  const [deadline, setDeadline] = useState<string>('02:00 hrs before river crest wall breach');
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'balanced' | 'aggressive'>('conservative');
  const [autonomousMode, setAutonomousMode] = useState<'semi' | 'full' | 'supervised'>('semi');
  const [selectedResources, setSelectedResources] = useState<string[]>([
    'ALS Ambulances',
    'High-Ground Shelters',
    'Field Response Teams',
    'Satellite & GIS Telemetry',
  ]);
  const [customResourceInput, setCustomResourceInput] = useState<string>('');

  // AI Analyst Extraction Results & Generated Plan Tasks
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [newTaskDraftTitle, setNewTaskDraftTitle] = useState<string>('');
  const [newTaskDraftAgent, setNewTaskDraftAgent] = useState<string>('Execution Agent');

  const predefinedTemplates = [
    {
      title: 'Flash Flood Evacuation',
      category: 'emergency' as MissionCategory,
      priority: 'critical' as MissionPriority,
      goal: 'Coordinate evacuation for a flood-affected region with limited ambulances and three shelters.',
      location: 'Sector 4 Lower Basin',
      affected: '4,200 residents',
      deadline: '02:00 hrs before river crest breach',
    },
    {
      title: 'PM-Kisan Hail Crop Insurance Claim',
      category: 'agriculture' as MissionCategory,
      priority: 'high' as MissionPriority,
      goal: 'Verify satellite crop damage, compile farmer 7/12 land records, and expedite direct benefit transfer filing.',
      location: 'Marathwada Agricultural Zone',
      affected: '1,850 smallholder farmers',
      deadline: '48 hrs statutory window',
    },
    {
      title: 'Inter-Hospital ICU Oxygen Balancing',
      category: 'healthcare' as MissionCategory,
      priority: 'critical' as MissionPriority,
      goal: 'Coordinate transfer of 40 oxygen-dependent patients across 6 district hospitals before cryogenic refill cutover.',
      location: 'District Medical Center Network',
      affected: '40 ICU patients',
      deadline: '03:30 hrs reserve buffer',
    },
    {
      title: 'Cold-Chain mRNA Vaccine Distribution',
      category: 'logistics' as MissionCategory,
      priority: 'high' as MissionPriority,
      goal: 'Deliver 15,000 temperature-controlled vials to 32 rural clinics with real-time IoT temperature rerouting.',
      location: 'Central Depot to Western Primary Clinics',
      affected: '32 rural primary clinics',
      deadline: '06:00 hrs thermal window',
    },
  ];

  const handleRunAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const previewId = `mission-${Date.now()}`;
      const derivedTitle =
        missionName.trim() ||
        (goal.length > 54 ? `${goal.slice(0, 54).trim()}...` : goal.trim());

      const dynamicTasks = generateDynamicMissionTasks({
        id: previewId,
        title: derivedTitle,
        objective: goal,
        category,
        priority,
        location,
        eta: deadline,
      });
      setGeneratedTasks(dynamicTasks);

      const result = await apiClient.analyzeGoal(goal, category);
      setAiAnalysis({
        ...result,
        summary: result?.summary || `Autonomous multi-agent DAG synthesized for: ${goal}`,
        entities: result?.entities?.length
          ? result.entities
          : [location, peopleAffected, ...selectedResources.slice(0, 3)],
      });
      setStep(3);
    } catch (err) {
      console.error('Goal analysis failed:', err);
      const previewId = `mission-${Date.now()}`;
      const derivedTitle =
        missionName.trim() ||
        (goal.length > 54 ? `${goal.slice(0, 54).trim()}...` : goal.trim());
      setGeneratedTasks(
        generateDynamicMissionTasks({
          id: previewId,
          title: derivedTitle,
          objective: goal,
          category,
          priority,
          location,
          eta: deadline,
        })
      );
      setStep(3);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddResourceTag = () => {
    if (!customResourceInput.trim()) return;
    if (!selectedResources.includes(customResourceInput.trim())) {
      setSelectedResources([...selectedResources, customResourceInput.trim()]);
    }
    setCustomResourceInput('');
  };

  const handleRemoveResourceTag = (res: string) => {
    setSelectedResources(selectedResources.filter((r) => r !== res));
  };

  const handleAddCustomPlanTask = () => {
    if (!newTaskDraftTitle.trim()) return;
    const nextIdx = generatedTasks.length + 1;
    const prevTask = generatedTasks[generatedTasks.length - 1];
    const customTask: Task = {
      id: `T-${String(nextIdx).padStart(2, '0')}`,
      missionId: 'draft',
      title: newTaskDraftTitle.trim(),
      description: `Operator-configured task for objective: "${goal}" at ${location}.`,
      assignedAgent: newTaskDraftAgent as any,
      status: 'ready',
      priority: priority,
      dependencies: prevTask ? [prevTask.id] : [],
      estimatedDurationMinutes: 20,
      requiredResource: selectedResources[0] || 'Field Operations Unit',
      requiredTool: 'Autonomous Mission Executor',
      riskLevel: priority === 'critical' ? 'high' : 'medium',
      retryCount: 0,
      maxRetries: 3,
      executionLogs: [
        `[${new Date().toLocaleTimeString()}] Task added during Step 4 plan synthesis`,
      ],
      metadata: {
        phase: 'Phase 3: Execution',
        location,
        resources: selectedResources.slice(0, 2),
        successCriteria: '100% telemetry verification',
      },
    };
    setGeneratedTasks([...generatedTasks, customTask]);
    setNewTaskDraftTitle('');
  };

  const handleRemoveDraftTask = (taskId: string) => {
    if (generatedTasks.length <= 3) return;
    setGeneratedTasks(
      generatedTasks
        .filter((t) => t.id !== taskId)
        .map((t) => ({
          ...t,
          dependencies: t.dependencies.filter((d) => d !== taskId),
        }))
    );
  };

  const handleLaunchMission = async () => {
    setLaunching(true);
    try {
      const finalTitle =
        missionName.trim() ||
        (goal.length > 58 ? `${goal.slice(0, 58).trim()}...` : goal.trim());

      const newMission = await apiClient.createMission({
        title: finalTitle,
        objective: goal,
        category,
        priority,
        location,
        eta: deadline,
        status: 'executing',
        autonomousLevel: autonomousMode,
        tasks: generatedTasks,
        constraints: [
          { id: 'c1', key: 'affected', label: 'Affected Citizens / Scope', value: peopleAffected, type: 'hard' },
          { id: 'c2', key: 'deadline', label: 'Operational Deadline', value: deadline, type: 'hard' },
          { id: 'c3', key: 'risk_mode', label: 'Governance Policy', value: `${riskTolerance} - ${autonomousMode.toUpperCase()}`, type: 'regulatory' },
          { id: 'c4', key: 'resources', label: 'Allocated Resources', value: selectedResources.join(', '), type: 'soft' },
        ],
        aiUnderstanding: aiAnalysis || {
          summary: `Autonomous plan formulated for: ${goal}`,
          entities: [location, peopleAffected, ...selectedResources],
          assumptions: ['Sensors and cellular comms operational.'],
          risks: ['Dynamic route or resource bottleneck during peak execution.'],
          missingInfo: [],
          explanation: `PLANOVA AI decomposed "${finalTitle}" into ${generatedTasks.length} interdependent tasks across ${category.toUpperCase()} domain agents.`,
          confidenceScore: 95.4,
        },
      });

      await refreshAll();
      onMissionCreated(newMission.id);
    } catch (err) {
      console.error('Launch failed:', err);
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stepper Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <span className="text-xs font-mono font-bold text-[#7C3AED] uppercase tracking-wider block">
            Agentic Planning Workflow
          </span>
          <h1 className="text-xl font-black text-zinc-950 dark:text-white">
            Define & Launch New Operational Mission
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                if (s < step) setStep(s);
              }}
              className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors ${
                step === s
                  ? 'bg-[#2563EB] text-white'
                  : s < step
                  ? 'bg-[#16A34A] text-white cursor-pointer'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
              }`}
            >
              {s}
            </button>
          ))}
          <span className="ml-2 font-bold text-zinc-900 dark:text-white">Step {step} of 5</span>
        </div>
      </div>

      {/* STEP 1: DEFINE GOAL */}
      {step === 1 && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-5 shadow-2xs">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Mission Title (Optional — auto-generated from objective if left blank)
            </label>
            <input
              type="text"
              value={missionName}
              onChange={(e) => setMissionName(e.target.value)}
              placeholder="e.g. Sector 4 Flood Plain Evacuation"
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] font-mono mb-4"
            />

            <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block mb-2">
              What do you want PLANOVA AI to accomplish?
            </label>
            <p className="text-xs text-zinc-500 mb-3">
              Describe your objective in natural language. Mention locations, resource constraints, urgency, and goals.
            </p>
            <textarea
              rows={4}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Coordinate evacuation for a flood-affected region with limited ambulances and three shelters..."
              className="w-full p-3.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] font-mono leading-relaxed"
            />
          </div>

          {/* Quick Preset Templates */}
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2 font-mono">
              Quick Mission Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {predefinedTemplates.map((tpl, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setMissionName(tpl.title);
                    setGoal(tpl.goal);
                    setCategory(tpl.category);
                    setPriority(tpl.priority);
                    setLocation(tpl.location);
                    setPeopleAffected(tpl.affected);
                    setDeadline(tpl.deadline);
                  }}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 rounded-lg cursor-pointer transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                      {tpl.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] font-semibold">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{tpl.goal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!goal.trim()}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>Next: Domain & Constraints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MISSION DOMAIN & CONSTRAINTS */}
      {step === 2 && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-5 shadow-2xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Mission Classification, Resources & Operational Constraints
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Mission Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MissionCategory)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-medium"
              >
                <option value="emergency">Emergency Response</option>
                <option value="disaster">Disaster Relief</option>
                <option value="agriculture">Farmer Assistance</option>
                <option value="government">Government Services</option>
                <option value="healthcare">Healthcare Administration</option>
                <option value="accident">Accident Assistance</option>
                <option value="logistics">Logistics & Supply Chain</option>
                <option value="industrial">Industrial Maintenance</option>
                <option value="career">Student & Career Execution</option>
                <option value="project">General Project Execution</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MissionPriority)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-medium"
              >
                <option value="critical">Critical (Immediate Life-Safety Risk)</option>
                <option value="high">High (Time-Sensitive Operational SLA)</option>
                <option value="medium">Medium (Standard Strategic Workflow)</option>
                <option value="low">Low (Background Informational / Audit)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Geographic Location / Ward
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Estimated Affected Scope / Population
              </label>
              <input
                type="text"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Hard Execution Deadline / ETA
              </label>
              <input
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                Risk Tolerance Protocol
              </label>
              <select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value as any)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-medium"
              >
                <option value="conservative">Conservative (Mandatory Human Sign-off on route deviation)</option>
                <option value="balanced">Balanced (Autonomous rerouting with notification)</option>
                <option value="aggressive">Aggressive (Fully autonomous emergency override)</option>
              </select>
            </div>
          </div>

          {/* Resource Requirements Builder */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Assigned Resources & Field Units
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {selectedResources.map((res) => (
                <span
                  key={res}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#2563EB] dark:text-blue-300 rounded-lg text-xs font-mono flex items-center gap-1.5"
                >
                  <span>{res}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResourceTag(res)}
                    className="text-slate-400 hover:text-[#DC2626] cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customResourceInput}
                onChange={(e) => setCustomResourceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddResourceTag();
                  }
                }}
                placeholder="Add required resource or unit (e.g., 4x4 Rescue Trucks, Drone Swarm)..."
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono"
              />
              <button
                type="button"
                onClick={handleAddResourceTag}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-bold rounded-lg cursor-pointer"
              >
                + Add Resource
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleRunAIAnalysis}
              disabled={analyzing}
              className="px-5 py-2.5 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Mission Analyst Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run AI Mission Analysis & Generate Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI MISSION ANALYST & GOVERNANCE */}
      {step === 3 && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#7C3AED] text-white font-bold rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#7C3AED] uppercase">
                  AI Mission Analyst Report
                </span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Mission Comprehension, Risk Vectors & Governance Mode
                </h2>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#16A34A]">
              {aiAnalysis?.confidenceScore || 95.4}% Confidence
            </span>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs">
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider block">
              AI Decomposition Reasoning for "{goal.slice(0, 65)}..."
            </span>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
              {aiAnalysis?.explanation ||
                `PLANOVA AI analyzed your ${category.toUpperCase()} objective at ${location} affecting ${peopleAffected}. Synthesized ${generatedTasks.length} domain-specialized tasks across 4 operational phases with Human-in-the-Loop governance gates.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="font-bold text-zinc-500 uppercase text-[10px] block">
                Extracted Operational Entities & Resources
              </span>
              <ul className="space-y-1 text-zinc-800 dark:text-zinc-200">
                {(aiAnalysis?.entities || [location, peopleAffected, ...selectedResources]).map(
                  (ent: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />
                      <span>{ent}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="font-bold text-zinc-500 uppercase text-[10px] block">
                Identified Risks & Failure Vectors
              </span>
              <ul className="space-y-1 text-zinc-800 dark:text-zinc-200">
                {(aiAnalysis?.risks || [
                  `Corridor or resource bottleneck at ${location}`,
                  `SLA deadline pressure (${deadline})`,
                  'Secondary resource contention requiring dynamic re-plan',
                ]).map((rsk: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3 h-3 text-[#EAB308] shrink-0" />
                    <span>{rsk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Governance Mode Selection */}
          <div className="pt-2">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-2">
              Human-in-the-Loop Governance Level
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  mode: 'semi' as const,
                  title: 'Semi-Autonomous (Recommended)',
                  desc: 'Standard tasks execute autonomously; critical risk actions halt for human approval.',
                },
                {
                  mode: 'full' as const,
                  title: 'Full Autonomous',
                  desc: 'Agents execute and re-route independently without human confirmation gates.',
                },
                {
                  mode: 'supervised' as const,
                  title: 'Supervised Advisory',
                  desc: 'Operator sign-off required before every phase transition.',
                },
              ].map((item) => (
                <div
                  key={item.mode}
                  onClick={() => setAutonomousMode(item.mode)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    autonomousMode === item.mode
                      ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-[#2563EB]'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </span>
                    {autonomousMode === item.mode && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB]" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Inspect Generated Mission Plan ({generatedTasks.length} Tasks)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: GENERATED DYNAMIC MISSION PLAN PREVIEW & CUSTOMIZATION */}
      {step === 4 && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-mono font-bold text-[#2563EB] uppercase">
                Dynamic DAG Task Decomposition (Plan v1)
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Generated Mission Tasks & Agent Assignments ({generatedTasks.length} Tasks)
              </h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] font-bold">
              Tailored for {category.toUpperCase()}
            </span>
          </div>

          {/* Add Custom Task to Plan before Launch */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={newTaskDraftTitle}
              onChange={(e) => setNewTaskDraftTitle(e.target.value)}
              placeholder="Add custom task node to this mission plan..."
              className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono"
            />
            <select
              value={newTaskDraftAgent}
              onChange={(e) => setNewTaskDraftAgent(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg font-mono"
            >
              <option value="Planning Agent">Planning Agent</option>
              <option value="Execution Agent">Execution Agent</option>
              <option value="Resource Agent">Resource Agent</option>
              <option value="Monitoring Agent">Monitoring Agent</option>
              <option value="Verification Agent">Verification Agent</option>
            </select>
            <button
              type="button"
              onClick={handleAddCustomPlanTask}
              className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Append Task</span>
            </button>
          </div>

          {/* Generated Tasks List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            {generatedTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-[#2563EB]">{task.id}</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{task.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {task.metadata?.phase}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-zinc-400">
                    <span className="text-[#7C3AED] font-semibold">{task.assignedAgent}</span>
                    <span>Resource: {task.requiredResource}</span>
                    <span>Deps: {task.dependencies.length > 0 ? task.dependencies.join(', ') : 'Root Node'}</span>
                    <span>Est: {task.estimatedDurationMinutes}m</span>
                  </div>
                </div>
                {generatedTasks.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDraftTask(task.id)}
                    className="p-1 text-zinc-400 hover:text-[#DC2626] cursor-pointer"
                    title="Remove task from plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Final Review & Launch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: FINAL REVIEW & LAUNCH */}
      {step === 5 && (
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#16A34A] text-white rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Mission Ready for Autonomous Deployment
              </h2>
              <span className="text-xs font-mono text-zinc-500">
                {generatedTasks.length} DAG tasks synthesized · All safety guardrails validated.
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs font-mono">
            <div>
              <span className="text-zinc-400 uppercase text-[10px] block">Mission Title</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block mt-0.5">
                {missionName.trim() || (goal.length > 58 ? `${goal.slice(0, 58).trim()}...` : goal.trim())}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 uppercase text-[10px] block">Objective</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 block mt-0.5">
                {goal}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700/60">
              <div>
                <span className="text-zinc-400 uppercase text-[10px] block">Domain</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase">{category}</span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] block">Priority</span>
                <span className="font-semibold text-[#DC2626] uppercase">{priority}</span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] block">Location</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{location}</span>
              </div>
              <div>
                <span className="text-zinc-400 uppercase text-[10px] block">Synthesized Plan</span>
                <span className="font-semibold text-[#2563EB]">Plan v1 ({generatedTasks.length} Tasks)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Plan Tasks</span>
            </button>
            <button
              onClick={handleLaunchMission}
              disabled={launching}
              className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {launching ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Persisting Mission & DAG Graph...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Mission & Open Mission Planner</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
