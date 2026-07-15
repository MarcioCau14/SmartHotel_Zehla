// Browser-safe Prisma client wrapper
// On the server: creates a real PrismaClient with encryption extension
// On the client: exports a dummy object that won't crash

import type { PrismaClient as PrismaClientType } from '@prisma/client';

type SafePrismaClient = PrismaClientType & Record<string, any>;

let _db: SafePrismaClient | null = null;

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

  // Server-side: create real Prisma client
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