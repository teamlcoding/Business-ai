import { db } from '../db/index.ts';
import * as schema from '../db/schema.ts';

export interface AuditLogParams {
  organizationId: string;
  userId?: string;
  userName?: string;
  action: string;
  module: string;
  ipAddress?: string;
  details?: Record<string, any> | string;
}

/**
 * Centralized Audit Logging Utility
 * Captures user actions across the application (document creation, updates, deletions)
 * and persists them into PostgreSQL with organization_id, user_id, and timestamp.
 */
export async function logAuditAction(params: AuditLogParams) {
  try {
    const {
      organizationId,
      userId = 'usr-system',
      userName = 'System / Business User',
      action,
      module: moduleName,
      ipAddress = '127.0.0.1',
      details
    } = params;

    if (!organizationId) {
      console.warn('[AuditLogger] Warning: organizationId missing, skipping database record.');
      return null;
    }

    let detailSuffix = '';
    if (details) {
      if (typeof details === 'string') {
        detailSuffix = ` - ${details}`;
      } else {
        try {
          detailSuffix = ` - ${JSON.stringify(details)}`;
        } catch {
          detailSuffix = ' - [Details object]';
        }
      }
    }

    const fullAction = `${action}${detailSuffix}`;

    const newLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      organization_id: organizationId,
      userId: String(userId),
      userName: String(userName),
      action: fullAction.length > 500 ? fullAction.substring(0, 497) + '...' : fullAction,
      module: moduleName || 'General',
      ipAddress,
      timestamp: new Date().toISOString(),
    };

    const result = await db.insert(schema.audit_logs).values(newLog).returning();
    return result[0];
  } catch (err) {
    console.error('[AuditLogger Error] Could not write audit log to PostgreSQL:', err);
    return null;
  }
}

/**
 * Helper for Express API route handlers to automatically capture request audit context
 */
export async function logReqAudit(
  req: any,
  action: string,
  moduleName: string,
  details?: Record<string, any> | string
) {
  const orgId =
    req.tenantContext?.organization_id ||
    req.body?.organization_id ||
    req.query?.organization_id ||
    'org-001';

  const user = req.user || {};
  const userId = user.id || user.username || user.userId || 'usr-active';
  const userName = user.name || user.username || user.email || user.role || 'Active User';

  const ipAddress =
    (req.headers && (req.headers['x-forwarded-for'] as string)?.split(',')[0]) ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  return logAuditAction({
    organizationId: orgId,
    userId,
    userName,
    action,
    module: moduleName,
    ipAddress,
    details,
  });
}
