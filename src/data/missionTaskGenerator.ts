import { Task, PlanVersion, Mission, MissionCategory, MissionPriority } from '../types';

export function generateDynamicMissionTasks(mission: {
  id: string;
  title: string;
  objective: string;
  category: MissionCategory;
  priority: MissionPriority;
  location: string;
  eta?: string;
  constraints?: { id?: string; key: string; label: string; value: string; type?: string }[];
}): Task[] {
  const mId = mission.id;
  const loc = mission.location || 'Primary Operational Sector';
  const obj = mission.objective || mission.title;
  const prio = mission.priority || 'high';
  const cat = mission.category || 'emergency';

  const constraintSummary =
    mission.constraints && mission.constraints.length > 0
      ? mission.constraints.map((c) => `${c.label}: ${c.value}`).join(' · ')
      : 'Standard operational safety & SLA constraints';

  const domainConfigs: Record<
    MissionCategory,
    {
      reconTitle: string;
      reconTool: string;
      reconResource: string;
      stageTitle: string;
      stageTool: string;
      stageResource: string;
      exec1Title: string;
      exec1Tool: string;
      exec1Resource: string;
      exec2Title: string;
      exec2Tool: string;
      exec2Resource: string;
      monitorTitle: string;
      monitorTool: string;
      monitorResource: string;
      adaptTitle: string;
      adaptTool: string;
      adaptResource: string;
      govTitle: string;
      govTool: string;
      govResource: string;
      verifyTitle: string;
      verifyTool: string;
      verifyResource: string;
    }
  > = {
    emergency: {
      reconTitle: `Hydrological & Hazard Perimeter Sweep (${loc})`,
      reconTool: 'Sentinel-2 Synthetic Aperture Radar (SAR)',
      reconResource: 'Doppler Telemetry Station',
      stageTitle: 'Triage Staging & ALS Ambulance Fleet Allocation',
      stageTool: 'Fleet Telemetry Gateway',
      stageResource: '8 ALS Ambulances & 3 Shelters',
      exec1Title: `Primary Emergency Evacuation Dispatch (${loc})`,
      exec1Tool: 'OpenRouting & Traffic GIS',
      exec1Resource: 'ALS Convoy Wave 1',
      exec2Title: 'Vulnerable Citizen & ICU Patient Extraction',
      exec2Tool: 'Ayushman Bharat & Civic Health Registry',
      exec2Resource: 'Disaster Paramedics & Triage Nurses',
      monitorTitle: 'Sub-Second Corridor & Flood Sensor Telemetry Sweep',
      monitorTool: 'IMD High-Resolution Doppler Radar',
      monitorResource: 'IoT Hydro Sensor Grid',
      adaptTitle: 'Contingency Bypass Route & Fleet Rebalancing Synthesis',
      adaptTool: 'OpenRouting & Traffic GIS',
      adaptResource: 'High-Clearance Military Transport Trucks',
      govTitle: 'Human-in-the-Loop Authorization: High-Risk Route Diversion',
      govTool: 'National Emergency Broadcast SMS Gateway',
      govResource: 'Incident Command Authority',
      verifyTitle: 'Biometric Shelter Headcount & Zero-Casualty Audit Seal',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'Verification Audit Ledger',
    },
    disaster: {
      reconTitle: `Seismic & Terrain Access Assessment (${loc})`,
      reconTool: 'Sentinel-2 Synthetic Aperture Radar (SAR)',
      reconResource: 'Aerial Recon Drone Swarm',
      stageTitle: 'Payload Staging & Heavy Lift Drone Calibration',
      stageTool: 'Fleet Telemetry Gateway',
      stageResource: 'Autonomous Cargo Drones & Trauma Kits',
      exec1Title: `Execute Aerial Drop & Medevac Corridor (${loc})`,
      exec1Tool: 'OpenRouting & Traffic GIS',
      exec1Resource: 'Drone Sortie Alpha & Rotary Wing Medevac',
      exec2Title: 'Deploy Mobile Water Purification & Field Triage Units',
      exec2Tool: 'National Emergency Broadcast SMS Gateway',
      exec2Resource: 'NDRF First Responder Platoons',
      monitorTitle: 'Continuous Wind Shear & Aftershock Telemetry Watch',
      monitorTool: 'IMD High-Resolution Doppler Radar',
      monitorResource: 'Seismic & Atmospheric Sensors',
      adaptTitle: 'Dynamic Flight Vector Recalculation Under Gust Constraints',
      adaptTool: 'OpenRouting & Traffic GIS',
      adaptResource: 'Reserve Battery & Relay Pods',
      govTitle: 'Operator Sign-Off: Low-Altitude Drop Zone Override',
      govTool: 'Emergency Gmail Dispatch Broadcaster',
      govResource: 'Disaster Command Control',
      verifyTitle: 'Ground-Truth Payload Receipt & Survivor Verification',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'Optical Drop Confirmation Feed',
    },
    agriculture: {
      reconTitle: `Multi-Spectral Satellite Crop Damage Scan (${loc})`,
      reconTool: 'Sentinel-2 Synthetic Aperture Radar (SAR)',
      reconResource: 'SAR Backscatter Imagery Pipeline',
      stageTitle: '7/12 Land Record Cross-Referencing & Beneficiary Indexing',
      stageTool: 'Ayushman Bharat & Civic Health Registry',
      stageResource: 'MahaBhulekh Land Registry API',
      exec1Title: `Automated Crop Loss Assessment & Parcel Mapping (${loc})`,
      exec1Tool: 'Sentinel-2 Synthetic Aperture Radar (SAR)',
      exec1Resource: 'Agronomy Assessment Engine',
      exec2Title: 'Compile Direct Benefit Transfer (DBT) Claim Dossiers',
      exec2Tool: 'Google Drive Mission Dossier Archive',
      exec2Resource: 'District Agriculture Treasury Pool',
      monitorTitle: 'Meteorological Hail & Unseasonal Rain Nowcasting',
      monitorTool: 'IMD High-Resolution Doppler Radar',
      monitorResource: 'Automated Weather Stations',
      adaptTitle: 'Re-Index Cloud-Obscured Parcels via Microwave Radar',
      adaptTool: 'Sentinel-2 Synthetic Aperture Radar (SAR)',
      adaptResource: 'Drone Field Verification Units',
      govTitle: 'District Collector Approval: Batch Subsidy Disbursement',
      govTool: 'Emergency Gmail Dispatch Broadcaster',
      govResource: 'State Treasury Authorization Gate',
      verifyTitle: 'Verify 100% Farmer Bank Settlement & Audit Ledger',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'NPCI Settlement Confirmation',
    },
    government: {
      reconTitle: `Ingest Citizen Entitlement Applications & Demographic Audit (${loc})`,
      reconTool: 'Ayushman Bharat & Civic Health Registry',
      reconResource: 'Unified Citizen Service Portal',
      stageTitle: 'Pseudonymized Tokenization & Cross-Department Queue Setup',
      stageTool: 'Google Keep Tactical Action Scratchpad',
      stageResource: 'Civil Registry Verification Nodes',
      exec1Title: `Execute Multi-Agency Document Clearance (${loc})`,
      exec1Tool: 'Ayushman Bharat & Civic Health Registry',
      exec1Resource: 'Automated Document OCR & Validator',
      exec2Title: 'Provision Ration Portability, Healthcare & School Quotas',
      exec2Tool: 'National Emergency Broadcast SMS Gateway',
      exec2Resource: 'Municipal Welfare Allocation Pool',
      monitorTitle: 'Real-Time SLA Compliance & Duplicate Claim Detection',
      monitorTool: 'Google Drive Mission Dossier Archive',
      monitorResource: 'SHA-256 Deduplication Monitor',
      adaptTitle: 'Rebalance Verification Queues Across Regional Tehsil Desks',
      adaptTool: 'OpenRouting & Traffic GIS',
      adaptResource: 'Auxiliary Caseworker Pool',
      govTitle: 'Commissioner Authorization: Exception Case Sign-Off',
      govTool: 'Emergency Gmail Dispatch Broadcaster',
      govResource: 'Municipal Governance Board',
      verifyTitle: 'Certify Citizen Benefit Delivery & Compliance Dossier',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'Public Audit Ledger',
    },
    healthcare: {
      reconTitle: `Poll Regional ICU Bed & Cryogenic Oxygen Telemetry (${loc})`,
      reconTool: 'Ayushman Bharat & Civic Health Registry',
      reconResource: '9-Hospital ICU Telemetry Network',
      stageTitle: 'Lock Liquid Medical Oxygen (LMO) Buffers & ALS Escorts',
      stageTool: 'Fleet Telemetry Gateway',
      stageResource: '120 Type-D Oxygen Cylinders & 8 ALS Units',
      exec1Title: `Execute Inter-Hospital Critical Patient Transfers (${loc})`,
      exec1Tool: 'OpenRouting & Traffic GIS',
      exec1Resource: 'Mobile ICU Ambulance Fleet',
      exec2Title: 'Dispatch Cryogenic Tanker Refill & Ventilator Balancing',
      exec2Tool: 'Fleet Telemetry Gateway',
      exec2Resource: 'Disaster Paramedics & Triage Nurses',
      monitorTitle: 'Continuous LMO Pressure & Ward Saturation Monitoring',
      monitorTool: 'Ayushman Bharat & Civic Health Registry',
      monitorResource: 'Hospital IoT Telemetry Sensors',
      adaptTitle: 'Synthesize Mutual-Aid Ward Surge & Tanker Reroute Plan',
      adaptTool: 'OpenRouting & Traffic GIS',
      adaptResource: 'Peripheral Private Hospital Reserve',
      govTitle: 'Chief Medical Officer Sign-Off: Acute Transfer Protocol',
      govTool: 'Emergency Gmail Dispatch Broadcaster',
      govResource: 'CMO Clinical Governance Gate',
      verifyTitle: 'Verify Patient Admission Vitals & 48h Oxygen Buffer Seal',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'Clinical Outcome Audit Ledger',
    },
    accident: {
      reconTitle: `Expressway Incident Scene & Multi-Vehicle Trauma Triage (${loc})`,
      reconTool: 'OpenRouting & Traffic GIS',
      reconResource: 'Highway CCTV & Drone Recon',
      stageTitle: 'Reserve Golden-Hour Green Corridor & Hydraulic Cutters',
      stageTool: 'Fleet Telemetry Gateway',
      stageResource: '8 ALS Ambulances & Heavy Rescue Tender',
      exec1Title: `Dispatch Trauma Extraction & Hazmat Spill Containment (${loc})`,
      exec1Tool: 'OpenRouting & Traffic GIS',
      exec1Resource: 'Highway Patrol & Fire Rescue Units',
      exec2Title: 'High-Velocity Patient Transit to Level-1 Trauma & Burn Center',
      exec2Tool: 'Ayushman Bharat & Civic Health Registry',
      exec2Resource: 'ALS Trauma Paramedic Teams',
      monitorTitle: 'Live Golden-Hour Countdown & Contraflow Traffic Watch',
      monitorTool: 'OpenRouting & Traffic GIS',
      monitorResource: 'Expressway Telemetry Sensors',
      adaptTitle: 'Dynamic Detour of Civilian Traffic & Helipad Activation',
      adaptTool: 'National Emergency Broadcast SMS Gateway',
      adaptResource: 'Air Ambulance Medevac Reserve',
      govTitle: 'Highway Commander Sign-Off: Full Contraband Lane Closure',
      govTool: 'Emergency Gmail Dispatch Broadcaster',
      govResource: 'State Highway Patrol Command',
      verifyTitle: 'Verify Zero Unattended Casualties & Corridor Re-Opening',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'Surgical Admission & Clearance Log',
    },
    logistics: {
      reconTitle: `Cold-Chain Inventory & Reefer Telemetry Calibration (${loc})`,
      reconTool: 'Fleet Telemetry Gateway',
      reconResource: 'Central Bio-Depot Cryo Sensors',
      stageTitle: 'Lock Multi-Echelon Route Matrix & Thermal Escort Fleet',
      stageTool: 'OpenRouting & Traffic GIS',
      stageResource: 'Refrigerated Transport Fleet & Dry Ice Reserve',
      exec1Title: `Dispatch Temperature-Controlled Convoy Waves (${loc})`,
      exec1Tool: 'OpenRouting & Traffic GIS',
      exec1Resource: 'IoT-Monitored Cold-Chain Trucks',
      exec2Title: 'Execute Rural Clinic Handoff & Digital Custody Signatures',
      exec2Tool: 'Ayushman Bharat & Civic Health Registry',
      exec2Resource: 'Regional Depot Pharmacists',
      monitorTitle: 'Sub-Second Thermal Drift & Route Bottleneck Telemetry',
      monitorTool: 'IMD High-Resolution Doppler Radar',
      monitorResource: 'Onboard IoT Thermal Probes (-20°C to -15°C)',
      adaptTitle: 'Autonomous Cryo-Depot Diversion on Compressor Drift',
      adaptTool: 'OpenRouting & Traffic GIS',
      adaptResource: 'Backup Refrigerated Van Pool',
      govTitle: 'Logistics Director Approval: Emergency Cold-Storage Transfer',
      govTool: 'Emergency Gmail Dispatch Broadcaster',
      govResource: 'Cold-Chain Quality Assurance Gate',
      verifyTitle: 'Verify 100% Vial Potency Compliance & Delivery Ledger',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'Continuous Thermal Chain Certificate',
    },
    industrial: {
      reconTitle: `Ultrasonic Acoustic Baseline & Turbine Telemetry Scan (${loc})`,
      reconTool: 'Sentinel-2 Synthetic Aperture Radar (SAR)',
      reconResource: 'Non-Destructive Acoustic Array',
      stageTitle: 'Lock Outage Window, Spare Blade Inventory & Rigging Crew',
      stageTool: 'Google Keep Tactical Action Scratchpad',
      stageResource: 'Stage-1 Turbine Blades & Crane Riggers',
      exec1Title: `Execute Automated Ultrasonic Blade & Rotor Inspection (${loc})`,
      exec1Tool: 'Google Drive Mission Dossier Archive',
      exec1Resource: 'Robotic NDT Crawler Units',
      exec2Title: 'Precision Micro-Fracture Replacement & Torque Calibration',
      exec2Tool: 'Google Keep Tactical Action Scratchpad',
      exec2Resource: 'Senior Turbine Maintenance Engineers',
      monitorTitle: 'Continuous Outage SLA Clock & Thermal Stress Monitoring',
      monitorTool: 'IMD High-Resolution Doppler Radar',
      monitorResource: 'Plant SCADA Telemetry Bus',
      adaptTitle: 'Resequence Parallel Overhaul Tasks to Preserve 24h Window',
      adaptTool: 'Google Keep Tactical Action Scratchpad',
      adaptResource: 'Auxiliary Maintenance Shift Crew',
      govTitle: 'Chief Plant Engineer Sign-Off: 400MW Synchronization Restart',
      govTool: 'Emergency Gmail Dispatch Broadcaster',
      govResource: 'Grid Safety & Lockout-Tagout Gate',
      verifyTitle: 'Verify Zero Harmonic Vibration & Full Power Cutover Audit',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'SCADA Harmonics Certification',
    },
    career: {
      reconTitle: `Ingest Academic Fellowship Criteria & Deadline Matrix (${loc})`,
      reconTool: 'Google Drive Mission Dossier Archive',
      reconResource: 'University Admissions Requirement Index',
      stageTitle: 'Assemble Transcripts, Research Proposal & Referee Schedule',
      stageTool: 'Google Keep Tactical Action Scratchpad',
      stageResource: 'Credential Notarization & LaTeX Pipeline',
      exec1Title: `Execute Research Proposal Synthesis & Literature Audit (${loc})`,
      exec1Tool: 'Google Drive Mission Dossier Archive',
      exec1Resource: 'Academic Dossier Workspace',
      exec2Title: 'Coordinate Faculty Endorsements & Ethics Board Clearances',
      exec2Tool: 'Emergency Gmail Dispatch Broadcaster',
      exec2Resource: 'Faculty Recommendation Tracker',
      monitorTitle: 'Continuous Submission Window & Portal Checksum Watch',
      monitorTool: 'Google Keep Tactical Action Scratchpad',
      monitorResource: 'Deadline SLA Countdown Engine',
      adaptTitle: 'Trigger Alternate Referee Escalation & Fast-Track Apostille',
      adaptTool: 'Emergency Gmail Dispatch Broadcaster',
      adaptResource: 'Backup Academic Endorsers',
      govTitle: 'Applicant Final Review & Cryptographic Submission Sign-Off',
      govTool: 'Google Drive Mission Dossier Archive',
      govResource: 'Candidate Authorization Gate',
      verifyTitle: 'Verify University Portal Receipt & Grant Dossier Archive',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'Submission Confirmation Hash',
    },
    project: {
      reconTitle: `Pre-Cutover Database Parity & Sharding Topology Audit (${loc})`,
      reconTool: 'Google Drive Mission Dossier Archive',
      reconResource: 'Primary Tier-4 Datacenter Telemetry',
      stageTitle: 'Stage Shadow-Write Replicas & 90-Second Rollback Triggers',
      stageTool: 'Google Keep Tactical Action Scratchpad',
      stageResource: 'Distributed PostgreSQL Cluster Nodes',
      exec1Title: `Execute Zero-Downtime Ledger Sync & Traffic Drainage (${loc})`,
      exec1Tool: 'OpenRouting & Traffic GIS',
      exec1Resource: 'Core Banking Cutover Pipeline',
      exec2Title: 'Run Cryptographic Row-Level Checksums Across 42M Accounts',
      exec2Tool: 'Google Drive Mission Dossier Archive',
      exec2Resource: 'Automated Parity Verification Workers',
      monitorTitle: 'Sub-Second Replication Lag & Transaction Anomaly Watch',
      monitorTool: 'Google Keep Tactical Action Scratchpad',
      monitorResource: 'Prometheus & Grafana SRE Stream',
      adaptTitle: 'Synthesize Read-Replica Failover & Connection Pool Rebalance',
      adaptTool: 'OpenRouting & Traffic GIS',
      adaptResource: 'DR Sync Hub Standby Nodes',
      govTitle: 'CTO & SRE Commander Sign-Off: Production Cutover Commit',
      govTool: 'Emergency Gmail Dispatch Broadcaster',
      govResource: 'Change Advisory Board (CAB) Gate',
      verifyTitle: 'Certify 100% Data Parity, Zero Dropped Txns & Audit Seal',
      verifyTool: 'Google Drive Mission Dossier Archive',
      verifyResource: 'Immutable Cutover Dossier',
    },
  };

  const cfg = domainConfigs[cat] || domainConfigs.emergency;

  return [
    {
      id: `${mId}-t1`,
      missionId: mId,
      title: cfg.reconTitle,
      description: `Establish real-time situational awareness for objective: "${obj}". Applied constraints: ${constraintSummary}.`,
      status: 'completed',
      priority: prio,
      assignedAgent: 'Planning Agent',
      requiredTool: cfg.reconTool,
      dependencies: [],
      estimatedDurationMinutes: 10,
      actualDurationMinutes: 9,
      startTime: '00:00',
      completedTime: '00:09',
      riskLevel: 'low',
      requiresApproval: false,
      output: `Initial perimeter and baseline telemetry verified for ${loc}. All primary entities indexed with 96.4% confidence.`,
      evidence: [`Telemetry Sweep Log #${mId.slice(-4)}`, `Geospatial Boundary Lock (${loc})`],
      metadata: {
        phase: 'Phase I: Assessment & Intelligence',
        resources: [cfg.reconResource],
        planVersion: 1,
      },
    },
    {
      id: `${mId}-t2`,
      missionId: mId,
      title: cfg.stageTitle,
      description: `Decompose operational dependency graph and lock primary resources for ${mission.title}.`,
      status: 'completed',
      priority: prio,
      assignedAgent: 'Resource Agent',
      requiredTool: cfg.stageTool,
      dependencies: [`${mId}-t1`],
      estimatedDurationMinutes: 15,
      actualDurationMinutes: 13,
      startTime: '00:09',
      completedTime: '00:22',
      riskLevel: 'low',
      requiresApproval: false,
      output: `Allocated ${cfg.stageResource}. Staging corridors and reserve buffers locked.`,
      evidence: [`Resource Allocation Manifest #${mId.slice(-4)}`],
      metadata: {
        phase: 'Phase II: Staging & Fleet Allocation',
        resources: [cfg.stageResource],
        planVersion: 1,
      },
    },
    {
      id: `${mId}-t3`,
      missionId: mId,
      title: cfg.exec1Title,
      description: `Primary field execution wave dispatched for ${obj} at ${loc}.`,
      status: 'in_progress',
      priority: prio,
      assignedAgent: 'Execution Agent',
      requiredTool: cfg.exec1Tool,
      dependencies: [`${mId}-t2`],
      estimatedDurationMinutes: 25,
      startTime: '00:22',
      riskLevel: 'medium',
      requiresApproval: false,
      output: `Active execution underway using ${cfg.exec1Tool}. Telemetry heartbeat nominal.`,
      evidence: [`Live Dispatch Stream (${loc})`],
      metadata: {
        phase: 'Phase III: Transit Corridors & Telemetry',
        resources: [cfg.exec1Resource],
        planVersion: 1,
      },
    },
    {
      id: `${mId}-t4`,
      missionId: mId,
      title: cfg.exec2Title,
      description: `Parallel high-priority workstream executing under ${prio.toUpperCase()} SLA protocol.`,
      status: 'in_progress',
      priority: prio,
      assignedAgent: 'Execution Agent',
      requiredTool: cfg.exec2Tool,
      dependencies: [`${mId}-t2`],
      estimatedDurationMinutes: 30,
      startTime: '00:24',
      riskLevel: 'high',
      requiresApproval: false,
      output: `Coordinating ${cfg.exec2Resource} across target checkpoints.`,
      evidence: [`Field Unit Transponder Log`],
      metadata: {
        phase: 'Phase III: Transit Corridors & Telemetry',
        resources: [cfg.exec2Resource],
        planVersion: 1,
      },
    },
    {
      id: `${mId}-t5`,
      missionId: mId,
      title: cfg.monitorTitle,
      description: `Continuous anomaly, bottleneck, and environmental hazard sweep across ${loc}.`,
      status: 'in_progress',
      priority: 'medium',
      assignedAgent: 'Monitoring Agent',
      requiredTool: cfg.monitorTool,
      dependencies: [`${mId}-t1`],
      estimatedDurationMinutes: 40,
      startTime: '00:10',
      riskLevel: 'low',
      requiresApproval: false,
      output: `Sub-second telemetry polling active. Zero unmitigated cascading failures.`,
      evidence: [`Sensor Stream Checksum OK`],
      metadata: {
        phase: 'Phase III: Transit Corridors & Telemetry',
        resources: [cfg.monitorResource],
        planVersion: 1,
      },
    },
    {
      id: `${mId}-t6`,
      missionId: mId,
      title: cfg.adaptTitle,
      description: `Pre-computed adaptive contingency route and resource rebalancing if primary corridor degrades.`,
      status: 'ready',
      priority: prio,
      assignedAgent: 'Planning Agent',
      requiredTool: cfg.adaptTool,
      dependencies: [`${mId}-t3`, `${mId}-t5`],
      estimatedDurationMinutes: 12,
      riskLevel: 'high',
      requiresApproval: false,
      output: `Alternative execution branch staged and ready for instant cutover.`,
      metadata: {
        phase: 'Phase IV: Disruption & Adaptive Replan',
        resources: [cfg.adaptResource],
        planVersion: 1,
      },
    },
    {
      id: `${mId}-t7`,
      missionId: mId,
      title: cfg.govTitle,
      description: `Human-in-the-Loop governance checkpoint validating safety compliance and high-impact resource shifts.`,
      status: 'waiting_approval',
      priority: 'critical',
      assignedAgent: 'Resource Agent',
      requiredTool: cfg.govTool,
      dependencies: [`${mId}-t4`, `${mId}-t6`],
      estimatedDurationMinutes: 10,
      riskLevel: 'critical',
      requiresApproval: true,
      approvalStatus: 'pending',
      output: `AWAITING OPERATOR AUTHORIZATION: Confirm high-impact resource & corridor commitment for ${mission.title}.`,
      metadata: {
        phase: 'Phase IV: Disruption & Adaptive Replan',
        resources: [cfg.govResource],
        planVersion: 1,
      },
    },
    {
      id: `${mId}-t8`,
      missionId: mId,
      title: cfg.verifyTitle,
      description: `Multi-source ground-truth verification confirming 100% objective completion before mission closure.`,
      status: 'ready',
      priority: 'critical',
      assignedAgent: 'Verification Agent',
      requiredTool: cfg.verifyTool,
      dependencies: [`${mId}-t7`],
      estimatedDurationMinutes: 15,
      riskLevel: 'low',
      requiresApproval: false,
      output: `Verification checklist staged. Awaiting upstream task completion.`,
      metadata: {
        phase: 'Phase V: Diversion & Verified Closure',
        resources: [cfg.verifyResource],
        planVersion: 1,
      },
    },
  ];
}

export function generateDynamicPlanVersions(mission: Mission, tasks: Task[]): PlanVersion[] {
  const baseTasks = tasks.map((t) => ({ ...t }));
  const v1: PlanVersion = {
    id: `plan-${mission.id}-v1`,
    version: 1,
    missionId: mission.id,
    createdAt: mission.createdAt || new Date().toISOString(),
    reason: `Initial autonomous mission decomposition for "${mission.title}" (${baseTasks.length} tasks across 5 operational phases).`,
    tasks: baseTasks,
    changesDescription: [
      `Synthesized baseline DAG for ${mission.location} under ${mission.priority.toUpperCase()} priority.`,
      `Bound ${baseTasks.length} tasks to specialized Planning, Execution, Monitoring, Resource, and Verification agents.`,
    ],
    summaryDiff: {
      addedTasks: baseTasks.length,
      modifiedTasks: 0,
      reroutedPaths: 1,
      resourceAdjustments: 1,
    },
  };

  if ((mission.planVersion || 1) >= 2) {
    const v2Tasks = baseTasks.map((t, idx) =>
      idx === 2 || idx === 5
        ? {
            ...t,
            status: 'completed' as const,
            output: `[ADAPTIVE PLAN v2]: Re-vectored via secondary high-clearance corridor to bypass primary bottleneck at ${mission.location}.`,
          }
        : t
    );
    const v2: PlanVersion = {
      id: `plan-${mission.id}-v2`,
      version: 2,
      missionId: mission.id,
      createdAt: mission.updatedAt || new Date().toISOString(),
      reason: `Adaptive re-planning triggered by live telemetry anomaly in ${mission.location}; rerouted critical path and rebalanced reserve resources.`,
      tasks: v2Tasks,
      changesDescription: [
        `Activated contingency task ${baseTasks[5]?.id || 't6'} to bypass primary corridor bottleneck.`,
        `Reallocated reserve capacity across ${mission.location} with +8 min SLA buffer.`,
      ],
      summaryDiff: {
        addedTasks: 0,
        modifiedTasks: 3,
        reroutedPaths: 2,
        resourceAdjustments: 2,
      },
    };
    return [v1, v2];
  }

  return [v1];
}

export const SEED_TASKS_BY_MISSION: Record<string, Task[]> = Object.fromEntries(
  ([] as Mission[]).map((m) => [m.id, []])
);
