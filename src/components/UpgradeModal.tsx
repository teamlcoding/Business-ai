import React from 'react';
import { Check, Zap, X, Shield, Sparkles } from 'lucide-react';
import { PlanType, Organization } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrg: Organization;
  onUpgradePlan: (plan: PlanType) => void;
  isDarkMode: boolean;
}

const PLANS: { name: PlanType; price: string; description: string; features: string[]; highlight?: boolean }[] = [
  {
    name: 'Free',
    price: '$0 / mo',
    description: 'Basic single-branch POS & billing for small vendors',
    features: ['Single Branch', 'Basic Billing & Receipts', '1 User Access', 'Up to 50 Monthly Invoices']
  },
  {
    name: 'Starter',
    price: '$29 / mo',
    description: 'For growing retail shops & service businesses',
    features: ['Up to 2 Branches', 'POS & Inventory Alerts', 'GST & PDF Invoice Generator', '3 User Accounts', 'WhatsApp Basic Reminders']
  },
  {
    name: 'Growth',
    price: '$79 / mo',
    description: 'Complete suite with CRM, HR & Finance analytics',
    features: ['Up to 5 Branches', 'CRM Sales Pipeline', 'HR Payroll & Attendance', 'WhatsApp API Automated Workflows', 'Recharts Financial Dashboards'],
    highlight: true
  },
  {
    name: 'Business',
    price: '$199 / mo',
    description: 'Multi-tenant architecture & AI Resume Screening',
    features: ['Unlimited Branches', 'Full AI Resume Screening', 'Multi-Warehouse Inventory Transfer', 'Custom Invoice Templates', 'Dedicated Priority Support']
  },
  {
    name: 'Enterprise',
    price: 'Contact Sales',
    description: 'Full custom microservice readiness & SLA guarantee',
    features: ['Unlimited Multi-Tenancy', 'Custom Gemini AI Models & Live Voice API', 'Dedicated Account Manager', 'Custom REST & Webhook Integrations', '99.99% Uptime Guarantee']
  }
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentOrg,
  onUpgradePlan,
  isDarkMode
}) => {
  if (!isOpen) return null;

  const handleSelectPlan = async (plan: PlanType) => {
    if (plan === 'Free') {
      onUpgradePlan('Free');
      onClose();
      return;
    }

    // Paid Plan: Create registration request in PostgreSQL as 'Pending Approval' and trigger WhatsApp
    try {
      const res = await fetch('/api/subscriptions/request-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: currentOrg?.name || 'My Enterprise',
          ownerName: 'Business Owner',
          phone: '+91 9028310199',
          businessType: currentOrg?.businessType || 'Retail',
          selectedPlan: plan,
          requirements: `Subscription Plan Upgrade to ${plan} (Pending Super Admin Approval)`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank');
        }
        alert(`Your request for the ${plan} Plan has been submitted to Super Admin for approval.`);
      }
    } catch (err) {
      console.error('Error submitting plan request:', err);
    }

    onUpgradePlan(plan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
      }`}>
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">BusinessOS Membership Plans</h2>
              <p className="text-xs text-neutral-400">Current Active Plan for {currentOrg?.name || 'Organization'}: <span className="font-semibold text-amber-400">{currentOrg?.plan || 'Free'}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = currentOrg?.plan === plan.name;
            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  plan.highlight 
                    ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10' 
                    : isDarkMode ? 'border-neutral-800 bg-neutral-950/40' : 'border-neutral-200 bg-neutral-50'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{plan.name}</span>
                    {plan.highlight && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500 text-white">Popular</span>
                    )}
                  </div>
                  <div>
                    <div className="text-xl font-bold">{plan.price}</div>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">{plan.description}</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5">
                  <button
                    onClick={() => handleSelectPlan(plan.name)}
                    disabled={isCurrent}
                    className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent 
                        ? 'bg-neutral-800 text-neutral-500 cursor-default' 
                        : plan.highlight 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md' 
                          : 'bg-neutral-200 hover:bg-white text-neutral-900 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-100'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : `Select ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
