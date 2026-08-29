import React, { useState, useEffect } from 'react';
import { 
  Settings2, Layers, Grid, Sliders, Layout, Plus, Trash2, Edit3, Save, CheckCircle2, 
  Building2, ArrowUp, ArrowDown, Eye, EyeOff, ShieldCheck, Tag, FileText, Check
} from 'lucide-react';
import { Organization, WorkspaceConfig, SubWorkspace, IndustryTemplate } from '../../types';

interface WorkspaceCustomizerProps {
  organization?: Organization;
  currentOrg?: Organization;
  isDarkMode?: boolean;
  onSaveSuccess?: () => void;
  onSave?: (config: WorkspaceConfig) => void;
}

export const WorkspaceCustomizer: React.FC<WorkspaceCustomizerProps> = ({
  organization,
  currentOrg,
  isDarkMode = false,
  onSaveSuccess,
  onSave,
}) => {
  const org = organization || currentOrg;
  const orgId = org?.id || 'ORG-001';
  const orgName = org?.name || 'Organization';

  const [activeTab, setActiveTab] = useState<'sidebar' | 'workspaces' | 'fields' | 'widgets'>('sidebar');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [config, setConfig] = useState<Partial<WorkspaceConfig>>({
    organization_id: orgId,
    businessType: org?.businessType || 'Retail',
    companySize: org?.companySize || 'Medium',
    themeColor: '#2563eb',
    enabledModules: ['pos', 'billing', 'products', 'inventory', 'sales', 'reports'],
    sidebarConfig: { customLabels: {}, hiddenModules: [], orderedModules: [] },
    customFields: {},
    customWidgets: [],
  });
  const [subWorkspaces, setSubWorkspaces] = useState<SubWorkspace[]>([]);
  const [industryTemplates, setIndustryTemplates] = useState<IndustryTemplate[]>([]);

  // Form inputs for new sub-workspace
  const [newWsName, setNewWsName] = useState<string>('');
  const [newWsType, setNewWsType] = useState<string>('Branch');
  const [newWsDesc, setNewWsDesc] = useState<string>('');

  // Form inputs for new custom field
  const [fieldModule, setFieldModule] = useState<string>('invoices');
  const [fieldLabel, setFieldLabel] = useState<string>('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'date' | 'select'>('text');

  useEffect(() => {
    loadWorkspaceData();
  }, [orgId]);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      // Fetch Workspace Config
      const configRes = await fetch(`/api/workspace-config?orgId=${orgId}`);
      if (configRes.ok) {
        const data = await configRes.json();
        setConfig({
          ...data,
          enabledModules: JSON.parse(data.enabledModulesJson || '[]'),
          sidebarConfig: JSON.parse(data.sidebarConfigJson || '{}'),
          customFields: JSON.parse(data.customFieldsJson || '{}'),
          customWidgets: JSON.parse(data.customWidgetsJson || '[]'),
        });
      }

      // Fetch Sub-Workspaces
      const wsRes = await fetch(`/api/workspaces?orgId=${orgId}`);
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        setSubWorkspaces(wsData);
      }

      // Fetch Industry Templates
      const tplRes = await fetch('/api/industry-templates');
      if (tplRes.ok) {
        const tplData = await tplRes.json();
        setIndustryTemplates(tplData.map((t: any) => ({
          ...t,
          defaultModules: JSON.parse(t.defaultModulesJson || '[]'),
          dashboardWidgets: JSON.parse(t.dashboardWidgetsJson || '[]'),
          terminology: JSON.parse(t.terminologyJson || '{}'),
        })));
      }
    } catch (err) {
      console.error('Error loading workspace customizer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const payload = {
        orgId,
        businessType: config.businessType,
        companySize: config.companySize,
        themeColor: config.themeColor,
        enabledModules: config.enabledModules,
        sidebarConfig: config.sidebarConfig,
        customFields: config.customFields,
        customWidgets: config.customWidgets,
        wizardCompleted: true,
      };

      const res = await fetch('/api/workspace-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update workspace configuration');
      const savedData = await res.json();
      if (onSave) onSave(savedData);
      alert('Workspace configuration successfully saved!');
    } catch (err: any) {
      alert(err.message || 'Error saving workspace config');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubWorkspace = async () => {
    if (!newWsName.trim()) return;
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          name: newWsName,
          type: newWsType,
          description: newWsDesc,
          enabledModules: config.enabledModules,
        }),
      });

      if (res.ok) {
        const newWs = await res.json();
        setSubWorkspaces([...subWorkspaces, newWs]);
        setNewWsName('');
        setNewWsDesc('');
      }
    } catch (err) {
      console.error('Failed to create sub-workspace:', err);
    }
  };

  const handleDeleteSubWorkspace = async (id: string) => {
    if (!confirm('Are you sure you want to remove this workspace?')) return;
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubWorkspaces(subWorkspaces.filter(w => w.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete workspace:', err);
    }
  };

  const handleAddCustomField = () => {
    if (!fieldLabel.trim()) return;
    const currentFields = config.customFields || {};
    const moduleFields = currentFields[fieldModule] || [];
    const newField = {
      id: `cf_${Date.now()}`,
      label: fieldLabel.trim(),
      type: fieldType,
    };

    const updated = {
      ...currentFields,
      [fieldModule]: [...moduleFields, newField],
    };

    setConfig({ ...config, customFields: updated });
    setFieldLabel('');
  };

  const handleRemoveCustomField = (mod: string, fieldId: string) => {
    const currentFields = config.customFields || {};
    const moduleFields = currentFields[mod] || [];
    const updated = {
      ...currentFields,
      [mod]: moduleFields.filter((f: any) => f.id !== fieldId),
    };
    setConfig({ ...config, customFields: updated });
  };

  const allAvailableModules = [
    { id: 'pos', name: 'POS & Billing', cat: 'Operations' },
    { id: 'billing', name: 'Invoices & Quotations', cat: 'Operations' },
    { id: 'products', name: 'Products & Services', cat: 'Operations' },
    { id: 'inventory', name: 'Stock & Warehouse', cat: 'Operations' },
    { id: 'ca', name: 'CA Practice & Tax', cat: 'Finance & Tax' },
    { id: 'finance', name: 'Accounts & Ledger', cat: 'Finance & Tax' },
    { id: 'crm', name: 'CRM & Clients', cat: 'Sales' },
    { id: 'hr', name: 'HR & Staff Payroll', cat: 'Management' },
    { id: 'projects', name: 'Projects & Sites', cat: 'Operations' },
    { id: 'whatsapp', name: 'WhatsApp Automation', cat: 'Communication' },
    { id: 'helpdesk', name: 'Helpdesk Tickets', cat: 'Support' },
    { id: 'reports', name: 'Reports & Analytics', cat: 'Intelligence' },
  ];

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading workspace configuration engine...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" /> Dynamic Architecture Engine
          </div>
          <h1 className="text-2xl font-bold text-white">Customize Workspace for {orgName}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Tailor sidebar links, custom fields, sub-workspace sub-nodes, and widget layouts specifically for your organization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? 'Saving Config...' : 'Save Workspace Config'}
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: 'sidebar', label: 'Modules & Navigation', icon: Layout },
          { id: 'workspaces', label: 'Sub-Workspaces & Branches', icon: Layers },
          { id: 'fields', label: 'Custom Fields', icon: Tag },
          { id: 'widgets', label: 'Dashboard Widgets', icon: Grid },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SIDEBAR & NAVIGATION */}
      {activeTab === 'sidebar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Enabled Modules & Sidebar Customization</h3>
            <p className="text-xs text-slate-500">Toggle modules on or off and optionally customize their display label in the navigation sidebar.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {allAvailableModules.map((mod) => {
                const isEnabled = (config.enabledModules || []).includes(mod.id);
                const customLabel = config.sidebarConfig?.customLabels?.[mod.id] || mod.name;

                return (
                  <div
                    key={mod.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isEnabled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                        {mod.cat}
                      </span>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => {
                          const currentMods = config.enabledModules || [];
                          const updatedMods = e.target.checked
                            ? [...currentMods, mod.id]
                            : currentMods.filter((m: string) => m !== mod.id);
                          setConfig({ ...config, enabledModules: updatedMods });
                        }}
                        className="w-4 h-4 text-indigo-600 rounded-md"
                      />
                    </div>
                    <div className="text-sm font-bold text-slate-900 mb-1">{mod.name}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <input
                        type="text"
                        value={customLabel}
                        onChange={(e) => {
                          const customLabels = { ...(config.sidebarConfig?.customLabels || {}), [mod.id]: e.target.value };
                          setConfig({
                            ...config,
                            sidebarConfig: { ...config.sidebarConfig, customLabels },
                          });
                        }}
                        placeholder="Custom Sidebar Label"
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUB-WORKSPACES */}
      {activeTab === 'workspaces' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Sub-Workspaces & Organizational Units</h3>
            <p className="text-xs text-slate-500">Isolate operational data between branches, sites, or practice areas.</p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Create New Sub-Workspace</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  placeholder="Workspace Name (e.g., Delhi Outlet)"
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <select
                  value={newWsType}
                  onChange={(e) => setNewWsType(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Branch">Branch Office</option>
                  <option value="Department">Department</option>
                  <option value="Project Site">Project Site</option>
                  <option value="Practice Area">Practice Area</option>
                </select>
                <button
                  type="button"
                  onClick={handleCreateSubWorkspace}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Sub-Workspace
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Workspaces ({subWorkspaces.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subWorkspaces.map((ws) => (
                  <div key={ws.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{ws.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{ws.type} • ID: {ws.id}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubWorkspace(ws.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM FIELDS */}
      {activeTab === 'fields' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Custom Field Definitions</h3>
            <p className="text-xs text-slate-500">Extend standard forms (Invoices, Customers, Products, Support Tickets) with industry-specific attributes.</p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Add Custom Field</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  value={fieldModule}
                  onChange={(e) => setFieldModule(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="invoices">Invoices & Bills</option>
                  <option value="customers">Customers / Clients</option>
                  <option value="products">Products / Services</option>
                  <option value="tickets">Helpdesk Tickets</option>
                </select>

                <input
                  type="text"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  placeholder="Field Name (e.g. Serial No / Batch Code)"
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />

                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as any)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="text">Text Input</option>
                  <option value="number">Numeric Value</option>
                  <option value="date">Date Picker</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Field
                </button>
              </div>
            </div>

            {/* List Existing Fields */}
            <div className="space-y-3 pt-2">
              {Object.keys(config.customFields || {}).map((modKey) => {
                const fields = (config.customFields || {})[modKey] || [];
                if (fields.length === 0) return null;
                return (
                  <div key={modKey} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider capitalize">{modKey} Custom Fields</div>
                    <div className="flex flex-wrap gap-2">
                      {fields.map((f: any) => (
                        <div key={f.id} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs flex items-center gap-2">
                          <span className="font-bold text-slate-900">{f.label}</span>
                          <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase">{f.type}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(modKey, f.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DASHBOARD WIDGETS */}
      {activeTab === 'widgets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Dashboard Widgets Layout</h3>
            <p className="text-xs text-slate-500">Configure widgets that appear on the executive dashboard tailored to your industry.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {[
                { id: 'daily_sales_counter', name: 'Daily POS Sales Counter', cat: 'Retail / Food' },
                { id: 'top_selling_products', name: 'Fast Moving Products', cat: 'Retail / Food' },
                { id: 'low_stock_alerts', name: 'Inventory Stock Alerts', cat: 'Retail / Hospital' },
                { id: 'active_tables_occupancy', name: 'Live Table Occupancy', cat: 'Restaurant' },
                { id: 'live_kitchen_orders', name: 'Live Kitchen KOT Queue', cat: 'Restaurant' },
                { id: 'upcoming_tax_due_dates', name: 'Tax Compliance Calendar', cat: 'CA Firm' },
                { id: 'pending_client_filings', name: 'GST & Audit Filings', cat: 'CA Firm' },
                { id: 'today_appointments', name: 'Doctor OPD Queue', cat: 'Hospital' },
                { id: 'occupied_beds_ipd', name: 'IPD Occupied Beds', cat: 'Hospital' },
                { id: 'active_project_milestones', name: 'Sprint & Project Progress', cat: 'IT Company' },
                { id: 'active_site_progress', name: 'Site Progress & Labour', cat: 'Construction' },
                { id: 'property_inventory_status', name: 'Available Real Estate Units', cat: 'Real Estate' },
              ].map((w) => {
                const isChecked = (config.customWidgets || []).includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      const currentW = config.customWidgets || [];
                      const updated = isChecked ? currentW.filter((item: string) => item !== w.id) : [...currentW, w.id];
                      setConfig({ ...config, customWidgets: updated });
                    }}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">{w.cat}</div>
                      <div className="font-bold text-xs text-slate-900">{w.name}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
