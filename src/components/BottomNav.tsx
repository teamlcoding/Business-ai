import React from 'react';
import { LayoutDashboard, ShoppingCart, FileText, Users, Menu } from 'lucide-react';
import { ModuleType } from '../types';

interface BottomNavProps {
  activeModule: ModuleType;
  onSelectModule: (module: ModuleType) => void;
  onOpenMobileDrawer: () => void;
  isDarkMode: boolean;
  activeRole?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  onSelectModule,
  onOpenMobileDrawer,
  isDarkMode,
  activeRole
}) => {
  const tabs = activeRole === 'Super Admin' 
    ? [{ id: 'superadmin' as ModuleType, label: 'Super Admin HQ', icon: LayoutDashboard }]
    : [
        { id: 'dashboard' as ModuleType, label: 'Executive', icon: LayoutDashboard },
        { id: 'pos' as ModuleType, label: 'Billing POS', icon: ShoppingCart },
        { id: 'documents' as ModuleType, label: 'Docs/GST', icon: FileText },
        { id: 'crm' as ModuleType, label: 'CRM Leads', icon: Users },
      ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 md:hidden border-t px-2 py-1.5 transition-colors ${
      isDarkMode 
        ? 'bg-neutral-950/95 border-neutral-800 text-neutral-300 backdrop-blur-lg' 
        : 'bg-white/95 border-neutral-200 text-neutral-700 backdrop-blur-lg'
    }`}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectModule(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive 
                  ? 'text-blue-500 font-bold' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={onOpenMobileDrawer}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-neutral-400 hover:text-neutral-200"
        >
          <Menu className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium text-amber-400">All Modules</span>
        </button>
      </div>
    </nav>
  );
};
