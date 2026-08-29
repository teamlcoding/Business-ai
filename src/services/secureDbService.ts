import { PgTable } from 'drizzle-orm/pg-core';
import { SQL } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { buildTenantFilter } from '../db/utils.ts';
import {
  encryptSensitiveRecord,
  decryptSensitiveRecord,
  decryptSensitiveRecords,
  DEFAULT_SENSITIVE_FIELDS,
} from './cryptoService.ts';

/**
 * Secure Database Interaction Service Layer
 * Wraps database operations with automatic Field-Level Encryption (FLE),
 * deterministic data hashing, and tenant security filters before hitting the database persistence layer.
 */

export interface SecureDbOptions {
  sensitiveFields?: string[];
  bypassEncryption?: boolean;
}

/**
 * Secure Insert: Encrypts sensitive fields before persisting to database
 */
export async function secureInsert<T extends PgTable & { organization_id: any }>(
  table: T,
  values: Record<string, any>,
  orgId: string,
  options: SecureDbOptions = {}
) {
  if (!orgId) {
    throw new Error('Secure DB Error: organization_id is required for multi-tenant insert.');
  }

  const sensitiveFields = options.sensitiveFields || DEFAULT_SENSITIVE_FIELDS;
  
  // Encrypt sensitive payload
  const processedValues = options.bypassEncryption
    ? { ...values, organization_id: orgId }
    : { ...encryptSensitiveRecord(values, sensitiveFields), organization_id: orgId };

  const results = await db.insert(table as any).values(processedValues).returning();

  // Return decrypted record for immediate UI consumption
  return decryptSensitiveRecord((results as any[])?.[0], sensitiveFields);
}

/**
 * Secure Select: Fetches records scoped to active tenant and decrypts sensitive fields
 */
export async function secureSelect<T extends PgTable & { organization_id: any }>(
  table: T,
  orgId: string,
  additionalCondition?: SQL,
  options: SecureDbOptions = {}
) {
  if (!orgId) {
    throw new Error('Secure DB Error: organization_id is required for tenant isolation.');
  }

  const filter = buildTenantFilter(table.organization_id, orgId, additionalCondition);
  const rows = await db.select().from(table as any).where(filter);

  const sensitiveFields = options.sensitiveFields || DEFAULT_SENSITIVE_FIELDS;
  return options.bypassEncryption ? rows : decryptSensitiveRecords(rows, sensitiveFields);
}

/**
 * Secure Update: Encrypts updated sensitive fields before persistence and decrypts result
 */
export async function secureUpdate<T extends PgTable & { organization_id: any }>(
  table: T,
  values: Record<string, any>,
  orgId: string,
  whereCondition: SQL,
  options: SecureDbOptions = {}
) {
  if (!orgId) {
    throw new Error('Secure DB Error: organization_id is required for tenant update.');
  }

  const sensitiveFields = options.sensitiveFields || DEFAULT_SENSITIVE_FIELDS;
  const processedValues = options.bypassEncryption
    ? values
    : encryptSensitiveRecord(values, sensitiveFields);

  const tenantWhere = buildTenantFilter(table.organization_id, orgId, whereCondition);
  const updatedRows = await db.update(table as any).set(processedValues).where(tenantWhere).returning();

  return options.bypassEncryption
    ? updatedRows
    : decryptSensitiveRecords(updatedRows, sensitiveFields);
}

/**
 * Secure Delete: Deletes records strictly within tenant scope
 */
export async function secureDelete<T extends PgTable & { organization_id: any }>(
  table: T,
  orgId: string,
  whereCondition: SQL
) {
  if (!orgId) {
    throw new Error('Secure DB Error: organization_id is required for tenant delete.');
  }

  const tenantWhere = buildTenantFilter(table.organization_id, orgId, whereCondition);
  return await db.delete(table as any).where(tenantWhere).returning();
}
