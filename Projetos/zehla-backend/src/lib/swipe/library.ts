import { prisma } from '@/lib/prisma';

import { type SwipeTemplate, type PlanTier, type SwipeCategory } from './types';

// src/lib/swipe/library.ts

export class SwipeLibrary {
  static async getTemplates(filters?: { 
    channel?: string; 
    category?: SwipeCategory; 
    tier?: PlanTier;
    isActive?: boolean;
  }) {
    return await prisma.swipeTemplate.findMany({
      where: {
        ...filters,
        isActive: filters?.isActive ?? true,
      },
      orderBy: { convRate: 'desc' },
    });
  }

  static async getById(id: string) {
    return await prisma.swipeTemplate.findUnique({
      where: { id },
    });
  }

  static async create(data: unknown) {
    return await prisma.swipeTemplate.create({
      data: {
        ...data,
        variables: Array.isArray(data.variables) ? JSON.stringify(data.variables) : data.variables,
      },
    });
  }

  static async update(id: string, data: unknown) {
    return await prisma.swipeTemplate.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.swipeTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
