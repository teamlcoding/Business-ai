export type UserRole = 
  | 'Super Admin'
  | 'Business Owner'
  | 'Branch Manager'
  | 'HR'
  | 'Accountant'
  | 'Sales'
  | 'Inventory Manager'
  | 'Employee'
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

export type PlanType = 'Free' | 'Starter' | 'Growth' | 'Business' | 'Enterprise';

export type ModuleType = 
  | 'dashboard'
  | 'pos'
  | 'documents'
  | 'whatsapp'
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
  type: 'GST Invoice' | 'Quotation' | 'Estimate' | 'Purchase Order' | 'Sales Order' | 'Delivery Challan' | 'Credit Note' | 'Salary Slip' | 'Offer Letter';
  clientName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Draft' | 'Sent' | 'Cancelled';
  itemsCount: number;
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

export interface AiCommandResponse {
  response: string;
  action?: 'NAVIGATE' | 'CREATE_INVOICE' | 'SEND_WHATSAPP' | 'SHOW_REPORT' | 'FILTER_INVENTORY' | 'GENERATE_SALARY';
  targetModule?: ModuleType;
  highlights?: string[];
  data?: any;
}
