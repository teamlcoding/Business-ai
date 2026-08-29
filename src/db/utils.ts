import { eq, and, SQL } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { db } from './index.ts';
import * as schema from './schema.ts';
import {
  encryptSensitiveRecord,
  decryptSensitiveRecord,
  decryptSensitiveRecords,
  DEFAULT_SENSITIVE_FIELDS,
  hashField,
  encryptField,
  decryptField
} from '../services/cryptoService.ts';
import { logAuditAction, logReqAudit } from '../services/auditLogger.ts';

export {
  encryptSensitiveRecord,
  decryptSensitiveRecord,
  decryptSensitiveRecords,
  DEFAULT_SENSITIVE_FIELDS,
  hashField,
  encryptField,
  decryptField,
  logAuditAction,
  logReqAudit
};

/**
 * Tenant Isolation & Field-Level Encryption Utility Functions
 * Enforces strict multi-tenant isolation and encrypts sensitive fields before hitting the database.
 */

/**
 * Inject organization_id and optional branch_id conditions into a Drizzle query filter.
 * Ensures strict multi-tenant isolation and branch-level data segregation across all database calls.
 */
export function buildTenantFilter(
  tableOrgColumn: any,
  orgId: string,
  additionalCondition?: SQL
): SQL {
  if (!orgId) {
    throw new Error('Tenant Isolation Security Error: organization_id is required for database query execution.');
  }

  const tenantCondition = eq(tableOrgColumn, orgId);
  if (additionalCondition) {
    return and(tenantCondition, additionalCondition)!;
  }
  return tenantCondition;
}

export function buildTenantAndBranchFilter(
  tableOrgColumn: any,
  tableBranchColumn: any,
  orgId: string,
  branchId?: string | null,
  additionalCondition?: SQL
): SQL {
  if (!orgId) {
    throw new Error('Tenant Isolation Security Error: organization_id is required for database query execution.');
  }

  const tenantCondition = eq(tableOrgColumn, orgId);
  const conditions: SQL[] = [tenantCondition];

  if (branchId && tableBranchColumn) {
    conditions.push(eq(tableBranchColumn, branchId));
  }

  if (additionalCondition) {
    conditions.push(additionalCondition);
  }

  return and(...conditions)!;
}

/**
 * Fetch records from any tenant-scoped table with mandatory organization_id filter and auto-decryption of FLE fields.
 */
export async function selectTenantRecords<T extends PgTable & { organization_id: any }>(
  table: T,
  orgId: string,
  additionalCondition?: SQL
) {
  if (!orgId) {
    throw new Error('Tenant Isolation Security Error: Missing organization_id filter.');
  }

  const filter = buildTenantFilter(table.organization_id, orgId, additionalCondition);
  const rows = await db.select().from(table as any).where(filter);
  return decryptSensitiveRecords(rows);
}

/**
 * Fetch records from any tenant-scoped table with mandatory organization_id and optional branch_id filters.
 */
export async function selectTenantBranchRecords<T extends PgTable & { organization_id: any; branch_id?: any }>(
  table: T,
  orgId: string,
  branchId?: string | null,
  additionalCondition?: SQL
) {
  if (!orgId) {
    throw new Error('Tenant Isolation Security Error: Missing organization_id filter.');
  }

  const filter = buildTenantAndBranchFilter(table.organization_id, (table as any).branch_id, orgId, branchId, additionalCondition);
  const rows = await db.select().from(table as any).where(filter);
  return decryptSensitiveRecords(rows);
}

/**
 * Insert a new record enforcing that organization_id and branch_id match active tenant context with automatic Field-Level Encryption and Audit Logging.
 */
export async function insertTenantRecord<T extends PgTable & { organization_id: any }>(
  table: T,
  values: Record<string, any>,
  orgId: string,
  branchId?: string | null
) {
  if (!orgId) {
    throw new Error('Tenant Isolation Security Error: Cannot insert record without organization_id.');
  }

  const encryptedValues = encryptSensitiveRecord(values);
  const recordWithTenant = {
    ...encryptedValues,
    organization_id: orgId,
    ...(branchId && (table as any).branch_id ? { branch_id: branchId } : {}),
  };

  const results = await db.insert(table as any).values(recordWithTenant).returning();
  const decrypted = decryptSensitiveRecord((results as any[])?.[0]);

  // Centralized Audit Log
  const tableName = (table as any)?.[Symbol.for('drizzle:Name')] || 'Database Table';
  logAuditAction({
    organizationId: orgId,
    userId: values.created_by || values.userId || 'usr-system',
    userName: values.created_by_name || values.userName || 'Active User',
    action: `Created record in ${tableName}`,
    module: tableName,
    details: { recordId: decrypted?.id, type: values.type || values.name }
  }).catch(e => console.warn('Audit logging note:', e));

  return decrypted;
}

/**
 * Update record(s) in a table restricted strictly to the active tenant organization_id with Field-Level Encryption and Audit Logging.
 */
export async function updateTenantRecord<T extends PgTable & { organization_id: any }>(
  table: T,
  values: Record<string, any>,
  orgId: string,
  whereCondition: SQL
) {
  if (!orgId) {
    throw new Error('Tenant Isolation Security Error: Cannot update record without organization_id filter.');
  }

  const encryptedValues = encryptSensitiveRecord(values);
  const tenantWhere = buildTenantFilter(table.organization_id, orgId, whereCondition);
  const updatedRows = await db.update(table as any).set(encryptedValues).where(tenantWhere).returning();
  const decrypted = decryptSensitiveRecords(updatedRows);

  // Centralized Audit Log
  const tableName = (table as any)?.[Symbol.for('drizzle:Name')] || 'Database Table';
  logAuditAction({
    organizationId: orgId,
    userId: values.updated_by || values.userId || 'usr-system',
    userName: values.updated_by_name || values.userName || 'Active User',
    action: `Updated record(s) in ${tableName}`,
    module: tableName,
    details: { count: decrypted.length, updatedKeys: Object.keys(values) }
  }).catch(e => console.warn('Audit logging note:', e));

  return decrypted;
}

/**
 * Delete record(s) from a table restricted strictly to the active tenant organization_id with Audit Logging.
 */
export async function deleteTenantRecord<T extends PgTable & { organization_id: any }>(
  table: T,
  orgId: string,
  whereCondition: SQL
) {
  if (!orgId) {
    throw new Error('Tenant Isolation Security Error: Cannot delete record without organization_id filter.');
  }

  const tenantWhere = buildTenantFilter(table.organization_id, orgId, whereCondition);
  const deleted = await db.delete(table as any).where(tenantWhere).returning();
  const deletedArray = (Array.isArray(deleted) ? deleted : []) as any[];

  // Centralized Audit Log
  const tableName = (table as any)?.[Symbol.for('drizzle:Name')] || 'Database Table';
  logAuditAction({
    organizationId: orgId,
    userId: 'usr-system',
    userName: 'Active User',
    action: `Deleted record(s) from ${tableName}`,
    module: tableName,
    details: { count: deletedArray.length, deletedIds: deletedArray.map((d: any) => d.id) }
  }).catch(e => console.warn('Audit logging note:', e));

  return deleted;
}

/**
 * Specific Tenant Helper Queries
 */
export async function getTenantUsers(orgId: string) {
  return selectTenantRecords(schema.users, orgId);
}

export async function getTenantBranches(orgId: string) {
  return selectTenantRecords(schema.branches, orgId);
}

export async function getTenantCustomers(orgId: string) {
  return selectTenantRecords(schema.customers, orgId);
}

export async function getTenantVendors(orgId: string) {
  return selectTenantRecords(schema.vendors, orgId);
}

export async function getTenantProducts(orgId: string) {
  return selectTenantRecords(schema.products, orgId);
}

export async function getTenantInvoices(orgId: string) {
  return selectTenantRecords(schema.invoices, orgId);
}

export async function getTenantPurchases(orgId: string) {
  return selectTenantRecords(schema.purchases, orgId);
}

export async function getTenantEmployees(orgId: string) {
  return selectTenantRecords(schema.employees, orgId);
}

export async function getTenantDocuments(orgId: string) {
  return selectTenantRecords(schema.documents, orgId);
}

export async function getTenantProjects(orgId: string) {
  return selectTenantRecords(schema.projects, orgId);
}

export async function getTenantTasks(orgId: string) {
  return selectTenantRecords(schema.tasks, orgId);
}
