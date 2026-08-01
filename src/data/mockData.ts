import { Organization, Branch, Product, Customer, Lead, Employee, DocumentRecord, ExpenseRecord, ProjectItem, SupportTicket, WhatsAppTemplate } from '../types';

export const mockOrganizations: Organization[] = [
  {
    id: 'ORG-1001',
    name: 'Vanguard Retail Chain Ltd',
    gstin: '27AABCV8912A1Z5',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    plan: 'Growth',
    businessType: 'Retail',
    companySize: 'Medium',
  },
  {
    id: 'ORG-1002',
    name: 'Apollo Care Hospital & Medical Center',
    gstin: '24AAACD1109B1Z2',
    logoUrl: '',
    plan: 'Business',
    businessType: 'Hospital / Clinic',
    companySize: 'Enterprise',
  },
  {
    id: 'ORG-1003',
    name: 'Skyline Heavy Construction & Infra',
    gstin: '07AAACS4412K1Z9',
    logoUrl: '',
    plan: 'Enterprise',
    businessType: 'Construction',
    companySize: 'Enterprise',
  },
];

export const mockBranches: Branch[] = [
  { id: 'b-1', orgId: 'ORG-1001', name: 'Mumbai Bandra Central Store', city: 'Mumbai', code: 'MUM-01', isMain: true },
  { id: 'b-2', orgId: 'ORG-1001', name: 'Pune FC Road Outlet', city: 'Pune', code: 'PUN-01', isMain: false },
  { id: 'b-3', orgId: 'ORG-1002', name: 'Ahmedabad Main Specialty Wing', city: 'Ahmedabad', code: 'AMD-01', isMain: true },
  { id: 'b-4', orgId: 'ORG-1003', name: 'Delhi NCR Site Office', city: 'New Delhi', code: 'DEL-01', isMain: true }
];

export interface TenantProduct extends Product {
  organization_id: string;
}

export interface TenantCustomer extends Customer {
  organization_id: string;
}

export interface TenantLead extends Lead {
  organization_id: string;
}

export interface TenantEmployee extends Employee {
  organization_id: string;
}

export interface TenantDocumentRecord extends DocumentRecord {
  organization_id: string;
}

export interface TenantExpenseRecord extends ExpenseRecord {
  organization_id: string;
}

export interface TenantProjectItem extends ProjectItem {
  organization_id: string;
}

export interface TenantSupportTicket extends SupportTicket {
  organization_id: string;
}

export interface TenantWhatsAppTemplate extends WhatsAppTemplate {
  organization_id: string;
}

export const mockProducts: TenantProduct[] = [
  // ORG-1001 (Retail Chain)
  { id: 'p-1', organization_id: 'ORG-1001', sku: 'RET-101', name: 'Organic Cold Pressed Almond Milk 1L', category: 'Dairy & Beverages', price: 299, cost: 180, stock: 45, minStockAlert: 10, unit: 'Bottle', barcode: '890123456701', gstRate: 18 },
  { id: 'p-2', organization_id: 'ORG-1001', sku: 'RET-102', name: 'Gourmet Dark Chocolate Bar 100g', category: 'Confectionery', price: 150, cost: 85, stock: 120, minStockAlert: 25, unit: 'Piece', barcode: '890123456702', gstRate: 18 },
  { id: 'p-3', organization_id: 'ORG-1001', sku: 'RET-103', name: 'Extra Virgin Olive Oil 500ml', category: 'Grocery', price: 650, cost: 420, stock: 8, minStockAlert: 15, unit: 'Bottle', barcode: '890123456703', gstRate: 12 },
  { id: 'p-4', organization_id: 'ORG-1001', sku: 'RET-104', name: 'Logitech MX Master 3S Wireless Mouse', category: 'Electronics', price: 8990, cost: 6500, stock: 14, minStockAlert: 5, unit: 'Pcs', barcode: '890123456704', gstRate: 18 },

  // ORG-1002 (Hospital)
  { id: 'p-5', organization_id: 'ORG-1002', sku: 'MED-501', name: 'Paracetamol 650mg Infusion Bag', category: 'Pharmaceuticals', price: 120, cost: 40, stock: 500, minStockAlert: 100, unit: 'Unit', barcode: '890999000101', gstRate: 12 },
  { id: 'p-6', organization_id: 'ORG-1002', sku: 'MED-502', name: 'Sterile Surgical Gloves Box (100 pairs)', category: 'Surgical Consumables', price: 850, cost: 500, stock: 60, minStockAlert: 20, unit: 'Box', barcode: '890999000102', gstRate: 12 },

  // ORG-1003 (Construction)
  { id: 'p-7', organization_id: 'ORG-1003', sku: 'MAT-901', name: 'Fe550 TMT Steel Rebar (1 Ton)', category: 'Structural Steel', price: 58000, cost: 49000, stock: 15, minStockAlert: 5, unit: 'Ton', barcode: '890888000101', gstRate: 18 },
  { id: 'p-8', organization_id: 'ORG-1003', sku: 'MAT-902', name: 'Portland Cement Bags (50kg Bag)', category: 'Building Materials', price: 380, cost: 310, stock: 400, minStockAlert: 100, unit: 'Bag', barcode: '890888000102', gstRate: 28 }
];

export const mockCustomers: TenantCustomer[] = [
  // ORG-1001
  { id: 'c-1', organization_id: 'ORG-1001', name: 'Aarav Mehta', company: 'Nexus Retail Stores', email: 'aarav@nexus.in', phone: '+91 98200 11223', gstin: '27AAACN1234A1Z1', address: 'Bandra West, Mumbai', totalSpent: 48500, outstandingBalance: 3200, status: 'VIP' },
  { id: 'c-2', organization_id: 'ORG-1001', name: 'Priya Sharma', company: 'Priya Mart', email: 'priya@mart.in', phone: '+91 98200 44556', address: 'Andheri East, Mumbai', totalSpent: 18200, outstandingBalance: 0, status: 'Active' },

  // ORG-1002
  { id: 'c-3', organization_id: 'ORG-1002', name: 'Patient: Rajesh Gupta', company: 'Self', email: 'r.gupta@gmail.com', phone: '+91 98111 22334', address: 'Satellite, Ahmedabad', totalSpent: 125000, outstandingBalance: 12000, status: 'Active' },

  // ORG-1003
  { id: 'c-4', organization_id: 'ORG-1003', name: 'DLF Urban Infra Corp', company: 'DLF Group', email: 'procurement@dlf.in', phone: '+91 98990 88776', gstin: '07AAACD9988K1Z3', address: 'Connaught Place, New Delhi', totalSpent: 4500000, outstandingBalance: 650000, status: 'VIP' }
];

export const mockLeads: TenantLead[] = [
  // ORG-1001
  { id: 'l-1', organization_id: 'ORG-1001', customerName: 'Rohan Mehta', company: 'AeroSpace Components India', phone: '+91 98220 44111', value: 350000, stage: 'Proposal', assignedTo: 'Amit Varma', lastFollowUp: 'Yesterday' },
  { id: 'l-2', organization_id: 'ORG-1001', customerName: 'Kavita Chawla', company: 'Chawla Retail Chains', phone: '+91 98110 99887', value: 620000, stage: 'Negotiation', assignedTo: 'Neha Kapoor', lastFollowUp: 'Today, 11:00 AM' },

  // ORG-1002
  { id: 'l-3', organization_id: 'ORG-1002', customerName: 'Corporate Health Package', company: 'TCS Medical Desk', phone: '+91 99300 22110', value: 1200000, stage: 'Contacted', assignedTo: 'Dr. Patel', lastFollowUp: '3 days ago' },

  // ORG-1003
  { id: 'l-4', organization_id: 'ORG-1003', customerName: 'NHAI Highway Tender', company: 'NHAI India', phone: '+91 98200 77665', value: 24000000, stage: 'Closed Won', assignedTo: 'Anand Verma', lastFollowUp: 'Today, 2:30 PM' }
];

export const mockEmployees: TenantEmployee[] = [
  // ORG-1001
  { id: 'e-1', organization_id: 'ORG-1001', code: 'EMP-101', name: 'Rohan Deshmukh', email: 'rohan@vanguardretail.in', role: 'Store Manager', department: 'Retail Operations', salary: 65000, attendanceToday: 'Present', joinDate: '2023-04-15', status: 'Active' },
  { id: 'e-2', organization_id: 'ORG-1001', code: 'EMP-102', name: 'Sneha Kulkarni', email: 'sneha@vanguardretail.in', role: 'POS Cashier', department: 'Sales', salary: 32000, attendanceToday: 'Present', joinDate: '2024-01-10', status: 'Active' },

  // ORG-1002
  { id: 'e-3', organization_id: 'ORG-1002', code: 'EMP-201', name: 'Dr. Ananya Joshi', email: 'dr.ananya@apollocare.org', role: 'Chief Resident Doctor', department: 'Cardiology', salary: 180000, attendanceToday: 'Present', joinDate: '2022-08-01', status: 'Active' },

  // ORG-1003
  { id: 'e-4', organization_id: 'ORG-1003', code: 'EMP-301', name: 'Vikram Rajput', email: 'vikram@skylineinfra.com', role: 'Chief Project Engineer', department: 'Civil Construction', salary: 140000, attendanceToday: 'Present', joinDate: '2021-03-12', status: 'Active' }
];

export const mockDocuments: TenantDocumentRecord[] = [
  // ORG-1001
  { id: 'd-1', organization_id: 'ORG-1001', docNumber: 'INV-2026-001', type: 'GST Invoice', clientName: 'Aarav Mehta', amount: 14850, date: '2026-08-01', status: 'Paid', itemsCount: 4 },
  { id: 'd-2', organization_id: 'ORG-1001', docNumber: 'INV-2026-002', type: 'GST Invoice', clientName: 'Priya Sharma', amount: 8200, date: '2026-07-31', status: 'Pending', itemsCount: 2 },

  // ORG-1002
  { id: 'd-3', organization_id: 'ORG-1002', docNumber: 'HOSP-2026-801', type: 'GST Invoice', clientName: 'Patient: Rajesh Gupta', amount: 45000, date: '2026-08-01', status: 'Paid', itemsCount: 12 },

  // ORG-1003
  { id: 'd-4', organization_id: 'ORG-1003', docNumber: 'INFRA-PO-901', type: 'Purchase Order', clientName: 'DLF Urban Infra Corp', amount: 850000, date: '2026-07-28', status: 'Sent', itemsCount: 3 }
];

export const mockExpenses: TenantExpenseRecord[] = [
  // ORG-1001
  { id: 'ex-1', organization_id: 'ORG-1001', category: 'Store Utilities', description: 'Bandra Store Electricity Bill', amount: 18400, date: '2026-07-28', paidBy: 'Corporate Card', paymentMode: 'Credit Card', receiptAttached: true },

  // ORG-1002
  { id: 'ex-2', organization_id: 'ORG-1002', category: 'Medical Oxygen Supplies', description: 'Liquid Medical Oxygen Cylinder Refill', amount: 85000, date: '2026-07-25', paidBy: 'Bank Transfer', paymentMode: 'Bank Transfer', receiptAttached: true },

  // ORG-1003
  { id: 'ex-3', organization_id: 'ORG-1003', category: 'Equipment Fuel & Diesel', description: 'Site JCB Excavator Fuel Refill', amount: 140000, date: '2026-07-30', paidBy: 'Site Manager Cash', paymentMode: 'Cash', receiptAttached: true }
];

export const mockProjects: TenantProjectItem[] = [
  // ORG-1001
  { id: 'prj-1', organization_id: 'ORG-1001', title: 'Pune FC Road Store Launch', client: 'Internal Expansion', budget: 850000, progress: 85, dueDate: '2026-08-20', status: 'In Progress', teamMembers: ['Rohan Deshmukh', 'Sneha Kulkarni'] },

  // ORG-1002
  { id: 'prj-2', organization_id: 'ORG-1002', title: 'ICU Block B Automation & Telemetry', client: 'Apollo Board', budget: 3200000, progress: 50, dueDate: '2026-09-15', status: 'In Progress', teamMembers: ['Dr. Ananya Joshi'] },

  // ORG-1003
  { id: 'prj-3', organization_id: 'ORG-1003', title: 'Delhi NCR Highway Flyover Section 4', client: 'NHAI India', budget: 45000000, progress: 65, dueDate: '2026-12-30', status: 'In Progress', teamMembers: ['Vikram Rajput'] }
];

export const mockTickets: TenantSupportTicket[] = [
  // ORG-1001
  { id: 't-1', organization_id: 'ORG-1001', ticketNo: 'TCK-1001', customerName: 'Aarav Mehta', subject: 'Receipt barcode formatting query', priority: 'Low', status: 'Resolved', createdAt: '2026-07-29' },

  // ORG-1002
  { id: 't-2', organization_id: 'ORG-1002', ticketNo: 'TCK-2001', customerName: 'Patient: Rajesh Gupta', subject: 'Mediclaim insurance claim document request', priority: 'High', status: 'In Progress', createdAt: '2026-07-31' },

  // ORG-1003
  { id: 't-3', organization_id: 'ORG-1003', ticketNo: 'TCK-3001', customerName: 'DLF Urban Infra Corp', subject: 'Steel mill test certificate dispatch', priority: 'Medium', status: 'Open', createdAt: '2026-08-01' }
];

export const mockWhatsAppTemplates: TenantWhatsAppTemplate[] = [
  { id: 'wt-1', organization_id: 'ORG-1001', name: 'Invoice Notification', category: 'Invoice', bodyText: 'Dear {{customer_name}}, your invoice {{invoice_no}} for amount {{amount}} is ready. Thank you for choosing {{company_name}}.', status: 'Approved' },
  { id: 'wt-2', organization_id: 'ORG-1001', name: 'Payment Reminder', category: 'Reminder', bodyText: 'Hi {{customer_name}}, this is a gentle reminder regarding payment of {{amount}} for invoice {{invoice_no}} due on {{due_date}}.', status: 'Approved' },
  { id: 'wt-3', organization_id: 'ORG-1001', name: 'Monthly Salary Slip', category: 'Salary Slip', bodyText: 'Hello {{employee_name}}, your salary slip for month {{month}} has been generated. Net Salary: {{net_salary}}.', status: 'Approved' }
];
