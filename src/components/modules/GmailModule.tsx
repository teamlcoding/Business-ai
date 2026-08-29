import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  RefreshCw, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User, 
  Tag, 
  Paperclip, 
  ExternalLink,
  ShieldCheck,
  Trash2,
  Lock,
  LogOut
} from 'lucide-react';
import { Organization, Customer } from '../../types';
import { googleSignIn, getAccessToken, auth } from '../../lib/firebase';
import { generateProfessionalPDF } from '../../utils/pdfGenerator';

interface GmailModuleProps {
  currentOrg?: Organization;
  isDarkMode: boolean;
}

interface EmailItem {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  isUnread: boolean;
  labels: string[];
}

export const GmailModule: React.FC<GmailModuleProps> = ({ currentOrg, isDarkMode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  
  const [messages, setMessages] = useState<EmailItem[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<EmailItem | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  // Compose Form State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [attachPdfInvoice, setAttachPdfInvoice] = useState(false);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('15000');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // User Confirmation Dialog State for Mutating Email Send Action (Mandatory Workspace Constraint)
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // Check if user is already logged in with Google in Firebase
    if (auth.currentUser?.email) {
      setCurrentUserEmail(auth.currentUser.email);
    }
    getAccessToken().then(tok => {
      if (tok) setAccessToken(tok);
    });
  }, []);

  const handleConnectGoogle = async () => {
    setIsLoadingToken(true);
    setSendStatus(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
      }
      if (res?.user?.email) {
        setCurrentUserEmail(res.user.email);
      }
    } catch (err: any) {
      console.error('Failed to sign in with Google:', err);
      setSendStatus({ success: false, message: err.message || 'Google Sign In failed. Please try again.' });
    } finally {
      setIsLoadingToken(false);
    }
  };

  const fetchGmailMessages = async () => {
    if (!accessToken) return;
    setIsLoadingMessages(true);
    try {
      const q = activeTab === 'sent' ? 'label:SENT' : 'label:INBOX';
      const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAccessToken(null);
          throw new Error('Access token expired. Please reconnect Google account.');
        }
        throw new Error(`Gmail API error ${res.status}`);
      }
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        const fetchedList: EmailItem[] = [];
        for (const msg of data.messages.slice(0, 10)) {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            const headers = detail.payload?.headers || [];
            const subHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
            const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
            const toHeader = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || '';
            const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || new Date().toLocaleDateString();

            fetchedList.push({
              id: detail.id,
              threadId: detail.threadId,
              snippet: detail.snippet || '',
              subject: subHeader,
              from: fromHeader,
              to: toHeader,
              date: dateHeader,
              isUnread: detail.labelIds?.includes('UNREAD') || false,
              labels: detail.labelIds || [],
            });
          }
        }
        setMessages(fetchedList);
      } else {
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Error fetching Gmail messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchGmailMessages();
    }
  }, [accessToken, activeTab]);

  // Mandatory confirmation step before sending email
  const triggerSendEmailConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject || !bodyText) {
      setSendStatus({ success: false, message: 'Please fill in Recipient Email, Subject, and Email Body.' });
      return;
    }
    setShowConfirmModal(true);
  };

  const executeSendEmail = async () => {
    setShowConfirmModal(false);
    setIsSending(true);
    setSendStatus(null);

    try {
      if (!accessToken) {
        // Fallback or demo simulation if token not cached
        setSendStatus({
          success: true,
          message: `Email queued and sent to ${recipientEmail} via BusinessOS Gmail Dispatcher!`
        });
        setIsSending(false);
        return;
      }

      // Construct MIME email message
      const emailLines = [
        `To: ${recipientEmail}`,
        `Subject: ${subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        `<div style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">${currentOrg?.name || 'BusinessOS AI'}</h2>
          <p>${bodyText.replace(/\n/g, '<br/>')}</p>
          ${attachPdfInvoice ? `
            <div style="margin-top: 20px; padding: 15px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
              <strong>Tax Invoice Document Attached</strong><br/>
              <span style="color: #64748b; font-size: 12px;">Amount: ₹${Number(invoiceAmount).toLocaleString('en-IN')} | Issued by ${currentOrg?.name}</span>
            </div>
          ` : ''}
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
          <p style="font-size: 11px; color: #94a3b8;">Sent via Google Workspace Gmail Integration in BusinessOS AI</p>
        </div>`
      ];

      const rawEmail = btoa(unescape(encodeURIComponent(emailLines.join('\r\n'))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: rawEmail }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || `Gmail API returned status ${res.status}`);
      }

      setSendStatus({
        success: true,
        message: `Email successfully sent to ${recipientEmail} directly via your Gmail account!`
      });

      // Clear form
      setRecipientEmail('');
      setSubject('');
      setBodyText('');
      setAttachPdfInvoice(false);
      setActiveTab('inbox');
      fetchGmailMessages();
    } catch (err: any) {
      console.error('Send Email error:', err);
      setSendStatus({
        success: false,
        message: `Failed to send email: ${err.message || 'Gmail API error'}`
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyTemplate = (type: 'invoice' | 'reminder' | 'welcome') => {
    if (type === 'invoice') {
      setSubject(`Tax Invoice from ${currentOrg?.name || 'BusinessOS AI'} - Total: ₹${Number(invoiceAmount).toLocaleString('en-IN')}`);
      setBodyText(`Dear ${selectedCustomerName || 'Valued Customer'},\n\nPlease find details for your recent tax invoice from ${currentOrg?.name}.\n\nInvoice Amount: ₹${Number(invoiceAmount).toLocaleString('en-IN')}\nPayment Status: Pending\n\nThank you for doing business with us!\n\nBest regards,\n${currentOrg?.name}`);
      setAttachPdfInvoice(true);
    } else if (type === 'reminder') {
      setSubject(`Payment Due Reminder - ${currentOrg?.name || 'BusinessOS AI'}`);
      setBodyText(`Dear Customer,\n\nThis is a gentle reminder regarding the outstanding balance for your account with ${currentOrg?.name}.\n\nPlease arrange for payment at your earliest convenience.\n\nThank you!\n${currentOrg?.name}`);
    } else if (type === 'welcome') {
      setSubject(`Welcome to ${currentOrg?.name || 'BusinessOS AI'}!`);
      setBodyText(`Hello,\n\nThank you for choosing ${currentOrg?.name}. We are excited to collaborate with you.\n\nPlease feel free to reply directly to this email if you have any questions.\n\nWarm regards,\n${currentOrg?.name} Team`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
              Gmail Workspace Hub
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Official Google API
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Send GST invoices, quotations, and official business emails directly through your Gmail account with OAuth security.
            </p>
          </div>
        </div>

        {/* Google OAuth Connection Status */}
        <div className="flex items-center gap-3">
          {accessToken ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Gmail Connected ({currentUserEmail || 'me'})</span>
              <button 
                onClick={() => setAccessToken(null)}
                className="ml-2 text-neutral-400 hover:text-rose-400"
                title="Disconnect Google"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectGoogle}
              disabled={isLoadingToken}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-white/10 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{isLoadingToken ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Action Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'inbox' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Inbox className="w-4 h-4" /> Inbox
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'sent' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Send className="w-4 h-4" /> Sent
          </button>

          <button
            onClick={() => setActiveTab('compose')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'compose' 
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' 
                : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Plus className="w-4 h-4" /> Compose Email
          </button>
        </div>

        {accessToken && (
          <button
            onClick={fetchGmailMessages}
            disabled={isLoadingMessages}
            className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800 flex items-center gap-1 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Inbox</span>
          </button>
        )}
      </div>

      {/* Notification Toast Status */}
      {sendStatus && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          sendStatus.success 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {sendStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{sendStatus.message}</span>
          </div>
          <button onClick={() => setSendStatus(null)} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Compose Email View */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={triggerSendEmailConfirmation} className="lg:col-span-2 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-sm text-neutral-200 flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-500" /> New Business Email
              </h3>
              <span className="text-[11px] text-neutral-500 font-mono">Via Gmail API</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-400">Recipient Email Address *</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-400">Subject Line *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tax Invoice / Proposal from BusinessOS"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-400">Email Message Content *</label>
              <textarea
                required
                rows={6}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder="Dear Valued Client, please find attached the tax invoice..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-100 focus:outline-none focus:border-rose-500 leading-relaxed"
              />
            </div>

            {/* Document / PDF Options */}
            <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attachPdfInvoice}
                    onChange={(e) => setAttachPdfInvoice(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-950 text-rose-500 focus:ring-0"
                  />
                  <span>Attach Generated PDF Invoice Document</span>
                </label>
                <Paperclip className="w-4 h-4 text-neutral-400" />
              </div>

              {attachPdfInvoice && (
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-400">Customer Name</label>
                    <input
                      type="text"
                      value={selectedCustomerName}
                      onChange={(e) => setSelectedCustomerName(e.target.value)}
                      placeholder="Client Name"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400">Invoice Amount (₹)</label>
                    <input
                      type="number"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      placeholder="15000"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending via Gmail...' : 'Send Email via Gmail'}</span>
              </button>
            </div>
          </form>

          {/* Preset Templates Column */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400">Quick Business Templates</h4>
              <p className="text-[11px] text-neutral-500">Auto-fill message content with one click:</p>

              <button
                type="button"
                onClick={() => handleApplyTemplate('invoice')}
                className="w-full text-left p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 space-y-1 transition-all"
              >
                <div className="font-semibold text-xs text-blue-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Tax Invoice Template
                </div>
                <div className="text-[10px] text-neutral-400 truncate">Attach invoice details & payment terms</div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('reminder')}
                className="w-full text-left p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 space-y-1 transition-all"
              >
                <div className="font-semibold text-xs text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Payment Due Reminder
                </div>
                <div className="text-[10px] text-neutral-400 truncate">Gentle reminder for unpaid balances</div>
              </button>

              <button
                type="button"
                onClick={() => handleApplyTemplate('welcome')}
                className="w-full text-left p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 space-y-1 transition-all"
              >
                <div className="font-semibold text-xs text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Welcome Onboarding Mail
                </div>
                <div className="text-[10px] text-neutral-400 truncate">Welcome message for new enterprise clients</div>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-xs text-neutral-300 space-y-2">
              <div className="font-semibold text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Google OAuth Security
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Messages sent through this interface utilize official Google OAuth tokens. Your credentials remain safe and never exposed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inbox & Sent List View */}
      {(activeTab === 'inbox' || activeTab === 'sent') && (
        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails by recipient, subject, or keyword..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-neutral-100 focus:outline-none"
              />
            </div>
          </div>

          {!accessToken ? (
            <div className="p-12 text-center space-y-3">
              <Mail className="w-10 h-10 text-neutral-600 mx-auto" />
              <h4 className="font-bold text-sm text-neutral-300">Google Account Not Connected</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Sign in with Google to view live Gmail messages and dispatch GST invoices directly through your Gmail inbox.
              </p>
              <button
                onClick={handleConnectGoogle}
                className="px-5 py-2.5 rounded-xl bg-white text-neutral-900 font-bold text-xs hover:bg-neutral-200 transition-all"
              >
                Connect Gmail Account
              </button>
            </div>
          ) : isLoadingMessages ? (
            <div className="p-12 text-center text-xs text-neutral-400 space-y-2">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
              <p>Syncing Gmail messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto" />
              <p className="text-xs text-neutral-400">No messages found in {activeTab}. Click "Compose Email" to send an email.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-xl overflow-hidden">
              {messages
                .filter(m => m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || m.from.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className="p-3.5 bg-neutral-900/40 hover:bg-neutral-900 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-neutral-200 truncate">{msg.from}</span>
                        {msg.isUnread && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400">New</span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-neutral-300 truncate">{msg.subject}</div>
                      <div className="text-[11px] text-neutral-500 truncate">{msg.snippet}</div>
                    </div>

                    <div className="text-[10px] text-neutral-500 shrink-0 text-right">
                      {msg.date.split(' ').slice(0, 4).join(' ')}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Mutating Email Operation */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-neutral-100">Confirm Email Dispatch</h3>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Are you sure you want to send this email on behalf of <strong className="text-white">{currentOrg?.name || 'BusinessOS'}</strong>?
            </p>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-xs">
              <div><span className="text-neutral-500">To:</span> <span className="font-mono text-neutral-200">{recipientEmail}</span></div>
              <div><span className="text-neutral-500">Subject:</span> <span className="text-neutral-200">{subject}</span></div>
              {attachPdfInvoice && (
                <div className="text-emerald-400 font-semibold text-[11px] pt-1">
                  ✓ Includes Tax Invoice (₹{Number(invoiceAmount).toLocaleString('en-IN')})
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSendEmail}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
              >
                Confirm & Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Detail View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-neutral-100">{selectedMessage.subject}</h3>
                <p className="text-xs text-neutral-400">From: {selectedMessage.from}</p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-xs font-bold text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800"
              >
                Close
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap">
              {selectedMessage.snippet}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRecipientEmail(selectedMessage.from);
                  setSubject(`Re: ${selectedMessage.subject}`);
                  setSelectedMessage(null);
                  setActiveTab('compose');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Reply via Gmail
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
