# Firebase Security Specification

## Data Invariants
1. A resource (branch, user, customer, product, invoice, employee) must belong to a valid Organization (`orgId`).
2. Only authenticated users bound to an Organization or Super Admins can access or modify tenant records.
3. Users cannot forge document ownership or overwrite `organization_id` fields.

## Dirty Dozen Security Test Payloads
1. Unauthenticated creation of an organization.
2. Cross-tenant read access (User in Org A reading Org B documents).
3. Shadow field injection (Injecting `isAdmin: true` into user document).
4. Invalid string length payload (Injecting 1MB string into product name).
5. Document ID poisoning (Using 500-character string with special characters as document ID).
6. State shortcut (Bypassing invoice approval or updating terminal status).
7. Non-owner modification of user roles or permissions.
8. Impersonation via client-provided user ID in authorization payload.
9. Modifying immutable timestamp `createdAt`.
10. Unverified email write attempt.
11. Query scraping with blanket list queries without resource filtering.
12. Attempting to bypass tenant organization check via wildcard path traversal.
