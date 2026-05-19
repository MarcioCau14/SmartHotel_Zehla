import { jwtVerify, SignJWT } from 'jose';


// src/lib/auth/jwt.ts

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'zehla_super_secret_2026_change_me');

export interface ZehlaJWTPayload {
  sub: string;          // userId
  email: string;  
  tenantId: string;  
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'SUPER_ADMIN';  
  permissions: string[];  
  iat?: number;  
  exp?: number;  
}

export async function verifyToken(token: string): Promise<ZehlaJWTPayload> {
  try {
  const { payload } = await jwtVerify(token, SECRET, {
    clockTolerance: 60,
  });  
  return payload as unknown as ZehlaJWTPayload;  
}

export function extractToken(req: Request): string {  
  const auth = req.headers.get('authorization');  
  if (auth?.startsWith('Bearer ')) return auth.slice(7);  
    
  // Fallback para cookie (Server Actions)  
  const cookie = req.headers.get('cookie');  
  const match = cookie?.match(/__session=([^;]+)/);  
  if (match) return match[1];  
    
  throw new Error('TOKEN_MISSING');
}
