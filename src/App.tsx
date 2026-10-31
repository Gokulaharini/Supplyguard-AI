/**
 * SupplyGuard AI - Main Application Root
 * Autonomous Supply Chain Digital Twin & Recovery Agent
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { DigitalTwinPage } from './pages/DigitalTwinPage.tsx';
import { DisruptionPage } from './pages/DisruptionPage.tsx';
import { ImpactAnalysisPage } from './pages/ImpactAnalysisPage.tsx';
import { RecoveryPlanningPage } from './pages/RecoveryPlanningPage.tsx';
import { ScenarioComparisonPage } from './pages/ScenarioComparisonPage.tsx';
import { AIAssistantPage } from './pages/AIAssistantPage.tsx';
import { EvidencePage } from './pages/EvidencePage.tsx';
import { EvaluationPage } from './pages/EvaluationPage.tsx';
import { ApprovalsPage } from './pages/ApprovalsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { api } from './services/api.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeDisruptionsCount, setActiveDisruptionsCount] = useState<number>(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [geminiConnected, setGeminiConnected] = useState<boolean>(false);

  const refreshGlobalState = useCallback(async () => {
    try {
      const dash = await api.getDashboard();
      setActiveDisruptionsCount(dash.activeDisruptionsCount || 0);
      setPendingApprovalsCount(dash.pendingApprovalsCount || 0);
      setGeminiConnected(dash.geminiConnected || false);
    } catch (err) {
      console.warn('Dashboard sync:', err);
    }
  }, []);

  useEffect(() => {
    refreshGlobalState();
  }, [refreshGlobalState]);

  const handleResetSimulation = async () => {
    try {
      await api.resetSimulation();
      await refreshGlobalState();
    } catch (err) {
      console.error(err);
    }
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} onRefresh={refreshGlobalState} />;
      case 'digital-twin':
        return <DigitalTwinPage />;
      case 'disruptions':
        return <DisruptionPage onNavigate={setCurrentTab} onRefresh={refreshGlobalState} />;
      case 'impact':
        return <ImpactAnalysisPage onNavigate={setCurrentTab} />;
      case 'recovery':
        return <RecoveryPlanningPage onNavigate={setCurrentTab} onRefresh={refreshGlobalState} />;
      case 'scenarios':
        return <ScenarioComparisonPage />;
      case 'ai-assistant':
        return <AIAssistantPage />;
      case 'evidence':
        return <EvidencePage />;
      case 'evaluation':
        return <EvaluationPage />;
      case 'approvals':
        return <ApprovalsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={setCurrentTab} onRefresh={refreshGlobalState} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onResetSimulation={handleResetSimulation}
        activeDisruptionsCount={activeDisruptionsCount}
      />

      {/* Main Body: Sidebar + Dynamic Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeDisruptionsCount={activeDisruptionsCount}
          pendingApprovalsCount={pendingApprovalsCount}
          geminiConnected={geminiConnected}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950/90">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
