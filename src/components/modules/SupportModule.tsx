import React, { useState } from 'react';
import { Headphones, Send, Sparkles, MessageSquare, CheckCircle2, Clock, User } from 'lucide-react';
import { SupportTicket } from '../../types';
import { mockTickets } from '../../data/mockData';

interface SupportModuleProps {
  isDarkMode: boolean;
}

export const SupportModule: React.FC<SupportModuleProps> = ({ isDarkMode }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am BusinessOS AI Support Assistant. How can I assist your customer queries today?' },
    { sender: 'user', text: 'How do I issue a credit note for a returned order?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

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
        body: JSON.stringify({ prompt: `Customer Support Query: ${userMsg}`, businessType: 'General Enterprise' })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'bot', text: data.response || 'To issue a credit note, navigate to Documents & GST Studio, click "Generate New Document" and select "Credit Note" from the document type dropdown.' }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: 'bot', text: 'To issue a credit note, navigate to Documents & GST Studio, click "Generate New Document" and select "Credit Note" from the document type dropdown.' }]);
    } finally {
      setIsBotThinking(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">Customer Support & AI Helpdesk</h2>
          <p className="text-xs text-neutral-400">Automated AI ticket resolution & live customer inquiry assistant.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Support Tickets Queue */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Active Customer Tickets</h3>
            <span className="text-xs font-mono text-blue-400">{tickets.length} Tickets</span>
          </div>

          <div className="space-y-3">
            {tickets.map(tck => (
              <div key={tck.id} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-400">{tck.ticketNo}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    tck.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {tck.priority} Priority
                  </span>
                </div>
                <h4 className="font-bold text-neutral-200">{tck.subject}</h4>
                <p className="text-[11px] text-neutral-400">Customer: {tck.customerName} • {tck.createdAt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live AI Customer Bot Chat */}
        <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800 text-xs font-bold text-blue-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Automated Support Agent</span>
          </div>

          <div className="flex-1 space-y-3 max-h-80 overflow-y-auto p-2">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 text-[10px] font-bold">
                    AI
                  </div>
                )}
                <div className={`p-3 rounded-2xl max-w-xs leading-relaxed ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-950 border border-neutral-800 text-neutral-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isBotThinking && (
              <div className="text-[11px] text-neutral-400 italic animate-pulse">AI is formulating response...</div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-neutral-800">
            <input
              type="text"
              placeholder="Ask support bot..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none"
            />
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
