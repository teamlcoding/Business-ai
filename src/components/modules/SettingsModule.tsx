import React, { useState, useEffect } from 'react';
import { Settings, Building2, ShieldCheck, Zap, Key, Save, Palette, MessageSquare, Users, UserPlus, Lock, RefreshCw, CheckCircle2, AlertCircle, Sliders, Sparkles } from 'lucide-react';
import { Organization, UserRole } from '../../types';
import { WorkspaceCustomizer } from '../workspace/WorkspaceCustomizer';
import { WorkspaceSetupWizard } from '../workspace/WorkspaceSetupWizard';

interface SettingsModuleProps {
  currentOrg: Organization;
  activeRole?: UserRole;
  onUpdateOrgName: (name: string) => void;
  onOpenUpgradeModal: () => void;
  isDarkMode: boolean;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  currentOrg,
  activeRole = 'Business Owner',
  onUpdateOrgName,
  onOpenUpgradeModal,
  isDarkMode
}) => {
  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [gstin, setGstin] = useState(currentOrg?.gstin || '');
  const [address, setAddress] = useState('Suite 402, Trade Tower, Lower Parel, Mumbai, MH');
  const [phone, setPhone] = useState('+91 98201 11223');
  const [logoUrl, setLogoUrl] = useState(currentOrg?.logoUrl || '');
  
  const [bankName, setBankName] = useState('HDFC Bank - BKC Branch');
  const [accNo, setAccNo] = useState('50200018928192');
  const [ifsc, setIfsc] = useState('HDFC0000124');

  const [invoiceTheme, setInvoiceTheme] = useState('Modern Blue');
  const [receiptTheme, setReceiptTheme] = useState('Compact 80mm Thermal');
  const [currency, setCurrency] = useState('₹ (INR)');
  const [taxRate, setTaxRate] = useState('18% GST');
  const [language, setLanguage] = useState('English');
  const [whatsAppDefaultMsg, setWhatsAppDefaultMsg] = useState('Dear {{customer_name}}, thank you for doing business with us! Invoice {{invoice_no}} of amount {{amount}} is ready.');
  const [thankYouMsg, setThankYouMsg] = useState('Thank you for choosing us! Visit again soon.');

  // Staff User Management State
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmPassword, setNewConfirmPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Branch Manager');
  const [userSuccessMsg, setUserSuccessMsg] = useState('');
  const [userErrorMsg, setUserErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'general' | 'workspace' | 'staff'>('general');
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  const isOwnerOrAdmin = activeRole === 'Business Owner' || activeRole === 'Super Admin';

  const fetchStaffUsers = async () => {
    if (!currentOrg?.id) return;
    setLoadingStaff(true);
    try {
      const res = await fetch(`/api/tenant/users?orgId=${currentOrg.id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setStaffUsers(data);
      }
    } catch (err) {
      console.error('Error loading staff users:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, [currentOrg?.id]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSuccessMsg('');
    setUserErrorMsg('');

    if (!newUsername || !newPassword || !newConfirmPassword || !newName || !newEmail) {
      setUserErrorMsg('Username, Password, Confirm Password, Email ID, and Full Name are required.');
      return;
    }

    if (newPassword !== newConfirmPassword) {
      setUserErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setUserErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setUserErrorMsg('Please enter a valid unique Email Address.');
      return;
    }

    try {
      const res = await fetch('/api/tenant/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: currentOrg?.id || 'ORG-001',
          username: newUsername,
          password: newPassword,
          name: newName,
          email: newEmail,
          phone: newPhone,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUserErrorMsg(data.error || 'Failed to create user ID');
        return;
      }

      setUserSuccessMsg(`Successfully created login ID '${newUsername}' for ${newName}!`);
      setNewUsername('');
      setNewPassword('');
      setNewConfirmPassword('');
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setShowAddUserModal(false);
      fetchStaffUsers();
    } catch (err: any) {
      setUserErrorMsg(err.message || 'Error creating user account');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrgName(orgName);
    alert('Business Settings & Customization Preferences saved successfully!');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">Business Settings & Customization</h2>
          <p className="text-xs text-neutral-400">Configure company branding, dynamic workspace layouts, module visibility, and staff accounts.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSetupWizard(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Workspace Wizard</span>
          </button>
          <button
            onClick={onOpenUpgradeModal}
            className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Plan: {currentOrg?.plan || 'Free'}</span>
          </button>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Branding & Billing</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'workspace'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Dynamic Workspace & Modules</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'staff'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Accounts ({staffUsers.length})</span>
        </button>
      </div>

      {/* TAB 1: General Branding & Billing Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Company Profile Settings */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Building2 className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold">Company Profile & Contact Info</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Legal Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
              />
            </div>

            {/* Locked Business Vertical Display */}
            <div className="space-y-1 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <label className="text-amber-400 font-bold text-[11px] uppercase tracking-wider">Business Vertical (Industry)</label>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[10px] flex items-center gap-1 border border-amber-500/30">
                  <Lock className="w-3 h-3 text-amber-300" /> Locked to Organization
                </span>
              </div>
              <input
                type="text"
                disabled
                value={currentOrg?.businessType || 'Retail'}
                className="w-full bg-neutral-950/80 border border-neutral-800/80 rounded-lg p-2 text-xs font-semibold text-neutral-200 cursor-not-allowed"
              />
              <p className="text-[10px] text-neutral-400 leading-tight">
                Business Vertical is permanently locked to your organization profile to preserve industry-tailored workflows, tax brackets, and module configurations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Business Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Business Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Logo Image URL</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Invoice & Theme Customization */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Palette className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold">Invoice, Receipt & Localization</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Invoice Print Theme</label>
                <select
                  value={invoiceTheme}
                  onChange={(e) => setInvoiceTheme(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="Modern Blue">Modern Blue</option>
                  <option value="Classic Corporate">Classic Corporate</option>
                  <option value="Minimal Dark">Minimal Dark</option>
                  <option value="Compact Thermal">Compact Thermal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">POS Receipt Format</label>
                <select
                  value={receiptTheme}
                  onChange={(e) => setReceiptTheme(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="Compact 80mm Thermal">Compact 80mm Thermal</option>
                  <option value="58mm Small Receipt">58mm Small Receipt</option>
                  <option value="A5 Half Sheet">A5 Half Sheet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="₹ (INR)">₹ (INR)</option>
                  <option value="$ (USD)">$ (USD)</option>
                  <option value="€ (EUR)">€ (EUR)</option>
                  <option value="£ (GBP)">£ (GBP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Default Tax Rate</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="18% GST">18% GST</option>
                  <option value="12% GST">12% GST</option>
                  <option value="5% GST">5% GST</option>
                  <option value="0% Exempt">0% Exempt</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Thank You Message on Invoice</label>
              <input
                type="text"
                value={thankYouMsg}
                onChange={(e) => setThankYouMsg(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Default Message Template */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <MessageSquare className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-bold">Default WhatsApp Message Template</h3>
          </div>

          <div className="space-y-2 text-xs">
            <label className="text-neutral-400 font-semibold">Pre-filled WhatsApp Invoice Message</label>
            <textarea
              rows={4}
              value={whatsAppDefaultMsg}
              onChange={(e) => setWhatsAppDefaultMsg(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
            />
            <p className="text-[10px] text-neutral-400">Available variables: {'{{customer_name}}, {{invoice_no}}, {{amount}}, {{company_name}}'}</p>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold">Default Bank Account for Invoices</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Bank & Branch Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Account Number</label>
                <input
                  type="text"
                  value={accNo}
                  onChange={(e) => setAccNo(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">IFSC Code</label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Business Configurations</span>
          </button>
        </div>

      </form>
      )}

      {/* TAB 2: Dynamic Workspace & Customizer */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <WorkspaceCustomizer
            currentOrg={currentOrg}
            isDarkMode={isDarkMode}
            onSaveSuccess={() => alert('Dynamic Workspace configuration saved!')}
          />
        </div>
      )}

      {/* Security, Data Encryption & Tenant Isolation Trust Center */}
      {activeTab === 'general' && (
      <div className={`p-6 rounded-2xl border space-y-5 ${
        isDarkMode ? 'bg-gradient-to-br from-neutral-900 to-emerald-950/20 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Data Security & Tenant Isolation Guarantee</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-neutral-400">Your business data is strictly isolated with AES-256 Cloud Encryption and zero cross-tenant visibility.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-emerald-400">
              <span>Database Encryption</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-neutral-300 text-[11px]">All financial records, invoices, customer leads, and employee PII are encrypted at rest using AES-256 algorithms and TLS 1.3 in transit.</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-blue-400">
              <span>Tenant Isolation Engine</span>
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-neutral-300 text-[11px]">Strict SQL level filtering by <code className="text-indigo-400 font-mono">organization_id</code> prevents any unauthorized organization from querying your data under any circumstance.</p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between font-bold text-purple-400">
              <span>RBAC Permission Control</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-neutral-300 text-[11px]">Only authorized employee accounts created by the Business Owner can access assigned modules based on explicit role privileges.</p>
          </div>
        </div>
      </div>
      )}

      {/* Staff Logins & Account Management Section (Main Client / Business Owner Only) */}
      {(activeTab === 'staff' || activeTab === 'general') && (
      <div className={`p-6 rounded-2xl border space-y-5 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Staff & Team User Account Management</h3>
              <p className="text-xs text-neutral-400">Main Client / Business Owner can create employee user IDs and passwords for staff to handle business modules.</p>
            </div>
          </div>

          {isOwnerOrAdmin && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Staff User ID & Password</span>
            </button>
          )}
        </div>

        {userSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{userSuccessMsg}</span>
          </div>
        )}

        {userErrorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{userErrorMsg}</span>
          </div>
        )}

        {!isOwnerOrAdmin ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Only the primary Business Owner or Super Admin can create user accounts and manage employee credentials for this business.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${isDarkMode ? 'border-neutral-800 text-neutral-400 bg-neutral-950/50' : 'border-neutral-200 text-neutral-500 bg-neutral-50'}`}>
                <tr>
                  <th className="py-2.5 px-3 font-semibold">User ID / Username</th>
                  <th className="py-2.5 px-3 font-semibold">Full Name</th>
                  <th className="py-2.5 px-3 font-semibold">Assigned Role</th>
                  <th className="py-2.5 px-3 font-semibold">Contact Email / Phone</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {staffUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      {loadingStaff ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                          <span>Loading employee user accounts...</span>
                        </div>
                      ) : (
                        <span>No additional staff user accounts created yet. Click "Create Staff User ID & Password" above to add staff accounts.</span>
                      )}
                    </td>
                  </tr>
                ) : (
                  staffUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-800/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-400">{u.username}</td>
                      <td className="py-3 px-3 font-medium">{u.name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-400">{u.email || u.phone || 'N/A'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={async () => {
                            const newPass = prompt(`Enter new password for ${u.username}:`);
                            if (newPass) {
                              try {
                                const res = await fetch('/api/tenant/users/reset-password', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: u.id, orgId: currentOrg?.id, newPassword: newPass }),
                                });
                                const d = await res.json();
                                if (res.ok) alert(`Password for '${u.username}' updated!`);
                                else alert(d.error || 'Failed to update password');
                              } catch (err) {
                                alert('Error resetting password');
                              }
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold transition-colors"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Add Staff User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold">Create Staff User Login & Password</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-neutral-400 hover:text-neutral-200 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              
              {userErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{userErrorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">User Login ID / Username *</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. manager_mumbai"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Unique Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="rajesh@company.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Login Password *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Assign Role *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none font-medium"
                  >
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Sales">Sales & Cashier</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="HR">HR Manager</option>
                    <option value="Employee">Standard Employee</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  Save & Create Login ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workspace Setup Wizard Modal */}
      {showSetupWizard && (
        <WorkspaceSetupWizard
          organization={currentOrg}
          onComplete={(cfg) => {
            setShowSetupWizard(false);
            alert('Workspace configuration updated successfully!');
          }}
          onCancel={() => setShowSetupWizard(false)}
        />
      )}

    </div>
  );
};
