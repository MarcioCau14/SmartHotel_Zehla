// Browser-safe Prisma client wrapper
// On the server: creates a real PrismaClient with encryption extension
// On the client: exports a dummy object that won't crash
// On Vercel/serverless: falls back to no-op if DB is not available

import type { PrismaClient as PrismaClientType } from '@prisma/client';

type SafePrismaClient = PrismaClientType & Record<string, any>;

let _db: SafePrismaClient | null = null;
let _dbAvailable: boolean | null = null;

/**
 * Check if the database is available by testing the connection.
 * Returns false if DATABASE_URL is invalid or connection fails.
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  if (_dbAvailable !== null) return _dbAvailable;
  
  try {
    const url = process.env.DATABASE_URL;
    if (!url || (!url.startsWith('file:') && !url.startsWith('postgresql:') && !url.startsWith('mysql:'))) {
      _dbAvailable = false;
      return false;
    }
    
    // Try a lightweight query
    const client = getDbClient();
    if (!client) {
      _dbAvailable = false;
      return false;
    }
    
    await client.$queryRaw`SELECT 1`;
    _dbAvailable = true;
    return true;
  } catch {
    _dbAvailable = false;
    return false;
  }
}

function getDbClient(): SafePrismaClient | null {
  // Only create Prisma on the server
  if (typeof window !== 'undefined') {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { prismaEncryptionExtension } = require('./prisma-encryption-middleware');

    const globalForPrisma = globalThis as unknown as { prisma: any };

    const client =
      globalForPrisma.prisma ??
      new (PrismaClient as any)({
        log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn'],
      });

    const db = (client as any).$extends(prismaEncryptionExtension) as unknown as SafePrismaClient;

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

    return db;
  } catch {
    return null;
  }
}

function createDb(): SafePrismaClient {
  // Only create Prisma on the server
  if (typeof window !== 'undefined') {
    // Return a no-op proxy for the browser
    return new Proxy({} as SafePrismaClient, {
      get() {
        // Return a function that returns a promise resolving to null
        return (...args: any[]) => Promise.resolve(null);
      },
    }) as unknown as SafePrismaClient;
  }

  // Server-side: try to create real Prisma client
  const client = getDbClient();
  if (client) {
    return client;
  }

  // Fallback: return a no-op proxy that won't crash
  console.warn('[db] Prisma client unavailable — using no-op fallback');
  return new Proxy({} as SafePrismaClient, {
    get() {
      return (..._args: any[]) => Promise.resolve(null);
    },
  }) as unknown as SafePrismaClient;
}

// Lazy singleton
export const db: SafePrismaClient = new Proxy({} as SafePrismaClient, {
  get(_target, prop, receiver) {
    if (!_db) {
      _db = createDb();
    }
    const value = Reflect.get(_db, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(_db);
    }
    return value;
  },
});

// Re-export the type
export type { PrismaClientType as PrismaClient };
