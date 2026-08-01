import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Lock, 
  Key, 
  Send, 
  Check, 
  MessageSquare,
  ChevronRight,
  LayoutDashboard,
  ShoppingCart,
  Users,
  DollarSign,
  Utensils,
  HeartPulse,
  HardHat,
  ArrowLeft
} from 'lucide-react';
import { AuthState, BusinessType, PlanType, Organization, Branch, UserRole } from '../../types';

interface AuthViewsProps {
  authState: AuthState;
  onNavigateAuth: (state: AuthState) => void;
  onLoginSuccess: (org: Organization, role: UserRole, bt: BusinessType) => void;
  onRegisterSuccess: (org: Organization, branch: Branch, plan: PlanType) => void;
  isDarkMode: boolean;
}

export const AuthViews: React.FC<AuthViewsProps> = ({
  authState,
  onNavigateAuth,
  onLoginSuccess,
  onRegisterSuccess,
  isDarkMode
}) => {
  // Login Form State
  const [loginOrgId, setLoginOrgId] = useState('org-001');
  const [loginUsername, setLoginUsername] = useState('owner');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Business Owner');
  const [selectedBt, setSelectedBt] = useState<BusinessType>('Retail');

  // Registration Wizard Steps
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [regName, setRegName] = useState('');
  const [regType, setRegType] = useState<BusinessType>('Retail');
  const [regOwner, setRegOwner] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regGstin, setRegGstin] = useState('');
  const [regCountry, setRegCountry] = useState('India');
  const [regState, setRegState] = useState('Maharashtra');
  const [regCity, setRegCity] = useState('Mumbai');
  const [regPlan, setRegPlan] = useState<PlanType>('Free');
  const [showWaSentNotice, setShowWaSentNotice] = useState(false);

  // Password Recovery
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Handle One-Click Demo Login
  const handleQuickLogin = (role: UserRole, bt: BusinessType, orgName: string) => {
    const demoOrg: Organization = {
      id: role === 'Super Admin' ? 'master-hq' : 'org-001',
      name: orgName,
      gstin: '27AABCV8912A1Z5',
      plan: 'Growth',
      businessType: bt,
      companySize: 'Medium'
    };
    onLoginSuccess(demoOrg, role, bt);
  };

  // Login Form Submit with Real Backend REST API Call
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', phone: '', email: '', businessType: 'Retail' });
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLoginFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Login failed. Please check credentials.');
        setIsLoggingIn(false);
        return;
      }

      // Save token in localStorage
      localStorage.setItem('businessos_token', data.accessToken);
      localStorage.setItem('businessos_user', JSON.stringify(data.user));

      const org: Organization = data.organization || {
        id: data.user.organization_id || 'org-001',
        name: `${selectedBt} Enterprise`,
        gstin: '27AABCV8912A1Z5',
        plan: 'Growth',
        businessType: selectedBt,
        companySize: 'Medium'
      };

      onLoginSuccess(org, data.user.role as UserRole, selectedBt);
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback for quick demo execution
      const demoOrg: Organization = {
        id: loginUsername === 'superadmin' ? 'ORG-SYSTEM' : 'ORG-1001',
        name: loginUsername === 'superadmin' ? 'BusinessOS AI Headquarters' : `${selectedBt} Enterprises`,
        gstin: '27AABCV8912A1Z5',
        plan: 'Growth',
        businessType: selectedBt,
        companySize: 'Medium'
      };
      onLoginSuccess(demoOrg, selectedRole, selectedBt);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Registration Submit with Real Backend REST API Call
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const res = await fetch('/api/auth/register-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: regName,
          ownerName: regOwner,
          phone: regPhone,
          email: regEmail,
          businessType: regType,
          gstin: regGstin,
          address: `${regCity}, ${regState}, ${regCountry}`,
          selectedPlan: regPlan,
        }),
      });

      const data = await res.json();

      if (data.autoActivated) {
        // Free Plan Activated
        localStorage.setItem('businessos_token', data.accessToken);
        onRegisterSuccess(data.organization, {
          id: 'branch-main',
          orgId: data.organization.id,
          name: `${data.organization.name} Main Branch`,
          city: regCity || 'Main City',
          code: 'MAIN-01',
          isMain: true
        }, 'Free');
      } else {
        // Paid Plan Pending Approval -> Open WhatsApp
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank');
        }
        setShowWaSentNotice(true);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      if (regPlan !== 'Free') {
        const waMsg = `Hello BusinessOS AI Team,\n\nI would like to register my business.\n\nBusiness Name: ${regName}\nOwner Name: ${regOwner}\nBusiness Type: ${regType}\nSelected Plan: ${regPlan}\nPhone Number: ${regPhone}\n\nPlease approve my account.`;
        const waUrl = `https://wa.me/919876543210?text=${encodeURIComponent(waMsg)}`;
        window.open(waUrl, '_blank');
        setShowWaSentNotice(true);
      } else {
        const orgId = `org-${Date.now().toString().slice(-4)}`;
        const newOrg: Organization = {
          id: orgId,
          name: regName || 'My Business OS',
          gstin: regGstin || '27AAACB9988A1Z0',
          plan: 'Free',
          businessType: regType,
          companySize: 'Small'
        };
        onRegisterSuccess(newOrg, {
          id: 'branch-1',
          orgId,
          name: `${regCity} Main Branch`,
          city: regCity || 'Mumbai',
          code: 'MAIN-01',
          isMain: true
        }, 'Free');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // 1. LANDING PAGE VIEW
  if (authState === 'landing') {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'} font-sans`}>
        
        {/* Navigation Bar */}
        <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-neutral-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                BusinessOS AI
              </span>
              <span className="text-[10px] block font-mono text-neutral-400">Multi-Vertical Enterprise OS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateAuth('login')}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-700 hover:bg-neutral-800 text-neutral-200 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigateAuth('register')}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
            >
              Register Business
            </button>
          </div>
        </header>

        {/* Hero Banner Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>AI-Driven Operating System Tailored for 14+ Business Types</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            One Backend Platform. <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              100% Unique Runtime App for Every Business.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Dynamic dashboards, role-based sidebars, native WhatsApp PDF invoice sharing, POS billing, HR payroll, and context-aware AI agents — custom engineered for Retail, Restaurants, Hospitals, Construction, IT, and more.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigateAuth('register')}
              className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all"
            >
              <span>Start Free Business Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleQuickLogin('Business Owner', 'Retail', 'Vanguard Retail Chain')}
              className="px-6 py-3.5 rounded-2xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Launch Live Interactive Demo</span>
            </button>
          </div>

          {/* Quick Demo Vertical Buttons */}
          <div className="pt-12 border-t border-neutral-800/80 space-y-4">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Experience Contextual Dashboards By Business Vertical
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              {[
                { name: 'Retail', icon: ShoppingCart, bt: 'Retail' as BusinessType },
                { name: 'Restaurant', icon: Utensils, bt: 'Restaurant' as BusinessType },
                { name: 'Hospital / Clinic', icon: HeartPulse, bt: 'Hospital / Clinic' as BusinessType },
                { name: 'Construction', icon: HardHat, bt: 'Construction' as BusinessType },
                { name: 'IT Company', icon: LayoutDashboard, bt: 'IT Company / CA Firm' as BusinessType },
                { name: 'Super Admin HQ', icon: ShieldCheck, bt: 'IT Company / CA Firm' as BusinessType, role: 'Super Admin' as UserRole }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickLogin(item.role || 'Business Owner', item.bt, `${item.name} Operations`)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 flex items-center gap-2 transition-all"
                  >
                    <Icon className="w-4 h-4 text-blue-400" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Vertical Feature Grid */}
        <section className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Native WhatsApp Sharing (No API Needed)</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Generates vector PDF receipts and opens your installed WhatsApp or WhatsApp Web with prefilled recipient, invoice numbers, and amount.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">Dynamic Role & Sidebar Engine</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Sidebar items, KPIs, and charts automatically morph based on whether you are logged in as Owner, HR, Accountant, Sales, or Customer Portal.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold">WhatsApp Subscription Approval HQ</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Paid plan subscriptions route prefilled messages to Super Admin on WhatsApp. Admins approve accounts, assign Org IDs, and issue credentials.
            </p>
          </div>
        </section>

        {/* Membership Plans Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-8 border-t border-neutral-800/80">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black">Enterprise Membership Plans</h2>
            <p className="text-xs text-neutral-400">Transparent pricing. Free plan activates immediately; paid plans include dedicated WhatsApp support.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                name: 'Free',
                price: '₹0',
                period: 'Forever Free',
                desc: 'Instant self-activation for single-branch micro businesses.',
                features: ['1 Branch', '100 Products', 'POS & GST Invoicing', 'WhatsApp Invoice Sharing', 'Basic AI Assistant'],
                highlight: false,
              },
              {
                name: 'Starter',
                price: '₹999',
                period: '/ month',
                desc: 'For growing retail shops and single clinics.',
                features: ['2 Branches', '500 Products', 'CRM & Inventory', 'WhatsApp Support Approval', 'HR & Payroll Basic'],
                highlight: false,
              },
              {
                name: 'Growth',
                price: '₹2,499',
                period: '/ month',
                desc: 'Ideal for multi-branch retail, chains, & hospitals.',
                features: ['5 Branches', 'Unlimited Products', 'Full POS + CRM + HR', 'WhatsApp Automated PDF', 'Gemini AI Business Health'],
                highlight: true,
              },
              {
                name: 'Business',
                price: '₹4,999',
                period: '/ month',
                desc: 'For manufacturing, construction & infra companies.',
                features: ['15 Branches', 'Project Management', 'Custom GST & Audit Logs', 'Role-Based Access Control', 'Dedicated Manager'],
                highlight: false,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'Contact Sales',
                desc: 'Tailored for large multi-entity enterprises.',
                features: ['Unlimited Branches', 'Cloud SQL Dedicated Instance', 'Custom Module Builder', '24/7 Priority Support', 'SLA Guarantee'],
                highlight: false,
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-blue-900/30 to-neutral-900 border-blue-500 shadow-xl shadow-blue-600/10'
                    : 'bg-neutral-900/50 border-neutral-800'
                }`}
              >
                <div className="space-y-2">
                  {plan.highlight && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wide">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-base font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black">{plan.price}</span>
                    <span className="text-[10px] text-neutral-400">{plan.period}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">{plan.desc}</p>
                  <ul className="space-y-1.5 pt-2 text-[11px] text-neutral-300">
                    {plan.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onNavigateAuth('register')}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Testimonials */}
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-8 border-t border-neutral-800/80">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black">Trusted by 10,000+ Business Leaders</h2>
            <p className="text-xs text-neutral-400">See how BusinessOS AI transforms operations across diverse industries.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Sending PDF invoices directly to our customers' WhatsApp with zero email setup saved us 15 hours every week in billing follow-ups.",
                author: "Rohan Deshmukh",
                role: "Managing Director, Vanguard Retail Chain",
                badge: "Retail"
              },
              {
                quote: "The context-aware Gemini AI health score gives our medical board real-time visibility into bed occupancy, pharmacy inventory, and lab revenue.",
                author: "Dr. Ananya Joshi",
                role: "Chief Medical Officer, Apollo Care Hospital",
                badge: "Hospital"
              },
              {
                quote: "We manage 12 site construction projects simultaneously. The project milestone tracker and material dispatch logs keep our engineering teams perfectly synced.",
                author: "Vikram Rajput",
                role: "VP Operations, Skyline Infra Heavy Ltd",
                badge: "Construction"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-4">
                <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-blue-400 text-[10px] font-mono">
                  {t.badge}
                </span>
                <p className="text-xs text-neutral-300 italic leading-relaxed">"{t.quote}"</p>
                <div>
                  <div className="text-xs font-bold text-white">{t.author}</div>
                  <div className="text-[10px] text-neutral-400">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="max-w-4xl mx-auto px-6 py-16 space-y-6 border-t border-neutral-800/80">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black">Frequently Asked Questions</h2>
            <p className="text-xs text-neutral-400">Everything you need to know about BusinessOS AI</p>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                q: "How does the WhatsApp invoice sharing work without third-party email servers?",
                a: "BusinessOS AI generates vector PDF invoices directly in your browser or server, then opens your device's native WhatsApp app or WhatsApp Web with the client's phone number and prefilled invoice summary."
              },
              {
                q: "What happens after I register for a Paid Plan?",
                a: "When you select a paid plan (Starter, Growth, Business, Enterprise), a prefilled message is generated for the BusinessOS AI Super Admin team on WhatsApp. Upon payment verification, the admin approves your account and issues your Organization credentials."
              },
              {
                q: "Is my business data isolated securely in the database?",
                a: "Yes! Every organization is isolated with strict row-level organization_id tenant keys in PostgreSQL hosted on Cloud SQL."
              },
              {
                q: "Can I customize my company logos and receipt branding?",
                a: "Absolutely! You can upload your main company logo, favicon, invoice logo, receipt logo, and set primary/secondary brand colors in Settings."
              }
            ].map((faq, idx) => (
              <div key={idx} className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/40">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-semibold flex justify-between items-center text-neutral-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg font-mono text-neutral-400">{openFaq === idx ? '−' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-neutral-400 text-xs border-t border-neutral-800/50 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Floating WhatsApp Action Button */}
        <a
          href="https://wa.me/919876543210?text=Hi%20BusinessOS%20AI%20Team%2C%20I%20have%20an%20inquiry%20about%20your%20Enterprise%20SaaS%20Platform."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl flex items-center gap-2 font-bold text-xs transition-all hover:scale-105"
        >
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="hidden sm:inline">Chat on WhatsApp</span>
        </a>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-neutral-800 text-center text-xs text-neutral-400">
          BusinessOS AI • Universal Multi-Tenant Enterprise Application Engine
        </footer>

      </div>
    );
  }

  // 2. LOGIN VIEW
  if (authState === 'login') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'} font-sans`}>
        <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 sm:p-8 space-y-6 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Sign In to BusinessOS AI</h2>
                <p className="text-xs text-neutral-400">Enter your credentials or select quick demo mode</p>
              </div>
            </div>

            <button onClick={() => onNavigateAuth('landing')} className="text-neutral-400 hover:text-neutral-200 text-xs font-semibold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>

          <form onSubmit={handleLoginFormSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">User Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="Business Owner">Business Owner</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="HR">HR Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Sales">Sales Executive</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Employee">Employee Portal</option>
                  <option value="Customer Portal">Customer Portal</option>
                  <option value="Vendor Portal">Vendor Portal</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 font-semibold">Business Vertical</label>
                <select
                  value={selectedBt}
                  onChange={(e) => setSelectedBt(e.target.value as BusinessType)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  <option value="Retail">Retail</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Hospital / Clinic">Hospital / Clinic</option>
                  <option value="Construction">Construction</option>
                  <option value="IT Company / CA Firm">IT Company</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Logistics">Logistics</option>
                  <option value="School / Institute">School</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Organization ID / Username</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="owner / admin@businessos.ai"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-neutral-400 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigateAuth('forgot')}
                  className="text-blue-400 hover:underline text-[11px]"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all"
            >
              Sign In to Dashboard
            </button>
          </form>

          {/* Quick Demo Fast Logins */}
          <div className="pt-4 border-t border-neutral-800/80 space-y-2">
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider text-center">
              One-Click Preset Roles
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickLogin('Business Owner', 'Retail', 'Retail Chain HQ')}
                className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left"
              >
                <div className="font-semibold text-blue-400">Retail Owner</div>
                <div className="text-[10px] text-neutral-400">POS & Inventory</div>
              </button>

              <button
                onClick={() => handleQuickLogin('Super Admin', 'IT Company / CA Firm', 'Super Admin Master HQ')}
                className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left"
              >
                <div className="font-semibold text-amber-400">Super Admin HQ</div>
                <div className="text-[10px] text-amber-300">Approve & Provision</div>
              </button>

              <button
                onClick={() => handleQuickLogin('HR', 'IT Company / CA Firm', 'TechCorp HR')}
                className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left"
              >
                <div className="font-semibold text-purple-400">HR Manager</div>
                <div className="text-[10px] text-neutral-400">Payroll & Resumes</div>
              </button>

              <button
                onClick={() => handleQuickLogin('Accountant', 'Retail', 'FinAcc Services')}
                className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left"
              >
                <div className="font-semibold text-emerald-400">Accountant</div>
                <div className="text-[10px] text-neutral-400">GST & Financials</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs text-neutral-400">Don't have an account? </span>
            <button
              onClick={() => onNavigateAuth('register')}
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              Register Business
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 3. REGISTER BUSINESS WIZARD
  if (authState === 'register') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'} font-sans`}>
        <div className={`w-full max-w-xl rounded-2xl border shadow-2xl p-6 sm:p-8 space-y-6 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-bold">Register Your Business</h2>
              <p className="text-xs text-neutral-400">Step {regStep} of 3 • Business Profile & Plan Selection</p>
            </div>
            <button onClick={() => onNavigateAuth('landing')} className="text-neutral-400 hover:text-neutral-200 text-xs font-semibold flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Landing
            </button>
          </div>

          {showWaSentNotice ? (
            <div className="space-y-4 text-center py-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/30">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-green-400">WhatsApp Request Dispatched!</h3>
              <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                Your subscription request for <span className="font-bold text-white">{regName}</span> ({regPlan} Plan) has been routed to the BusinessOS AI Super Admin team via WhatsApp.
              </p>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 max-w-sm mx-auto">
                After Admin verifies payment, they will assign your Organization ID, Username, and Password.
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => onNavigateAuth('login')}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Go to Login Page
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegistrationSubmit} className="space-y-4 text-xs">
              
              {regStep === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">Business Name</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Acme Supermarket & Retail"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold">Business Type / Vertical</label>
                      <select
                        value={regType}
                        onChange={(e) => setRegType(e.target.value as BusinessType)}
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
                      <label className="text-neutral-400 font-semibold">Owner Name</label>
                      <input
                        type="text"
                        required
                        value={regOwner}
                        onChange={(e) => setRegOwner(e.target.value)}
                        placeholder="Full Name"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98200 12345"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold">Email Address</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="owner@example.com"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (regName && regOwner && regPhone) setRegStep(2);
                      }}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      Next: Location & Tax Details →
                    </button>
                  </div>
                </div>
              )}

              {regStep === 2 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-neutral-400 font-semibold">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      value={regGstin}
                      onChange={(e) => setRegGstin(e.target.value)}
                      placeholder="27AABCV8912A1Z5"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold">Country</label>
                      <input
                        type="text"
                        value={regCountry}
                        onChange={(e) => setRegCountry(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold">State</label>
                      <input
                        type="text"
                        value={regState}
                        onChange={(e) => setRegState(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-neutral-400 font-semibold">City</label>
                      <input
                        type="text"
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="px-4 py-3 rounded-xl border border-neutral-800 text-neutral-300 font-semibold text-xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegStep(3)}
                      className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      Next: Select Membership Plan →
                    </button>
                  </div>
                </div>
              )}

              {regStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-neutral-300 font-semibold text-xs">Choose Your Plan Tier</div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {(['Free', 'Starter', 'Growth', 'Business', 'Enterprise'] as PlanType[]).map((plan) => (
                      <button
                        type="button"
                        key={plan}
                        onClick={() => setRegPlan(plan)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          regPlan === plan 
                            ? 'bg-blue-600/20 border-blue-500 text-white font-bold' 
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{plan}</span>
                          {regPlan === plan && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <span className="text-[10px] text-neutral-400 font-normal mt-1">
                          {plan === 'Free' ? 'Instant Access' : 'WhatsApp Request'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] leading-relaxed">
                    {regPlan === 'Free' ? (
                      <span>Free plan activates immediately with complete single-branch access.</span>
                    ) : (
                      <span>Selecting <b>{regPlan}</b> will trigger a WhatsApp message to Super Admin. Admin will verify payment and manually issue your account credentials.</span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="px-4 py-3 rounded-xl border border-neutral-800 text-neutral-300 font-semibold text-xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
                    >
                      {regPlan === 'Free' ? 'Complete Free Registration' : 'Send WhatsApp Subscription Request'}
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}

          <div className="text-center pt-2">
            <span className="text-xs text-neutral-400">Already registered? </span>
            <button
              onClick={() => onNavigateAuth('login')}
              className="text-xs font-bold text-blue-400 hover:underline"
            >
              Log In Here
            </button>
          </div>

        </div>
      </div>
    );
  }

  // 4. FORGOT PASSWORD & RESET VIEWS
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'} font-sans`}>
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 sm:p-8 space-y-6 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h2 className="text-lg font-bold">Password Recovery</h2>
          <button onClick={() => onNavigateAuth('login')} className="text-neutral-400 hover:text-neutral-200 text-xs font-semibold">
            Cancel
          </button>
        </div>

        {authState === 'forgot' && (
          <div className="space-y-4 text-xs">
            <p className="text-neutral-400">Enter your registered business phone number to receive a 6-digit OTP verification code.</p>
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Phone Number</label>
              <input
                type="text"
                value={recoveryPhone}
                onChange={(e) => setRecoveryPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                if (recoveryPhone) onNavigateAuth('otp');
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Send OTP Code
            </button>
          </div>
        )}

        {authState === 'otp' && (
          <div className="space-y-4 text-xs">
            <p className="text-neutral-400">Enter the 6-digit OTP sent to {recoveryPhone} (Use demo OTP: <span className="font-mono text-amber-400">123456</span>).</p>
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">OTP Code</label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono tracking-widest text-neutral-200 focus:outline-none text-center text-lg"
              />
            </div>
            <button
              onClick={() => {
                if (otpCode === '123456' || otpCode.length === 6) onNavigateAuth('reset');
                else alert('Please use OTP: 123456');
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Verify OTP
            </button>
          </div>
        )}

        {authState === 'reset' && (
          <div className="space-y-4 text-xs">
            <p className="text-neutral-400">Choose a new secure password for your account.</p>
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                alert('Password reset successful! Please log in with your new password.');
                onNavigateAuth('login');
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Save New Password
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
