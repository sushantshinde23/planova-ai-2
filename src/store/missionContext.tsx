import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  UserRole,
} from '../types';
import { apiClient } from '../services/api';
import { Language, translations, tr as translatePhrase } from '../i18n/translations';
import {
  SEED_MISSIONS,
  SEED_TASKS_FLOOD,
  SEED_PLAN_VERSIONS,
  SEED_RESOURCES,
  SEED_TOOLS,
  SEED_APPROVALS,
  SEED_AUDIT_LOGS,
  SEED_DOCUMENTS,
} from '../data/seedData';
import {
  auth,
  db,
  onAuthStateChanged,
  loginWithEmailPassword,
  registerWithEmailPassword,
  loginWithGoogle,
  logoutAuthenticatedUser,
  syncUserProfileToFirestore,
  updateFirestoreUserProfile,
} from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export type SettingsTabType = 'profile' | 'account' | 'preferences' | 'security';

interface MissionContextType {
  missions: Mission[];
  activeMissionId: string;
  activeMission: Mission | undefined;
  tasks: Task[];
  plans: PlanVersion[];
  selectedPlanVersion: number;
  approvals: ApprovalRequest[];
  resources: ResourceItem[];
  tools: ToolDefinition[];
  auditLogs: AuditLogEntry[];
  documents: DocumentRecord[];
  analytics: any;
  language: Language;
  theme: 'light' | 'dark';
  currentUser: User;
  isAuthenticated: boolean;
  authLoading: boolean;
  settingsTab: SettingsTabType;
  isDemoRunning: boolean;
  demoStep: number;
  isApprovalModalOpen: boolean;
  activeApproval: ApprovalRequest | null;
  connectionError: string | null;
  wsConnected: boolean;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type?: 'info' | 'warning' | 'critical' | 'success';
  }>;
  unreadCount: number;
  markNotificationsRead: () => void;
  t: typeof translations['en'];

  // Actions
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUserRole: (role: UserRole) => void;
  setSettingsTab: (tab: SettingsTabType) => void;
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  registerAccount: (fullName: string, email: string, password: string) => Promise<void>;
  loginWithGoogleProvider: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  setActiveMissionId: (id: string) => void;
  setSelectedPlanVersion: (v: number) => void;
  createTask: (taskData: Partial<Task>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task>;
  updateTaskStatus: (taskId: string, status: any) => Promise<void>;
  deleteMission: (missionId: string) => Promise<void>;
  createPlanVersion: (reason: string, triggeredByEvent?: string) => Promise<PlanVersion>;
  updateResourceAllocation: (resourceId: string, updates: Partial<ResourceItem>) => Promise<ResourceItem>;
  provisionResource: (resourceData: Partial<ResourceItem>) => Promise<ResourceItem>;
  decideApproval: (id: string, decision: 'approved' | 'rejected', notes?: string) => Promise<void>;
  openApprovalModal: (appr: ApprovalRequest) => void;
  closeApprovalModal: () => void;
  triggerDisruption: (type: 'route_r2_blocked' | 'ambulance_reduced') => Promise<void>;
  startHackathonDemo: () => void;
  stopHackathonDemo: () => void;
  stepDemoForward: () => void;
  resetDemo: () => Promise<void>;
  addDocument: (doc: DocumentRecord) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [missions, setMissions] = useState<Mission[]>(SEED_MISSIONS);
  const [activeMissionId, setActiveMissionId] = useState<string>('mission-flood-evac-01');
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS_FLOOD);
  const [plans, setPlans] = useState<PlanVersion[]>(SEED_PLAN_VERSIONS);
  const [selectedPlanVersion, setSelectedPlanVersion] = useState<number>(2);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(SEED_APPROVALS);
  const [resources, setResources] = useState<ResourceItem[]>(SEED_RESOURCES);
  const [tools, setTools] = useState<ToolDefinition[]>(SEED_TOOLS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(SEED_AUDIT_LOGS);
  const [documents, setDocuments] = useState<DocumentRecord[]>(SEED_DOCUMENTS);
  const [analytics, setAnalytics] = useState<any>({
    missionCompletionRate: 98.4,
    taskCompletionRate: 96.2,
    avgExecutionTimeMinutes: 44.5,
    avgReplanningLatencySeconds: 1.8,
    totalReplanningEvents: 14,
    failedTasksCount: 2,
    resourceUtilizationRate: 88.5,
    humanApprovalResponseMinutes: 3.2,
    toolSuccessRate: 99.4,
  });

  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const activeMissionIdRef = useRef<string>(activeMissionId);
  useEffect(() => {
    activeMissionIdRef.current = activeMissionId;
  }, [activeMissionId]);

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('planova_language');
      if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
    } catch {}
    return 'en';
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('planova_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'light';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('planova_language', lang);
    } catch {}
  };

  const setTheme = (th: 'light' | 'dark') => {
    setThemeState(th);
    try {
      localStorage.setItem('planova_theme', th);
    } catch {}
  };

  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-001',
    name: 'Sushant Shinde',
    email: 'sushantshinde5598@gmail.com',
    role: 'operator',
    department: 'Emergency & Civil Defense Operations',
    authProvider: 'email',
    createdAt: '2026-09-15T08:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    emailVerified: true,
    preferences: {
      theme: 'light',
      language: 'en',
      notificationsEnabled: true,
      defaultDomain: 'emergency',
      autoApproveLowRisk: true,
      compactTelemetry: false,
    },
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const token =
        localStorage.getItem('planova_session_token') ||
        sessionStorage.getItem('planova_session_token');
      return !!token;
    } catch {
      return false;
    }
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [settingsTab, setSettingsTab] = useState<SettingsTabType>('profile');

  // Helper to mirror operational entities to Cloud Firestore when authenticated
  const mirrorToFirestore = async (collectionName: string, docId: string, payload: any) => {
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, collectionName, docId), JSON.parse(JSON.stringify(payload)), {
          merge: true,
        });
      }
    } catch {
      // non-blocking cloud sync
    }
  };

  // Restore session from backend API and Firebase Auth
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        const token =
          localStorage.getItem('planova_session_token') ||
          sessionStorage.getItem('planova_session_token');

        if (token) {
          const data = await apiClient.getCurrentUser();
          if (data.authenticated && data.user && mounted) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            if (data.user.preferences?.theme) setThemeState(data.user.preferences.theme);
            if (data.user.preferences?.language) setLanguageState(data.user.preferences.language);
          }
        }
      } catch (e) {
        console.warn('Session check warning:', e);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    restoreSession();

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email && !fbUser.isAnonymous) {
        const synced = await syncUserProfileToFirestore({
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          role: 'operator',
          department: 'Emergency & Civil Defense Operations',
          avatarUrl: fbUser.photoURL || undefined,
          authProvider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
          emailVerified: fbUser.emailVerified,
        });
        if (mounted) {
          setCurrentUser(synced);
          setIsAuthenticated(true);
        }
      }
      if (mounted) setAuthLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const persistSession = (user: User, token?: string, rememberMe: boolean = true) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    try {
      const storage = rememberMe ? localStorage : sessionStorage;
      if (token) storage.setItem('planova_session_token', token);
      storage.setItem('planova_user_profile', JSON.stringify(user));
    } catch {}
  };

  const loginWithEmail = async (email: string, password: string, rememberMe: boolean = true) => {
    const { user, token } = await loginWithEmailPassword(email, password, rememberMe);
    persistSession(user, token, rememberMe);
    if (user.preferences?.theme) setTheme(user.preferences.theme);
    if (user.preferences?.language) setLanguage(user.preferences.language);
    await refreshAll();
  };

  const registerAccount = async (fullName: string, email: string, password: string) => {
    const { user, token } = await registerWithEmailPassword(fullName, email, password);
    persistSession(user, token, true);
    await refreshAll();
  };

  const loginWithGoogleProvider = async () => {
    const { user, token } = await loginWithGoogle();
    persistSession(user, token, true);
    await refreshAll();
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    const payload = {
      email: currentUser.email,
      name: updates.name ?? currentUser.name,
      department: updates.department ?? currentUser.department,
      avatarUrl: updates.avatarUrl ?? currentUser.avatarUrl,
      role: updates.role ?? currentUser.role,
      preferences: updates.preferences
        ? { ...(currentUser.preferences || ({} as any)), ...updates.preferences }
        : currentUser.preferences,
    };

    const res = await apiClient.updateProfile(payload);
    setCurrentUser(res.user);
    setConnectionError(null);

    if (updates.preferences?.theme) setTheme(updates.preferences.theme);
    if (updates.preferences?.language) setLanguage(updates.preferences.language);

    await updateFirestoreUserProfile(res.user.id, updates);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    await logoutAuthenticatedUser();
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('planova_session_token');
      localStorage.removeItem('planova_user_profile');
      sessionStorage.removeItem('planova_session_token');
      sessionStorage.removeItem('planova_user_profile');
    } catch {}
  };

  // Demo flow state
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(null);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
      type?: 'info' | 'warning' | 'critical' | 'success';
    }>
  >([
    {
      id: 'notif-01',
      title: 'Route R2 Flood Sensor Alert',
      message: 'Hydrological Sensor #12 reports +0.92m water depth on Causeway Bridge R2. Bypass R4 synthesized.',
      timestamp: '2 mins ago',
      read: false,
      type: 'critical',
    },
    {
      id: 'notif-02',
      title: 'Human Governance Gate Active',
      message: 'Approval required for Task T-09: Divert Ambulance Fleet via Elevated Bypass R4.',
      timestamp: '5 mins ago',
      read: false,
      type: 'warning',
    },
    {
      id: 'notif-03',
      title: 'Multi-Agent Telemetry Synced',
      message: 'All 7 specialized agents connected to Mission Digital Twin with sub-second latency.',
      timestamp: '12 mins ago',
      read: true,
      type: 'success',
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      if (body) body.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      if (body) body.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Fetch all persisted state from backend database
  const refreshAll = useCallback(async () => {
    try {
      const [m, a, r, tl, ad, dc, an] = await Promise.all([
        apiClient.getMissions(),
        apiClient.getApprovals(),
        apiClient.getResources(),
        apiClient.getTools(),
        apiClient.getAuditLogs(),
        apiClient.getDocuments(),
        apiClient.getAnalytics(),
      ]);
      if (Array.isArray(m) && m.length > 0) setMissions(m);
      if (Array.isArray(a)) setApprovals(a);
      if (Array.isArray(r) && r.length > 0) setResources(r);
      if (Array.isArray(tl) && tl.length > 0) setTools(tl);
      if (Array.isArray(ad)) setAuditLogs(ad);
      if (Array.isArray(dc)) setDocuments(dc);
      if (an && an.missionCompletionRate) setAnalytics(an);

      const safeMissionsList = Array.isArray(m) && m.length > 0 ? m : SEED_MISSIONS;
      const targetId = activeMissionId || (safeMissionsList[0] && safeMissionsList[0].id) || 'mission-flood-evac-01';
      const [tks, pls] = await Promise.all([
        apiClient.getTasks(targetId),
        apiClient.getPlans(targetId),
      ]);
      if (Array.isArray(tks)) setTasks(tks);
      if (Array.isArray(pls)) setPlans(pls);
      setConnectionError(null);
    } catch (err: any) {
      console.warn('Backend connection error:', err);
      setConnectionError('Unable to reach PLANOVA AI Backend Server. Changes cannot be saved until connection is restored.');
    }
  }, [activeMissionId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Load mission tasks & plans from backend whenever activeMissionId changes
  useEffect(() => {
    let active = true;
    const loadMissionDetails = async () => {
      try {
        const [tks, pls] = await Promise.all([
          apiClient.getTasks(activeMissionId),
          apiClient.getPlans(activeMissionId),
        ]);
        if (active) {
          if (Array.isArray(tks)) setTasks(tks);
          if (Array.isArray(pls)) {
            setPlans(pls);
            if (pls.length > 0) {
              const maxVer = Math.max(...pls.map((p) => p.version));
              setSelectedPlanVersion(maxVer);
            }
          }
          setConnectionError(null);
        }
      } catch (err) {
        if (active) {
          setConnectionError('Connection lost while loading mission data from server.');
        }
      }
    };
    loadMissionDetails();
    return () => {
      active = false;
    };
  }, [activeMissionId]);

  // Real-Time WebSocket Client Connection (/ws) with Auto-Reconnect
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isUnmounted = false;

    const connectWebSocket = () => {
      if (isUnmounted) return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (isUnmounted) return;
          setWsConnected(true);
          setConnectionError(null);
        };

        ws.onmessage = (event) => {
          if (isUnmounted) return;
          try {
            const payload = JSON.parse(event.data);
            const { type, data } = payload;

            if (type === 'mission_created' && data?.mission) {
              setMissions((prev) => {
                if (prev.some((m) => m.id === data.mission.id)) return prev;
                return [data.mission, ...prev];
              });
            } else if (type === 'mission_updated' && data?.id) {
              setMissions((prev) => prev.map((m) => (m.id === data.id ? data : m)));
            } else if (type === 'mission_deleted' && data?.id) {
              setMissions((prev) => prev.filter((m) => m.id !== data.id));
            } else if (type === 'task_created' && data?.task) {
              if (data.missionId === activeMissionIdRef.current) {
                setTasks((prev) => {
                  if (prev.some((t) => t.id === data.task.id)) return prev;
                  return [...prev, data.task];
                });
              }
              if (data.mission) {
                setMissions((prev) => prev.map((m) => (m.id === data.mission.id ? data.mission : m)));
              }
            } else if (type === 'task_updated' && data?.task) {
              if (data.missionId === activeMissionIdRef.current) {
                setTasks((prev) => prev.map((t) => (t.id === data.task.id ? data.task : t)));
              }
              if (data.mission) {
                setMissions((prev) => prev.map((m) => (m.id === data.mission.id ? data.mission : m)));
              }
            } else if (type === 'plan_created' && data?.plan) {
              if (data.missionId === activeMissionIdRef.current) {
                setPlans((prev) => {
                  if (prev.some((p) => p.id === data.plan.id)) return prev;
                  return [...prev, data.plan];
                });
                setSelectedPlanVersion(data.plan.version);
              }
              if (data.mission) {
                setMissions((prev) => prev.map((m) => (m.id === data.mission.id ? data.mission : m)));
              }
            } else if (type === 'event_created' && data) {
              if (data.missionId === activeMissionIdRef.current && Array.isArray(data.tasks)) {
                setTasks(data.tasks);
              }
              if (data.missionId === activeMissionIdRef.current && Array.isArray(data.plans)) {
                setPlans(data.plans);
              }
              if (Array.isArray(data.resources)) {
                setResources(data.resources);
              }
              if (data.mission) {
                setMissions((prev) => prev.map((m) => (m.id === data.mission.id ? data.mission : m)));
              }
            } else if (type === 'resource_updated' && data?.id) {
              setResources((prev) => prev.map((r) => (r.id === data.id ? data : r)));
            } else if (type === 'resource_created' && data?.id) {
              setResources((prev) => {
                if (prev.some((r) => r.id === data.id)) return prev;
                return [data, ...prev];
              });
            } else if (type === 'approval_decided' && data?.approval) {
              setApprovals((prev) => prev.map((a) => (a.id === data.approval.id ? data.approval : a)));
              if (Array.isArray(data.tasks) && data.approval.missionId === activeMissionIdRef.current) {
                setTasks(data.tasks);
              }
              if (data.mission) {
                setMissions((prev) => prev.map((m) => (m.id === data.mission.id ? data.mission : m)));
              }
            } else if (type === 'document_uploaded' && data?.id) {
              setDocuments((prev) => {
                if (prev.some((d) => d.id === data.id)) return prev;
                return [data, ...prev];
              });
            } else if (type === 'audit:created' && data?.id) {
              setAuditLogs((prev) => {
                if (prev.some((a) => a.id === data.id)) return prev;
                return [data, ...prev];
              });
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.onclose = () => {
          if (isUnmounted) return;
          setWsConnected(false);
          reconnectTimer = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch {
        reconnectTimer = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  const activeMission = missions.find((m) => m.id === activeMissionId) || missions[0];

  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    const savedTask = await apiClient.createTask(activeMissionId, taskData);
    setTasks((prev) => {
      if (prev.some((t) => t.id === savedTask.id)) return prev;
      const next = [...prev, savedTask];
      const completedCount = next.filter((t) => t.status === 'completed' || t.status === 'verified').length;
      const inProgressCount = next.filter((t) => t.status === 'in_progress').length;
      const waitingApprovalCount = next.filter((t) => t.status === 'waiting_approval').length;
      const progress = next.length > 0 ? Math.round((completedCount / next.length) * 100) : 0;
      setMissions((ms) =>
        ms.map((m) =>
          m.id === activeMissionId
            ? {
                ...m,
                tasksCount: next.length,
                completedCount,
                inProgressCount,
                waitingApprovalCount,
                progress,
                status: progress === 100 ? 'completed' : m.status,
              }
            : m
        )
      );
      return next;
    });
    await mirrorToFirestore('tasks', savedTask.id, savedTask);
    return savedTask;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const updatedTask = await apiClient.updateTask(activeMissionId, taskId, updates);
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === taskId ? updatedTask : t));
      const completedCount = next.filter((t) => t.status === 'completed' || t.status === 'verified').length;
      const inProgressCount = next.filter((t) => t.status === 'in_progress').length;
      const waitingApprovalCount = next.filter((t) => t.status === 'waiting_approval').length;
      const progress = next.length > 0 ? Math.round((completedCount / next.length) * 100) : 0;
      setMissions((ms) =>
        ms.map((m) =>
          m.id === activeMissionId
            ? {
                ...m,
                tasksCount: next.length,
                completedCount,
                inProgressCount,
                waitingApprovalCount,
                progress,
                status: progress === 100 ? 'completed' : m.status === 'completed' ? 'executing' : m.status,
              }
            : m
        )
      );
      return next;
    });
    await mirrorToFirestore('tasks', updatedTask.id, updatedTask);
    return updatedTask;
  };

  const updateTaskStatus = async (taskId: string, status: any) => {
    await updateTask(taskId, { status });
  };

  const deleteMission = async (missionId: string) => {
    await apiClient.deleteMission(missionId);
    setMissions((prev) => {
      const remaining = prev.filter((m) => m.id !== missionId);
      if (activeMissionId === missionId && remaining.length > 0) {
        setActiveMissionId(remaining[0].id);
      }
      return remaining;
    });
  };

  const createPlanVersion = async (reason: string, triggeredByEvent?: string): Promise<PlanVersion> => {
    const newPlan = await apiClient.createPlanVersion(activeMissionId, {
      reason,
      triggeredByEvent,
      tasksSnapshot: tasks,
    });
    setPlans((prev) => {
      if (prev.some((p) => p.version === newPlan.version)) return prev;
      return [...prev, newPlan];
    });
    setSelectedPlanVersion(newPlan.version);
    await mirrorToFirestore('plan_versions', newPlan.id || `plan-${activeMissionId}-v${newPlan.version}`, newPlan);
    return newPlan;
  };

  const updateResourceAllocation = async (
    resourceId: string,
    updates: Partial<ResourceItem>
  ): Promise<ResourceItem> => {
    const saved = await apiClient.updateResource(resourceId, updates);
    setResources((prev) => prev.map((r) => (r.id === resourceId ? saved : r)));
    await mirrorToFirestore('resources', saved.id, saved);
    return saved;
  };

  const provisionResource = async (resourceData: Partial<ResourceItem>): Promise<ResourceItem> => {
    const saved = await apiClient.createResource({ ...resourceData, missionId: activeMissionId });
    setResources((prev) => {
      if (prev.some((r) => r.id === saved.id)) return prev;
      return [saved, ...prev];
    });
    await mirrorToFirestore('resources', saved.id, saved);
    return saved;
  };

  const decideApproval = async (id: string, decision: 'approved' | 'rejected', notes?: string) => {
    const res = await apiClient.decideApproval(id, decision, notes);
    setApprovals((prev) => prev.map((a) => (a.id === id ? res.approval : a)));
    if (res.tasks) setTasks(res.tasks);
    if (res.mission) {
      setMissions((prev) => prev.map((m) => (m.id === res.mission!.id ? res.mission! : m)));
    }
    setIsApprovalModalOpen(false);
    await mirrorToFirestore('approvals', res.approval.id, res.approval);
  };

  const openApprovalModal = (appr: ApprovalRequest) => {
    setActiveApproval(appr);
    setIsApprovalModalOpen(true);
  };

  const closeApprovalModal = () => {
    setIsApprovalModalOpen(false);
  };

  const setUserRole = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    apiClient.setRole(role).catch(() => {});
  };

  // Triggering live real-time disruptions persisted to backend
  const triggerDisruption = async (type: 'route_r2_blocked' | 'ambulance_reduced') => {
    try {
      const res: any = await apiClient.createMissionEvent(activeMissionId, {
        type,
        severity: 'critical',
      });
      if (res.tasks) setTasks(res.tasks);
      if (res.plans) setPlans(res.plans);
      if (res.resources) setResources(res.resources);
      if (res.mission) {
        setMissions((prev) => prev.map((m) => (m.id === res.mission!.id ? res.mission! : m)));
      }
      if (res.event?.newPlanVersion) {
        setSelectedPlanVersion(res.event.newPlanVersion);
      } else if (type === 'route_r2_blocked') {
        setSelectedPlanVersion(2);
      } else if (type === 'ambulance_reduced') {
        setSelectedPlanVersion(3);
      }
      if (type === 'ambulance_reduced') {
        const targetAppr = approvals.find((a) => a.missionId === activeMissionId && a.status === 'pending') || approvals.find((a) => a.id === 'appr-01');
        if (targetAppr) openApprovalModal(targetAppr);
      }
      if (res.event) {
        await mirrorToFirestore('mission_events', res.event.id, res.event);
      }
    } catch (err) {
      setConnectionError('Failed to record disruption event on backend.');
    }
  };

  // Flagship Demo Engine
  const startHackathonDemo = () => {
    setIsDemoRunning(true);
    setDemoStep(1);
    setActiveMissionId('mission-flood-evac-01');
    setSelectedPlanVersion(1);
  };

  const stopHackathonDemo = () => {
    setIsDemoRunning(false);
  };

  const stepDemoForward = () => {
    setDemoStep((prev) => {
      const next = prev + 1;
      if (next === 2) {
        setSelectedPlanVersion(1);
      } else if (next === 3) {
        ['task-01', 'task-02', 'task-03', 'task-04', 'task-05', 'task-06'].forEach((tid) => {
          updateTaskStatus(tid, 'completed');
        });
      } else if (next === 4) {
        triggerDisruption('route_r2_blocked');
      } else if (next === 5) {
        setSelectedPlanVersion(2);
      } else if (next === 6) {
        triggerDisruption('ambulance_reduced');
      } else if (next === 7) {
        const targetAppr = approvals.find((a) => a.id === 'appr-01');
        if (targetAppr) openApprovalModal(targetAppr);
      } else if (next === 8) {
        updateTaskStatus('task-20', 'completed');
        updateTaskStatus('task-21', 'completed');
        updateTaskStatus('task-22', 'completed');
        updateTaskStatus('task-23', 'verified');
      } else if (next >= 9) {
        apiClient.updateMission('mission-flood-evac-01', {
          status: 'completed',
          progress: 100,
          completedCount: 24,
          inProgressCount: 0,
          waitingApprovalCount: 0,
        }).then((updated) => {
          setMissions((ms) => ms.map((m) => (m.id === updated.id ? updated : m)));
        });
        setIsDemoRunning(false);
      }
      return next > 9 ? 9 : next;
    });
  };

  const resetDemo = async () => {
    setIsDemoRunning(false);
    setDemoStep(1);
    try {
      const data = await apiClient.resetDemoState();
      if (data.missions) setMissions(data.missions);
      if (data.tasks) setTasks(data.tasks);
      if (data.plans) setPlans(data.plans);
      if (data.resources) setResources(data.resources);
      if (data.approvals) setApprovals(data.approvals);
      setSelectedPlanVersion(2);
    } catch {
      setConnectionError('Failed to reset demo state on backend.');
    }
  };

  const addDocument = async (docRecord: DocumentRecord) => {
    const savedDoc = await apiClient.uploadDocument({
      ...docRecord,
      missionId: activeMissionId,
    });
    setDocuments((prev) => {
      if (prev.some((d) => d.id === savedDoc.id)) return prev;
      return [savedDoc, ...prev];
    });
    await mirrorToFirestore('documents', savedDoc.id, savedDoc);
  };

  const t = translations[language] || translations.en;

  return (
    <MissionContext.Provider
      value={{
        missions,
        activeMissionId,
        activeMission,
        tasks,
        plans,
        selectedPlanVersion,
        approvals,
        resources,
        tools,
        auditLogs,
        documents,
        analytics,
        language,
        theme,
        currentUser,
        isAuthenticated,
        authLoading,
        settingsTab,
        isDemoRunning,
        demoStep,
        isApprovalModalOpen,
        activeApproval,
        connectionError,
        wsConnected,
        notifications,
        unreadCount,
        markNotificationsRead,
        t,
        setLanguage,
        setTheme,
        setUserRole,
        setSettingsTab,
        loginWithEmail,
        registerAccount,
        loginWithGoogleProvider,
        updateUserProfile,
        logout,
        setActiveMissionId,
        setSelectedPlanVersion,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteMission,
        createPlanVersion,
        updateResourceAllocation,
        provisionResource,
        decideApproval,
        openApprovalModal,
        closeApprovalModal,
        triggerDisruption,
        startHackathonDemo,
        stopHackathonDemo,
        stepDemoForward,
        resetDemo,
        addDocument,
        refreshAll,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
