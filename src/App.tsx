import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileDrawer } from './components/MobileDrawer';
import { BottomNav } from './components/BottomNav';
import { AiCommandPalette } from './components/AiCommandPalette';
import { UpgradeModal } from './components/UpgradeModal';
import { AuthViews } from './components/auth/AuthViews';

import { DashboardModule } from './components/modules/DashboardModule';
import { CaModule } from './components/modules/CaModule';
import { PosModule } from './components/modules/PosModule';
import { DocumentsModule } from './components/modules/DocumentsModule';
import { WhatsAppModule } from './components/modules/WhatsAppModule';
import { GmailModule } from './components/modules/GmailModule';
import { CrmModule } from './components/modules/CrmModule';
import { HrModule } from './components/modules/HrModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { FinanceModule } from './components/modules/FinanceModule';
import { ProjectsModule } from './components/modules/ProjectsModule';
import { SupportModule } from './components/modules/SupportModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { SuperAdminModule } from './components/modules/SuperAdminModule';

import { ModuleType, Organization, Branch, UserRole, BusinessType, PlanType, AuthState } from './types';
import { mockOrganizations, mockBranches } from './data/mockData';
import { checkModulePermission } from './utils/permissions';
import { Lock, Zap } from 'lucide-react';

export const SUPER_ADMIN_ORG: Organization = {
  id: 'ORG-SUPER',
  name: 'BusinessOS AI',
  ownerName: 'Platform Super Admin',
  email: 'admin@businessos.ai',
  phone: '+91 9028310199',
  whatsappNumber: '+91 9028310199',
  address: 'BusinessOS AI Platform Owner HQ',
  plan: 'Enterprise',
  businessType: 'SaaS Platform',
  companySize: 'Enterprise',
  status: 'Active',
  primaryColor: '#2563eb',
  secondaryColor: '#1d4ed8',
};

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('businessos_token');
    return token ? 'app' : 'landing';
  });
  
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [currentOrg, setCurrentOrg] = useState<Organization>(mockOrganizations[0]);
  
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [currentBranch, setCurrentBranch] = useState<Branch>(mockBranches[0]);

  const [activeRole, setActiveRole] = useState<UserRole>('Business Owner');
  const [businessType, setBusinessType] = useState<BusinessType>('IT Company / CA Firm');

  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Modals & Mobile Drawer State
  const [showAiCommand, setShowAiCommand] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('businessos_token');
    localStorage.removeItem('businessos_user');
    setAuthState('landing');
  };

  // Fetch organizations from PostgreSQL on load (filtered for customers, SuperAdmin locked to BusinessOS AI)
  useEffect(() => {
    if (authState !== 'app') return;
    const token = localStorage.getItem('businessos_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/tenant/organizations', { headers })
      .then(async res => {
        if (!res.ok) return null;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return res.json();
        }
        return null;
      })
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          // Filter out platform admin org from customer org list
          const customerOnlyOrgs = data.filter((o: Organization) => o.id !== 'ORG-SUPER' && o.id !== 'ORG-SYSTEM' && o.name !== 'BusinessOS AI');
          setOrganizations(customerOnlyOrgs);

          if (activeRole === 'Super Admin') {
            setCurrentOrg(SUPER_ADMIN_ORG);
          } else if (!currentOrg || currentOrg.id === 'ORG-SUPER' || currentOrg.id === 'ORG-SYSTEM') {
            if (customerOnlyOrgs.length > 0) setCurrentOrg(customerOnlyOrgs[0]);
          }
        }
      })
      .catch(err => console.error('Error fetching tenant orgs:', err));
  }, [authState]);

  // Keep Super Admin locked to BusinessOS AI Platform Org
  useEffect(() => {
    if (activeRole === 'Super Admin') {
      setCurrentOrg(SUPER_ADMIN_ORG);
      setBusinessType('SaaS Platform');
      setActiveModule('superadmin');
    } else if (currentOrg?.id === 'ORG-SUPER' || currentOrg?.id === 'ORG-SYSTEM') {
      const firstCustomerOrg = organizations.find(o => o.id !== 'ORG-SUPER' && o.id !== 'ORG-SYSTEM') || mockOrganizations[0];
      setCurrentOrg(firstCustomerOrg);
      setBusinessType(firstCustomerOrg.businessType);
      if (activeModule === 'superadmin') setActiveModule('dashboard');
    }
  }, [activeRole]);

  // Keyboard shortcut Cmd+K for AI Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowAiCommand(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateOrgName = (newName: string) => {
    if (!currentOrg) return;
    const updated = { ...currentOrg, name: newName };
    setCurrentOrg(updated);
    setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const handleUpgradePlan = (newPlan: PlanType) => {
    if (!currentOrg) return;
    const updated = { ...currentOrg, plan: newPlan };
    setCurrentOrg(updated);
    setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const handleAddOrganization = (newOrg: Organization, newBranch: Branch) => {
    setOrganizations(prev => [newOrg, ...prev]);
    setBranches(prev => [newBranch, ...prev]);
    setCurrentOrg(newOrg);
    setCurrentBranch(newBranch);
    setBusinessType(newOrg.businessType);
  };

  const handleUpdateOrgStatus = (orgId: string, newPlan: PlanType) => {
    setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, plan: newPlan } : o));
    if (currentOrg?.id === orgId) {
      setCurrentOrg(prev => ({ ...prev, plan: newPlan }));
    }
  };

  const handleLoginSuccess = (org: Organization, role: UserRole, bt: BusinessType) => {
    setActiveRole(role);
    if (role === 'Super Admin') {
      setCurrentOrg(SUPER_ADMIN_ORG);
      setBusinessType('SaaS Platform');
      setActiveModule('superadmin');
    } else {
      setCurrentOrg(org);
      setBusinessType(bt);
      setActiveModule('dashboard');
    }
    setAuthState('app');
  };

  const handleRegisterSuccess = (org: Organization, branch: Branch, plan: PlanType) => {
    handleAddOrganization(org, branch);
    setActiveRole('Business Owner');
    setBusinessType(org.businessType);
    setActiveModule('dashboard');
    setAuthState('app');
  };

  // Switch Role helper - if switching to Super Admin, auto navigate to superadmin module
  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'Super Admin') {
      setActiveModule('superadmin');
    } else if (activeModule === 'superadmin') {
      setActiveModule('dashboard');
    }
  };

  // Render Auth Pages if not in 'app' view
  if (authState !== 'app') {
    return (
      <AuthViews
        authState={authState}
        onNavigateAuth={(st) => setAuthState(st)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div id="app-root" className={`min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors ${
      isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'
    }`}>
      
      {/* Top Header Bar */}
      <Header
        currentOrg={currentOrg}
        organizations={organizations}
        onSelectOrg={(org) => {
          setCurrentOrg(org);
          setBusinessType(org.businessType);
        }}
        currentBranch={currentBranch}
        branches={branches}
        onSelectBranch={(branch) => setCurrentBranch(branch)}
        activeRole={activeRole}
        onSelectRole={handleRoleChange}
        businessType={businessType}
        onChangeBusinessType={(bt) => setBusinessType(bt)}
        companySize={currentOrg?.companySize || 'Medium'}
        onChangeCompanySize={(size) => currentOrg && setCurrentOrg({ ...currentOrg, companySize: size })}
        onOpenAiCommand={() => setShowAiCommand(true)}
        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        onNavigateAuth={(st) => setAuthState(st)}
        onLogout={handleLogout}
      />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex items-stretch">
        
        {/* Desktop Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          businessType={businessType}
          activeRole={activeRole}
          plan={currentOrg?.plan || 'Free'}
          isDarkMode={isDarkMode}
          onOpenAiCommand={() => setShowAiCommand(true)}
        />

        {/* Right Active Module Viewport */}
        <main className="flex-1 p-3 sm:p-6 pb-20 md:pb-6 overflow-y-auto min-w-0">
          
          {(() => {
            const perm = checkModulePermission(currentOrg, activeRole, activeModule);

            if (!perm.allowed) {
              return (
                <div className={`p-8 rounded-2xl border text-center max-w-xl mx-auto my-12 space-y-5 shadow-2xl ${
                  isDarkMode ? 'bg-neutral-900/90 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
                }`}>
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold">Paid Subscription Required</h2>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                      {perm.message}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono">
                    Current Organization Plan: <span className="font-bold uppercase tracking-wider">{currentOrg?.plan || 'Free'}</span>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Upgrade to Paid Subscription</span>
                    </button>
                    <button
                      onClick={() => setActiveModule('dashboard')}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <>
                {activeModule === 'superadmin' && (
                  <SuperAdminModule
                    organizations={organizations}
                    onAddOrganization={handleAddOrganization}
                    onUpdateOrgStatus={handleUpdateOrgStatus}
                    isDarkMode={isDarkMode}
                  />
                )}

                {activeModule === 'dashboard' && (
                  <DashboardModule
                    currentOrg={currentOrg}
                    currentBranch={currentBranch}
                    businessType={businessType}
                    activeRole={activeRole}
                    companySize={currentOrg?.companySize || 'Medium'}
                    onNavigateModule={(mod) => setActiveModule(mod)}
                    isDarkMode={isDarkMode}
                  />
                )}

                {activeModule === 'ca' && (
                  <CaModule currentOrg={currentOrg} isDarkMode={isDarkMode} />
                )}

                {activeModule === 'pos' && (
                  <PosModule isDarkMode={isDarkMode} />
                )}

                {activeModule === 'documents' && (
                  <DocumentsModule currentOrg={currentOrg} isDarkMode={isDarkMode} />
                )}

                {activeModule === 'whatsapp' && (
                  <WhatsAppModule isDarkMode={isDarkMode} />
                )}

                {activeModule === 'gmail' && (
                  <GmailModule currentOrg={currentOrg} isDarkMode={isDarkMode} />
                )}

                {activeModule === 'crm' && (
                  <CrmModule currentOrg={currentOrg} isDarkMode={isDarkMode} />
                )}

                {activeModule === 'hr' && (
                  <HrModule currentOrg={currentOrg} isDarkMode={isDarkMode} />
                )}

                {activeModule === 'inventory' && (
                  <InventoryModule currentOrg={currentOrg} isDarkMode={isDarkMode} />
                )}

                {activeModule === 'finance' && (
                  <FinanceModule isDarkMode={isDarkMode} />
                )}

                {activeModule === 'projects' && (
                  <ProjectsModule isDarkMode={isDarkMode} />
                )}

                {activeModule === 'support' && (
                  <SupportModule isDarkMode={isDarkMode} />
                )}

                {activeModule === 'reports' && (
                  <ReportsModule isDarkMode={isDarkMode} />
                )}

                {activeModule === 'settings' && (
                  <SettingsModule
                    currentOrg={currentOrg}
                    activeRole={activeRole}
                    onUpdateOrgName={handleUpdateOrgName}
                    onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                    isDarkMode={isDarkMode}
                  />
                )}
              </>
            );
          })()}
        </main>

      </div>

      {/* Mobile Slide-over Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        currentOrg={currentOrg}
        organizations={organizations}
        onSelectOrg={(org) => setCurrentOrg(org)}
        currentBranch={currentBranch}
        branches={branches}
        onSelectBranch={(branch) => setCurrentBranch(branch)}
        activeRole={activeRole}
        onSelectRole={handleRoleChange}
        businessType={businessType}
        onChangeBusinessType={(bt) => setBusinessType(bt)}
        onOpenAiCommand={() => setShowAiCommand(true)}
        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
        isDarkMode={isDarkMode}
        activeRole={activeRole}
      />

      {/* AI OS Command Palette Overlay */}
      <AiCommandPalette
        isOpen={showAiCommand}
        onClose={() => setShowAiCommand(false)}
        businessType={businessType}
        activeRole={activeRole}
        onNavigateModule={(mod) => setActiveModule(mod)}
        isDarkMode={isDarkMode}
      />

      {/* Membership Plan Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentOrg={currentOrg}
        onUpgradePlan={handleUpgradePlan}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
