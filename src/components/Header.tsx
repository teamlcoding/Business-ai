import React, { useState } from 'react';
import { 
  Building2, 
  GitBranch, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  Bell, 
  Search, 
  ChevronDown, 
  Sun, 
  Moon, 
  Check, 
  Zap,
  UserCheck,
  Menu,
  Home,
  LogOut,
  ExternalLink,
  Copy,
  Lock,
  X
} from 'lucide-react';
import { Organization, Branch, UserRole, BusinessType, CompanySize, AuthState } from '../types';

interface HeaderProps {
  currentOrg: Organization;
  organizations: Organization[];
  onSelectOrg: (org: Organization) => void;
  currentBranch: Branch;
  branches: Branch[];
  onSelectBranch: (branch: Branch) => void;
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  businessType: BusinessType;
  onChangeBusinessType: (bt: BusinessType) => void;
  companySize?: CompanySize;
  onChangeCompanySize?: (size: CompanySize) => void;
  onOpenAiCommand: () => void;
  onOpenUpgradeModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenMobileDrawer?: () => void;
  onNavigateAuth?: (state: AuthState) => void;
  onLogout?: () => void;
}

const ROLES: UserRole[] = [
  'Super Admin',
  'Business Owner',
  'Branch Manager',
  'HR',
  'Accountant',
  'Sales',
  'Inventory Manager',
  'Employee',
  'Customer Portal',
  'Vendor Portal'
];

const BUSINESS_TYPES: BusinessType[] = [
  'IT Company / CA Firm',
  'Retail',
  'Grocery',
  'Pharmacy',
  'Restaurant',
  'Hotel',
  'Hospital / Clinic',
  'Manufacturing',
  'Construction',
  'Logistics',
  'School / Institute',
  'Real Estate',
  'Salon / Gym',
  'Service Business'
];

export const Header: React.FC<HeaderProps> = ({
  currentOrg,
  organizations,
  onSelectOrg,
  currentBranch,
  branches,
  onSelectBranch,
  activeRole,
  onSelectRole,
  businessType,
  onChangeBusinessType,
  companySize,
  onChangeCompanySize,
  onOpenAiCommand,
  onOpenUpgradeModal,
  isDarkMode,
  onToggleTheme,
  onOpenMobileDrawer,
  onNavigateAuth,
  onLogout
}) => {
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  return (
    <header className={`sticky top-0 z-40 h-16 border-b transition-colors ${
      isDarkMode 
        ? 'bg-neutral-950/90 border-neutral-800 text-neutral-100 backdrop-blur-md' 
        : 'bg-white/90 border-neutral-200 text-neutral-900 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Left: Mobile Menu Toggle & Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className={`p-2 rounded-xl border md:hidden ${
                isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-neutral-100' : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-neutral-900'
              }`}
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-amber-400" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md shadow-blue-500/20 shrink-0">
              B
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight leading-none">BusinessOS</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  AI
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 leading-none">Enterprise Platform</span>
            </div>
          </div>

          <div className="h-5 w-px bg-neutral-700/30 hidden md:block"></div>

          {/* Organization Indicator */}
          <div className="relative hidden md:block">
            {activeRole === 'Super Admin' ? (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                isDarkMode 
                  ? 'bg-blue-600/15 border-blue-500/30 text-blue-300' 
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold">BusinessOS AI Platform</span>
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">
                  Platform Owner
                </span>
              </div>
            ) : (
              <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                isDarkMode ? 'bg-neutral-900/60 border-neutral-800 text-neutral-200' : 'bg-neutral-100/60 border-neutral-200 text-neutral-800'
              }`}>
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span className="max-w-[150px] truncate font-bold">{currentOrg?.name || 'Organization'}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  AES-256 Encrypted
                </span>
              </div>
            )}
          </div>

          {/* Branch Switcher Dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => {
                setShowBranchDropdown(!showBranchDropdown);
                setShowOrgDropdown(false);
                setShowRoleDropdown(false);
                setShowTypeDropdown(false);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-200' 
                  : 'bg-neutral-100 border-neutral-200 hover:border-neutral-300 text-neutral-800'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-500" />
              <span className="max-w-[110px] truncate">{currentBranch?.name || 'Main Branch'}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {showBranchDropdown && (
              <div className={`absolute left-0 mt-2 w-56 rounded-xl border shadow-xl py-2 z-50 ${
                isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
              }`}>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Select Branch</div>
                {branches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      onSelectBranch(b);
                      setShowBranchDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-emerald-500/10 transition-colors ${
                      b.id === currentBranch?.id ? 'font-semibold text-emerald-500' : ''
                    }`}
                  >
                    <span>{b.name} ({b.city})</span>
                    {b.id === currentBranch?.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Center: Global AI Command Bar Launcher */}
        <div className="flex-1 max-w-md mx-2">
          <button
            onClick={onOpenAiCommand}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs transition-all ${
              isDarkMode 
                ? 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200' 
                : 'bg-neutral-100/80 border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="truncate">Ask BusinessOS AI or type command...</span>
            </div>
            <kbd className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
              isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-400' : 'bg-neutral-200 border-neutral-300 text-neutral-600'
            }`}>
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Role, Business Type, Plan & Utilities */}
        <div className="flex items-center gap-2">
          
          {/* Business Type Indicator (Locked for Tenants / Customers) */}
          <div className="relative hidden xl:block">
            {activeRole === 'Super Admin' ? (
              <>
                <button
                  onClick={() => {
                    setShowTypeDropdown(!showTypeDropdown);
                    setShowRoleDropdown(false);
                    setShowOrgDropdown(false);
                    setShowBranchDropdown(false);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700' 
                      : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                  title="Super Admin: Override Business Vertical"
                >
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>{businessType}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {showTypeDropdown && (
                  <div className={`absolute right-0 mt-2 w-52 rounded-xl border shadow-xl py-2 z-50 ${
                    isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
                  }`}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Business Vertical</div>
                    {BUSINESS_TYPES.map(bt => (
                      <button
                        key={bt}
                        onClick={() => {
                          onChangeBusinessType(bt);
                          setShowTypeDropdown(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-purple-500/10 transition-colors ${
                          bt === businessType ? 'font-semibold text-purple-400' : ''
                        }`}
                      >
                        <span>{bt}</span>
                        {bt === businessType && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                  isDarkMode 
                    ? 'bg-neutral-900/90 border-neutral-800 text-neutral-300' 
                    : 'bg-neutral-100/90 border-neutral-200 text-neutral-700'
                }`}
                title="Business Vertical is locked to your organization profile"
              >
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>{businessType}</span>
                <Lock className="w-3 h-3 text-amber-400 shrink-0" />
              </div>
            )}
          </div>

          {/* Company Size Selector */}
          {onChangeCompanySize && (
            <div className="relative hidden xl:block">
              <button
                onClick={() => {
                  setShowSizeDropdown(!showSizeDropdown);
                  setShowTypeDropdown(false);
                  setShowRoleDropdown(false);
                  setShowOrgDropdown(false);
                  setShowBranchDropdown(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-neutral-900 border-neutral-800 text-amber-400' 
                    : 'bg-neutral-100 border-neutral-200 text-amber-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Scale: {companySize || 'Medium'}</span>
                <ChevronDown className="w-3 h-3 text-amber-400" />
              </button>

              {showSizeDropdown && (
                <div className={`absolute right-0 mt-2 w-40 rounded-xl border shadow-xl py-2 z-50 ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
                }`}>
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Business Scale</div>
                  {(['Small', 'Medium', 'Enterprise'] as CompanySize[]).map(sz => (
                    <button
                      key={sz}
                      onClick={() => {
                        onChangeCompanySize(sz);
                        setShowSizeDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-amber-500/10 transition-colors ${
                        sz === companySize ? 'font-semibold text-amber-400' : ''
                      }`}
                    >
                      <span>{sz}</span>
                      {sz === companySize && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Role Badge */}
          <div className="relative">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
              isDarkMode 
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{activeRole}</span>
            </div>
          </div>

          {/* Plan Badge Upgrade Trigger */}
          <button
            onClick={onOpenUpgradeModal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium hover:brightness-110 transition-all"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{currentOrg?.plan || 'Free'}</span>
          </button>

          {/* Home / Landing Page Nav Button */}
          {onNavigateAuth && (
            <button
              onClick={() => onNavigateAuth('landing')}
              className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium ${
                isDarkMode 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white' 
                  : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-neutral-900'
              }`}
              title="Go to Home / Landing Page"
            >
              <Home className="w-4 h-4 text-blue-400" />
              <span className="hidden md:inline">Home</span>
            </button>
          )}

          {/* Testing Link Modal Trigger */}
          <button
            onClick={() => setShowTestModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Get Live Testing Links"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Testing Link</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border transition-colors ${
              isDarkMode 
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200' 
                : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
            }`}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Log Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Sign Out / Change Account"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          )}

        </div>

      </div>

      {/* Testing Links & Credentials Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className={`w-full max-w-lg p-6 rounded-2xl border space-y-5 shadow-2xl ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Live Application Testing Links</h3>
              </div>
              <button onClick={() => setShowTestModal(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Shared Testing Link */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-neutral-400 font-semibold">
                  <span>Shared App URL (Preview / Production)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">Active</span>
                </div>
                <div className="flex items-center justify-between bg-neutral-900 p-2 rounded-lg font-mono text-emerald-400 break-all text-[11px]">
                  <span>https://ais-pre-qiulobj3duzr4xqpkesrjg-306236073531.asia-southeast1.run.app</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('https://ais-pre-qiulobj3duzr4xqpkesrjg-306236073531.asia-southeast1.run.app');
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1 text-neutral-400 hover:text-white shrink-0 ml-2"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Dev Link */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-neutral-400 font-semibold">
                  <span>Development App URL (Dev Environment)</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">Live</span>
                </div>
                <div className="flex items-center justify-between bg-neutral-900 p-2 rounded-lg font-mono text-blue-400 break-all text-[11px]">
                  <span>https://ais-dev-qiulobj3duzr4xqpkesrjg-306236073531.asia-southeast1.run.app</span>
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="font-semibold text-neutral-300">Quick Test Credentials:</div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 bg-neutral-900 rounded-lg">
                    <span className="text-neutral-500 block">Super Admin:</span>
                    <span className="text-purple-400">superadmin</span> / <span className="text-neutral-300">admin123</span>
                  </div>
                  <div className="p-2 bg-neutral-900 rounded-lg">
                    <span className="text-neutral-500 block">Business Owner:</span>
                    <span className="text-blue-400">owner</span> / <span className="text-neutral-300">password123</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg border relative transition-colors ${
                isDarkMode 
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200' 
                  : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500"></span>
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-xl border shadow-xl p-4 z-50 ${
                isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-white border-neutral-200 text-neutral-800'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
                  <span className="text-xs font-semibold">Notifications</span>
                  <span className="text-[10px] text-blue-400 font-medium">Mark all read</span>
                </div>
                <div className="space-y-3 pt-3">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                    <div>
                      <p className="font-medium">GST Invoice #892 Paid</p>
                      <p className="text-[11px] text-neutral-400">Nexus Digital paid ₹106,082 via UPI</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 shrink-0"></span>
                    <div>
                      <p className="font-medium">Low Stock Alert</p>
                      <p className="text-[11px] text-neutral-400">Dell UltraSharp Monitor stock is at 2 units</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

    </header>
  );
};
