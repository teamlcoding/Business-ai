export type UserRole = 
  | 'Super Admin'
  | 'Business Owner'
  | 'Branch Manager'
  | 'HR'
  | 'Accountant'
  | 'Sales'
  | 'Inventory Manager'
  | 'Employee'
  | 'CA'
  | 'Customer Portal'
  | 'Vendor Portal';

export type BusinessType = 
  | 'Retail'
  | 'Grocery'
  | 'Pharmacy'
  | 'Restaurant'
  | 'Hotel'
  | 'Hospital / Clinic'
  | 'Manufacturing'
  | 'Construction'
  | 'Logistics'
  | 'School / Institute'
  | 'Real Estate'
  | 'IT Company / CA Firm'
  | 'Salon / Gym'
  | 'Service Business';

export type PlanType = 'Free' | 'Starter' | 'Growth' | 'Business' | 'Enterprise' | 'Custom';

export type ModuleType = 
  | 'dashboard'
  | 'ca'
  | 'pos'
  | 'documents'
  | 'whatsapp'
  | 'gmail'
  | 'crm'
  | 'hr'
  | 'inventory'
  | 'finance'
  | 'projects'
  | 'support'
  | 'reports'
  | 'settings'
  | 'superadmin';

export type AuthState = 'landing' | 'login' | 'register' | 'forgot' | 'otp' | 'reset' | 'app';

export interface RegistrationRequest {
  id: string;
  businessName: string;
  businessType: BusinessType;
  ownerName: string;
  phone: string;
  email: string;
  gstin: string;
  country: string;
  state: string;
  city: string;
  selectedPlan: PlanType;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  assignedOrgId?: string;
  generatedUsername?: string;
  generatedPassword?: string;
}

export type CompanySize = 'Small' | 'Medium' | 'Enterprise';

export interface Organization {
  id: string;
  name: string;
  gstin: string;
  logoUrl?: string;
  plan: PlanType;
  businessType: BusinessType;
  companySize?: CompanySize;
}

export interface Branch {
  id: string;
  orgId: string;
  name: string;
  city: string;
  code: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  barcode: string;
  gstRate: number; // e.g. 18 for 18%
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
}

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  gstin?: string;
  address: string;
  totalSpent: number;
  outstandingBalance: number;
  status: 'Active' | 'VIP' | 'Lead';
}

export interface Lead {
  id: string;
  customerName: string;
  company: string;
  phone: string;
  value: number;
  stage: 'Lead' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Closed Won';
  assignedTo: string;
  lastFollowUp: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  role: string;
  department: string;
  salary: number;
  attendanceToday: 'Present' | 'Absent' | 'On Leave' | 'Half Day';
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
}

export interface DocumentRecord {
  id: string;
  docNumber: string;
  type: 'GST Invoice' | 'Quotation' | 'Estimate' | 'Purchase Order' | 'Sales Order' | 'Delivery Challan' | 'Credit Note' | 'Salary Slip' | 'Offer Letter' | string;
  clientName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Draft' | 'Sent' | 'Cancelled' | string;
  itemsCount: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileDataUrl?: string;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  paymentMode: 'Bank Transfer' | 'Cash' | 'Credit Card' | 'UPI';
  receiptAttached: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  client: string;
  budget: number;
  progress: number; // 0-100
  dueDate: string;
  status: 'In Progress' | 'Completed' | 'On Hold' | 'Planning';
  teamMembers: string[];
}

export interface SupportTicket {
  id: string;
  ticketNo: string;
  customerName: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'Invoice' | 'Receipt' | 'Payment Link' | 'Salary Slip' | 'Reminder' | 'Marketing';
  bodyText: string;
  status: 'Approved' | 'Pending Approval';
}

export interface WorkspaceConfig {
  id: string;
  organization_id: string;
  businessType: string;
  companySize: string;
  themeColor: string;
  wizardCompleted: boolean;
  enabledModules: ModuleType[] | string[];
  sidebarConfig?: {
    customLabels?: Record<string, string>;
    hiddenModules?: string[];
    orderedModules?: string[];
    customSections?: { id: string; title: string; modules: string[] }[];
  };
  customFields?: Record<string, { id: string; label: string; type: 'text' | 'number' | 'date' | 'select'; options?: string[]; required?: boolean }[]>;
  customStatuses?: Record<string, string[]>;
  customWidgets?: string[];
  approvalWorkflows?: { id: string; module: string; thresholdAmount: number; approverRole: string }[];
  documentTemplates?: { type: string; title: string; headerNote?: string; footerTerms?: string; logoPosition?: string }[];
  taxSettings?: { gstEnabled: boolean; gstin?: string; defaultTaxRate: number; panNo?: string };
  notificationRules?: { emailAlerts: boolean; whatsappAlerts: boolean; dailySummary: boolean };
}

export interface SubWorkspace {
  id: string;
  organization_id: string;
  branch_id?: string;
  name: string;
  type: 'Branch' | 'Department' | 'Project Site' | 'Practice Area' | 'Custom' | string;
  description?: string;
  members?: string[];
  enabledModules?: string[];
  status: 'Active' | 'Archived' | string;
  created_by?: string;
  createdAt?: string;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  description: string;
  defaultModules: string[];
  dashboardWidgets: string[];
  terminology: {
    clientLabel: string;
    productLabel: string;
    invoiceLabel: string;
    inventoryLabel: string;
    supplierLabel: string;
  };
  quickActions: string[];
  helpdeskCategories: string[];
  documentTypes: string[];
  isActive: boolean;
}

export interface HelpdeskTicket {
  id: string;
  organization_id: string;
  branch_id?: string;
  workspace_id?: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | string;
  status: 'Open' | 'In Progress' | 'Pending Customer' | 'Resolved' | 'Closed' | string;
  createdByName: string;
  createdByEmail?: string;
  assignedTo?: string;
  slaHours?: number;
  resolutionNotes?: string;
  customFields?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunicationSettings {
  id: string;
  officialWhatsappNumber: string;
  supportEmail: string;
  salesPhone: string;
  autoSharePdfOnWhatsapp: boolean;
  updatedAt?: string;
}

export interface DynamicPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  billingCycle: 'Monthly' | 'Yearly' | string;
  description: string;
  featuresJson: string | string[];
  enabledModulesJson?: string | string[];
  userLimit: number;
  branchLimit: number;
  storageLimitMb: number;
  aiUsageLimit: string;
  caServiceIncluded: boolean;
  isPopular: boolean;
  buttonText: string;
  isActive: boolean;
}

export interface AiCommandResponse {
  response: string;
  action?: 'NAVIGATE' | 'CREATE_INVOICE' | 'SEND_WHATSAPP' | 'SHOW_REPORT' | 'FILTER_INVENTORY' | 'GENERATE_SALARY';
  targetModule?: ModuleType;
  highlights?: string[];
  data?: any;
}

