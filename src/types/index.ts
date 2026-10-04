export type MissionCategory =
  | 'emergency'
  | 'disaster'
  | 'agriculture'
  | 'government'
  | 'healthcare'
  | 'accident'
  | 'logistics'
  | 'industrial'
  | 'career'
  | 'project';

export type MissionStatus =
  | 'draft'
  | 'planning'
  | 'executing'
  | 'paused'
  | 'replanning'
  | 'awaiting_approval'
  | 'completed'
  | 'failed';

export type MissionPriority = 'low' | 'medium' | 'high' | 'critical';

export type TaskStatus =
  | 'pending'
  | 'planned'
  | 'ready'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'replanning'
  | 'verified';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AgentRole =
  | 'analyst'
  | 'planner'
  | 'orchestrator'
  | 'executor'
  | 'monitor'
  | 'replanner'
  | 'verifier';

export interface MissionConstraint {
  id: string;
  key: string;
  label: string;
  value: string;
  type: 'hard' | 'soft' | 'resource' | 'regulatory';
  source?: string;
}

export interface Task {
  id: string;
  missionId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: MissionPriority;
  assignedAgent: string;
  requiredTool?: string;
  requiredResource?: string;
  dependencies: string[]; // task IDs
  estimatedDurationMinutes: number;
  actualDurationMinutes?: number;
  startTime?: string;
  completedTime?: string;
  riskLevel?: RiskLevel;
  requiresApproval?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'bypassed';
  output?: string;
  evidence?: string[];
  executionLogs?: string[];
  replanCount?: number;
  retryCount?: number;
  maxRetries?: number;
  planVersion?: number;
  metadata?: Record<string, any>;
}

export interface Mission {
  id: string;
  title: string;
  tagline?: string;
  objective: string;
  category: MissionCategory;
  status: MissionStatus;
  priority: MissionPriority;
  location: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
  eta: string;
  progress: number; // 0 - 100
  tasksCount: number;
  completedCount: number;
  inProgressCount: number;
  waitingApprovalCount: number;
  replannedCount: number;
  constraints: MissionConstraint[];
  planVersion: number;
  autonomousLevel: 'full' | 'semi' | 'supervised' | 'manual';
  aiUnderstanding?: {
    summary: string;
    entities: string[];
    assumptions: string[];
    risks: string[];
    missingInfo: string[];
    explanation: string;
    confidenceScore: number;
  };
}

export interface PlanVersion {
  id?: string;
  version: number;
  missionId: string;
  createdAt: string;
  reason: string;
  triggeredBy?: string;
  triggeredByEvent?: string;
  tasks: Task[];
  changes?: string[];
  changesDescription: string[];
  summaryDiff: {
    addedTasks: number;
    modifiedTasks?: number;
    removedTasks?: number;
    reroutedPaths: number;
    resourceAdjustments: number;
  };
}

export interface DisruptionEvent {
  id: string;
  missionId: string;
  timestamp: string;
  source: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  affectedTaskIds: string[];
  resolved: boolean;
  replannedVersion?: number;
}

export interface ApprovalRequest {
  id: string;
  missionId: string;
  taskId: string;
  taskTitle: string;
  action: string;
  reason: string;
  impactDescription: string;
  affectedTasksCount: number;
  aiConfidence: number;
  evidence: string[];
  proposedAlternative: string;
  riskLevel: RiskLevel;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
}

export interface ResourceItem {
  id: string;
  missionId?: string;
  name: string;
  type: 'vehicle' | 'personnel' | 'shelter' | 'equipment' | 'facility' | 'budget' | 'medical';
  total: number;
  available: number;
  allocated: number;
  inUse: number;
  unit: string;
  location?: string;
  status: 'optimal' | 'constrained' | 'critical';
  assignedMissionIds: string[];
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: 'geospatial' | 'routing' | 'weather' | 'government' | 'communication' | 'database' | 'ai';
  status: 'online' | 'degraded' | 'offline';
  description: string;
  latencyMs: number;
  endpoint: string;
  successRate: number;
  executionsCount: number;
}

export interface ToolExecutionLog {
  id: string;
  toolId: string;
  toolName: string;
  missionId: string;
  taskId?: string;
  timestamp: string;
  reason: string;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any>;
  status: 'success' | 'failed' | 'running';
  executionTimeMs: number;
}

export interface DocumentRecord {
  id: string;
  missionId?: string;
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'text';
  sizeBytes: number;
  uploadedAt: string;
  status: 'processed' | 'analyzing' | 'error';
  extractedEntities: {
    names: string[];
    dates: string[];
    locations: string[];
    requirements: string[];
    criticalFlags: string[];
  };
  summary: string;
  previewUrl?: string;
  source?: 'camera' | 'gallery' | 'drive' | 'local';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  missionId: string;
  missionTitle: string;
  agent: string;
  action: string;
  toolUsed?: string;
  user: string;
  riskLevel: RiskLevel;
  approvalRequired: boolean;
  approvalStatus?: string;
  result: 'success' | 're-planned' | 'rejected' | 'failed';
  details: string;
}

export interface SystemHealthMetrics {
  status: 'operational' | 'degraded' | 'maintenance';
  uptimeSeconds: number;
  activeAgents: number;
  activeMissions: number;
  toolSuccessRate: number;
  averageReplanningLatencySeconds: number;
  humanApprovalResponseMinutes: number;
  lastHeartbeat: string;
}

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'en' | 'hi' | 'mr';
  notificationsEnabled: boolean;
  defaultDomain: MissionCategory;
  autoApproveLowRisk: boolean;
  compactTelemetry: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  authProvider?: 'email' | 'google';
  createdAt?: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
  preferences?: UserPreferences;
}
