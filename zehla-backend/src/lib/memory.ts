import { InMemoryZaosMemoryAdapter } from '../infrastructure/persistence/memory/InMemoryZaosMemoryAdapter';

// Global singleton instance for in-memory Vector DB to survive across Next.js reloads/routes
const globalForMemory = globalThis as unknown as {
  memoryAdapter?: InMemoryZaosMemoryAdapter;
};

export const memoryAdapter = globalForMemory.memoryAdapter ?? new InMemoryZaosMemoryAdapter();

if (process.env.NODE_ENV !== 'production') {
  globalForMemory.memoryAdapter = memoryAdapter;
}
