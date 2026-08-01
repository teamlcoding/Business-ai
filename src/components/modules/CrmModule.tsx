import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, Mail, DollarSign, Calendar, ChevronRight, UserPlus, X, RefreshCw } from 'lucide-react';
import { Lead, Customer, Organization } from '../../types';
import { mockLeads } from '../../data/mockData';

interface CrmModuleProps {
  currentOrg?: Organization;
  isDarkMode: boolean;
}

const STAGES = ['Lead', 'Contacted', 'Proposal', 'Negotiation', 'Closed Won'] as const;

export const CrmModule: React.FC<CrmModuleProps> = ({ currentOrg, isDarkMode }) => {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'contacts'>('pipeline');
  
  // New Lead Modal State
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newValue, setNewValue] = useState(250000);

  // New Customer Modal State
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [custName, setCustName] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');

  const loadCustomers = () => {
    if (!currentOrg?.id) return;
    setIsLoading(true);
    const token = localStorage.getItem('businessos_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/tenant/customers?organization_id=${currentOrg.id}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
        }
      })
      .catch(err => console.error('Error fetching customers:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, [currentOrg?.id]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !currentOrg?.id) return;

    try {
      const token = localStorage.getItem('businessos_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/tenant/customers', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          organization_id: currentOrg.id,
          name: custName,
          company: custCompany || 'Independent Client',
          email: custEmail || `${custName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: custPhone || '+91 98000 00000',
          totalSpent: 0,
          outstandingBalance: 0,
          status: 'Active'
        })
      });

      if (res.ok) {
        setShowAddCustomer(false);
        setCustName('');
        setCustCompany('');
        setCustEmail('');
        setCustPhone('');
        loadCustomers();
      }
    } catch (err) {
      console.error('Error creating customer:', err);
    }
  };

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName) return;
    const lead: Lead = {
      id: `l-${Date.now()}`,
      customerName: newLeadName,
      company: newCompany || 'Independent Client',
      phone: newPhone || '+91 98000 00000',
      value: newValue,
      stage: 'Lead',
      assignedTo: 'Amit Varma',
      lastFollowUp: 'Just created'
    };
    setLeads([lead, ...leads]);
    setShowAddLead(false);
    setNewLeadName('');
  };

  const moveLeadStage = (leadId: string, direction: 'next' | 'prev') => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const currIdx = STAGES.indexOf(l.stage as any);
        let newIdx = direction === 'next' ? currIdx + 1 : currIdx - 1;
        if (newIdx >= 0 && newIdx < STAGES.length) {
          return { ...l, stage: STAGES[newIdx] };
        }
      }
      return l;
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Controls */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">CRM & Sales Pipeline Engine</h2>
          <p className="text-xs text-neutral-400">Track deal stages, customer relationship histories & sales velocity.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'pipeline' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              Sales Pipeline
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'contacts' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              Customer Directory
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'contacts' && (
              <button
                onClick={() => setShowAddCustomer(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
              </button>
            )}
            <button
              onClick={() => setShowAddLead(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Lead</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'pipeline' ? (
        /* Kanban Pipeline Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-2">
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage);
            const totalStageVal = stageLeads.reduce((acc, l) => acc + l.value, 0);

            return (
              <div
                key={stage}
                className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between ${
                  isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-xs font-bold text-neutral-200">{stage}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                      {stageLeads.length}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono font-semibold text-neutral-400">Total: ₹{totalStageVal.toLocaleString()}</p>

                  <div className="space-y-3">
                    {stageLeads.map(lead => (
                      <div
                        key={lead.id}
                        className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                          isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-neutral-100">{lead.customerName}</h4>
                          <span className="text-xs font-black text-emerald-400">₹{lead.value.toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">{lead.company}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-500">
                          <span>{lead.assignedTo}</span>
                          <div className="flex gap-1">
                            {stage !== 'Lead' && (
                              <button onClick={() => moveLeadStage(lead.id, 'prev')} className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300">
                                ←
                              </button>
                            )}
                            {stage !== 'Closed Won' && (
                              <button onClick={() => moveLeadStage(lead.id, 'next')} className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white">
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Customer Directory Table */
        <div className={`rounded-2xl border overflow-hidden ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-200 min-w-[600px]">
            <thead className={`border-b text-[10px] uppercase font-semibold text-neutral-400 tracking-wider ${
              isDarkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Company</th>
                <th className="p-4">Contact</th>
                <th className="p-4">GSTIN</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4">Outstanding</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-blue-500/5 transition-colors">
                  <td className="p-4 font-bold">{c.name}</td>
                  <td className="p-4 text-neutral-300">{c.company || 'Individual'}</td>
                  <td className="p-4 font-mono text-neutral-400">{c.phone}</td>
                  <td className="p-4 font-mono text-neutral-400">{c.gstin || 'N/A'}</td>
                  <td className="p-4 font-bold text-emerald-400">₹{c.totalSpent.toLocaleString()}</td>
                  <td className="p-4 font-bold text-amber-400">₹{c.outstandingBalance.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-semibold">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold">Add Lead to CRM</h3>
              <button onClick={() => setShowAddLead(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Contact / Client Name</label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Company Name</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Estimated Deal Value (₹)</label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
              >
                Add Lead to Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold">Add Customer to PostgreSQL</h3>
              <button onClick={() => setShowAddCustomer(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Company Name</label>
                <input
                  type="text"
                  value={custCompany}
                  onChange={(e) => setCustCompany(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  placeholder="e.g. Acro Tech Ltd"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Email</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                    placeholder="email@company.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Phone</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
              >
                Save Customer to PostgreSQL
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
