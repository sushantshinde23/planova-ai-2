import {
  Mission,
  Task,
  PlanVersion,
  ResourceItem,
  ToolDefinition,
  ApprovalRequest,
  AuditLogEntry,
  DocumentRecord,
  User,
} from '../types';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const token =
      localStorage.getItem('planova_session_token') ||
      sessionStorage.getItem('planova_session_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // ignore storage access issues
  }
  return headers;
}

async function handleResponse<T>(res: Response, errorMsg: string): Promise<T> {
  if (!res.ok) {
    let detail = errorMsg;
    try {
      const errData = await res.json();
      if (errData?.error) detail = errData.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(detail);
  }
  return res.json();
}

export const apiClient = {
  // ----------------------------------------------------
  // AUTH & PROFILE
  // ----------------------------------------------------
  async getCurrentUser(): Promise<{ authenticated: boolean; user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to verify current session');
  },

  async getProfile(): Promise<{ user: User }> {
    const res = await fetch('/api/profile', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch user profile');
  },

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res, 'Failed to save user profile to database');
  },

  async setRole(role: 'admin' | 'operator' | 'viewer'): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/role', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(res, 'Failed to update role');
  },

  // ----------------------------------------------------
  // MISSIONS
  // ----------------------------------------------------
  async getMissions(): Promise<Mission[]> {
    const res = await fetch('/api/missions', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch missions from database');
  },

  async getMission(id: string): Promise<Mission & { tasks: Task[]; plans: PlanVersion[]; events?: any[] }> {
    const res = await fetch(`/api/missions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch mission details');
  },

  async createMission(missionData: Partial<Mission> & { tasks?: Partial<Task>[] }): Promise<Mission & { tasks?: Task[]; plans?: PlanVersion[] }> {
    const res = await fetch('/api/missions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(missionData),
    });
    return handleResponse(res, 'Failed to create and persist mission');
  },

  async updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
    const res = await fetch(`/api/missions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res, 'Failed to update mission');
  },

  async deleteMission(id: string): Promise<{ success: boolean; deletedId: string }> {
    const res = await fetch(`/api/missions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to delete mission');
  },

  // ----------------------------------------------------
  // TASKS
  // ----------------------------------------------------
  async getTasks(missionId: string): Promise<Task[]> {
    const res = await fetch(`/api/missions/${missionId}/tasks`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch mission tasks');
  },

  async createTask(missionId: string, taskData: Partial<Task>): Promise<Task> {
    const res = await fetch(`/api/missions/${missionId}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res, 'Failed to create mission task');
  },

  async updateTask(missionId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...updates, missionId }),
    });
    return handleResponse(res, 'Failed to persist task update');
  },

  // ----------------------------------------------------
  // PLAN VERSIONS (IMMUTABLE VERSIONING)
  // ----------------------------------------------------
  async getPlans(missionId: string): Promise<PlanVersion[]> {
    const res = await fetch(`/api/missions/${missionId}/plans`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch plan versions');
  },

  async createPlanVersion(
    missionId: string,
    planData: {
      reason: string;
      triggeredByEvent?: string;
      changedTasks?: string[];
      resourceChanges?: string[];
      reroutedPaths?: string[];
      tasksSnapshot?: Task[];
      approvalStatus?: 'approved' | 'pending' | 'rejected';
    }
  ): Promise<PlanVersion> {
    const res = await fetch(`/api/missions/${missionId}/plans`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(planData),
    });
    return handleResponse(res, 'Failed to save new plan version');
  },

  // ----------------------------------------------------
  // MISSION EVENTS
  // ----------------------------------------------------
  async getMissionEvents(missionId: string): Promise<any[]> {
    const res = await fetch(`/api/missions/${missionId}/events`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch mission events');
  },

  async createMissionEvent(
    missionId: string,
    eventData: {
      type: string;
      title?: string;
      description?: string;
      severity?: string;
      affectedTasks?: string[];
    }
  ): Promise<{ event: any; tasks: Task[]; resources: ResourceItem[]; mission?: Mission }> {
    const res = await fetch(`/api/missions/${missionId}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(res, 'Failed to record mission event');
  },

  // ----------------------------------------------------
  // APPROVALS
  // ----------------------------------------------------
  async getApprovals(): Promise<ApprovalRequest[]> {
    const res = await fetch('/api/approvals', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch approvals');
  },

  async createApproval(approvalData: Partial<ApprovalRequest>): Promise<ApprovalRequest> {
    const res = await fetch('/api/approvals', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(approvalData),
    });
    return handleResponse(res, 'Failed to submit approval request');
  },

  async decideApproval(
    approvalId: string,
    decision: 'approved' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; approval: ApprovalRequest; tasks?: Task[]; mission?: Mission }> {
    const res = await fetch(`/api/approvals/${approvalId}/decision`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ decision, notes }),
    });
    return handleResponse(res, 'Failed to record approval decision');
  },

  // ----------------------------------------------------
  // WHAT-IF SIMULATOR
  // ----------------------------------------------------
  async simulateScenario(
    missionId: string,
    scenarioType: string,
    severity: string,
    parameters?: any
  ): Promise<any> {
    const res = await fetch(`/api/missions/${missionId}/simulate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ scenarioType, severity, parameters }),
    });
    return handleResponse(res, 'Simulation failed');
  },

  async runSimulation(params: {
    missionId?: string;
    scenario: string;
    ambulanceCount?: number;
    rainIntensity?: number;
    shelter2Closed?: boolean;
  }): Promise<any> {
    const targetMissionId = params.missionId || 'mission-flood-evac-01';
    const res = await fetch(`/api/missions/${targetMissionId}/simulate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        scenarioType: params.scenario,
        severity: params.shelter2Closed ? 'critical' : 'high',
        parameters: params,
      }),
    });
    return handleResponse(res, 'Simulation failed');
  },

  // ----------------------------------------------------
  // RESOURCES
  // ----------------------------------------------------
  async getResources(): Promise<ResourceItem[]> {
    const res = await fetch('/api/resources', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch resources');
  },

  async createResource(resourceData: Partial<ResourceItem> & { missionId?: string }): Promise<ResourceItem> {
    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(resourceData),
    });
    return handleResponse(res, 'Failed to provision resource');
  },

  async updateResource(id: string, updates: Partial<ResourceItem>): Promise<ResourceItem> {
    const res = await fetch(`/api/resources/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res, 'Failed to update resource allocation');
  },

  // ----------------------------------------------------
  // TOOLS
  // ----------------------------------------------------
  async getTools(): Promise<ToolDefinition[]> {
    const res = await fetch('/api/tools', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch tools');
  },

  async executeTool(
    toolId: string,
    inputPayload: any,
    reason: string,
    missionId?: string
  ): Promise<any> {
    const res = await fetch(`/api/tools/${toolId}/execute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ inputPayload, reason, missionId }),
    });
    return handleResponse(res, 'Failed to execute tool');
  },

  // ----------------------------------------------------
  // DOCUMENTS
  // ----------------------------------------------------
  async getDocuments(): Promise<DocumentRecord[]> {
    const res = await fetch('/api/documents', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch documents');
  },

  async uploadDocument(docData: Partial<DocumentRecord> & { missionId?: string }): Promise<DocumentRecord> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(docData),
    });
    return handleResponse(res, 'Failed to upload and index document');
  },

  // ----------------------------------------------------
  // AUDIT & ANALYTICS
  // ----------------------------------------------------
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch('/api/audit', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch audit logs');
  },

  async getAnalytics(): Promise<any> {
    const res = await fetch('/api/analytics', {
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to fetch analytics');
  },

  async resetDemoState(): Promise<any> {
    const res = await fetch('/api/demo/reset', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res, 'Failed to reset demo state');
  },

  // ----------------------------------------------------
  // GEMINI AI AGENTS
  // ----------------------------------------------------
  async analyzeGoal(goal: string, domain?: string): Promise<any> {
    const res = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ goal, domain }),
    });
    return handleResponse(res, 'Goal analysis failed');
  },

  async generatePlan(goal: string, constraints?: any): Promise<any> {
    const res = await fetch('/api/gemini/plan', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ goal, constraints }),
    });
    return handleResponse(res, 'Plan generation failed');
  },

  async sendTacticalChat(
    messages: { role: string; content: string }[],
    missionContext?: any
  ): Promise<{ reply: string }> {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ messages, missionContext }),
    });
    return handleResponse(res, 'Chat failed');
  },

  async lowLatencyTriage(eventSnippet: string): Promise<{ analysis: string }> {
    const res = await fetch('/api/gemini/low-latency', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ eventSnippet }),
    });
    return handleResponse(res, 'Triage failed');
  },
};
