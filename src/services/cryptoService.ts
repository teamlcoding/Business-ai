import crypto from 'node:crypto';

/**
 * Field-Level Encryption & Hashing Service
 * Provides AES-256-GCM symmetric encryption and salted SHA-256 deterministic hashing
 * for protecting sensitive business data before it reaches the persistence layer.
 */

// Encryption Key and Salt derivation from environment or fallback secure seed
const MASTER_KEY = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET || 'businessos_field_encryption_master_key_2026_99x';
const HASH_SALT = process.env.HASH_SALT || 'businessos_salt_2026_q88';

// Derive a 256-bit key using PBKDF2
const AES_KEY = crypto.pbkdf2Sync(MASTER_KEY, HASH_SALT, 100000, 32, 'sha256');

// List of default sensitive field names across business schemas
export const DEFAULT_SENSITIVE_FIELDS = [
  'gstin',
  'panNumber',
  'bankAccountNo',
  'ifscCode',
  'salary',
  'phone',
  'whatsappNumber',
  'aadhaar',
  'ssn',
  'creditLimit',
  'taxRegistrationNumber',
  'passportNo',
  'patientMedicalHistory',
  'apiSecret',
  'privateNotes'
];

/**
 * Deterministically hash a value (e.g. phone, email, GSTIN) for exact-match database queries
 * without storing raw plain text.
 */
export function hashField(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const str = String(value).trim().toLowerCase();
  return crypto.createHmac('sha256', HASH_SALT).update(str).digest('hex');
}

/**
 * Encrypt a plain text string using AES-256-GCM.
 * Output format: `enc:ivHex:authTagHex:encryptedTextHex`
 */
export function encryptField(plaintext: string | number | null | undefined): string {
  if (plaintext === null || plaintext === undefined || plaintext === '') return '';
  const text = String(plaintext);
  
  // If already encrypted, avoid double encryption
  if (text.startsWith('enc:')) return text;

  const iv = crypto.randomBytes(12); // 96-bit IV for AES-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', AES_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  const ivHex = iv.toString('hex');

  return `enc:${ivHex}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM encrypted string.
 * Expects input format: `enc:ivHex:authTagHex:encryptedTextHex`
 */
export function decryptField(encryptedPayload: string | null | undefined): string {
  if (!encryptedPayload || typeof encryptedPayload !== 'string') return '';
  if (!encryptedPayload.startsWith('enc:')) return encryptedPayload; // Return raw if unencrypted legacy data

  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 4) return encryptedPayload;

    const [, ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', AES_KEY, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Field Decryption Error:', error);
    // Return masked indicator on decryption failure
    return '[Encrypted Business Data]';
  }
}

/**
 * Encrypt sensitive keys in a record before storing in the database layer.
 */
export function encryptSensitiveRecord<T extends Record<string, any>>(
  record: T,
  sensitiveFields: string[] = DEFAULT_SENSITIVE_FIELDS
): T {
  if (!record || typeof record !== 'object') return record;

  const encryptedRecord: Record<string, any> = { ...record };

  for (const field of sensitiveFields) {
    if (field in encryptedRecord && encryptedRecord[field]) {
      // Store encrypted ciphertext
      const originalValue = encryptedRecord[field];
      encryptedRecord[field] = encryptField(originalValue);
      // Also generate a hashed index if shadow field exists (e.g. gstin_hash)
      const hashKey = `${field}_hash`;
      encryptedRecord[hashKey] = hashField(originalValue);
    }
  }

  return encryptedRecord as T;
}

/**
 * Decrypt sensitive keys in a record after fetching from database layer.
 */
export function decryptSensitiveRecord<T extends Record<string, any>>(
  record: T,
  sensitiveFields: string[] = DEFAULT_SENSITIVE_FIELDS
): T {
  if (!record || typeof record !== 'object') return record;

  const decryptedRecord: Record<string, any> = { ...record };

  for (const field of sensitiveFields) {
    if (field in decryptedRecord && typeof decryptedRecord[field] === 'string' && decryptedRecord[field].startsWith('enc:')) {
      decryptedRecord[field] = decryptField(decryptedRecord[field]);
    }
  }

  return decryptedRecord as T;
}

/**
 * Decrypt an array of database records.
 */
export function decryptSensitiveRecords<T extends Record<string, any>>(
  records: T[],
  sensitiveFields: string[] = DEFAULT_SENSITIVE_FIELDS
): T[] {
  if (!Array.isArray(records)) return [];
  return records.map(r => decryptSensitiveRecord(r, sensitiveFields));
}
