import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  MessageSquare, 
  Users, 
  UserCheck, 
  Package, 
  DollarSign, 
  FolderKanban, 
  Headphones, 
  BarChart3, 
  Settings, 
  Sparkles,
  ShieldCheck,
  Zap,
  Lock
} from 'lucide-react';
import { ModuleType, BusinessType, UserRole, PlanType } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  businessType: BusinessType;
  activeRole?: UserRole;
  plan?: PlanType;
  isDarkMode: boolean;
  onOpenAiCommand: () => void;
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
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Billing & POS', icon: ShoppingCart, badge: 'Fast', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'Sales', 'Inventory Manager'] },
  { id: 'documents', label: 'Documents & GST', icon: FileText, allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'Accountant', 'Sales', 'Customer Portal', 'Vendor Portal'] },
  { id: 'whatsapp', label: 'WhatsApp Hub', icon: MessageSquare, badge: 'Share', badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20', allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'Sales', 'Customer Portal'] },
  { id: 'crm', label: 'CRM & Leads', icon: Users, allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'Sales'] },
  { id: 'hr', label: 'HR & Payroll', icon: UserCheck, badge: 'AI Resume', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20', allowedRoles: ['Super Admin', 'Business Owner', 'HR', 'Employee'] },
  { id: 'inventory', label: 'Inventory & Stock', icon: Package, allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'Inventory Manager', 'Vendor Portal'] },
  { id: 'finance', label: 'Finance & P&L', icon: DollarSign, allowedRoles: ['Super Admin', 'Business Owner', 'Accountant'] },
  { id: 'projects', label: 'Projects & Tasks', icon: FolderKanban, allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'Employee'] },
  { id: 'support', label: 'Customer Support', icon: Headphones, allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'Sales', 'Customer Portal', 'Vendor Portal'] },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'HR', 'Accountant', 'Sales', 'Inventory Manager'] },
  { id: 'settings', label: 'Settings', icon: Settings, allowedRoles: ['Super Admin', 'Business Owner', 'Branch Manager', 'HR', 'Accountant', 'Employee'] },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  businessType,
  activeRole = 'Business Owner',
  plan = 'Growth',
  isDarkMode,
  onOpenAiCommand
}) => {
  // Filter navigation items dynamically based on Role
  const filteredNavItems = ALL_NAV_ITEMS.filter(item => {
    if (activeRole === 'Super Admin') return true; // Super Admin sees all modules
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(activeRole as UserRole);
  });

  return (
    <aside className={`hidden md:flex w-64 shrink-0 border-r flex-col justify-between py-5 px-3 transition-colors ${
      isDarkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-neutral-50/80 border-neutral-200 text-neutral-700'
    }`}>
      <div className="space-y-6">
        
        {/* Business Context Info */}
        <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
          isDarkMode ? 'bg-neutral-900/60 border-neutral-800/80' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between text-neutral-400 font-medium text-[11px] uppercase tracking-wider">
            <span>Role & Vertical</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="font-semibold text-sm text-neutral-100 flex items-center justify-between">
            <span className="truncate">{businessType}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          </div>
          <div className="text-[10px] text-blue-400 font-mono flex items-center justify-between">
            <span>Role: {activeRole}</span>
            <span className="text-amber-400 font-bold">{plan}</span>
          </div>
        </div>

        {/* AI Quick Launcher Button */}
        <button
          onClick={onOpenAiCommand}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-xs shadow-md shadow-blue-600/20 hover:brightness-110 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Launch AI Command OS</span>
        </button>

        {/* Primary Navigation Items */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            {activeRole} Modules
          </div>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? isDarkMode 
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                    : isDarkMode 
                      ? 'hover:bg-neutral-900 hover:text-neutral-100 border border-transparent' 
                      : 'hover:bg-neutral-200/60 hover:text-neutral-900 border border-transparent'
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

      {/* Footer System Status */}
      <div className={`p-3 rounded-xl border text-xs space-y-2 ${
        isDarkMode ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-[11px]">Dynamic OS Runtime</span>
          <span className="text-[10px] text-emerald-400 font-semibold">Live Synced</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-mono text-neutral-300">Tenant Isolation Active</span>
        </div>
      </div>
    </aside>
  );
};
