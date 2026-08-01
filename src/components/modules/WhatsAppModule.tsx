import React, { useState } from 'react';
import { MessageSquare, Key, CheckCircle2, AlertCircle, Plus, Send, RefreshCw, Zap } from 'lucide-react';
import { WhatsAppTemplate } from '../../types';
import { mockWhatsAppTemplates } from '../../data/mockData';

interface WhatsAppModuleProps {
  isDarkMode: boolean;
}

export const WhatsAppModule: React.FC<WhatsAppModuleProps> = ({ isDarkMode }) => {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(mockWhatsAppTemplates);
  const [apiKey, setApiKey] = useState('waba_live_891823912839123891');
  const [phoneNumberId, setPhoneNumberId] = useState('109283910283');
  const [simPhone, setSimPhone] = useState('+91 98201 11223');
  const [simCustomerName, setSimCustomerName] = useState('Nexus Digital Tech');
  const [simAmount, setSimAmount] = useState('106,082');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate>(mockWhatsAppTemplates[0]);

  const [logs, setLogs] = useState([
    { id: 1, phone: '+91 98201 11223', template: 'Invoice Notification', status: 'Delivered', time: '10:42 AM' },
    { id: 2, phone: '+91 97112 33445', template: 'Payment Reminder', status: 'Read', time: '09:15 AM' },
    { id: 3, phone: '+91 99870 55667', template: 'Monthly Salary Slip', status: 'Delivered', time: 'Yesterday' }
  ]);

  const handleSendTestMessage = () => {
    const formattedText = selectedTemplate.bodyText
      .replace('{{customer_name}}', simCustomerName)
      .replace('{{amount}}', `₹${simAmount}`)
      .replace('{{invoice_no}}', 'INV-2026-0891')
      .replace('{{download_link}}', 'https://businessos.ai/inv/891')
      .replace('{{company_name}}', 'Apex Global');

    const newLog = {
      id: Date.now(),
      phone: simPhone,
      template: selectedTemplate.name,
      status: 'Sent',
      time: 'Just now'
    };
    setLogs([newLog, ...logs]);
    alert(`WhatsApp Message Triggered Successfully:\n\nTo: ${simPhone}\n\nContent: "${formattedText}"`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">WhatsApp Business API Automation Hub</h2>
            <p className="text-xs text-neutral-400">Automate invoices, payment links, salary slips & CRM follow-ups directly on WhatsApp.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>API Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* API Credentials & Settings */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Key className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold">WhatsApp API Credentials</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">WhatsApp Permanent Access Token</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Phone Number ID</label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1 text-[11px]">
              <span className="text-neutral-400 font-semibold">Webhook Status</span>
              <p className="text-emerald-400 font-mono">https://api.businessos.ai/v1/whatsapp/webhook</p>
            </div>
          </div>
        </div>

        {/* Interactive Template Simulator */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              Live WhatsApp Message Simulator
            </h3>
            <span className="text-xs text-neutral-400 font-mono">{templates.length} Active Templates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Inputs */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Select WhatsApp Template</label>
                <select
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const found = templates.find(t => t.id === e.target.value);
                    if (found) setSelectedTemplate(found);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Customer Phone Number</label>
                <input
                  type="text"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Customer Name Variable</label>
                <input
                  type="text"
                  value={simCustomerName}
                  onChange={(e) => setSimCustomerName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Amount Variable (₹)</label>
                <input
                  type="text"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Chat Bubble Preview */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">Live Preview</span>
                <div className="p-3 bg-emerald-900/40 rounded-xl border border-emerald-500/30 text-xs text-emerald-100 leading-relaxed font-sans">
                  {selectedTemplate.bodyText
                    .replace('{{customer_name}}', simCustomerName)
                    .replace('{{amount}}', `₹${simAmount}`)
                    .replace('{{invoice_no}}', 'INV-2026-0891')
                    .replace('{{download_link}}', 'https://businessos.ai/inv/891')
                    .replace('{{company_name}}', 'Apex Global')}
                </div>
              </div>

              <button
                onClick={handleSendTestMessage}
                className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-green-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Dispatch WhatsApp Message</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Dispatch History Logs */}
      <div className={`p-5 rounded-2xl border space-y-3 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Recent WhatsApp Automated Message Logs</h3>
        <div className="divide-y divide-neutral-800/60">
          {logs.map(log => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <div>
                  <span className="font-semibold text-neutral-200">{log.phone}</span>
                  <span className="text-neutral-500 ml-2">({log.template})</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-neutral-400">
                <span className="text-[10px] font-mono">{log.time}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
