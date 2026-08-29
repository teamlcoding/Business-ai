import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  GitBranch, 
  Briefcase, 
  UserCheck, 
  Zap, 
  Sparkles, 
  Check, 
  ChevronDown,
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  MessageSquare, 
  Mail,
  Users, 
  Package, 
  DollarSign, 
  FolderKanban, 
  Headphones, 
  BarChart3, 
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  Lock,
  Calculator
} from 'lucide-react';
import { ModuleType, Organization, Branch, UserRole, BusinessType } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
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
  onOpenAiCommand: () => void;
  onOpenUpgradeModal: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

interface NavItem {
  id: ModuleType;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  allowedRoles?: UserRole[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'superadmin', label: 'Super Admin HQ', icon: ShieldCheck, badge: 'Master', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20', allowedRoles: ['Super Admin'] },
  { id: 'dashboard', label: 'Executive AI', icon: LayoutDashboard },
  { id: 'ca', label: 'CA Practice Hub', icon: Calculator, badge: 'Tax', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', allowedRoles: ['Super Admin', 'Business Owner', 'Accountant', 'CA'] },
  { id: 'pos', label: 'Billing & POS', icon: ShoppingCart, badge: 'Fast', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'Sales', 'Inventory Manager'] },
  { id: 'documents', label: 'Documents & GST', icon: FileText, allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'Accountant', 'Sales', 'CA', 'Customer Portal', 'Vendor Portal'] },
  { id: 'whatsapp', label: 'WhatsApp Hub', icon: MessageSquare, badge: 'API', badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'gmail', label: 'Gmail Workspace', icon: Mail, badge: 'OAuth', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { id: 'crm', label: 'CRM & Leads', icon: Users },
  { id: 'hr', label: 'HR & Payroll', icon: UserCheck, badge: 'AI Resume', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'inventory', label: 'Inventory & Stock', icon: Package },
  { id: 'finance', label: 'Finance & P&L', icon: DollarSign },
  { id: 'projects', label: 'Projects & Tasks', icon: FolderKanban },
  { id: 'support', label: 'Customer Support', icon: Headphones },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

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

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeModule,
  onSelectModule,
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
  onOpenAiCommand,
  onOpenUpgradeModal,
  isDarkMode,
  onToggleTheme
}) => {
  const [showOrgSelect, setShowOrgSelect] = useState(false);
  const [showBranchSelect, setShowBranchSelect] = useState(false);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className={`relative w-4/5 max-w-xs h-full flex flex-col justify-between p-5 overflow-y-auto shadow-2xl z-10 transition-transform ${
        isDarkMode ? 'bg-neutral-950 text-neutral-100 border-r border-neutral-800' : 'bg-white text-neutral-900 border-r border-neutral-200'
      }`}>
        
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                B
              </div>
              <div>
                <div className="font-bold text-sm leading-none">BusinessOS</div>
                <div className="text-[10px] text-neutral-400">Mobile Enterprise OS</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border ${
                isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick AI Trigger */}
          <button
            onClick={() => {
              onClose();
              onOpenAiCommand();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-md shadow-blue-600/20"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch AI Command OS</span>
          </button>

          {/* Context Switchers Section */}
          <div className="space-y-2 text-xs">
            
            {/* Organization Display / Switcher */}
            <div className="relative">
              {activeRole === 'Super Admin' ? (
                <div className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left ${
                  isDarkMode ? 'bg-blue-950/30 border-blue-800/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}>
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate font-bold">BusinessOS AI Platform</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-semibold">
                    HQ
                  </span>
                </div>
              ) : (
                <div className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left ${
                  isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-100/80 border-neutral-200'
                }`}>
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate font-semibold">{currentOrg?.name || 'Organization'}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    AES-256
                  </span>
                </div>
              )}
            </div>

            {/* Branch Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBranchSelect(!showBranchSelect)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <GitBranch className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate font-medium">{currentBranch?.name || 'Main Branch'}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </button>

              {showBranchSelect && (
                <div className={`mt-1 p-1 rounded-xl border space-y-1 ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
                }`}>
                  {branches.map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBranch(b);
                        setShowBranchSelect(false);
                      }}
                      className="w-full text-left p-2 rounded-lg text-[11px] flex items-center justify-between hover:bg-emerald-500/10"
                    >
                      <span>{b.name} ({b.city})</span>
                      {b.id === currentBranch?.id && <Check className="w-3 h-3 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Business Vertical Display */}
            <div className="relative">
              {activeRole === 'Super Admin' ? (
                <>
                  <button
                    onClick={() => setShowTypeSelect(!showTypeSelect)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate font-medium">{businessType}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  </button>

                  {showTypeSelect && (
                    <div className={`mt-1 p-1 max-h-40 overflow-y-auto rounded-xl border space-y-1 ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
                    }`}>
                      {BUSINESS_TYPES.map(bt => (
                        <button
                          key={bt}
                          onClick={() => {
                            onChangeBusinessType(bt);
                            setShowTypeSelect(false);
                          }}
                          className="w-full text-left p-2 rounded-lg text-[11px] flex items-center justify-between hover:bg-purple-500/10"
                        >
                          <span>{bt}</span>
                          {bt === businessType && <Check className="w-3 h-3 text-purple-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-100/80 border-neutral-200'
                  }`}
                  title="Business Vertical is locked to your organization profile"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate font-semibold text-xs">{businessType}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400 shrink-0" /> Locked
                  </span>
                </div>
              )}
            </div>

            {/* User Role Badge */}
            <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <UserCheck className="w-3.5 h-3.5 shrink-0 text-blue-400" />
              <span className="truncate font-semibold text-xs">Role: {activeRole}</span>
            </div>

          </div>

          {/* Module Navigation Links */}
          <div className="space-y-1 pt-2 border-t border-neutral-800">
            <div className="px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Core Modules
            </div>

            {ALL_NAV_ITEMS.filter(item => {
              if (activeRole === 'Super Admin') {
                return item.id === 'superadmin';
              }
              if (item.id === 'superadmin') return false;
              if (!item.allowedRoles) return true;
              return item.allowedRoles.includes(activeRole);
            }).map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectModule(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? isDarkMode 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                      : isDarkMode 
                        ? 'hover:bg-neutral-900 text-neutral-300' 
                        : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Footer System Controls */}
        <div className="pt-4 border-t border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onOpenUpgradeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentOrg?.plan || 'Free'}</span>
            </button>

            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border ${
                isDarkMode ? 'bg-neutral-900 border-neutral-800 text-amber-400' : 'bg-neutral-100 border-neutral-200 text-neutral-700'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
