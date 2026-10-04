/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [authPortalMode, setAuthPortalMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [postAuthTargetView, setPostAuthTargetView] = useState<string>('dashboard');
  const { startHackathonDemo, setActiveMissionId, isAuthenticated, authLoading } = useMission();

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
    setPostAuthTargetView('dashboard');
    setAuthPortalMode('login');
    setCurrentView('auth');
  };

  const handleSignUpFromLanding = () => {
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
      setCurrentView(postAuthTargetView || 'dashboard');
    }
  };

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

  if (currentView === 'auth' || (!isAuthenticated && !authLoading)) {
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
            onLogoutRedirect={() => setCurrentView('landing')}
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
