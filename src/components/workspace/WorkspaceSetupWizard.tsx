import React, { useState, useEffect } from 'react';
import { 
  Building2, Store, UtensilsCrossed, FileSpreadsheet, Hospital, 
  Laptop, HardHat, Home, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, 
  Settings2, Users, Layers, ShieldCheck, Check
} from 'lucide-react';
import { IndustryTemplate, Organization } from '../../types';

interface WorkspaceSetupWizardProps {
  organization?: Organization;
  currentOrg?: Organization;
  onComplete: (config: any) => void;
  onCancel?: () => void;
}

export const WorkspaceSetupWizard: React.FC<WorkspaceSetupWizardProps> = ({
  organization,
  currentOrg,
  onComplete,
  onCancel,
}) => {
  const org = organization || currentOrg;
  const orgId = org?.id || 'ORG-001';
  const orgName = org?.name || 'Organization';

  const [step, setStep] = useState<number>(1);
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State
  const [selectedIndustry, setSelectedIndustry] = useState<string>(
    org?.businessType?.toLowerCase().includes('restaurant') ? 'restaurant' :
    org?.businessType?.toLowerCase().includes('ca') ? 'ca_firm' :
    org?.businessType?.toLowerCase().includes('hospital') ? 'hospital' :
    org?.businessType?.toLowerCase().includes('it') ? 'it_company' :
    org?.businessType?.toLowerCase().includes('construction') ? 'construction' :
    org?.businessType?.toLowerCase().includes('real') ? 'real_estate' : 'retail'
  );
  const [companySize, setCompanySize] = useState<string>(org?.companySize || 'Medium');
  const [themeColor, setThemeColor] = useState<string>('#2563eb');
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [subWorkspaces, setSubWorkspaces] = useState<{ name: string; type: string }[]>([
    { name: 'Main HQ / Central Branch', type: 'Branch' },
    { name: 'Core Operations', type: 'Department' },
  ]);
  const [newSubWsName, setNewSubWsName] = useState<string>('');
  const [newSubWsType, setNewSubWsType] = useState<string>('Department');
  const [gstEnabled, setGstEnabled] = useState<boolean>(true);
  const [gstin, setGstin] = useState<string>(org?.gstin || '');
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(18);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/industry-templates');
      if (res.ok) {
        const data = await res.json();
        const parsed: IndustryTemplate[] = data.map((t: any) => ({
          ...t,
          defaultModules: JSON.parse(t.defaultModulesJson || '[]'),
          dashboardWidgets: JSON.parse(t.dashboardWidgetsJson || '[]'),
          terminology: JSON.parse(t.terminologyJson || '{}'),
          quickActions: JSON.parse(t.quickActionsJson || '[]'),
          helpdeskCategories: JSON.parse(t.helpdeskCategoriesJson || '[]'),
          documentTypes: JSON.parse(t.documentTypesJson || '[]'),
        }));
        setTemplates(parsed);

        // Auto select current industry template modules
        const match = parsed.find(p => p.id === selectedIndustry);
        if (match) {
          setEnabledModules(match.defaultModules);
        }
      }
    } catch (err) {
      console.error('Failed to load industry templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIndustry = (templateId: string) => {
    setSelectedIndustry(templateId);
    const match = templates.find(p => p.id === templateId);
    if (match) {
      setEnabledModules(match.defaultModules);
    }
  };

  const handleToggleModule = (modId: string) => {
    if (enabledModules.includes(modId)) {
      setEnabledModules(enabledModules.filter(m => m !== modId));
    } else {
      setEnabledModules([...enabledModules, modId]);
    }
  };

  const handleAddSubWorkspace = () => {
    if (!newSubWsName.trim()) return;
    setSubWorkspaces([...subWorkspaces, { name: newSubWsName.trim(), type: newSubWsType }]);
    setNewSubWsName('');
  };

  const handleRemoveSubWorkspace = (index: number) => {
    setSubWorkspaces(subWorkspaces.filter((_, i) => i !== index));
  };

  const handleFinishWizard = async () => {
    try {
      setSaving(true);
      const currentTemplate = templates.find(t => t.id === selectedIndustry);

      // Save Workspace Config
      const configPayload = {
        orgId,
        businessType: currentTemplate ? currentTemplate.name : selectedIndustry,
        companySize,
        themeColor,
        wizardCompleted: true,
        enabledModules,
        customWidgets: currentTemplate ? currentTemplate.dashboardWidgets : [],
        documentTemplates: currentTemplate ? currentTemplate.documentTypes.map(d => ({ type: d, title: d })) : [],
        taxSettings: { gstEnabled, gstin, defaultTaxRate },
      };

      const res = await fetch('/api/workspace-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configPayload),
      });

      if (!res.ok) throw new Error('Failed to save workspace configuration');

      // Create Sub-Workspaces
      for (const ws of subWorkspaces) {
        await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organization_id: orgId,
            name: ws.name,
            type: ws.type,
            enabledModules,
            status: 'Active',
          }),
        });
      }

      onComplete(configPayload);
    } catch (err: any) {
      alert(err.message || 'Error configuring workspace.');
    } finally {
      setSaving(false);
    }
  };

  const currentTemplate = templates.find(t => t.id === selectedIndustry);

  const getIndustryIcon = (id: string) => {
    switch (id) {
      case 'retail': return <Store className="w-6 h-6 text-blue-600" />;
      case 'restaurant': return <UtensilsCrossed className="w-6 h-6 text-amber-600" />;
      case 'ca_firm': return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
      case 'hospital': return <Hospital className="w-6 h-6 text-red-600" />;
      case 'it_company': return <Laptop className="w-6 h-6 text-indigo-600" />;
      case 'construction': return <HardHat className="w-6 h-6 text-orange-600" />;
      case 'real_estate': return <Home className="w-6 h-6 text-purple-600" />;
      default: return <Building2 className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">BusinessOS AI — Workspace Setup Wizard</h2>
              <p className="text-xs text-slate-300">Tailoring your entire workspace layout, modules & workflows for {orgName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              Step {step} of 4
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          <div className={`h-full bg-indigo-600 transition-all duration-300 ${
            step === 1 ? 'w-1/4' : step === 2 ? 'w-2/4' : step === 3 ? 'w-3/4' : 'w-full'
          }`} />
        </div>

        {/* Wizard Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: Industry & Company Size */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Select Industry Architecture</h3>
                <p className="text-sm text-slate-500">BusinessOS AI builds a distinct workspace layout, terminology, and workflows for each business type.</p>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading industry templates...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {templates.map((tpl) => {
                    const isSelected = selectedIndustry === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectIndustry(tpl.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20' 
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-slate-100">{getIndustryIcon(tpl.id)}</div>
                            {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">{tpl.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                          <span>{tpl.defaultModules?.length || 0} Default Modules</span>
                          <span className="capitalize font-semibold text-indigo-600">{tpl.id.replace('_', ' ')}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Company Size & Team Scale</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Small (1-10)', 'Medium (11-50)', 'Enterprise (50+)'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setCompanySize(sz.split(' ')[0])}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                          companySize === sz.split(' ')[0]
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Theme Accent Color</label>
                  <div className="flex items-center gap-3">
                    {['#2563eb', '#059669', '#dc2626', '#7c3aed', '#d97706', '#0284c7'].map((clr) => (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setThemeColor(clr)}
                        className={`w-8 h-8 rounded-full transition-transform border-2 ${
                          themeColor === clr ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: clr }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Sub-Workspaces & Branch Isolation */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Define Sub-Workspaces & Branches</h3>
                <p className="text-sm text-slate-500">Create isolated workspaces (e.g. "Mumbai Branch", "Sales Dept", "Site A") with separate data visibility.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Add Sub-Workspace</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubWsName}
                    onChange={(e) => setNewSubWsName(e.target.value)}
                    placeholder="e.g. Mumbai Outlet / Audit Team / Construction Site Alpha"
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={newSubWsType}
                    onChange={(e) => setNewSubWsType(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Branch">Branch Office</option>
                    <option value="Department">Department</option>
                    <option value="Project Site">Project Site</option>
                    <option value="Practice Area">Practice Area</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddSubWorkspace}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Configured Workspaces ({subWorkspaces.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subWorkspaces.map((ws, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{ws.name}</div>
                          <div className="text-xs text-slate-500">{ws.type}</div>
                        </div>
                      </div>
                      {subWorkspaces.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubWorkspace(i)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Enabled Modules & Terminology */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Enable Business Modules & Features</h3>
                <p className="text-sm text-slate-500">Choose which operational tools will appear on the sidebar and dashboard for this workspace.</p>
              </div>

              {currentTemplate && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-lg">
                      <Settings2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-900 uppercase">Industry Terminology Applied</div>
                      <div className="text-xs text-indigo-700 mt-0.5">
                        Client = <b>{currentTemplate.terminology?.clientLabel}</b> • Item = <b>{currentTemplate.terminology?.productLabel}</b> • Invoice = <b>{currentTemplate.terminology?.invoiceLabel}</b>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { id: 'pos', name: 'POS & Fast Billing', desc: 'Barcode scanner, quick checkout, thermal receipts' },
                  { id: 'billing', name: 'Invoicing & Quotations', desc: 'GST invoices, proforma, estimates' },
                  { id: 'products', name: 'Product / Service Catalog', desc: 'SKUs, pricing, categories, units' },
                  { id: 'inventory', name: 'Stock & Warehouse', desc: 'Stock alerts, batch numbers, transfers' },
                  { id: 'ca', name: 'CA Practice & Tax Audit', desc: 'GST, TDS, Income Tax, ROC, Compliance' },
                  { id: 'crm', name: 'CRM & Lead Management', desc: 'Pipeline, follow-ups, customer portal' },
                  { id: 'hr', name: 'HR, Staff & Attendance', desc: 'Salary slips, attendance log, leave management' },
                  { id: 'finance', name: 'Ledger & Accounting', desc: 'Journal, P&L, balance sheet, trial balance' },
                  { id: 'projects', name: 'Projects & Sites', desc: 'Milestones, tasks, site logs, RA bills' },
                  { id: 'whatsapp', name: 'WhatsApp Automation', desc: 'Send PDF invoices, payment links directly' },
                  { id: 'helpdesk', name: 'Helpdesk & Support', desc: 'Industry-specific tickets & SLAs' },
                  { id: 'reports', name: 'Analytics & Reports', desc: 'Sales trends, tax compliance, profit reports' },
                ].map((mod) => {
                  const isChecked = enabledModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleToggleModule(mod.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/30'
                          : 'border-slate-200 bg-white opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">{mod.name}</div>
                        <div className="text-[11px] text-slate-500 mt-1">{mod.desc}</div>
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
          )}

          {/* STEP 4: Tax & Confirmation */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tax & Regional Configuration</h3>
                <p className="text-sm text-slate-500">Configure GST compliance, tax percentages, and default document formats.</p>
              </div>

              <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <div className="font-bold text-sm text-slate-900">Enable GST Compliance</div>
                    <div className="text-xs text-slate-500">Automatically calculate CGST / SGST / IGST on invoices and bills</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => setGstEnabled(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500"
                  />
                </div>

                {gstEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        placeholder="27AAAAA0000A1Z5"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Default GST Rate (%)</label>
                      <select
                        value={defaultTaxRate}
                        onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={0}>0% (Exempt)</option>
                        <option value={5}>5% GST</option>
                        <option value={12}>12% GST</option>
                        <option value={18}>18% GST (Standard)</option>
                        <option value={28}>28% GST</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace Setup Overview</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    Ready to Build
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 block">Industry:</span>
                    <span className="font-bold text-white capitalize">{currentTemplate?.name || selectedIndustry}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Sub-Workspaces:</span>
                    <span className="font-bold text-white">{subWorkspaces.length} Configured</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Active Modules:</span>
                    <span className="font-bold text-white">{enabledModules.length} Modules</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">GST Status:</span>
                    <span className="font-bold text-emerald-400">{gstEnabled ? `Active (${defaultTaxRate}%)` : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            disabled={saving}
            className="px-4 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? (onCancel ? 'Skip for Now' : 'Cancel') : 'Previous'}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              Continue Step {step + 1}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishWizard}
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {saving ? 'Initializing Workspace...' : 'Launch Dynamic Workspace'}
              <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
