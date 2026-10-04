import React, { useState, useRef, useEffect } from 'react';
import { useMission } from '../store/missionContext';
import { tr } from '../i18n/translations';
import { HumanApprovalModal } from '../components/HumanApprovalModal';
import { AutopilotModal } from '../components/AutopilotModal';
import { ExplainableAIDrawer } from '../components/ExplainableAIDrawer';
import { ThemeToggle, LanguageSelector } from '../components/ThemeAndLanguageControls';
import {
  LayoutDashboard,
  FolderGit2,
  GitBranch,
  PlayCircle,
  Truck,
  Sliders,
  Wrench,
  MapPin,
  FileText,
  BarChart3,
  ShieldAlert,
  Settings,
  Bell,
  Search,
  ChevronRight,
  ChevronLeft,
  Activity,
  Bot,
  Sparkles,
  CheckCheck,
  Clock,
  Cpu,
  Network,
  AlertTriangle,
  Database,
  Play,
  X,
  UserCheck,
  LogOut,
  Plus,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentView,
  onNavigate,
}) => {
  const {
    t,
    language,
    missions = [],
    activeMission,
    tasks = [],
    tools = [],
    approvals = [],
    openApprovalModal,
    closeApprovalModal,
    notifications = [],
    unreadCount = 0,
    markNotificationsRead,
    currentUser,
    isAuthenticated,
    logout,
    isDemoRunning,
    demoStep,
    stopHackathonDemo,
  } = useMission();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePopover, setActivePopover] = useState<
    'notifications' | 'user' | 'autopilot' | 'explain' | 'search' | null
  >(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);

  const safeMissions = Array.isArray(missions) ? missions : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeTools = Array.isArray(tools) ? tools : [];
  const safeApprovals = Array.isArray(approvals) ? approvals : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const pendingApprovalsCount = safeApprovals.filter((a) => a.status === 'pending').length;
  const activeExecutingCount = safeTasks.filter((tk) => tk.status === 'in_progress').length;
  const atRiskTasksCount = safeTasks.filter(
    (tk) => tk.status === 'blocked' || tk.status === 'failed' || tk.status === 'waiting_approval'
  ).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (activePopover === 'notifications' && notifRef.current && !notifRef.current.contains(target)) {
        setActivePopover(null);
      }
      if (activePopover === 'user' && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setActivePopover(null);
      }
      if (activePopover === 'search' && searchRef.current && !searchRef.current.contains(target)) {
        setActivePopover(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePopover(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePopover]);

  // Clean up all transient layout overlays, modals, and scroll position on navigation change
  useEffect(() => {
    setActivePopover(null);
    setMobileMenuOpen(false);
    setGlobalSearchQuery('');
    closeApprovalModal();
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [currentView]);

  const searchResults = globalSearchQuery.trim()
    ? {
        missions: safeMissions
          .filter(
            (m) =>
              m.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
              m.category.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
              m.location.toLowerCase().includes(globalSearchQuery.toLowerCase())
          )
          .slice(0, 3),
        tasks: safeTasks
          .filter(
            (tk) =>
              tk.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
              tk.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
              tk.assignedAgent.toLowerCase().includes(globalSearchQuery.toLowerCase())
          )
          .slice(0, 4),
        tools: safeTools
          .filter(
            (tl) =>
              tl.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
              tl.category.toLowerCase().includes(globalSearchQuery.toLowerCase())
          )
          .slice(0, 3),
      }
    : null;

  const navSections = [
    {
      sectionLabel: t.nav?.sectionCommand || tr('COMMAND', language),
      items: [
        { id: 'dashboard', label: t.nav?.dashboard || 'Dashboard', icon: LayoutDashboard },
        { id: 'missions', label: t.nav?.missions || 'Missions', icon: FolderGit2, badge: safeMissions.length },
        { id: 'digital-twin', label: t.nav?.digitalTwin || 'Mission Digital Twin', icon: Cpu },
      ],
    },
    {
      sectionLabel: t.nav?.sectionIntelligence || tr('INTELLIGENCE', language),
      items: [
        { id: 'planner', label: t.nav?.planner || 'Mission Planner & Graph', icon: GitBranch },
        { id: 'agents', label: t.nav?.agents || 'Multi-Agent Collaboration', icon: Network },
        {
          id: 'predictive',
          label: t.nav?.predictive || 'Predictive Failure',
          icon: AlertTriangle,
          badge: atRiskTasksCount > 0 ? atRiskTasksCount : undefined,
          badgeAlert: true,
        },
        { id: 'simulator', label: t.nav?.simulator || 'What-If Simulator', icon: Sliders },
      ],
    },
    {
      sectionLabel: t.nav?.sectionExecution || tr('EXECUTION', language),
      items: [
        {
          id: 'execution',
          label: t.nav?.execution || 'Execution Center',
          icon: PlayCircle,
          badge: activeExecutingCount > 0 ? activeExecutingCount : undefined,
        },
        { id: 'resources', label: t.nav?.resources || 'Resource Center', icon: Truck },
        { id: 'tactical-map', label: t.nav?.tacticalMap || 'Tactical Map', icon: MapPin },
      ],
    },
    {
      sectionLabel: t.nav?.sectionMemoryGovernance || tr('MEMORY & GOVERNANCE', language),
      items: [
        { id: 'memory', label: t.nav?.memory || 'Mission Memory', icon: Database },
        { id: 'documents', label: t.nav?.documents || 'Document Center', icon: FileText },
        { id: 'analytics', label: t.nav?.analytics || 'Analytics', icon: BarChart3 },
        {
          id: 'audit',
          label: t.nav?.audit || 'Audit Log',
          icon: ShieldAlert,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeAlert: true,
        },
      ],
    },
    {
      sectionLabel: t.nav?.sectionSystem || tr('SYSTEM', language),
      items: [
        { id: 'tools', label: t.nav?.tools || 'Tool Orchestrator', icon: Wrench },
        { id: 'ai-chat', label: t.nav?.aiChat || 'AI Co-Pilot', icon: Bot },
        { id: 'settings', label: t.nav?.settings || 'Settings & Auth', icon: Settings },
      ],
    },
  ];

  const userInitials =
    (currentUser as any)?.avatarInitials ||
    (currentUser?.name
      ? currentUser.name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'SS');

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F4F6FB] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150 relative isolate">
      <HumanApprovalModal />
      <AutopilotModal
        isOpen={activePopover === 'autopilot'}
        onClose={() => setActivePopover(null)}
        onNavigate={(v) => {
          setActivePopover(null);
          onNavigate(v);
        }}
      />
      <ExplainableAIDrawer
        isOpen={activePopover === 'explain'}
        onClose={() => setActivePopover(null)}
      />

      {/* =====================================================================
          PREMIUM COMPACT TOP NAVIGATION BAR
      ===================================================================== */}
      <header className="h-14 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md relative z-layer-header flex items-center justify-between px-3 sm:px-5 shrink-0">
        {/* Left: Brand Lockup (Mobile Toggle) + Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl min-w-0">
          <button
            type="button"
            onClick={() => {
              setActivePopover(null);
              setMobileMenuOpen((prev) => !prev);
            }}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
            aria-label="Toggle Navigation"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>

          {/* Global Command Search */}
          <div className="relative flex-1 max-w-md min-w-0" ref={searchRef}>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearchQuery}
              onFocus={() => {
                setMobileMenuOpen(false);
                setActivePopover('search');
              }}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setMobileMenuOpen(false);
                setActivePopover('search');
              }}
              placeholder={t.common?.search || 'Search missions, tasks, agents, tools...'}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100/90 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] focus:bg-white dark:focus:bg-slate-950 transition-all"
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Live Search Results Popover */}
            {activePopover === 'search' && searchResults && (
              <div className="absolute left-0 top-10 w-full sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-layer-popover overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {searchResults.missions.length === 0 &&
                searchResults.tasks.length === 0 &&
                searchResults.tools.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 font-mono">
                    {tr('No matching missions, tasks, or tools found.', language)}
                  </div>
                ) : (
                  <>
                    {searchResults.missions.length > 0 && (
                      <div className="p-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 block font-semibold">
                          {t.nav?.missions || 'Missions'}
                        </span>
                        {searchResults.missions.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setActivePopover(null);
                              setGlobalSearchQuery('');
                              onNavigate('planner');
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {m.title}
                            </span>
                            <span className="text-[10px] font-mono text-[#2563EB] uppercase shrink-0">
                              {t.domains[m.category as keyof typeof t.domains] || m.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.tasks.length > 0 && (
                      <div className="p-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 block font-semibold">
                          {tr('Active Mission Tasks', language)}
                        </span>
                        {searchResults.tasks.map((tk) => (
                          <button
                            key={tk.id}
                            type="button"
                            onClick={() => {
                              setActivePopover(null);
                              setGlobalSearchQuery('');
                              onNavigate('execution');
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <div className="truncate">
                              <span className="font-mono font-bold text-[#2563EB] mr-1.5">{tk.id}</span>
                              <span className="text-slate-800 dark:text-slate-200">{tk.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {t.status[tk.status as keyof typeof t.status] || tk.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.tools.length > 0 && (
                      <div className="p-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 block font-semibold">
                          {tr('Orchestrated Tools', language)}
                        </span>
                        {searchResults.tools.map((tl) => (
                          <button
                            key={tl.id}
                            type="button"
                            onClick={() => {
                              setActivePopover(null);
                              setGlobalSearchQuery('');
                              onNavigate('tools');
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {tl.name}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 shrink-0">
                              {tl.latencyMs}ms
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Command Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mission Autopilot Control */}
          <button
            type="button"
            onClick={() =>
              setActivePopover((prev) => (prev === 'autopilot' ? null : 'autopilot'))
            }
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
              activePopover === 'autopilot'
                ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                : 'bg-slate-900 dark:bg-slate-800 text-white border-slate-800 dark:border-slate-700 hover:bg-[#2563EB] hover:border-[#2563EB]'
            }`}
          >
            <Play className="w-3 h-3 fill-current text-cyan-400" />
            <span className="hidden md:inline">{tr('Mission Autopilot', language)}</span>
          </button>

          {/* Why This Plan? AI Reasoning Button */}
          <button
            type="button"
            onClick={() =>
              setActivePopover((prev) => (prev === 'explain' ? null : 'explain'))
            }
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border ${
              activePopover === 'explain'
                ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
                : 'bg-purple-50/90 dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 border-purple-200/90 dark:border-purple-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
            <span className="hidden sm:inline">{t.common?.whyThisPlan || tr('Why this plan? AI', language)}</span>
          </button>

          {/* Pending Human Approval Gateway Pill (if active) */}
          {pendingApprovalsCount > 0 && (
            <button
              type="button"
              onClick={() => {
                const firstPending = safeApprovals.find((a) => a.status === 'pending');
                if (firstPending) openApprovalModal(firstPending);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping" />
              <span className="hidden xl:inline">
                {pendingApprovalsCount} {tr('Gate Pending', language)}
              </span>
              <span className="xl:hidden">{pendingApprovalsCount}</span>
            </button>
          )}

          {/* Operational Status Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-[11px] font-mono font-bold text-[#16A34A] dark:text-emerald-400 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] shadow-[0_0_8px_#16A34A]" />
            <span>{t.status?.operational?.toUpperCase() || tr('OPERATIONAL', language)}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setActivePopover((prev) =>
                  prev === 'notifications' ? null : 'notifications'
                );
              }}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
              title={t.common?.notifications || 'Notifications'}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {activePopover === 'notifications' && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-layer-popover overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.common?.notifications || 'Notifications'}
                    </span>
                  </div>
                  <button
                    onClick={markNotificationsRead}
                    className="text-[11px] font-mono text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>{tr('Mark all read', language)}</span>
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {safeNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      {tr('No operational alerts', language)}
                    </div>
                  ) : (
                    safeNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs space-y-1 transition-colors ${
                          !n.read
                            ? 'bg-blue-50/40 dark:bg-blue-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {n.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <LanguageSelector variant="dropdown" />
          <ThemeToggle showLabel={false} />

          {/* User Profile Control */}
          <div className="relative pl-1.5 border-l border-slate-200 dark:border-slate-800" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setActivePopover((prev) => (prev === 'user' ? null : 'user'));
              }}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {userInitials}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold leading-none text-slate-900 dark:text-white truncate max-w-[110px]">
                  {(currentUser?.name || 'Operator').split(' ')[0]}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[110px] mt-0.5">
                  {t.common?.[currentUser?.role as keyof typeof t.common] || currentUser?.role}
                </div>
              </div>
            </button>

            {activePopover === 'user' && (
              <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-layer-popover overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser?.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.email}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-[#16A34A] font-semibold">
                    <UserCheck className="w-3 h-3" />
                    <span>{t.common?.[currentUser?.role as keyof typeof t.common] || currentUser?.role}</span>
                  </div>
                </div>
                <div className="p-1.5 space-y-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePopover(null);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tr('Profile & Governance Settings', language)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePopover(null);
                      onNavigate('create-mission');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{t.dashboard?.launchNew || tr('Launch New Mission', language)}</span>
                  </button>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivePopover(null);
                        logout();
                        onNavigate('landing');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.common?.logout || tr('Sign Out Session', language)}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================================
          MAIN BODY: SLIM COMMAND SIDEBAR + VIEWPORT CANVAS
      ===================================================================== */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-layer-mobile-backdrop lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Left Command Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-layer-mobile-sidebar lg:relative lg:z-20 h-full min-h-0 ${
            sidebarCollapsed ? 'w-16' : 'w-60'
          } ${
            mobileMenuOpen
              ? 'translate-x-0 shadow-2xl'
              : '-translate-x-full lg:translate-x-0'
          } border-r border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0F172A] flex flex-col justify-between transition-all duration-200 shrink-0 select-none`}
        >
          {/* Top Brand Identity in Sidebar */}
          <div
            className={`px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center ${
              sidebarCollapsed ? 'justify-center' : 'justify-between'
            } shrink-0`}
          >
            <div
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-xs shrink-0 group-hover:bg-blue-700 transition-colors">
                P
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-sm font-black tracking-tight text-slate-950 dark:text-white leading-none">
                    {t.brandName || 'PLANOVA AI'}
                  </div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mt-1">
                    {tr('PLAN • EXECUTE • ADAPT', language)}
                  </div>
                </div>
              )}
            </div>
            {mobileMenuOpen && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Active Mission Quick Pill inside Sidebar */}
          {!sidebarCollapsed && activeMission && (
            <div className="px-3 pt-3 pb-1 shrink-0">
              <div
                onClick={() => onNavigate('planner')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-[#2563EB]/50 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-slate-400">
                  <span className="flex items-center gap-1 text-[#2563EB] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                    {tr('Active Mission', language)}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {activeMission.progress}%
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {activeMission.title}
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                    style={{ width: `${activeMission.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Logical Sectioned Navigation */}
          <nav
            aria-label="Primary Command Navigation"
            className="flex-1 min-h-0 px-2.5 py-2 space-y-4 overflow-y-auto overflow-x-hidden"
          >
            {navSections.map((group) => (
              <div key={group.sectionLabel} className="space-y-0.5">
                {!sidebarCollapsed && (
                  <div className="px-2.5 pb-1 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {group.sectionLabel}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${
                        sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-2.5'
                      } py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer relative group ${
                        isActive
                          ? 'bg-blue-50/90 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      {/* Active left accent bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#2563EB] shadow-[0_0_8px_#2563EB]" />
                      )}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-[#2563EB] dark:text-blue-400'
                              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          }`}
                        />
                        {!sidebarCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-md shrink-0 ${
                            (item as any).badgeAlert
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                              : isActive
                              ? 'bg-[#2563EB] text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Collapse Toggle Footer */}
          <div className="p-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => onNavigate('create-mission')}
                className="flex-1 mr-2 px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tr('New Mission', language)}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer mx-auto"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main
          ref={mainScrollRef}
          className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-7 relative"
        >
          {/* Guided Demo Banner when running */}
          {isDemoRunning && demoStep > 0 && (
            <div className="mb-6 p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-3 shadow-lg border border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 bg-[#7C3AED] text-white font-mono text-[10px] font-bold rounded uppercase shrink-0">
                  AUTONOMOUS DEMO STEP {demoStep}/5
                </span>
                <span className="text-xs font-medium text-slate-200 truncate">
                  {demoStep === 1 && 'Ingesting Goal & Decomposing 24-Task Mission Graph...'}
                  {demoStep === 2 && 'ALERT: Route R2 Bridge Submerged! Pausing T-09 & Synthesizing Bypass R4...'}
                  {demoStep === 3 && 'Human-in-the-Loop Gate Triggered: Reviewing Bypass R4 Authorization...'}
                  {demoStep === 4 && 'ALERT: Ambulance Fleet Reduced (8 -> 5)! Re-balancing Shelter Convoys...'}
                  {demoStep >= 5 && 'Plan v3 Verified & Executing. Zero Unassigned Casualties.'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                <button
                  type="button"
                  onClick={stopHackathonDemo}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Dismiss Demo Banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div key={currentView} className="max-w-[1440px] mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
