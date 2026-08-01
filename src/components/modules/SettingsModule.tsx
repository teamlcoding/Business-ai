import React, { useState } from 'react';
import { Settings, Building2, ShieldCheck, Zap, Key, Save, Palette, MessageSquare, Globe, DollarSign } from 'lucide-react';
import { Organization, PlanType } from '../../types';

interface SettingsModuleProps {
  currentOrg: Organization;
  onUpdateOrgName: (name: string) => void;
  onOpenUpgradeModal: () => void;
  isDarkMode: boolean;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  currentOrg,
  onUpdateOrgName,
  onOpenUpgradeModal,
  isDarkMode
}) => {
  const [orgName, setOrgName] = useState(currentOrg.name);
  const [gstin, setGstin] = useState(currentOrg.gstin);
  const [address, setAddress] = useState('Suite 402, Trade Tower, Lower Parel, Mumbai, MH');
  const [phone, setPhone] = useState('+91 98201 11223');
  const [logoUrl, setLogoUrl] = useState(currentOrg.logoUrl || '');
  
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrgName(orgName);
    alert('Business Settings & Customization Preferences saved successfully! System themes and WhatsApp defaults updated.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">Business Settings & Customization</h2>
          <p className="text-xs text-neutral-400">Configure company branding, invoice/receipt themes, default WhatsApp templates, currency, and bank details.</p>
        </div>

        <button
          onClick={onOpenUpgradeModal}
          className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Manage Plan: {currentOrg.plan}</span>
        </button>
      </div>

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
            <span>Save All Configurations</span>
          </button>
        </div>

      </form>

    </div>
  );
};
