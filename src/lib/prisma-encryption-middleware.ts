import { Prisma } from '@prisma/client';
import { encryptText, decryptText } from './encryption';

const ENCRYPTED_FIELDS = ['apiKey', 'apiSecret'] as const;

/**
 * Returns true if a string looks like it's in the encrypted format (iv:authTag:ciphertext).
 * The format always has exactly 3 colon-separated segments.
 */
function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  return parts.length === 3;
}

/**
 * Encrypts specified fields on a data object in-place if they have non-empty values.
 */
function encryptFields(data: Record<string, unknown>): void {
  for (const field of ENCRYPTED_FIELDS) {
    const value = data[field];
    if (typeof value === 'string' && value.length > 0) {
      try {
        data[field] = encryptText(value);
      } catch {
        // Never throw — keep original value on failure
      }
    }
  }
}

/**
 * Decrypts specified fields on a result object in-place if they look encrypted.
 */
function decryptFields(result: Record<string, unknown>): void {
  for (const field of ENCRYPTED_FIELDS) {
    const value = result[field];
    if (typeof value === 'string' && isEncrypted(value)) {
      try {
        result[field] = decryptText(value);
      } catch {
        // Never throw — keep original value on failure
      }
    }
  }
}

/**
 * Decrypts sensitive fields on a single record or an array of records.
 */
function decryptResult(result: any): any {
  if (result == null) return result;

  if (Array.isArray(result)) {
    for (const item of result) {
      if (item != null && typeof item === 'object') {
        decryptFields(item as Record<string, unknown>);
      }
    }
    return result;
  }

  if (typeof result === 'object') {
    decryptFields(result as Record<string, unknown>);
  }

  return result;
}

/**
 * Prisma Client Extension that automatically encrypts `apiKey` and `apiSecret` fields
 * on the `ApiConfig` model when creating/updating, and decrypts them when reading.
 *
 * Usage:
 *   import { prismaEncryptionExtension } from '@/lib/prisma-encryption-middleware';
 *   const db = new PrismaClient().$extends(prismaEncryptionExtension);
 */
export const prismaEncryptionExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      apiConfig: {
        async create({ args, query }) {
          if (args.data) {
            encryptFields(args.data as Record<string, unknown>);
          }
          const result = await query(args);
          return decryptResult(result);
        },
        async update({ args, query }) {
          if (args.data) {
            encryptFields(args.data as Record<string, unknown>);
          }
          const result = await query(args);
          return decryptResult(result);
        },
        async findUnique({ args, query }) {
          const result = await query(args);
          return decryptResult(result);
        },
        async findFirst({ args, query }) {
          const result = await query(args);
          return decryptResult(result);
        },
        async findMany({ args, query }) {
          const result = await query(args);
          return decryptResult(result);
        },
      },
    },
  });
});