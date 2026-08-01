import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Key, 
  Plus, 
  Search, 
  Send, 
  AlertTriangle, 
  BarChart3, 
  Sliders, 
  MessageSquare, 
  Lock, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { Organization, Branch, BusinessType, PlanType, RegistrationRequest } from '../../types';

interface SuperAdminModuleProps {
  organizations: Organization[];
  onAddOrganization: (org: Organization, branch: Branch) => void;
  onUpdateOrgStatus: (orgId: string, plan: PlanType) => void;
  isDarkMode: boolean;
}

const INITIAL_REQUESTS: RegistrationRequest[] = [
  {
    id: 'REQ-901',
    businessName: 'Vanguard Retail Chain',
    businessType: 'Retail',
    ownerName: 'Vikram Sharma',
    phone: '+91 98200 44123',
    email: 'vikram@vanguardretail.in',
    gstin: '27AABCV8912A1Z5',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    selectedPlan: 'Growth',
    requestedAt: '2026-08-01 10:15 AM',
    status: 'Pending'
  },
  {
    id: 'REQ-902',
    businessName: 'Apollo Care Hospital & Labs',
    businessType: 'Hospital / Clinic',
    ownerName: 'Dr. Ramesh Patel',
    phone: '+91 98111 88234',
    email: 'dr.ramesh@apollocare.org',
    gstin: '24AAACD1109B1Z2',
    country: 'India',
    state: 'Gujarat',
    city: 'Ahmedabad',
    selectedPlan: 'Business',
    requestedAt: '2026-08-01 11:30 AM',
    status: 'Pending'
  },
  {
    id: 'REQ-903',
    businessName: 'Skyline Construction Infrastructure',
    businessType: 'Construction',
    ownerName: 'Anand Verma',
    phone: '+91 98990 12399',
    email: 'anand@skylineinfra.com',
    gstin: '07AAACS4412K1Z9',
    country: 'India',
    state: 'Delhi',
    city: 'New Delhi',
    selectedPlan: 'Enterprise',
    requestedAt: '2026-07-31 04:20 PM',
    status: 'Pending'
  }
];

export const SuperAdminModule: React.FC<SuperAdminModuleProps> = ({
  organizations,
  onAddOrganization,
  onUpdateOrgStatus,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'organizations' | 'plans' | 'cms' | 'analytics' | 'audit'>('approvals');
  const [requests, setRequests] = useState<RegistrationRequest[]>(INITIAL_REQUESTS);
  const [selectedReq, setSelectedReq] = useState<RegistrationRequest | null>(null);

  // CMS Landing Settings & Plans State
  const [heroTitle, setHeroTitle] = useState('One Backend Platform. 100% Unique Runtime App for Every Business.');
  const [heroSubtitle, setHeroSubtitle] = useState('Dynamic dashboards, role-based sidebars, native WhatsApp PDF invoice sharing, POS billing, HR payroll...');
  const [whatsappPhone, setWhatsappPhone] = useState('919876543210');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [cmsSavedMsg, setCmsSavedMsg] = useState('');

  // Fetch landing settings and plans on load
  React.useEffect(() => {
    fetch('/api/public/landing-settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.heroTitle) {
          setHeroTitle(data.heroTitle);
          setHeroSubtitle(data.heroSubtitle || '');
          setWhatsappPhone(data.whatsappPhone || '919876543210');
        }
      })
      .catch(err => console.error('Error fetching landing settings:', err));

    fetch('/api/public/plans')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDbPlans(data);
      })
      .catch(err => console.error('Error fetching plans:', err));
  }, []);

  const handleSaveCmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('businessos_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/admin/landing-settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ heroTitle, heroSubtitle, whatsappPhone }),
      });

      for (const p of dbPlans) {
        await fetch('/api/admin/plans', {
          method: 'POST',
          headers,
          body: JSON.stringify(p),
        });
      }

      setCmsSavedMsg('Landing page settings and pricing plans saved to PostgreSQL database!');
      setTimeout(() => setCmsSavedMsg(''), 4000);
    } catch (err) {
      console.error('Error saving CMS:', err);
    }
  };
  
  // Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Approval Form State
  const [assignedPlan, setAssignedPlan] = useState<PlanType>('Growth');
  const [generatedUsername, setGeneratedUsername] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Create Org State
  const [newOrgName, setNewOrgName] = useState('');
  const [newBusinessType, setNewBusinessType] = useState<BusinessType>('Retail');
  const [newGstin, setNewGstin] = useState('27AAACB1234A1Z1');
  const [newPlan, setNewPlan] = useState<PlanType>('Growth');
  const [newBranchCity, setNewBranchCity] = useState('Mumbai');

  const handleOpenApproval = (req: RegistrationRequest) => {
    setSelectedReq(req);
    setAssignedPlan(req.selectedPlan);
    const cleanName = req.businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
    setGeneratedUsername(`${cleanName}_admin`);
    setGeneratedPassword(`BOS#${Math.floor(100000 + Math.random() * 900000)}`);
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = () => {
    if (!selectedReq) return;

    const orgId = `org-${Date.now().toString().slice(-4)}`;
    const newOrg: Organization = {
      id: orgId,
      name: selectedReq.businessName,
      gstin: selectedReq.gstin,
      plan: assignedPlan,
      businessType: selectedReq.businessType,
      companySize: assignedPlan === 'Enterprise' ? 'Enterprise' : 'Medium'
    };

    const newBranch: Branch = {
      id: `branch-${Date.now().toString().slice(-4)}`,
      orgId,
      name: `${selectedReq.city} Main Branch`,
      city: selectedReq.city,
      code: `${selectedReq.city.slice(0, 3).toUpperCase()}-01`,
      isMain: true
    };

    onAddOrganization(newOrg, newBranch);

    // Update request list
    setRequests(prev => prev.map(r => r.id === selectedReq.id ? {
      ...r,
      status: 'Approved',
      assignedOrgId: orgId,
      generatedUsername,
      generatedPassword
    } : r));

    // Open WhatsApp prefilled message to customer
    const cleanPhone = selectedReq.phone.replace(/[^0-9]/g, '');
    const waMsg = `Hello ${selectedReq.ownerName},\n\nYour BusinessOS AI account for *${selectedReq.businessName}* is APPROVED!\n\n🔑 *Login Credentials*\n- Organization ID: ${orgId}\n- Username: ${generatedUsername}\n- Temporary Password: ${generatedPassword}\n- Plan: ${assignedPlan}\n\nLogin URL: https://businessos.ai/login\n\nWelcome aboard!`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank');

    setShowApprovalModal(false);
    alert(`Account approved for ${selectedReq.businessName}! Organization ID: ${orgId}. Credentials sent via WhatsApp.`);
  };

  const handleReject = (reqId: string) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Rejected' } : r));
    alert('Subscription request rejected.');
  };

  const handleManualCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;

    const orgId = `org-${Date.now().toString().slice(-4)}`;
    const newOrg: Organization = {
      id: orgId,
      name: newOrgName,
      gstin: newGstin,
      plan: newPlan,
      businessType: newBusinessType,
      companySize: newPlan === 'Enterprise' ? 'Enterprise' : 'Medium'
    };

    const newBranch: Branch = {
      id: `branch-${Date.now().toString().slice(-4)}`,
      orgId,
      name: `${newBranchCity} Central HQ`,
      city: newBranchCity,
      code: `${newBranchCity.slice(0, 3).toUpperCase()}-01`,
      isMain: true
    };

    onAddOrganization(newOrg, newBranch);
    setShowCreateOrgModal(false);
    setNewOrgName('');
    alert(`New Organization "${newOrgName}" created successfully! Organization ID: ${orgId}`);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Super Admin Top Header */}
      <div className={`p-5 sm:p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border-neutral-800' : 'bg-gradient-to-r from-amber-50/80 via-white to-orange-50/40 border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">BusinessOS AI Super Admin Control Panel</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Master HQ</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Approve customer WhatsApp subscriptions, manage organizations, assign plans, generate credentials, and monitor global revenue.</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateOrgModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Organization</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Total Active Companies</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-100">{organizations.length + 12}</div>
          <p className="text-[11px] text-emerald-400 font-medium">+3 new onboarded this week</p>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Pending WhatsApp Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{requests.filter(r => r.status === 'Pending').length}</div>
          <p className="text-[11px] text-neutral-400 font-medium">Requires admin authorization</p>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Platform ARR Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">₹4,890,000</div>
          <p className="text-[11px] text-neutral-400 font-medium">Monthly MRR: ₹407,500</p>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'}`}>
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Active AI Agents</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">14 Vertical AI OS</div>
          <p className="text-[11px] text-emerald-400 font-medium">99.98% System Uptime</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'approvals' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals ({requests.filter(r => r.status === 'Pending').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('organizations')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'organizations' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Active Organizations ({organizations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'plans' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Plans & Module Config</span>
        </button>

        <button
          onClick={() => setActiveTab('cms')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'cms' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Landing Page CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'analytics' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Revenue & Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'audit' 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === 'approvals' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">Subscription Requests from WhatsApp Flow</h3>
              <p className="text-xs text-neutral-400">Paid plan requests submitted by owners via prefilled WhatsApp flow require manual approval.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-neutral-400 font-semibold uppercase ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <tr>
                  <th className="pb-3">Ref ID</th>
                  <th className="pb-3">Business & Owner</th>
                  <th className="pb-3">Vertical</th>
                  <th className="pb-3">Requested Plan</th>
                  <th className="pb-3">Contact & GST</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-800/30">
                    <td className="py-3.5 font-mono text-amber-400 font-semibold">{req.id}</td>
                    <td className="py-3.5">
                      <div className="font-bold">{req.businessName}</div>
                      <div className="text-[11px] text-neutral-400">{req.ownerName}</div>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 border border-neutral-700">{req.businessType}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {req.selectedPlan} Plan
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="font-mono text-neutral-300">{req.phone}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{req.gstin || 'No GST'}</div>
                    </td>
                    <td className="py-3.5 text-neutral-400 font-mono text-[11px]">{req.requestedAt}</td>
                    <td className="py-3.5">
                      {req.status === 'Pending' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" /> Pending Approval
                        </span>
                      )}
                      {req.status === 'Approved' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {req.status === 'Rejected' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {req.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleOpenApproval(req)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-700 text-neutral-400 hover:text-neutral-200 text-xs"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            if (req.generatedUsername) {
                              alert(`Account Credentials:\nOrg ID: ${req.assignedOrgId}\nUsername: ${req.generatedUsername}\nPassword: ${req.generatedPassword}`);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-[11px]"
                        >
                          View Credentials
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Organizations List */}
      {activeTab === 'organizations' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">All Provisioned Organizations</h3>
            <span className="text-xs text-neutral-400">Total: {organizations.length} Companies</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <div key={org.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-100">{org.name}</h4>
                    <p className="text-[11px] text-neutral-400 font-mono">Org ID: {org.id}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {org.plan}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-neutral-300">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Business Type:</span>
                    <span className="font-semibold text-blue-400">{org.businessType}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">GSTIN:</span>
                    <span className="font-mono">{org.gstin}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Company Size:</span>
                    <span className="font-semibold">{org.companySize || 'Medium'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const newP: PlanType = org.plan === 'Free' ? 'Growth' : org.plan === 'Growth' ? 'Enterprise' : 'Free';
                      onUpdateOrgStatus(org.id, newP);
                      alert(`Updated plan for ${org.name} to ${newP}`);
                    }}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Sliders className="w-3 h-3" /> Switch Plan
                  </button>
                  <button
                    onClick={() => alert(`Reset temporary password link dispatched to owner of ${org.name}`)}
                    className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" /> Reset Password
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Plans & Modules Config */}
      {activeTab === 'plans' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <h3 className="text-sm font-bold">Membership Plan Tier Configuration</h3>
          <p className="text-xs text-neutral-400">Configure enabled modules and AI agent capabilities per plan tier.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {['Free', 'Starter', 'Growth', 'Business'].map((tier) => (
              <div key={tier} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="font-bold text-amber-400 text-sm border-b border-neutral-800 pb-2 flex justify-between">
                  <span>{tier} Tier</span>
                  <span className="text-neutral-400 text-[10px]">Active</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-neutral-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> POS Billing</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> GST Documents</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Direct Share</div>
                  {tier !== 'Free' ? (
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> HR & Payroll Engine</div>
                  ) : (
                    <div className="flex items-center gap-2 text-neutral-500"><XCircle className="w-3.5 h-3.5 text-neutral-600" /> HR & Payroll Engine</div>
                  )}
                  {tier === 'Growth' || tier === 'Business' ? (
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Full CRM & Projects</div>
                  ) : (
                    <div className="flex items-center gap-2 text-neutral-500"><XCircle className="w-3.5 h-3.5 text-neutral-600" /> Full CRM & Projects</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab CMS: Dynamic Landing Page Content & Dynamic Pricing Editor */}
      {activeTab === 'cms' && (
        <form onSubmit={handleSaveCmsSettings} className={`p-5 rounded-2xl border space-y-6 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold">Dynamic Landing Page & Pricing CMS</h3>
              <p className="text-xs text-neutral-400">All changes immediately reflect on the public landing page without redeploying code.</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
            >
              Save All Changes to Database
            </button>
          </div>

          {cmsSavedMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {cmsSavedMsg}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">1. Landing Page Content</h4>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Hero Title Headline</label>
              <textarea
                rows={2}
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Hero Subtitle Paragraph</label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">WhatsApp Admin Support Number (Country Code Included)</label>
              <input
                type="text"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4 text-xs border-t border-neutral-800 pt-4">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">2. Dynamic Pricing Plans Editor</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbPlans.map((plan, idx) => (
                <div key={plan.id || idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="font-bold text-blue-400 border-b border-neutral-800 pb-1 flex justify-between">
                    <span>{plan.name} Plan</span>
                    <span className="text-[10px] text-neutral-500 font-mono">ID: {plan.id}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 text-[10px]">Display Price</label>
                    <input
                      type="text"
                      value={plan.price || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDbPlans(prev => prev.map((p, pIdx) => pIdx === idx ? { ...p, price: val } : p));
                      }}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-bold text-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 text-[10px]">Billing Period</label>
                    <input
                      type="text"
                      value={plan.period || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDbPlans(prev => prev.map((p, pIdx) => pIdx === idx ? { ...p, period: val } : p));
                      }}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 text-[10px]">Description</label>
                    <input
                      type="text"
                      value={plan.description || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDbPlans(prev => prev.map((p, pIdx) => pIdx === idx ? { ...p, description: val } : p));
                      }}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: Revenue & Reports */}
      {activeTab === 'analytics' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <h3 className="text-sm font-bold">Platform SaaS Revenue Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="font-bold text-neutral-200">Revenue Breakdown by Plan</div>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between"><span>Enterprise Plan (5 clients)</span><span className="font-mono text-emerald-400">₹250,000 / mo</span></div>
                <div className="flex justify-between"><span>Business Plan (8 clients)</span><span className="font-mono text-emerald-400">₹112,500 / mo</span></div>
                <div className="flex justify-between"><span>Growth Plan (12 clients)</span><span className="font-mono text-emerald-400">₹45,000 / mo</span></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="font-bold text-neutral-200">System Health & API Telemetry</div>
              <div className="space-y-2 pt-2 text-[11px] text-neutral-300">
                <div className="flex justify-between"><span>Gemini AI Command OS Requests</span><span className="font-mono text-blue-400">142,890 calls</span></div>
                <div className="flex justify-between"><span>WhatsApp Direct Dispatches</span><span className="font-mono text-green-400">38,120 messages</span></div>
                <div className="flex justify-between"><span>Active Cloud Databases</span><span className="font-mono text-purple-400">100% Synced</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: WhatsApp Audit Log */}
      {activeTab === 'audit' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <h3 className="text-sm font-bold">WhatsApp Subscription Dispatch Log</h3>
          <p className="text-xs text-neutral-400">Real-time log of customer subscription requests received via WhatsApp prefilled message handler.</p>
          <div className="space-y-2 font-mono text-[11px]">
            {requests.map(r => (
              <div key={r.id} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between text-neutral-300">
                <div>
                  <span className="text-amber-400 font-bold">[{r.requestedAt}]</span> {r.businessName} ({r.selectedPlan} Plan) - Owner: {r.ownerName} ({r.phone})
                </div>
                <span className="text-emerald-400">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval & Credential Assignment Modal */}
      {showApprovalModal && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="text-sm font-bold">Approve Organization & Generate Credentials</h3>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <div className="font-bold text-sm text-neutral-100">{selectedReq.businessName}</div>
                <p className="text-neutral-400">Owner: {selectedReq.ownerName} • Phone: {selectedReq.phone}</p>
                <p className="text-neutral-400">Vertical: {selectedReq.businessType} • City: {selectedReq.city}</p>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Assigned Plan Tier</label>
                <select
                  value={assignedPlan}
                  onChange={(e) => setAssignedPlan(e.target.value as PlanType)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="Free">Free</option>
                  <option value="Starter">Starter</option>
                  <option value="Growth">Growth</option>
                  <option value="Business">Business</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Generated Username</label>
                  <input
                    type="text"
                    value={generatedUsername}
                    onChange={(e) => setGeneratedUsername(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Generated Password</label>
                  <input
                    type="text"
                    value={generatedPassword}
                    onChange={(e) => setGeneratedPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[11px]">
                Upon clicking "Confirm & Send WhatsApp", the system will instantly provision the organization and launch WhatsApp with the prefilled credentials.
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={handleConfirmApproval}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Send via WhatsApp</span>
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Manual Create Org Modal */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <form onSubmit={handleManualCreateOrg} className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Building2 className="w-5 h-5" />
                <h3 className="text-sm font-bold">Manual Provision Organization</h3>
              </div>
              <button type="button" onClick={() => setShowCreateOrgModal(false)} className="text-neutral-400 hover:text-neutral-200">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Business Name</label>
                <input
                  type="text"
                  required
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Apex Global Logistics"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Business Vertical</label>
                  <select
                    value={newBusinessType}
                    onChange={(e) => setNewBusinessType(e.target.value as BusinessType)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="Retail">Retail</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Hospital / Clinic">Hospital / Clinic</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Construction">Construction</option>
                    <option value="Logistics">Logistics</option>
                    <option value="School / Institute">School / Institute</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="IT Company / CA Firm">IT Company / CA Firm</option>
                    <option value="Salon / Gym">Salon / Gym</option>
                    <option value="Service Business">Service Business</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Membership Plan</label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as PlanType)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  >
                    <option value="Free">Free</option>
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Business">Business</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">GSTIN Number</label>
                  <input
                    type="text"
                    value={newGstin}
                    onChange={(e) => setNewGstin(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Main Branch City</label>
                  <input
                    type="text"
                    value={newBranchCity}
                    onChange={(e) => setNewBranchCity(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-neutral-800">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
              >
                Provision Account
              </button>
              <button
                type="button"
                onClick={() => setShowCreateOrgModal(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
