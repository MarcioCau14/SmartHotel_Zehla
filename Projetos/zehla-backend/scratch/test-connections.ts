import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function auditConnections() {
  console.log('🛡️ [ZEHLA AUDIT] Starting Environment Audit for production/cloud variables...');
  
  // 1. Audit Environment Keys configuration
  const requiredKeys = [
    'DATABASE_URL',
    'REDIS_URL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'OPENROUTER_API_KEY',
    'EVOLUTION_API_URL',
    'EVOLUTION_API_KEY',
    'JWT_SECRET'
  ];

  let missing = 0;
  for (const key of requiredKeys) {
    const value = process.env[key];
    if (!value) {
      console.error(`❌ [ENV] Missing variable: ${key}`);
      missing++;
    } else if (value.includes('sua-chave') || value.includes('change-me')) {
      console.warn(`⚠️ [ENV] Placeholder detected for: ${key} = "${value}"`);
    } else {
      const masked = value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : '***';
      console.log(`✅ [ENV] Present: ${key} = ${masked}`);
    }
  }

  if (missing > 0) {
    console.error(`❌ [AUDIT] Audit FAILED: ${missing} required variables are missing.`);
  }

  // 2. Test Supabase Database connection
  console.log('\n🐘 [DATABASE] Probing Supabase PostgreSQL Connection...');
  const prisma = new PrismaClient();
  try {
    const start = Date.now();
    await prisma.$connect();
    // Execute a simple query
    const result = await prisma.$queryRaw`SELECT 1+1 AS result`;
    console.log(`✅ [DATABASE] Supabase connected successfully in ${Date.now() - start}ms. Result:`, result);
  } catch (error) {
    console.error('❌ [DATABASE] Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }

  // 3. Test Upstash Redis connection
  console.log('\n🔴 [REDIS] Probing Upstash Redis Connection...');
  if (process.env.REDIS_URL) {
    const redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
    });
    try {
      const start = Date.now();
      const ping = await redis.ping();
      console.log(`✅ [REDIS] Upstash Redis connected successfully in ${Date.now() - start}ms. PING Response: ${ping}`);
    } catch (error) {
      console.error('❌ [REDIS] Connection failed:', error);
    } finally {
      redis.disconnect();
    }
  } else {
    console.error('❌ [REDIS] Skipping test: REDIS_URL not defined.');
  }

  console.log('\n🛡️ [AUDIT] Environment Audit Finished.');
}

auditConnections().catch(console.error);
