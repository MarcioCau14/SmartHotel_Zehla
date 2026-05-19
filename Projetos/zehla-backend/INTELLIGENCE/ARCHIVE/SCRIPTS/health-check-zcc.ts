import { SignJWT } from 'jose';
import { performance } from 'perf_hooks';


// scripts/health-check-zcc.ts

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'zehla_super_secret_2026_change_me');
const BASE = 'http://localhost:3000';

async function generateTestToken() {
  try {
  return await new SignJWT({
    sub: 'admin-1',
    email: 'security@zehla.io',
    tenantId: 'zehla-core',
    role: 'SUPER_ADMIN',
    permissions: ['*']
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(SECRET_KEY);
}

const ENDPOINTS = [
  { name: 'ZCC Overview', path: '/api/zcc/overview' },
  { name: 'ZCC Leads', path: '/api/zcc/leads' },
];

async function healthCheck() {
  
  
  const token = await generateTestToken();

  for (const ep of ENDPOINTS) {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE}${ep.path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latency = (performance.now() - start).toFixed(2);
        
      if (res.status === 403) {
         — Token não é SUPER_ADMIN`);
      } else if (res.status === 200) {
        `);
      } else {
        `);
      }
    } catch (e: unknown) {
      
    }
  }

  // Testa acesso não autorizado
  
  const unauthorized = await fetch(`${BASE}/api/zcc/overview`);
  
    
  const badToken = await fetch(`${BASE}/api/zcc/overview`, {
    headers: { Authorization: 'Bearer token_invalido' },
  });
  
}

healthCheck();
