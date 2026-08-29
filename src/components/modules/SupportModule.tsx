import React, { useState, useEffect } from 'react';
import { Headphones, Send, Sparkles, MessageSquare, CheckCircle2, Clock, User, Plus, Filter, AlertCircle, ShieldAlert } from 'lucide-react';
import { HelpdeskTicket, Organization } from '../../types';

interface SupportModuleProps {
  currentOrg?: Organization;
  isDarkMode?: boolean;
}

export const SupportModule: React.FC<SupportModuleProps> = ({ currentOrg, isDarkMode = false }) => {
  const orgId = currentOrg?.id || 'ORG-001';
  const bizType = currentOrg?.businessType || 'Retail';

  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commSettings, setCommSettings] = useState({
    officialWhatsappNumber: '+91 9028310199',
    supportEmail: 'team.lcoding@gmail.com',
  });

  // Modal / New Ticket State
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('General Query');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Filter
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: `Hello! I am BusinessOS AI Helpdesk Assistant for ${currentOrg?.name || 'your business'}. How can I assist with client queries or ticket escalation today?` },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  useEffect(() => {
    loadHelpdeskData();
  }, [orgId]);

  const loadHelpdeskData = async () => {
    try {
      setLoading(true);
      // Fetch Tickets
      const res = await fetch(`/api/helpdesk/tickets?orgId=${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }

      // Fetch Communication Settings
      const commRes = await fetch('/api/system/communication-settings');
      if (commRes.ok) {
        const commData = await commRes.json();
        if (commData.officialWhatsappNumber) {
          setCommSettings({
            officialWhatsappNumber: commData.officialWhatsappNumber,
            supportEmail: commData.supportEmail || 'team.lcoding@gmail.com',
          });
        }
      }
    } catch (err) {
      console.error('Error loading helpdesk tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/helpdesk/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization_id: orgId,
          subject,
          description,
          category,
          priority,
          createdByName: currentOrg?.name || 'Store Admin',
          createdByEmail: commSettings.supportEmail,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setTickets([created, ...tickets]);
        setSubject('');
        setDescription('');
        setShowNewModal(false);
      }
    } catch (err) {
      console.error('Error creating helpdesk ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/helpdesk/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsBotThinking(true);

    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Industry Helpdesk Query (${bizType}): ${userMsg}`, businessType: bizType })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.response || 'Your support ticket request has been analyzed and logged for automated resolution.' }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'Thank you. Your inquiry has been routed to the senior support desk team.' }]);
    } finally {
      setIsBotThinking(false);
    }
  };

  // Industry-Aware Categories
  const getCategoriesForIndustry = () => {
    const bt = bizType.toLowerCase();
    if (bt.includes('restaurant')) return ['Food Order Delay', 'Table Booking Query', 'Delivery Refund', 'Kitchen KOT Error', 'Special Dietary Request'];
    if (bt.includes('ca')) return ['GST Filing Issue', 'Tax Audit Query', 'Client Document Request', 'ROC Compliance', 'Bank Recon Discrepancy'];
    if (bt.includes('hospital')) return ['Appointment Scheduling', 'Billing & Claims Inquiry', 'Pharmacy Stock Alert', 'Lab Test Report Issue', 'Patient Admission'];
    if (bt.includes('it')) return ['Technical Bug', 'SLA Incident', 'Client Change Request', 'Server Outage', 'Security Audit'];
    if (bt.includes('construction')) return ['Site Material Delay', 'Labour Attendance Issue', 'Contractor RA Bill Discrepancy', 'Machinery Breakdown', 'Safety Concern'];
    if (bt.includes('real')) return ['Site Visit Schedule', 'Booking Cancellation', 'Installment Query', 'Agreement Issue', 'Broker Commission'];
    return ['Customer Complaint', 'Product Return', 'Billing Discrepancy', 'Delivery Issue', 'Defective Item'];
  };

  const categories = getCategoriesForIndustry();

  const filteredTickets = selectedStatus === 'All'
    ? tickets
    : tickets.filter(t => t.status.toLowerCase() === selectedStatus.toLowerCase());

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full uppercase">
              {bizType} Industry Helpdesk
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Industry-Aware Support & Helpdesk</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage SLA tickets, customer complaints, and Super Admin escalation for {currentOrg?.name || 'Organization'}.</p>
        </div>

        {/* Super Admin Contact Badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 text-white border border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Official Helpdesk & Subscription Desk</div>
            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${commSettings.officialWhatsappNumber.replace(/[^0-9]/g, '')}?text=Helpdesk%20Support%20Request%20for%20${encodeURIComponent(currentOrg?.name || 'Enterprise')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current" />
                <span>{commSettings.officialWhatsappNumber}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Support Tickets ({filteredTickets.length})</h3>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Raise Ticket
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading support tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div className="text-sm font-bold text-slate-800">No active support tickets</div>
                <p className="text-xs text-slate-500">All customer issues and support requests are currently resolved.</p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 mt-2"
                >
                  Create New Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((tck) => (
                  <div key={tck.id} className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {tck.ticketNumber || tck.id}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{tck.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tck.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                          tck.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {tck.priority} Priority
                        </span>
                        <select
                          value={tck.status}
                          onChange={(e) => handleUpdateStatus(tck.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            tck.status === 'Open' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            tck.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{tck.subject}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{tck.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Created by: <b>{tck.createdByName}</b></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> SLA: {tck.slaHours || 24}h target
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Support Assistant Chatbox */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 flex flex-col h-[520px]">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">AI Helpdesk Assistant</h3>
              <p className="text-[11px] text-slate-400">Instant AI troubleshooting & automated ticket resolution</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs my-2">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isBotThinking && (
              <div className="text-slate-400 text-[11px] animate-pulse">AI Assistant analyzing response...</div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI helpdesk assistant..."
              className="flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Modal: New Ticket */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Raise Industry Support Ticket</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Category ({bizType})</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 font-bold rounded-lg border text-center transition-all ${
                        priority === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject / Summary</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. GST Invoice Tax calculation query for bulk order"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Details & Notes</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
