import { 
  Organization, 
  Branch, 
  Product, 
  Customer, 
  Lead, 
  Employee, 
  DocumentRecord, 
  ExpenseRecord, 
  ProjectItem, 
  SupportTicket, 
  WhatsAppTemplate,
  BusinessType,
  PlanType,
  UserRole
} from '../types';

export interface BaseTenantEntity {
  organization_id: string;
  branch_id?: string;
  created_by?: string;
  updated_by?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantProduct extends Product, BaseTenantEntity {}
export interface TenantCustomer extends Customer, BaseTenantEntity {}
export interface TenantLead extends Lead, BaseTenantEntity {}
export interface TenantEmployee extends Employee, BaseTenantEntity {}
export interface TenantDocumentRecord extends DocumentRecord, BaseTenantEntity {}
export interface TenantExpenseRecord extends ExpenseRecord, BaseTenantEntity {}
export interface TenantProjectItem extends ProjectItem, BaseTenantEntity {}
export interface TenantSupportTicket extends SupportTicket, BaseTenantEntity {}
export interface TenantWhatsAppTemplate extends WhatsAppTemplate, BaseTenantEntity {}

export interface TenantUser extends BaseTenantEntity {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'Active' | 'Suspended';
}

export interface TenantVendor extends BaseTenantEntity {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  category: string;
  outstandingBalance: number;
}

export interface TenantPurchaseOrder extends BaseTenantEntity {
  id: string;
  poNumber: string;
  vendorName: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Received' | 'Approved' | 'Cancelled';
}

export interface TenantAuditLog extends BaseTenantEntity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
}

// Initial Multi-Tenant Isolated Datasets
export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'ORG-1001',
    name: 'Vanguard Retail Chain Ltd',
    gstin: '27AABCV8912A1Z5',
    plan: 'Growth',
    businessType: 'Retail',
    companySize: 'Medium'
  },
  {
    id: 'ORG-1002',
    name: 'Apollo Care Hospital & Medical Center',
    gstin: '24AAACD1109B1Z2',
    plan: 'Business',
    businessType: 'Hospital / Clinic',
    companySize: 'Enterprise'
  },
  {
    id: 'ORG-1003',
    name: 'Skyline Heavy Construction & Infra',
    gstin: '07AAACS4412K1Z9',
    plan: 'Enterprise',
    businessType: 'Construction',
    companySize: 'Enterprise'
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'BR-101', orgId: 'ORG-1001', name: 'Mumbai Bandra Central Store', city: 'Mumbai', code: 'MUM-01', isMain: true },
  { id: 'BR-102', orgId: 'ORG-1001', name: 'Pune FC Road Outlet', city: 'Pune', code: 'PUN-01', isMain: false },
  { id: 'BR-201', orgId: 'ORG-1002', name: 'Ahmedabad Main Specialty Wing', city: 'Ahmedabad', code: 'AMD-01', isMain: true },
  { id: 'BR-301', orgId: 'ORG-1003', name: 'Delhi NCR Site Office', city: 'New Delhi', code: 'DEL-01', isMain: true }
];

// Seeded Multi-Tenant Products (strictly isolated by organization_id)
export const SEEDED_PRODUCTS: TenantProduct[] = [
  // ORG-1001 (Retail Chain)
  { id: 'prod-1', organization_id: 'ORG-1001', branch_id: 'BR-101', sku: 'RET-101', name: 'Organic Cold Pressed Almond Milk 1L', category: 'Dairy & Beverages', price: 299, cost: 180, stock: 45, minStockAlert: 10, unit: 'Bottle', barcode: '890123456701', gstRate: 18 },
  { id: 'prod-2', organization_id: 'ORG-1001', branch_id: 'BR-101', sku: 'RET-102', name: 'Gourmet Dark Chocolate Bar 100g', category: 'Confectionery', price: 150, cost: 85, stock: 120, minStockAlert: 25, unit: 'Piece', barcode: '890123456702', gstRate: 18 },
  { id: 'prod-3', organization_id: 'ORG-1001', branch_id: 'BR-102', sku: 'RET-103', name: 'Extra Virgin Olive Oil 500ml', category: 'Grocery', price: 650, cost: 420, stock: 8, minStockAlert: 15, unit: 'Bottle', barcode: '890123456703', gstRate: 12 },

  // ORG-1002 (Hospital)
  { id: 'prod-4', organization_id: 'ORG-1002', branch_id: 'BR-201', sku: 'MED-501', name: 'Paracetamol 650mg Infusion Bag', category: 'Pharmaceuticals', price: 120, cost: 40, stock: 500, minStockAlert: 100, unit: 'Unit', barcode: '890999000101', gstRate: 12 },
  { id: 'prod-5', organization_id: 'ORG-1002', branch_id: 'BR-201', sku: 'MED-502', name: 'Sterile Surgical Gloves Box (100 pairs)', category: 'Surgical Consumables', price: 850, cost: 500, stock: 60, minStockAlert: 20, unit: 'Box', barcode: '890999000102', gstRate: 12 },

  // ORG-1003 (Construction)
  { id: 'prod-6', organization_id: 'ORG-1003', branch_id: 'BR-301', sku: 'MAT-901', name: 'Fe550 TMT Steel Rebar (1 Ton)', category: 'Structural Steel', price: 58000, cost: 49000, stock: 15, minStockAlert: 5, unit: 'Ton', barcode: '890888000101', gstRate: 18 },
  { id: 'prod-7', organization_id: 'ORG-1003', branch_id: 'BR-301', sku: 'MAT-902', name: 'Portland Cement Bags (50kg Bag)', category: 'Building Materials', price: 380, cost: 310, stock: 400, minStockAlert: 100, unit: 'Bag', barcode: '890888000102', gstRate: 28 }
];

// Seeded Multi-Tenant Customers
export const SEEDED_CUSTOMERS: TenantCustomer[] = [
  // ORG-1001
  { id: 'cust-1', organization_id: 'ORG-1001', branch_id: 'BR-101', name: 'Aarav Mehta', company: 'Nexus Retail Stores', email: 'aarav@nexus.in', phone: '+91 98200 11223', gstin: '27AAACN1234A1Z1', address: 'Bandra West, Mumbai', totalSpent: 48500, outstandingBalance: 3200, status: 'VIP' },
  { id: 'cust-2', organization_id: 'ORG-1001', branch_id: 'BR-101', name: 'Priya Sharma', company: 'Priya Mart', email: 'priya@mart.in', phone: '+91 98200 44556', address: 'Andheri East, Mumbai', totalSpent: 18200, outstandingBalance: 0, status: 'Active' },

  // ORG-1002
  { id: 'cust-3', organization_id: 'ORG-1002', branch_id: 'BR-201', name: 'Patient: Rajesh Gupta', company: 'Self', email: 'r.gupta@gmail.com', phone: '+91 98111 22334', address: 'Satellite, Ahmedabad', totalSpent: 125000, outstandingBalance: 12000, status: 'Active' },

  // ORG-1003
  { id: 'cust-4', organization_id: 'ORG-1003', branch_id: 'BR-301', name: 'DLF Urban Infra Corp', company: 'DLF Group', email: 'procurement@dlf.in', phone: '+91 98990 88776', gstin: '07AAACD9988K1Z3', address: 'Connaught Place, New Delhi', totalSpent: 4500000, outstandingBalance: 650000, status: 'VIP' }
];

// Seeded Multi-Tenant Employees
export const SEEDED_EMPLOYEES: TenantEmployee[] = [
  // ORG-1001
  { id: 'emp-1', organization_id: 'ORG-1001', branch_id: 'BR-101', code: 'EMP-101', name: 'Rohan Deshmukh', email: 'rohan@vanguardretail.in', role: 'Store Manager', department: 'Retail Operations', salary: 65000, attendanceToday: 'Present', joinDate: '2023-04-15', status: 'Active' },
  { id: 'emp-2', organization_id: 'ORG-1001', branch_id: 'BR-101', code: 'EMP-102', name: 'Sneha Kulkarni', email: 'sneha@vanguardretail.in', role: 'POS Cashier', department: 'Sales', salary: 32000, attendanceToday: 'Present', joinDate: '2024-01-10', status: 'Active' },

  // ORG-1002
  { id: 'emp-3', organization_id: 'ORG-1002', branch_id: 'BR-201', code: 'EMP-201', name: 'Dr. Ananya Joshi', email: 'dr.ananya@apollocare.org', role: 'Chief Resident Doctor', department: 'Cardiology', salary: 180000, attendanceToday: 'Present', joinDate: '2022-08-01', status: 'Active' },

  // ORG-1003
  { id: 'emp-4', organization_id: 'ORG-1003', branch_id: 'BR-301', code: 'EMP-301', name: 'Vikram Rajput', email: 'vikram@skylineinfra.com', role: 'Chief Project Engineer', department: 'Civil Construction', salary: 140000, attendanceToday: 'Present', joinDate: '2021-03-12', status: 'Active' }
];

// Seeded Multi-Tenant Documents & Invoices
export const SEEDED_DOCUMENTS: TenantDocumentRecord[] = [
  // ORG-1001
  { id: 'doc-1', organization_id: 'ORG-1001', branch_id: 'BR-101', docNumber: 'INV-2026-001', type: 'GST Invoice', clientName: 'Aarav Mehta', amount: 14850, date: '2026-08-01', status: 'Paid', itemsCount: 4 },
  { id: 'doc-2', organization_id: 'ORG-1001', branch_id: 'BR-101', docNumber: 'INV-2026-002', type: 'GST Invoice', clientName: 'Priya Sharma', amount: 8200, date: '2026-07-31', status: 'Pending', itemsCount: 2 },

  // ORG-1002
  { id: 'doc-3', organization_id: 'ORG-1002', branch_id: 'BR-201', docNumber: 'HOSP-2026-801', type: 'GST Invoice', clientName: 'Patient: Rajesh Gupta', amount: 45000, date: '2026-08-01', status: 'Paid', itemsCount: 12 },

  // ORG-1003
  { id: 'doc-4', organization_id: 'ORG-1003', branch_id: 'BR-301', docNumber: 'INFRA-PO-901', type: 'Purchase Order', clientName: 'DLF Urban Infra Corp', amount: 850000, date: '2026-07-28', status: 'Sent', itemsCount: 3 }
];

// Row-Level Isolation Query Utility Functions
export function getTenantRecords<T extends BaseTenantEntity>(records: T[], organization_id: string): T[] {
  return records.filter(r => r.organization_id === organization_id);
}

export function filterByBranch<T extends BaseTenantEntity>(records: T[], branch_id?: string): T[] {
  if (!branch_id) return records;
  return records.filter(r => !r.branch_id || r.branch_id === branch_id);
}
