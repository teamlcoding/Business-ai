import { Organization, Branch, Product, Customer, Lead, Employee, DocumentRecord, ExpenseRecord, ProjectItem, SupportTicket, WhatsAppTemplate } from '../types';

export const mockOrganizations: Organization[] = [
  {
    id: 'ORG-SYSTEM',
    name: 'BusinessOS AI Headquarters',
    gstin: '27AABCV8912A1Z5',
    logoUrl: '',
    plan: 'Enterprise',
    businessType: 'IT Company / CA Firm',
    companySize: 'Enterprise',
  }
];

export const mockBranches: Branch[] = [
  { id: 'b-1', orgId: 'ORG-SYSTEM', name: 'Main Headquarter Branch', city: 'Mumbai', code: 'HQ-01', isMain: true }
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

export const mockProducts: TenantProduct[] = [];
export const mockCustomers: TenantCustomer[] = [];
export const mockLeads: TenantLead[] = [];
export const mockEmployees: TenantEmployee[] = [];
export const mockDocuments: TenantDocumentRecord[] = [];
export const mockExpenses: TenantExpenseRecord[] = [];
export const mockProjects: TenantProjectItem[] = [];
export const mockTickets: TenantSupportTicket[] = [];
export const mockWhatsAppTemplates: TenantWhatsAppTemplate[] = [];
