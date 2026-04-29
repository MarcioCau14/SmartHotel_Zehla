/**
 * ZEHLA Auth Library
 * Simple password hashing for SQLite (production: use bcrypt/argon2)
 * Token management for session persistence
 */

const SALT_ROUNDS = 10;

// Simple hash function for MVP (use bcrypt in production with PostgreSQL)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'zehla_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

// Simple JWT-like token for session management
export function generateSessionToken(tenantId: string, email: string): string {
  const payload = JSON.stringify({
    tid: tenantId,
    email,
    iat: Date.now(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  });
  return Buffer.from(payload).toString('base64url');
}

export function parseSessionToken(token: string): { tid: string; email: string; exp: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return { tid: payload.tid, email: payload.email, exp: payload.exp };
  } catch {
    return null;
  }
}

// Simple password strength checker
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 6) score += 25;
  else feedback.push('Mínimo 6 caracteres');

  if (password.length >= 8) score += 15;

  if (/[A-Z]/.test(password)) { score += 15; }
  else feedback.push('Adicione letras maiúsculas');

  if (/[0-9]/.test(password)) { score += 15; }
  else feedback.push('Adicione números');

  if (/[^A-Za-z0-9]/.test(password)) { score += 15; }
  else feedback.push('Adicione caracteres especiais');

  if (score >= 85) score = 100;
  else if (score >= 60) score = 75;

  return { score: Math.min(score, 100), feedback, isValid: password.length >= 6 };
}
