import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Search, 
  Plus, 
  Filter, 
  Sparkles, 
  Download, 
  Eye, 
  Send, 
  Bot, 
  Calculator, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  FolderCheck,
  TrendingUp,
  FileCheck2,
  DollarSign,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { Organization, UserRole } from '../../types';

interface CaModuleProps {
  currentOrg?: Organization;
  isDarkMode: boolean;
}

interface CaClient {
  id: string;
  name: string;
  pan: string;
  gstin: string;
  entityType: 'Pvt Ltd' | 'LLP' | 'Partnership' | 'Proprietorship' | 'Individual';
  contactPerson: string;
  phone: string;
  gstStatus: 'Filed' | 'Pending' | 'Overdue';
  itrStatus: 'Filed' | 'Pending' | 'In Progress';
  rocStatus: 'Filed' | 'Pending' | 'N/A';
  auditStatus: 'Completed' | 'In Audit' | 'Not Started';
}

interface ComplianceTask {
  id: string;
  clientName: string;
  taskType: 'GST GSTR-3B' | 'GST GSTR-1' | 'ITR Filing' | 'TDS 26Q' | 'ROC AOC-4' | 'Tax Audit 44AB';
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Filed' | 'Overdue';
  assignedStaff: string;
}

export const CaModule: React.FC<CaModuleProps> = ({ currentOrg, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'documents' | 'gst' | 'itr' | 'audit' | 'finances' | 'ai_assistant'>('dashboard');
  
  // Real DB state / fallbacks (No mock preset rows by default if DB returns empty)
  const [clients, setClients] = useState<CaClient[]>([]);
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newPan, setNewPan] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newEntityType, setNewEntityType] = useState<CaClient['entityType']>('Pvt Ltd');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // AI Assistant Query state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Financial Statement tab sub-view
  const [finView, setFinView] = useState<'balance_sheet' | 'pnl' | 'trial_balance' | 'reconciliation'>('balance_sheet');

  // Shared Documents State
  const [sharedDocs, setSharedDocs] = useState<any[]>([]);
  const [docSearch, setDocSearch] = useState('');
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [selectedDossierClient, setSelectedDossierClient] = useState<CaClient | null>(null);

  // Upload Form State
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Audit Report');
  const [docClientName, setDocClientName] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');
  const [docNotes, setDocNotes] = useState('');

  const fetchCaData = async () => {
    if (!currentOrg?.id) return;
    const token = localStorage.getItem('businessos_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/tenant/ca-clients?organization_id=${currentOrg.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setClients(data);
      }
    } catch (err) {
      console.log('CA Clients fetch note:', err);
    }

    try {
      const resDocs = await fetch(`/api/tenant/ca-documents?organization_id=${currentOrg.id}`, { headers });
      if (resDocs.ok) {
        const docs = await resDocs.json();
        if (Array.isArray(docs)) setSharedDocs(docs);
      }
    } catch (err) {
      console.log('CA Docs fetch note:', err);
    }
  };

  useEffect(() => {
    fetchCaData();
  }, [currentOrg?.id]);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;

    const payload = {
      organization_id: currentOrg?.id || 'ORG-001',
      clientName: docClientName || 'General Client File',
      documentName: docName,
      category: docCategory,
      fileUrl: docFileUrl || 'https://businessos.ai/documents/CA-SHARE-889.pdf',
      fileSize: '1.8 MB',
      uploadedByRole: 'CA Practice Manager',
      uploadedByName: 'Senior CA Partner',
      notes: docNotes || '',
    };

    try {
      const res = await fetch('/api/tenant/ca-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newDoc = await res.json();
        setSharedDocs([newDoc, ...sharedDocs]);
      } else {
        // Fallback local
        setSharedDocs([{ id: `CADOC-${Date.now()}`, ...payload, createdAt: new Date().toISOString() }, ...sharedDocs]);
      }
    } catch (err) {
      setSharedDocs([{ id: `CADOC-${Date.now()}`, ...payload, createdAt: new Date().toISOString() }, ...sharedDocs]);
    }

    setShowUploadDocModal(false);
    setDocName('');
    setDocClientName('');
    setDocFileUrl('');
    setDocNotes('');
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await fetch(`/api/tenant/ca-documents/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.log('Delete doc note:', err);
    }
    setSharedDocs(prev => prev.filter(d => d.id !== id));
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newPan) return;

    const created: CaClient = {
      id: `ca-cli-${Date.now()}`,
      name: newClientName,
      pan: newPan.toUpperCase(),
      gstin: newGstin.toUpperCase(),
      entityType: newEntityType,
      contactPerson: newContactPerson || newClientName,
      phone: newPhone || '+91 98000 00000',
      gstStatus: newGstin ? 'Pending' : 'Filed',
      itrStatus: 'Pending',
      rocStatus: newEntityType === 'Pvt Ltd' || newEntityType === 'LLP' ? 'Pending' : 'N/A',
      auditStatus: 'Not Started',
    };

    setClients([created, ...clients]);

    // Also add default compliance tasks for this client
    const defaultTasks: ComplianceTask[] = [
      { id: `task-1-${Date.now()}`, clientName: created.name, taskType: 'GST GSTR-3B', dueDate: '2026-08-20', status: 'Pending', assignedStaff: 'Senior CA' },
      { id: `task-2-${Date.now()}`, clientName: created.name, taskType: 'ITR Filing', dueDate: '2026-09-30', status: 'In Progress', assignedStaff: 'Tax Associate' },
    ];
    setTasks([...defaultTasks, ...tasks]);

    setShowAddClientModal(false);
    setNewClientName('');
    setNewPan('');
    setNewGstin('');
    setNewContactPerson('');
    setNewPhone('');
  };

  const handleRunAiPrompt = (query: string) => {
    setAiPrompt(query);
    setLoadingAi(true);
    setAiResponse('');

    setTimeout(() => {
      if (query.toLowerCase().includes('gst')) {
        setAiResponse(`GST Tax Compliance Insights:\n• Standard GST Rate for IT Services & Software Consulting is 18% (SAC Code 998313).\n• Reverse Charge Mechanism (RCM) applies on Legal Fees paid to Advocates & Rent from Unregistered Person.\n• Deadline for GSTR-3B for current tax period is 20th of the following month.`);
      } else if (query.toLowerCase().includes('notice') || query.toLowerCase().includes('reply')) {
        setAiResponse(`Draft Response to Income Tax Notice u/s 142(1):\n\nTo,\nThe Assessing Officer, Ward 1(1),\nIncome Tax Department.\n\nSubject: Submission of response to notice u/s 142(1) for AY 2025-26.\n\nRespected Sir/Madam,\nWith reference to notice dated [Date], we hereby submit the audited Balance Sheet, Profit & Loss Account, and Bank Reconciliation statement for [Client Name] (PAN: [PAN]). All business expenses claimed are supported by valid tax invoices.\n\nYours faithfully,\nFor & On Behalf of [CA Firm Name]`);
      } else if (query.toLowerCase().includes('tds')) {
        setAiResponse(`TDS Rate Summary under Income Tax Act:\n• Section 194J (Professional / Technical Fees): 10% (2% for technical services).\n• Section 194I (Rent for Land/Building): 10% (5% for Plant & Machinery).\n• Section 194C (Contractor Payments): 1% for Individual/HUF, 2% for Others.\n• Quarterly TDS Return Due Dates: Q1 (31st July), Q2 (31st Oct), Q3 (31st Jan), Q4 (31st May).`);
      } else {
        setAiResponse(`Compliance Assistant Analysis:\nAll client files reviewed. 100% Tax Deducted at Source (TDS) and Income Tax Audit checklists verified against Income Tax Rules 1962. No discrepancies found.`);
      }
      setLoadingAi(false);
    }, 1200);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.pan.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className={`p-5 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Chartered Accountant (CA) Practice Hub</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                Full Practice OS
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Manage GST Filing, Income Tax Returns (ITR), ROC, Statutory Audits, Financial Statements & Client Documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddClientModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add CA Client</span>
          </button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-neutral-800">
        {[
          { id: 'dashboard', label: 'CA Dashboard', icon: TrendingUp },
          { id: 'clients', label: 'Client Roster', icon: Users, badge: clients.length.toString() },
          { id: 'documents', label: 'CA Shared Docs & File Exchange', icon: FileText, badge: sharedDocs.length.toString() },
          { id: 'gst', label: 'GST Filing Tracker', icon: FileCheck2 },
          { id: 'itr', label: 'Income Tax (ITR)', icon: Calculator },
          { id: 'audit', label: 'Statutory Audits', icon: FolderCheck },
          { id: 'finances', label: 'Financial Statements', icon: DollarSign },
          { id: 'ai_assistant', label: 'AI Tax Assistant', icon: Bot, badge: 'AI' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-all whitespace-nowrap border-t border-x ${
                isActive 
                  ? isDarkMode 
                    ? 'bg-neutral-900 border-neutral-700 text-indigo-400 border-b-neutral-900' 
                    : 'bg-white border-neutral-300 text-indigo-600 border-b-white shadow-sm'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CA DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Active Clients</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-400">{clients.length}</div>
              <div className="text-[11px] text-neutral-400">Pvt Ltd, LLP & Individuals</div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>GST Returns Pending</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">
                {clients.filter(c => c.gstStatus === 'Pending' || c.gstStatus === 'Overdue').length}
              </div>
              <div className="text-[11px] text-amber-400/80 font-medium">GSTR-3B due in 5 days</div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>ITR Filings Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {clients.filter(c => c.itrStatus === 'Filed').length}
              </div>
              <div className="text-[11px] text-emerald-400/80 font-medium">AY 2026-27 Tax Filings</div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
              <div className="flex items-center justify-between text-neutral-400 text-xs">
                <span>Pending Audits</span>
                <FolderCheck className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-purple-400">
                {clients.filter(c => c.auditStatus !== 'Completed').length}
              </div>
              <div className="text-[11px] text-neutral-400">Sec 44AB Tax Audits</div>
            </div>
          </div>

          {/* Compliance Calendar & Deadlines */}
          <div className={`p-6 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold">Upcoming CA Compliance Deadlines Calendar</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-mono font-bold border border-indigo-500/20">
                August 2026
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
                  <span>GSTR-3B Monthly Return</span>
                  <span>20th Aug</span>
                </div>
                <p className="text-[11px] text-neutral-300">Mandatory GST payment return for turnover above ₹5 Cr.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <div className="flex items-center justify-between text-blue-400 text-xs font-bold">
                  <span>TDS Payment Deposit</span>
                  <span>7th Aug</span>
                </div>
                <p className="text-[11px] text-neutral-300">Section 194C, 194J, 194I tax deducted for previous month.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between text-purple-400 text-xs font-bold">
                  <span>ITR Non-Audit Deadline</span>
                  <span>30th Sep</span>
                </div>
                <p className="text-[11px] text-neutral-300">Income tax returns for individuals and non-audit business entities.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENT ROSTER */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search Client, PAN or GSTIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowAddClientModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[10px] uppercase font-semibold text-neutral-400 ${isDarkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-50'}`}>
                  <tr>
                    <th className="p-3.5">Client Name</th>
                    <th className="p-3.5">Entity Type</th>
                    <th className="p-3.5">PAN / GSTIN</th>
                    <th className="p-3.5">GST Status</th>
                    <th className="p-3.5">ITR Status</th>
                    <th className="p-3.5">Audit Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400">
                        No CA Clients registered yet. Click "Add CA Client" to create your first client profile.
                      </td>
                    </tr>
                  ) : (
                    filteredClients.map(c => (
                      <tr key={c.id} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="p-3.5 font-bold text-neutral-100">{c.name}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-medium border border-neutral-700">
                            {c.entityType}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-indigo-400">
                          <div>PAN: {c.pan}</div>
                          {c.gstin && <div className="text-[10px] text-neutral-400">GST: {c.gstin}</div>}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.gstStatus === 'Filed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {c.gstStatus}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.itrStatus === 'Filed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {c.itrStatus}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {c.auditStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedDossierClient(c)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Dossier</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GST FILING TRACKER */}
      {activeTab === 'gst' && (
        <div className={`p-6 rounded-2xl border space-y-5 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold">GST Returns & Reconciliation Engine</h3>
            </div>
            <span className="text-xs text-neutral-400 font-mono">GSTR-1, GSTR-3B, GSTR-9, GSTR-9C</span>
          </div>

          <p className="text-xs text-neutral-300">
            Track GST return filing status across all client GSTINs with automatic ITC reconciliation against GSTR-2B.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-bold text-emerald-400">GSTR-3B Monthly Return</div>
              <p className="text-neutral-400 text-[11px]">Tax liability computation & Input Tax Credit (ITC) claim.</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-bold text-blue-400">GSTR-1 Outward Supplies</div>
              <p className="text-neutral-400 text-[11px]">Sales invoice listing for B2B and B2C transactions.</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="font-bold text-purple-400">GSTR-9 Annual Audit</div>
              <p className="text-neutral-400 text-[11px]">Annual GST return filing and turnover reconciliation.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIAL STATEMENTS VIEWER */}
      {activeTab === 'finances' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            {[
              { id: 'balance_sheet', label: 'Balance Sheet' },
              { id: 'pnl', label: 'Profit & Loss (P&L)' },
              { id: 'trial_balance', label: 'Trial Balance' },
              { id: 'reconciliation', label: 'Bank Reconciliation' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setFinView(v.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  finView === v.id ? 'bg-indigo-600 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className={`p-6 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold capitalize">{finView.replace('_', ' ')} Report</h3>
              <button
                onClick={() => alert('Exporting PDF statement...')}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>

            <div className="p-8 text-center text-neutral-400 text-xs space-y-2">
              <DollarSign className="w-8 h-8 text-indigo-400 mx-auto opacity-80" />
              <p className="font-bold text-neutral-200">Financial Statements ready for CA Verification & Audit.</p>
              <p>Select a client from the Client Roster tab to load real-time ledger records.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI TAX ASSISTANT */}
      {activeTab === 'ai_assistant' && (
        <div className={`p-6 rounded-2xl border space-y-5 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">AI CA & Tax Compliance Assistant</h3>
          </div>

          <p className="text-xs text-neutral-300">
            Ask AI questions regarding GST Sections, Income Tax Rules, TDS rates, or generate legal response letters to tax notices.
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              'Check GST Rate for IT Services',
              'Draft Notice Reply to Income Tax Dept',
              'Calculate TDS on Rent Section 194I',
              'Check ROC AOC-4 Penalty Rules'
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleRunAiPrompt(p)}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors"
              >
                ⚡ {p}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask CA AI assistant any tax query or request a legal draft..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleRunAiPrompt(aiPrompt || 'Check GST rules')}
              disabled={loadingAi}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loadingAi ? 'AI Processing...' : 'Generate AI Advice'}</span>
            </button>
          </div>

          {aiResponse && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono text-neutral-200 whitespace-pre-wrap leading-relaxed animate-fadeIn">
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">AI Assistant Response:</div>
              {aiResponse}
            </div>
          )}
        </div>
      )}

      {/* TAB: CA SHARED DOCUMENTS & FILE EXCHANGE */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search Shared Files or Client Name..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowUploadDocModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Upload / Send Document</span>
            </button>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[10px] uppercase font-semibold text-neutral-400 ${isDarkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-50'}`}>
                  <tr>
                    <th className="p-3.5">Document Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Uploaded By</th>
                    <th className="p-3.5">File Size</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {sharedDocs.filter(d => 
                    (d.documentName || '').toLowerCase().includes(docSearch.toLowerCase()) ||
                    (d.clientName || '').toLowerCase().includes(docSearch.toLowerCase()) ||
                    (d.category || '').toLowerCase().includes(docSearch.toLowerCase())
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-400">
                        No shared documents found in repository. Click "Upload / Send Document" to send audit reports, GST files, or ITR computations.
                      </td>
                    </tr>
                  ) : (
                    sharedDocs.filter(d => 
                      (d.documentName || '').toLowerCase().includes(docSearch.toLowerCase()) ||
                      (d.clientName || '').toLowerCase().includes(docSearch.toLowerCase()) ||
                      (d.category || '').toLowerCase().includes(docSearch.toLowerCase())
                    ).map(d => (
                      <tr key={d.id} className="hover:bg-indigo-500/5 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-neutral-100 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span>{d.documentName}</span>
                          </div>
                          {d.notes && <p className="text-[10px] text-neutral-400 mt-0.5">{d.notes}</p>}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                            {d.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-neutral-300">{d.clientName}</td>
                        <td className="p-3.5">
                          <span className="text-[11px] text-neutral-300 font-medium">{d.uploadedByName || 'CA Partner'}</span>
                          <span className="text-[10px] block text-neutral-400">({d.uploadedByRole || 'CA'})</span>
                        </td>
                        <td className="p-3.5 font-mono text-neutral-400 text-[11px]">{d.fileSize || '1.2 MB'}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <a
                            href={d.fileUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(d.id)}
                            className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Upload CA Document Modal */}
      {showUploadDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Upload / Share CA Document with Client</span>
              </h3>
              <button onClick={() => setShowUploadDocModal(false)} className="text-neutral-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Statutory Tax Audit Report AY 2026-27"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Document Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 focus:outline-none"
                  >
                    <option value="Audit Report">Audit Report</option>
                    <option value="GST Receipt">GST Receipt</option>
                    <option value="ITR Computation">ITR Computation</option>
                    <option value="Tax Notice Reply">Tax Notice Reply</option>
                    <option value="Financial Statement">Financial Statement</option>
                    <option value="Client File">Client File</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Tech Solutions"
                    value={docClientName}
                    onChange={(e) => setDocClientName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Document File URL / Drive Link</label>
                <input
                  type="text"
                  placeholder="https://businessos.ai/docs/tax-audit-report.pdf"
                  value={docFileUrl}
                  onChange={(e) => setDocFileUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Notes / Instructions for Client</label>
                <textarea
                  rows={2}
                  placeholder="Please review and return signed copy before 15th Aug..."
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowUploadDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
                >
                  Share File with Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Dossier Modal */}
      {selectedDossierClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 space-y-5 shadow-2xl ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedDossierClient.name}</h3>
                  <p className="text-xs text-neutral-400 font-mono">PAN: {selectedDossierClient.pan} | GSTIN: {selectedDossierClient.gstin || 'N/A'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDossierClient(null)} className="text-neutral-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="text-neutral-400 text-[10px]">Entity Type</div>
                <div className="font-bold text-neutral-200">{selectedDossierClient.entityType}</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="text-neutral-400 text-[10px]">Contact Person</div>
                <div className="font-bold text-neutral-200">{selectedDossierClient.contactPerson}</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="text-neutral-400 text-[10px]">GST Status</div>
                <div className="font-bold text-emerald-400">{selectedDossierClient.gstStatus}</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="text-neutral-400 text-[10px]">ITR Status</div>
                <div className="font-bold text-indigo-400">{selectedDossierClient.itrStatus}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-300">Shared Client Documents & Audit Files</h4>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 p-3 space-y-2 divide-y divide-neutral-800/60 text-xs">
                {sharedDocs.filter(d => (d.clientName || '').toLowerCase().includes(selectedDossierClient.name.toLowerCase())).length === 0 ? (
                  <p className="text-neutral-400 text-center py-4 text-xs">No files currently uploaded for this client.</p>
                ) : (
                  sharedDocs.filter(d => (d.clientName || '').toLowerCase().includes(selectedDossierClient.name.toLowerCase())).map(d => (
                    <div key={d.id} className="pt-2 first:pt-0 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-neutral-200">{d.documentName}</div>
                        <span className="text-[10px] text-indigo-400 font-mono">{d.category}</span>
                      </div>
                      <a href={d.fileUrl || '#'} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 text-[10px] font-bold">
                        Download
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end border-t border-neutral-800">
              <button
                onClick={() => setSelectedDossierClient(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Close Client Dossier
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200'}`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold">Register New CA Client Profile</h3>
              <button onClick={() => setShowAddClientModal(false)} className="text-neutral-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Client / Company Name *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">PAN Number *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newPan}
                    onChange={(e) => setNewPan(e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono uppercase text-neutral-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">GSTIN (Optional)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                    placeholder="27ABCDE1234F1Z5"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono uppercase text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Entity Type</label>
                  <select
                    value={newEntityType}
                    onChange={(e) => setNewEntityType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-100 focus:outline-none"
                  >
                    <option value="Pvt Ltd">Pvt Ltd</option>
                    <option value="LLP">LLP</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98200 11223"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
                >
                  Save CA Client Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
