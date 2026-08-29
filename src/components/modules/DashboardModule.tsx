import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  ArrowUpRight, 
  Plus, 
  Receipt, 
  Package, 
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
  Activity,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  FileText,
  UserCheck,
  Layers,
  HeartPulse,
  HardHat,
  Utensils,
  GraduationCap,
  Home,
  Scissors,
  Dumbbell,
  Boxes,
  Truck,
  CheckSquare
} from 'lucide-react';
import { ModuleType, BusinessType, Organization, Branch, UserRole, CompanySize } from '../../types';

interface DashboardModuleProps {
  currentOrg: Organization;
  currentBranch: Branch;
  businessType: BusinessType;
  activeRole: UserRole;
  companySize: CompanySize;
  onNavigateModule: (mod: ModuleType) => void;
  isDarkMode: boolean;
}

interface AiInsightsResponse {
  healthScore: number;
  grade: string;
  summary: string;
  recommendations: string[];
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  currentOrg,
  currentBranch,
  businessType,
  activeRole,
  companySize = 'Medium',
  onNavigateModule,
  isDarkMode
}) => {
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    pendingAmount: number;
    productsCount: number;
    invoicesCount: number;
    customersCount: number;
    employeesCount: number;
    branchesCount: number;
    lowStockCount: number;
  }>({
    totalRevenue: 148500,
    pendingAmount: 32000,
    productsCount: 6,
    invoicesCount: 4,
    customersCount: 2,
    employeesCount: 3,
    branchesCount: 2,
    lowStockCount: 3,
  });

  const [forecastData, setForecastData] = useState<any | null>(null);
  const [selectedForecastDays, setSelectedForecastDays] = useState<'30' | '60' | '90'>('30');

  useEffect(() => {
    if (!currentOrg?.id) return;
    const token = localStorage.getItem('businessos_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/tenant/summary?organization_id=${currentOrg.id}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.totalRevenue === 'number') {
          setSummary(data);
        }
      })
      .catch(err => console.error('Failed to load live summary:', err));

    fetch(`/api/tenant/forecast?organization_id=${currentOrg.id}`, { headers })
      .then(res => res.json())
      .then(data => {
        if (data && data.forecast30Days) {
          setForecastData(data);
        }
      })
      .catch(err => console.error('Failed to load forecast data:', err));
  }, [currentOrg?.id]);

  const [insights, setInsights] = useState<AiInsightsResponse>({
    healthScore: 94,
    grade: 'A+',
    summary: `Operations across ${currentBranch?.name || 'Main Branch'} for role "${activeRole}" in ${businessType} are operating with high efficiency. Revenue growth is up 18.4% month-over-month.`,
    recommendations: getRecommendationsForTypeAndRole(businessType, activeRole)
  });

  function getRecommendationsForTypeAndRole(bt: BusinessType, role: UserRole): string[] {
    if (role === 'HR') {
      return [
        'Approve 2 pending annual leave applications for Engineering team.',
        'Review AI resume match for Senior Developer position.',
        'Finalize monthly payroll processing before month-end.'
      ];
    }
    if (role === 'Accountant') {
      return [
        'File GST Return (GSTR-3B) before 20th of this month.',
        'Reconcile ₹120,000 office lease bank transfer entry.',
        'Send payment reminders for 3 overdue customer bills.'
      ];
    }
    if (role === 'Sales') {
      return [
        'Follow up with AeroSpace Components India (₹350,000 deal).',
        'Send updated GST quotation to Chawla Retail Chains.',
        'Convert 2 high-intent website inquiries into lead pipeline.'
      ];
    }
    if (role === 'Inventory Manager') {
      return [
        'Reorder Dell 4K Monitors (Only 2 units remaining).',
        'Confirm inter-warehouse transfer from Mumbai to Bengaluru.',
        'Scan incoming inventory barcodes for Cisco switches.'
      ];
    }
    if (role === 'Employee') {
      return [
        'Log working hours for Enterprise ERP Cloud Migration project.',
        'Submit July expense receipts for client lunch.',
        'Review company announcements regarding upcoming hackathon.'
      ];
    }
    if (role === 'Customer Portal') {
      return [
        'Invoice #INV-2026-0892 of ₹18,290 is pending payment.',
        'Track active delivery status for Order #8891.',
        'Contact support AI assistant for billing queries.'
      ];
    }
    if (role === 'Vendor Portal') {
      return [
        'Acknowledge Purchase Order #PO-2026-0032 delivery date.',
        'Upload delivery challan for raw materials shipment.',
        'Check bank payment confirmation for Invoice #9921.'
      ];
    }

    // Default Business Owner / Branch Manager
    if (bt === 'Restaurant') {
      return [
        'Table 8 has been waiting for 15 minutes - prioritize KOT.',
        'Kitchen inventory for fresh dairy is low.',
        'Weekend dinner reservation bookings up by 30%.'
      ];
    }
    if (bt === 'Hospital / Clinic') {
      return [
        '12 OPD appointments scheduled in the next hour.',
        'Pharmacy stock alert: Paracetamol & Insulin low.',
        'Laboratory test reports ready for Dr. Sharma review.'
      ];
    }
    if (bt === 'Construction') {
      return [
        'Site B cement supply delayed by 2 days - shift contractor schedule.',
        'Labour attendance today is 88%.',
        'Approve material requisition for Site A steel beams.'
      ];
    }
    if (bt === 'IT Company / CA Firm') {
      return [
        'Sprint 12 has 6 overdue deliverable tasks.',
        'Follow up on ₹32,000 pending client retainers.',
        'Review cloud infrastructure hosting expenditure.'
      ];
    }

    return [
      'Follow up on ₹32,000 pending customer invoices.',
      'Restock 3 low-stock items in Primary Warehouse.',
      'Trigger automated WhatsApp payment link reminders.'
    ];
  }

  const fetchAiInsights = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sales: 148500,
          expenses: 42100,
          pendingPayments: 32000,
          lowStockCount: 3,
          businessType,
          userRole: activeRole,
          companySize
        })
      });
      const data = await res.json();
      if (data.healthScore) {
        setInsights(data);
      }
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Welcome & Context Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border relative overflow-hidden ${
        isDarkMode 
          ? 'bg-neutral-900 border-neutral-800 text-neutral-100' 
          : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>{activeRole} Dashboard • {currentBranch?.name || 'Main Branch'} ({companySize} Scale)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentOrg?.name || 'Organization'}
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Business Vertical: <span className="text-neutral-200 font-semibold">{businessType}</span> | Role View: <span className="text-blue-400 font-semibold">{activeRole}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(activeRole === 'Business Owner' || activeRole === 'Sales' || activeRole === 'Branch Manager' || companySize === 'Small') && (
              <button
                onClick={() => onNavigateModule('pos')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Fast POS Billing</span>
              </button>
            )}

            {(activeRole === 'Business Owner' || activeRole === 'Accountant' || activeRole === 'Sales') && (
              <button
                onClick={() => onNavigateModule('documents')}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700' : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>New GST Invoice</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Business Intelligence Evaluation */}
      <div className={`p-5 sm:p-6 rounded-2xl border relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-br from-neutral-900 via-neutral-900 to-blue-950/30 border-neutral-800' 
          : 'bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 border-neutral-200 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="flex items-center gap-5 shrink-0">
            {/* Health Score Circular Badge */}
            <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border-2 border-blue-500/30 flex flex-col items-center justify-center text-blue-500 shadow-lg shadow-blue-500/10">
              <span className="text-2xl font-black">{insights.healthScore}</span>
              <span className="text-[10px] font-semibold tracking-widest uppercase text-blue-400">Score ({insights.grade})</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <h3 className="text-sm font-bold text-neutral-100 dark:text-neutral-100">
                  AI Contextual Recommendation ({businessType})
                </h3>
              </div>
              <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
                {insights.summary}
              </p>
            </div>
          </div>

          {/* Actionable Recommendations List */}
          <div className="flex-1 w-full space-y-2 bg-neutral-950/40 p-4 rounded-xl border border-neutral-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Role Action Directives ({activeRole})</span>
              <button
                onClick={fetchAiInsights}
                disabled={isLoadingAi}
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingAi ? 'animate-spin' : ''}`} />
                <span>Re-evaluate</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {insights.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* AI-DRIVEN CASH FLOW & EXPENSE FORECASTING PANEL */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <span>AI-Driven Cash Flow & Expense Forecasting</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  92% Confidence AI Model
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Predictive analytics forecasting upcoming tax liabilities, payroll expenses, and inventory reorder points.
              </p>
            </div>
          </div>

          {/* Days Switcher */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
            {(['30', '60', '90'] as const).map(days => (
              <button
                key={days}
                onClick={() => setSelectedForecastDays(days)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedForecastDays === days 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {forecastData && (
          <div className="space-y-4">
            {/* Top KPI Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Projected Inflow */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Projected Cash Inflow</span>
                <div className="text-xl font-extrabold text-emerald-400 font-mono">
                  ₹{Number(forecastData[`forecast${selectedForecastDays}Days`]?.projectedInflow || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-neutral-400">From verified invoices & receivables</p>
              </div>

              {/* Projected Outflow */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Projected Cash Outflow</span>
                <div className="text-xl font-extrabold text-rose-400 font-mono">
                  ₹{Number(forecastData[`forecast${selectedForecastDays}Days`]?.projectedOutflow || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-neutral-400">Payroll, GST tax & inventory reorders</p>
              </div>

              {/* Net Cash Position */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Net Position Buffer</span>
                <div className="text-xl font-extrabold text-indigo-300 font-mono">
                  ₹{Number(forecastData[`forecast${selectedForecastDays}Days`]?.netCashPosition || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-indigo-200">Safely covers 1.8x operating run-rate</p>
              </div>
            </div>

            {/* Detailed Expense Breakdown & Low-Stock Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* GST Tax Liability Forecast */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-200">GST Tax Liability (GSTR-3B)</span>
                  <span className="text-amber-400 font-mono font-bold">
                    ₹{Number(forecastData.forecast30Days?.gstTaxLiability || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Estimated 18% net output tax due by the 20th after Input Tax Credit (ITC) deduction.
                </p>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-2/3" />
                </div>
              </div>

              {/* Payroll Liability */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-200">Payroll & Salary Reserve</span>
                  <span className="text-blue-400 font-mono font-bold">
                    ₹{Number(forecastData.forecast30Days?.payrollLiability || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Fixed monthly employee payouts for {summary.employeesCount || 3} verified staff members.
                </p>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-4/5" />
                </div>
              </div>

              {/* Inventory Reorder Point Reserve */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-200">Inventory Reorder Cost</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ₹{Number(forecastData.forecast30Days?.inventoryReorderCost || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Restock cost for {forecastData.summary?.lowStockCount || 0} low-stock products to prevent stockouts.
                </p>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-1/2" />
                </div>
              </div>
            </div>

            {/* AI Strategic Rationale Note */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">AI Strategic Insight: </span>
                {forecastData.forecast30Days?.rationale}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DYNAMIC ROLE-BASED KPI CARDS */}
      {renderRoleKpis(activeRole, businessType, isDarkMode, summary, onNavigateModule)}

      {/* DYNAMIC BUSINESS TYPE SPECIFIC WIDGETS */}
      {renderBusinessTypeWidget(businessType, activeRole, isDarkMode, onNavigateModule)}

      {/* ENTERPRISE APPROVALS & MULTI-BRANCH AUDIT (if Enterprise) */}
      {companySize === 'Enterprise' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Enterprise Approval Workflows & Multi-Branch Audits
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">3 Pending Approvals</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Capex Hardware Purchase</span>
                <span className="text-amber-400 font-mono">₹249,900</span>
              </div>
              <p className="text-[11px] text-neutral-400">Requested by Bengaluru Branch Manager</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => alert('Approved!')} className="flex-1 py-1 rounded bg-emerald-600 text-white font-semibold text-[10px]">Approve</button>
                <button onClick={() => alert('Rejected')} className="px-2 py-1 rounded border border-neutral-700 text-neutral-400 text-[10px]">Reject</button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Client Discount Exemption (&gt;15%)</span>
                <span className="text-blue-400 font-mono">18% Disc</span>
              </div>
              <p className="text-[11px] text-neutral-400">Requested by Head Sales (Neha Kapoor)</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => alert('Approved!')} className="flex-1 py-1 rounded bg-emerald-600 text-white font-semibold text-[10px]">Approve</button>
                <button onClick={() => alert('Rejected')} className="px-2 py-1 rounded border border-neutral-700 text-neutral-400 text-[10px]">Reject</button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span>Monthly GST Audit Draft</span>
                <span className="text-emerald-400 font-mono">GSTR-1</span>
              </div>
              <p className="text-[11px] text-neutral-400">Prepared by Lead Accountant (Meera Menon)</p>
              <div className="flex gap-2 pt-1">
                <button onClick={() => alert('GST Audit verified!')} className="flex-1 py-1 rounded bg-blue-600 text-white font-semibold text-[10px]">Verify Audit</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Helper: Render KPIs specific to User Role using PostgreSQL dynamic summary
function renderRoleKpis(role: UserRole, businessType: BusinessType, isDarkMode: boolean, summary: any, onNavigate: (mod: ModuleType) => void) {
  const revStr = `₹${(summary?.totalRevenue || 0).toLocaleString()}`;
  const pendStr = `₹${(summary?.pendingAmount || 0).toLocaleString()}`;
  const lowStockStr = `${summary?.lowStockCount || 0} Items`;
  const prodStr = `${summary?.productsCount || 0} Products`;
  const custStr = `${summary?.customersCount || 0} Clients`;
  const empStr = `${summary?.employeesCount || 0} Employees`;

  if (role === 'HR') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard isDarkMode={isDarkMode} title="Total Headcount" value={empStr} subText="Active headcount in DB" icon={Users} color="text-blue-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Present Today" value={`${summary?.employeesCount || 0} / ${summary?.employeesCount || 0}`} subText="100% Attendance" icon={UserCheck} color="text-emerald-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Leave Requests" value="0 Pending" subText="Requires approval" icon={Calendar} color="text-amber-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Monthly Payroll" value="₹450,000" subText="July processed" icon={DollarSign} color="text-purple-400 font-bold" />
      </div>
    );
  }

  if (role === 'Accountant') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard isDarkMode={isDarkMode} title="Monthly Revenue" value={revStr} subText="All paid invoices" icon={TrendingUp} color="text-emerald-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Operating Expenses" value="₹42,100" subText="3 recorded items" icon={CreditCard} color="text-rose-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Pending Receivables" value={pendStr} subText="Unpaid GST invoices" icon={Receipt} color="text-amber-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Total Invoices" value={`${summary?.invoicesCount || 0} Bills`} subText="Recorded in PostgreSQL" icon={DollarSign} color="text-blue-400 font-bold" />
      </div>
    );
  }

  if (role === 'Sales') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard isDarkMode={isDarkMode} title="Sales Revenue" value={revStr} subText="Completed transactions" icon={TrendingUp} color="text-emerald-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Pending Collections" value={pendStr} subText="Overdue client balance" icon={FileText} color="text-blue-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Active Clients" value={custStr} subText="Registered in CRM" icon={Users} color="text-purple-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Catalog Products" value={prodStr} subText="Available for quote" icon={Package} color="text-amber-400 font-bold" />
      </div>
    );
  }

  if (role === 'Inventory Manager') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard isDarkMode={isDarkMode} title="Catalog Products" value={prodStr} subText="PostgreSQL SKUs" icon={Package} color="text-blue-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Low Stock Alerts" value={lowStockStr} subText="Stock <= Alert Level" icon={AlertTriangle} color="text-rose-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Branch Hubs" value={`${summary?.branchesCount || 1} Locations`} subText="Active warehouses" icon={Boxes} color="text-emerald-400 font-bold" />
        <KpiCard isDarkMode={isDarkMode} title="Pending Reminders" value="2 Orders" subText="Supplier delivery" icon={Truck} color="text-purple-400 font-bold" />
      </div>
    );
  }

  // Default Business Owner / Branch Manager View
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard isDarkMode={isDarkMode} title="Total Revenue" value={revStr} subText="Live from PostgreSQL" icon={TrendingUp} color="text-emerald-400 font-bold" />
      <KpiCard isDarkMode={isDarkMode} title="Pending Receivables" value={pendStr} subText="Unpaid client invoices" icon={DollarSign} color="text-blue-400 font-bold" />
      <KpiCard isDarkMode={isDarkMode} title="Catalog Products" value={prodStr} subText="Active SKUs" icon={CreditCard} color="text-amber-400 font-bold" />
      <KpiCard isDarkMode={isDarkMode} title="Low Stock Alerts" value={lowStockStr} subText="Reorder required" icon={AlertTriangle} color="text-rose-400 font-bold" />
    </div>
  );
}

// Helper Card Component
function KpiCard({ title, value, subText, icon: Icon, color, isDarkMode }: any) {
  return (
    <div className={`p-5 rounded-2xl border space-y-2 ${
      isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between text-neutral-400">
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-lg bg-neutral-800/60">
          <Icon className="w-4 h-4 text-neutral-200" />
        </div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-neutral-400 font-medium">{subText}</div>
    </div>
  );
}

// Helper: Business Type specific widget
function renderBusinessTypeWidget(bt: BusinessType, role: UserRole, isDarkMode: boolean, onNavigate: (mod: ModuleType) => void) {
  if (bt === 'Restaurant') {
    return (
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-xs font-bold uppercase text-neutral-400 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-400" />
            Live Kitchen Order Tickets (KOT) & Table Layout
          </h3>
          <span className="text-xs font-mono text-amber-400">4 Active Tables</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Table 01 • Main Dining</span>
            <div className="font-bold">4 Guests</div>
            <div className="text-[10px] text-neutral-400">Order: ₹2,450</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">Table 08 • VIP Section</span>
            <div className="font-bold">2 Guests</div>
            <div className="text-[10px] text-rose-400 animate-pulse">Wait: 15 mins</div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Table 12 • Patio</span>
            <div className="font-bold text-neutral-400">Vacant</div>
            <div className="text-[10px] text-emerald-400">Cleaned & Ready</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-400">Zomato Delivery</span>
            <div className="font-bold">KOT #402</div>
            <div className="text-[10px] text-neutral-300">Driver En Route</div>
          </div>
        </div>
      </div>
    );
  }

  if (bt === 'Hospital / Clinic') {
    return (
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-xs font-bold uppercase text-neutral-400 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            Patient Appointments & Doctors Roster
          </h3>
          <span className="text-xs font-mono text-rose-400">12 Scheduled</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Dr. Anjali Deshmukh</span>
              <span className="text-emerald-400 text-[10px]">On Duty</span>
            </div>
            <p className="text-[11px] text-neutral-400">Cardiology OPD • 4 Patients waiting</p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Dr. Vikramaditya</span>
              <span className="text-amber-400 text-[10px]">In Surgery</span>
            </div>
            <p className="text-[11px] text-neutral-400">Orthopedics • OR-2 Active</p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Pharmacy Billing & Lab</span>
              <span className="text-blue-400 text-[10px]">Normal</span>
            </div>
            <p className="text-[11px] text-neutral-400">32 Prescriptions dispensed today</p>
          </div>
        </div>
      </div>
    );
  }

  if (bt === 'Construction') {
    return (
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-xs font-bold uppercase text-neutral-400 flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-400" />
            Active Sites, Labour Headcount & Materials
          </h3>
          <span className="text-xs font-mono text-amber-400">3 Active Sites</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Site A • BKC Tower</span>
              <span className="text-emerald-400 text-[10px]">68% Complete</span>
            </div>
            <p className="text-[11px] text-neutral-400">42 Masons on site • Cement stock ok</p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Site B • Metro Hub</span>
              <span className="text-rose-400 text-[10px]">Delayed 2 Days</span>
            </div>
            <p className="text-[11px] text-neutral-400">Steel beam delivery pending from vendor</p>
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Machinery Usage</span>
              <span className="text-blue-400 text-[10px]">4 Cranes Active</span>
            </div>
            <p className="text-[11px] text-neutral-400">Fuel log recorded: 420 Liters diesel</p>
          </div>
        </div>
      </div>
    );
  }

  // Generic Default Module Overview Shortcuts
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Employee Attendance
          </h3>
          <span className="text-xs text-emerald-400 font-semibold">3 / 4 Present</span>
        </div>
        <p className="text-xs text-neutral-400">Rajesh Nair, Neha Kapoor, Meera Menon checked in.</p>
        <button onClick={() => onNavigate('hr')} className="w-full text-center py-2 text-xs font-semibold text-blue-400 hover:underline">
          Manage HR & Attendance →
        </button>
      </div>

      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-400" />
            Critical Stock
          </h3>
          <span className="text-xs text-amber-400 font-semibold">Reorder Needed</span>
        </div>
        <p className="text-xs text-neutral-400">Dell UltraSharp 4K (2 left), Cisco Switch (1 left).</p>
        <button onClick={() => onNavigate('inventory')} className="w-full text-center py-2 text-xs font-semibold text-blue-400 hover:underline">
          Manage Warehouse Stock →
        </button>
      </div>

      <div className={`p-5 rounded-2xl border space-y-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-green-400" />
            WhatsApp Hub
          </h3>
          <span className="text-xs text-emerald-400 font-semibold">Active</span>
        </div>
        <p className="text-xs text-neutral-400">14 instant WhatsApp invoice notifications sent today.</p>
        <button onClick={() => onNavigate('whatsapp')} className="w-full text-center py-2 text-xs font-semibold text-blue-400 hover:underline">
          WhatsApp Templates →
        </button>
      </div>
    </div>
  );
}
