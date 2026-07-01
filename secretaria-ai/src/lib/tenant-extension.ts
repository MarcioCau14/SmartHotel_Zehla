import { db } from '@/lib/db';

type TenantScopedModel = 'property' | 'guest' | 'booking' | 'conversationLog' | 'knowledgeEntry'
  | 'trainingPrompt' | 'apiConfig' | 'agentConfig' | 'subscription' | 'auditLog'
  | 'notification' | 'performanceSnapshot' | 'aIActivityLog' | 'quickAction';

const TENANT_SCOPED: Record<TenantScopedModel, string> = {
  property: 'tenantId',
  guest: 'tenantId',
  booking: 'tenantId',
  conversationLog: 'tenantId',
  knowledgeEntry: 'tenantId',
  trainingPrompt: 'tenantId',
  apiConfig: 'tenantId',
  agentConfig: 'tenantId',
  subscription: 'tenantId',
  auditLog: 'tenantId',
  notification: 'tenantId',
  performanceSnapshot: 'tenantId',
  aIActivityLog: 'tenantId',
  quickAction: 'tenantId',
};

type TenantDbProxy = {
  [K in TenantScopedModel]: {
    findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
    findUnique: (args: { where: Record<string, unknown>; include?: Record<string, unknown> }) => Promise<unknown | null>;
    findFirst: (args: Record<string, unknown>) => Promise<unknown | null>;
    count: (args?: Record<string, unknown>) => Promise<number>;
    create: (args: { data: Record<string, unknown>; include?: Record<string, unknown> }) => Promise<unknown>;
    update: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<unknown>;
    delete: (args: { where: Record<string, unknown> }) => Promise<unknown>;
    updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => Promise<{ count: number }>;
    deleteMany: (args?: { where?: Record<string, unknown> }) => Promise<{ count: number }>;
    upsert: (args: { where: Record<string, unknown>; create: Record<string, unknown>; update: Record<string, unknown> }) => Promise<unknown>;
  };
};

export function withTenant(tenantId: string): TenantDbProxy {
  const proxy: Record<string, unknown> = {};

  for (const [model, field] of Object.entries(TENANT_SCOPED)) {
    const modelKey = model as TenantScopedModel;
    const prismaModel = (db as unknown as Record<string, unknown>)[modelKey] as Record<string, unknown>;

    proxy[modelKey] = {
      findMany: (args?: Record<string, unknown>) => {
        const merged = { ...args };
        merged.where = { ...(merged.where as Record<string, unknown> || {}), [field]: tenantId };
        return (prismaModel.findMany as Function)(merged);
      },
      findUnique: (args: { where: Record<string, unknown>; include?: Record<string, unknown> }) => {
        return (prismaModel.findUnique as Function)(args);
      },
      findFirst: (args: Record<string, unknown>) => {
        const merged = { ...args };
        merged.where = { ...(merged.where as Record<string, unknown> || {}), [field]: tenantId };
        return (prismaModel.findFirst as Function)(merged);
      },
      count: (args?: Record<string, unknown>) => {
        const merged = { ...args };
        merged.where = { ...(merged.where as Record<string, unknown> || {}), [field]: tenantId };
        return (prismaModel.count as Function)(merged);
      },
      create: (args: { data: Record<string, unknown>; include?: Record<string, unknown> }) => {
        const data = { ...args.data, [field]: tenantId };
        return (prismaModel.create as Function)({ ...args, data });
      },
      update: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        return (prismaModel.update as Function)(args);
      },
      delete: (args: { where: Record<string, unknown> }) => {
        return (prismaModel.delete as Function)(args);
      },
      updateMany: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
        const merged = { ...args };
        merged.where = { ...(merged.where as Record<string, unknown> || {}), [field]: tenantId };
        return (prismaModel.updateMany as Function)(merged);
      },
      deleteMany: (args?: { where?: Record<string, unknown> }) => {
        const merged = { ...args };
        merged.where = { ...(merged.where as Record<string, unknown> || {}), [field]: tenantId };
        return (prismaModel.deleteMany as Function)(merged);
      },
      upsert: (args: { where: Record<string, unknown>; create: Record<string, unknown>; update: Record<string, unknown> }) => {
        return (prismaModel.upsert as Function)(args);
      },
    };
  }

  return proxy as unknown as TenantDbProxy;
}
