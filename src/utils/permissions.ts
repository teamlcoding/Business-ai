import { PlanType, ModuleType, UserRole, Organization } from '../types';

export const PAID_PLANS: PlanType[] = ['Starter', 'Growth', 'Business', 'Enterprise'];

export function isPaidPlan(plan?: PlanType): boolean {
  if (!plan) return false;
  return plan !== 'Free';
}

export const PAID_MODULES: ModuleType[] = [
  'whatsapp',
  'crm',
  'hr',
  'inventory',
  'finance',
  'projects',
  'reports'
];

export function isPaidModule(module: ModuleType): boolean {
  return PAID_MODULES.includes(module);
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: 'role_restricted' | 'plan_upgrade_required' | 'pending_approval';
  message?: string;
}

export function checkModulePermission(
  org: Organization | null | undefined,
  role: UserRole,
  module: ModuleType
): PermissionCheckResult {
  // Super Admin bypass
  if (role === 'Super Admin') {
    return { allowed: true };
  }

  // Superadmin module is restricted to Super Admin role
  if (module === 'superadmin') {
    return {
      allowed: false,
      reason: 'role_restricted',
      message: 'Super Admin module is exclusively reserved for system Super Admin users.'
    };
  }

  // Check if module requires a Paid Plan
  if (isPaidModule(module)) {
    if (!org || !isPaidPlan(org.plan)) {
      return {
        allowed: false,
        reason: 'plan_upgrade_required',
        message: `The ${module.toUpperCase()} module is restricted to active Paid Subscriptions (Starter, Growth, Business, or Enterprise).`
      };
    }
  }

  return { allowed: true };
}
