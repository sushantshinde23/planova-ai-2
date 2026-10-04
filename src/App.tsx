/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MissionProvider, useMission } from './store/missionContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { MissionsList } from './pages/MissionsList';
import { MissionCreator } from './pages/MissionCreator';
import { MissionPlannerGraph } from './pages/MissionPlannerGraph';
import { ExecutionCenter } from './pages/ExecutionCenter';
import { ResourceCenterView } from './pages/ResourceCenterView';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { ToolOrchestratorView } from './pages/ToolOrchestratorView';
import { TacticalMapView } from './pages/TacticalMapView';
import { DocumentCenterView } from './pages/DocumentCenterView';
import { AnalyticsView } from './pages/AnalyticsView';
import { AuditLogView } from './pages/AuditLogView';
import { AITacticalChatView } from './pages/AITacticalChatView';
import { AuthPages, AuthPortal } from './pages/AuthPages';
import { DigitalTwinView } from './pages/DigitalTwinView';
import { MultiAgentCollabView } from './pages/MultiAgentCollabView';
import { PredictiveFailureView } from './pages/PredictiveFailureView';
import { MissionMemoryView } from './pages/MissionMemoryView';
import { ErrorBoundary } from './components/ErrorBoundary';

const PROTECTED_VIEWS = new Set([
  'dashboard',
  'missions',
  'create-mission',
  'planner',
  'digital-twin',
  'agents',
  'predictive',
  'memory',
  'execution',
  'resources',
  'simulator',
  'tools',
  'tactical-map',
  'documents',
  'analytics',
  'audit',
  'ai-chat',
  'settings',
]);

function resolveInitialViewFromUrl(): {
  view: string;
  authMode: 'login' | 'signup' | 'forgot' | 'reset';
} {
  if (typeof window === 'undefined') {
    return { view: 'landing', authMode: 'login' };
  }
  const rawPath = (
    window.location.hash.replace(/^#\/?/, '') ||
    window.location.pathname.replace(/^\/+/, '')
  )
    .toLowerCase()
    .trim();

  if (rawPath === 'login' || rawPath === 'signin' || rawPath === 'auth') {
    return { view: 'auth', authMode: 'login' };
  }
  if (rawPath === 'signup' || rawPath === 'register') {
    return { view: 'auth', authMode: 'signup' };
  }
  if (rawPath === 'forgot-password' || rawPath === 'forgot') {
    return { view: 'auth', authMode: 'forgot' };
  }
  if (PROTECTED_VIEWS.has(rawPath)) {
    return { view: rawPath, authMode: 'login' };
  }
  return { view: 'landing', authMode: 'login' };
}

function AppContent() {
  const initialRoute = resolveInitialViewFromUrl();
  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [authPortalMode, setAuthPortalMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(
    initialRoute.authMode
  );
  const [postAuthTargetView, setPostAuthTargetView] = useState<string>(
    PROTECTED_VIEWS.has(initialRoute.view) ? initialRoute.view : 'dashboard'
  );
  const { startHackathonDemo, setActiveMissionId, isAuthenticated, authLoading } = useMission();

  // Route protection & redirect synchronization without redirect loops
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated && currentView === 'auth') {
      if (postAuthTargetView === 'demo') {
        startHackathonDemo();
        setCurrentView('planner');
      } else {
        const nextView = PROTECTED_VIEWS.has(postAuthTargetView)
          ? postAuthTargetView
          : 'dashboard';
        setCurrentView(nextView);
      }
    } else if (!isAuthenticated && PROTECTED_VIEWS.has(currentView)) {
      setPostAuthTargetView(currentView);
      setAuthPortalMode('login');
      setCurrentView('auth');
    }
  }, [isAuthenticated, authLoading, currentView, postAuthTargetView, startHackathonDemo]);

  const openProtectedView = (targetView: string, mode: 'login' | 'signup' = 'login') => {
    if (isAuthenticated) {
      setCurrentView(targetView);
    } else {
      setPostAuthTargetView(targetView);
      setAuthPortalMode(mode);
      setCurrentView('auth');
    }
  };

  const handleLaunchMissionFromLanding = () => {
    openProtectedView('create-mission', 'login');
  };

  const handleEnterDashboard = () => {
    openProtectedView('dashboard', 'login');
  };

  const handleSignInFromLanding = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
      return;
    }
    setPostAuthTargetView('dashboard');
    setAuthPortalMode('login');
    setCurrentView('auth');
  };

  const handleSignUpFromLanding = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
      return;
    }
    setPostAuthTargetView('dashboard');
    setAuthPortalMode('signup');
    setCurrentView('auth');
  };

  const handleRunDemoFromLanding = () => {
    if (isAuthenticated) {
      startHackathonDemo();
      setCurrentView('planner');
    } else {
      setPostAuthTargetView('demo');
      setAuthPortalMode('login');
      setCurrentView('auth');
    }
  };

  const handleAuthSuccess = () => {
    if (postAuthTargetView === 'demo') {
      startHackathonDemo();
      setCurrentView('planner');
    } else {
      setCurrentView(
        PROTECTED_VIEWS.has(postAuthTargetView) ? postAuthTargetView : 'dashboard'
      );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F4F6FB] dark:bg-[#090D16] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-11 h-11 rounded-2xl bg-[#172554] dark:bg-[#2563EB] text-white flex items-center justify-center font-black text-lg shadow-md animate-pulse mb-4">
          P
        </div>
        <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping" />
          <span>Verifying Firebase Authentication Session...</span>
        </div>
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <LandingPage
        onLaunchMission={handleLaunchMissionFromLanding}
        onEnterDashboard={handleEnterDashboard}
        onRunDemo={handleRunDemoFromLanding}
        onSignIn={handleSignInFromLanding}
        onSignUp={handleSignUpFromLanding}
      />
    );
  }

  if (currentView === 'auth' || !isAuthenticated) {
    return (
      <AuthPortal
        initialMode={authPortalMode}
        onAuthSuccess={handleAuthSuccess}
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <DashboardLayout currentView={currentView} onNavigate={setCurrentView}>
      <ErrorBoundary key={currentView} onReturnToDashboard={() => setCurrentView('dashboard')}>
        {currentView === 'dashboard' && (
          <DashboardOverview
            onLaunchNewMission={() => setCurrentView('create-mission')}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'missions' && (
          <MissionsList
            onSelectMission={(id) => {
              setActiveMissionId(id);
              setCurrentView('planner');
            }}
            onLaunchNew={() => setCurrentView('create-mission')}
          />
        )}

        {currentView === 'create-mission' && (
          <MissionCreator
            onMissionCreated={(id) => {
              setActiveMissionId(id);
              setCurrentView('planner');
            }}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'planner' && <MissionPlannerGraph />}

        {currentView === 'digital-twin' && <DigitalTwinView />}

        {currentView === 'agents' && <MultiAgentCollabView />}

        {currentView === 'predictive' && <PredictiveFailureView />}

        {currentView === 'memory' && <MissionMemoryView />}

        {currentView === 'execution' && <ExecutionCenter />}

        {currentView === 'resources' && <ResourceCenterView />}

        {currentView === 'simulator' && <WhatIfSimulator />}

        {currentView === 'tools' && <ToolOrchestratorView />}

        {currentView === 'tactical-map' && <TacticalMapView />}

        {currentView === 'documents' && <DocumentCenterView />}

        {currentView === 'analytics' && <AnalyticsView />}

        {currentView === 'audit' && <AuditLogView />}

        {currentView === 'ai-chat' && <AITacticalChatView />}

        {currentView === 'settings' && (
          <AuthPages
            onAuthSuccess={() => setCurrentView('dashboard')}
            onLogoutRedirect={() => {
              setAuthPortalMode('login');
              setCurrentView('auth');
            }}
          />
        )}
      </ErrorBoundary>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MissionProvider>
        <AppContent />
      </MissionProvider>
    </ErrorBoundary>
  );
}
