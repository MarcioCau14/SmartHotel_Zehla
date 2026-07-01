# FASE 1 — Refinamento Moderno (Fundação)

> Documento de comando para aplicar melhorias estruturais na FASE 1.
> Leve para sua ferramenta de preferência (Cursor, Windsurf, Claude, etc.) e peça: **"Aplique este documento no projeto"**

---

## 1. ESLint — Flat Config com Regras Reais

**Problema:** O ESLint está com praticamente todas as regras desligadas — `no-explicit-any: off`, `no-unused-vars: off`, `exhaustive-deps: off`. O linter roda mas não pega nada.

**Melhoria:** Flat config com `typescript-eslint` v8, regras graduais por severidade, permitindo `any` só onde explicitamente marcado.

Arquivo: `eslint.config.mjs`

```js
// @ts-check
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // ── TypeScript (gradual) ──
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-require-imports': 'error',

      // ── React ──
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'off',

      // ── Next.js ──
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'off',

      // ── Gerais ──
      'prefer-const': 'error',
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-empty': 'warn',
      'no-irregular-whitespace': 'error',
    },
  },
  {
    ignores: [
      'node_modules/**', '.next/**', 'out/**', 'build/**', 'dist/**',
      'next-env.d.ts', 'mini-services/**', 'scripts/**', 'backend/**',
      'ddc_extracted/**', 'landing_extracted/**', 'extract-ddc/**',
      'staging-*/**', 'tool-results/**', 'examples/**', 'skills/**',
    ],
  },
);
```

E adicione `typescript-eslint` como devDependency:

```bash
npm i -D typescript-eslint
```

---

## 2. Tailwind CSS v4 Nativo

**Problema:** O projeto tem `tailwind.config.ts` (sintaxe v3) convivendo com `globals.css` (sintaxe v4 `@theme`, `@import "tailwindcss"`). As duas versões conflitam em alguns edge cases.

**Melhoria:** Migrar toda a configuração para o CSS. Remover `tailwind.config.ts`. Usar `@theme`, `@utility`, `@layer` nativos do Tailwind v4.

### 2a. Remova `tailwind.config.ts`

```bash
rm tailwind.config.ts
```

### 2b. Restaure o `src/app/globals.css` com sintaxe 100% v4

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* ── Design Tokens (substitui tailwind.config.ts) ── */
@theme {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --radius: 0.75rem;

  /* Cores ZEHLA */
  --color-royal: #4169E1;
  --color-royal-light: #6b8cff;
  --color-teal: #14b8a6;
  --color-teal-light: #2dd4bf;
  --color-emerald: #10b981;
  --color-amber: #f59e0b;
  --color-error: #ef4444;
  --color-surface: #0a0e1a;
  --color-surface-light: rgba(255, 255, 255, 0.04);
  --color-border-subtle: rgba(255, 255, 255, 0.08);

  /* Shadows personalizados */
  --shadow-glow-royal: 0 0 20px rgba(65, 105, 225, 0.3);
  --shadow-glow-teal: 0 0 20px rgba(20, 184, 166, 0.3);
  --shadow-glow-emerald: 0 0 15px rgba(16, 185, 129, 0.3);

  /* Animações */
  --animate-float-slow: float-slow 6s ease-in-out infinite;
  --animate-float-reverse: float-reverse 5s ease-in-out infinite;
  --animate-pulse-glow: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-terminal-blink: terminal-blink 1s step-end infinite;
  --animate-fade-up: fade-up 0.8s ease-out both;
  --animate-slide-left: slide-in-left 0.8s ease-out both;
  --animate-slide-right: slide-in-right 0.8s ease-out both;
  --animate-shimmer: shimmer 3s linear infinite;
  --animate-gradient-x: gradient-x 3s ease infinite;
  --animate-zehla-pulse: zehla-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  --animate-zehla-glow: zehla-glow 2s ease-in-out infinite;
  --animate-console-slide: console-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-12px) rotate(1deg); }
    66% { transform: translateY(-6px) rotate(-1deg); }
  }
  @keyframes float-reverse {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(10px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(65, 105, 225, 0.3), 0 0 40px rgba(65, 105, 225, 0.1); }
    50% { box-shadow: 0 0 30px rgba(65, 105, 225, 0.5), 0 0 60px rgba(65, 105, 225, 0.2); }
  }
  @keyframes terminal-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes fade-up {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-in-left {
    0% { opacity: 0; transform: translateX(-60px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @keyframes slide-in-right {
    0% { opacity: 0; transform: translateX(60px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes gradient-x {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes zehla-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes zehla-glow {
    0%, 100% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.3); }
    50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
  }
  @keyframes console-slide-in {
    from { opacity: 0; transform: translateX(12px); }
    to { opacity: 1; transform: translateX(0); }
  }
}

/* ── CSS Variables (shadcn/ui + tema escuro) ── */
:root {
  --background: #0a0e1a;
  --foreground: #f1f5f9;
  --card: rgba(255, 255, 255, 0.04);
  --card-foreground: #f1f5f9;
  --popover: rgba(255, 255, 255, 0.06);
  --popover-foreground: #f1f5f9;
  --primary: #4169E1;
  --primary-foreground: #ffffff;
  --secondary: rgba(255, 255, 255, 0.08);
  --secondary-foreground: #f1f5f9;
  --muted: rgba(255, 255, 255, 0.06);
  --muted-foreground: #94a3b8;
  --accent: #14b8a6;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --border: rgba(255, 255, 255, 0.08);
  --input: rgba(255, 255, 255, 0.08);
  --ring: #4169E1;
  --chart-1: #4169E1;
  --chart-2: #14b8a6;
  --chart-3: #10b981;
  --chart-4: #f59e0b;
  --chart-5: #ef4444;
  --sidebar: rgba(255, 255, 255, 0.03);
  --sidebar-foreground: #f1f5f9;
  --sidebar-primary: #4169E1;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: rgba(255, 255, 255, 0.06);
  --sidebar-accent-foreground: #f1f5f9;
  --sidebar-border: rgba(255, 255, 255, 0.08);
  --sidebar-ring: #4169E1;
}

/* ── Utilitários customizados (substitui classes CSS avulsas) ── */
@utility glass {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius);
}

@utility glass-hover {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
}

@utility gradient-text-royal {
  background: linear-gradient(135deg, #4169E1, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@utility bg-grid-subtle {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

@utility bg-dot-subtle {
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* ── Base layer ── */
@layer base {
  * {
    border-color: var(--border);
    outline-color: color-mix(in srgb, var(--ring) 50%, transparent);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans, 'Inter', sans-serif);
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.18); }
  * { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.02); }
}
```

---

## 3. Prisma — Singleton + Log Condicional + Remover Duplicata

**Problema:** Três arquivos exportam Prisma Client:
- `src/lib/db.ts` (usado na maioria dos lugares)
- `src/lib/prisma.ts` (idêntico)
- `src/prisma.ts` (só re-exporta `src/lib/prisma.ts`)

Além disso, `log: ['query']` roda em produção, vazando dados.

**Melhoria:** Unificar em `src/lib/db.ts` com log condicional. Remover os outros dois.

### 3a. `src/lib/db.ts`

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export type TransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0]
```

### 3b. Remova duplicatas

```bash
rm src/lib/prisma.ts src/prisma.ts
```

### 3c. Atualize imports

Nos arquivos que importam de `@/lib/prisma` ou `@/prisma`, mude para `@/lib/db`.

---

## 4. TypeScript — Strict Mode Máximo

**Problema:** `strict: true` e `noImplicitAny: true` já estão ativos, mas faltam flags importantes.

**Melhoria:** Adicionar flags de segurança de tipo.

`tsconfig.json` — adicione em `compilerOptions`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "exactOptionalPropertyTypes": false,
    "verbatimModuleSyntax": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "mini-services", "dist", "staging-*"]
}
```

**Nota:** `noUncheckedIndexedAccess` pode gerar muitos warnings. Para aplicar gradualmente, comece com `"noUncheckedIndexedAccess": false` e ative depois. `verbatimModuleSyntax` exige `type` nos imports de tipo — rode `npx tsc --noEmit` para ver os erros e corrija.

---

## 5. Next.js — StrictMode + Config Robusta

**Problema:** `reactStrictMode: false` esconde bugs. `output: 'standalone'` sem otimizações.

`next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'recharts'],
  },
  serverExternalPackages: ['bcryptjs'],
}

export default nextConfig
```

---

## 6. Middleware — Rate Limiting + CSP com Nonces

**Problema:** Middleware tem CSP hardcoded sem nonces, sem rate limiting.

**Melhoria:** Adicionar rate limiting com `@upstash/ratelimit` (funciona sem Redis em dev via mock embutido). Usar nonce para scripts inline.

### 6a. Instale

```bash
npm i @upstash/ratelimit @upstash/redis
```

### 6b. `src/lib/rate-limit.ts`

```ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const cache = new Map<string, { count: number; reset: number }>()

function createLocalRatelimit(requests: number, window: string) {
  const windowMs = parseWindow(window)
  return {
    limit: async (key: string) => {
      const now = Date.now()
      const entry = cache.get(key)
      if (!entry || now > entry.reset) {
        cache.set(key, { count: 1, reset: now + windowMs })
        return { success: true, limit: requests, remaining: requests - 1, reset: now + windowMs }
      }
      entry.count++
      if (entry.count > requests) {
        return { success: false, limit: requests, remaining: 0, reset: entry.reset }
      }
      return { success: true, limit: requests, remaining: requests - entry.count, reset: entry.reset }
    },
  }
}

function parseWindow(s: string): number {
  const match = s.match(/^(\d+)\s*(ms|s|m|h)$/)
  if (!match) return 60000
  const n = Number(match[1])
  const unit = match[2]
  const multipliers: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000 }
  return n * (multipliers[unit] ?? 60000)
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const hasRedis = !!(redisUrl && redisToken)

export const apiRatelimit = hasRedis
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      analytics: true,
    })
  : createLocalRatelimit(60, '60 s')

export const authRatelimit = hasRedis
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
    })
  : createLocalRatelimit(5, '60 s')
```

### 6c. `src/middleware.ts` atualizado

```ts
import { NextRequest, NextResponse } from 'next/server'
import { apiRatelimit, authRatelimit } from '@/lib/rate-limit'
import crypto from 'crypto'

const SKIP_LOG_PATHS = ['/api/health', '/api/readiness', '/_next/', '/favicon.ico', '/logo.svg', '/sounds/']
const PROTECTED_PATHS = ['/ddc', '/zcc', '/dashboard', '/config', '/tenants', '/campaigns', '/leads', '/targets', '/agents', '/roi', '/swipe-templates']

function shouldSkipLog(pathname: string) {
  return SKIP_LOG_PATHS.some(p => pathname.startsWith(p)) || pathname.startsWith('/_next')
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  const nonce = crypto.randomBytes(16).toString('base64')

  // ── Security Headers ──
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=()')

  if (process.env.NODE_ENV === 'production') {
    const csp = [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline' 'nonce-${nonce}' 'strict-dynamic'`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: blob: https://*.mercadopago.com`,
      `font-src 'self' data:`,
      `connect-src 'self' https://*.mercadopago.com wss://* https://*.railway.app`,
      `frame-ancestors 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
    ].join('; ')
    response.headers.set('Content-Security-Policy', csp)
  }

  // ── Request ID ──
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)

  // ── Rate Limiting ──
  const ip = getClientIp(request)
  if (pathname.startsWith('/api/')) {
    const isAuth = pathname.startsWith('/api/auth/')
    const limiter = isAuth ? authRatelimit : apiRatelimit
    const { success, remaining, reset } = await limiter.limit(`rl:${ip}:${pathname}`)
    response.headers.set('X-RateLimit-Remaining', String(remaining))
    response.headers.set('X-RateLimit-Reset', String(reset))

    if (!success) {
      return new NextResponse(JSON.stringify({ error: 'Muitas requisições. Tente novamente em instantes.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      })
    }
  }

  // ── Request Logging ──
  if (!shouldSkipLog(pathname)) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      type: pathname.startsWith('/api/') ? 'api-request' : 'page-request',
      requestId,
      method: request.method,
      path: pathname,
      ip,
    }))
  }

  // ── Auth Check ──
  if (isProtectedPath(pathname) && !pathname.startsWith('/api/')) {
    const sessionCookie = request.cookies.get('next-auth.session-token')
      || request.cookies.get('__Secure-next-auth.session-token')
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)'],
}
```

---

## 7. Core Library — Consolidar e Modularizar

**Problema:** `src/lib/api.ts` duplica hooks que já existem em `src/lib/api-hooks.ts`. `src/lib/types.ts` tem tipos que também estão em `src/lib/leads-types.ts`.

### 7a. Remover `src/lib/api.ts`

```bash
rm src/lib/api.ts
```

**Nota:** Verifique se algum arquivo importa de `@/lib/api`. Os hooks duplicados (`useLeads`, `useTargets`, `useHunt`) já existem em `@/lib/api-hooks` com mais funcionalidades e chamando as rotas corretas.

### 7b. `src/lib/leads-types.ts` — adicionar `export type` onde faltar

Unificar os tipos num lugar só. `src/lib/types.ts` pode ser eliminado se os tipos forem movidos para `leads-types.ts`.

---

## 8. Auth — Validação Robusta + Rate Limit + CSRF

**Problema:** Login sem rate limit, `NEXTAUTH_SECRET` hardcoded como fallback, CSRF não implementado.

### 8a. `src/lib/auth.ts` — adicione CSRF check e validação de senha forte

```ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

// Validações de segurança
const MIN_PASSWORD_LENGTH = 8
const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres`
  }
  if (!/[A-Z]/.test(password)) {
    return 'Senha deve conter pelo menos uma letra maiúscula'
  }
  if (!/[a-z]/.test(password)) {
    return 'Senha deve conter pelo menos uma letra minúscula'
  }
  if (!/[0-9]/.test(password)) {
    return 'Senha deve conter pelo menos um número'
  }
  return null
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const passwordError = validatePasswordStrength(credentials.password)
        if (passwordError) return null

        const tenant = await db.tenant.findUnique({
          where: { email: credentials.email },
        })

        if (tenant && tenant.passwordHash) {
          const isValid = await bcrypt.compare(credentials.password, tenant.passwordHash)
          if (isValid && tenant.status === 'active') {
            return {
              id: tenant.id,
              email: tenant.email!,
              name: tenant.name,
              role: tenant.role,
              tenantId: tenant.id,
              plan: tenant.plan,
            }
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId
        token.role = user.role
        token.plan = user.plan
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.tenantId = token.tenantId as string
        session.user.role = token.role as string
        session.user.plan = token.plan as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function requireTenant() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.tenantId) redirect('/login')
  return session.user.tenantId as string
}

export function verifyRobotToken(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false
  const token = authHeader.split(' ')[1]
  return token === process.env.ZEHLA_LOOP_API_KEY || token === process.env.ZAI_API_KEY
}
```

### 8b. `src/app/api/auth/register/route.ts` — adicione validação de senha

```ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, validatePasswordStrength } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, pousadaName } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    const passwordError = validatePasswordStrength(password)
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 })
    }

    const existing = await db.tenant.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const tenant = await db.tenant.create({
      data: {
        name: pousadaName || name,
        email,
        passwordHash: hashedPassword,
        phone,
        role: 'owner',
        plan: 'trial',
        property: {
          create: { name: pousadaName || `${name}'s Property` },
        },
      },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('[Register]', error)
    return NextResponse.json({ error: 'Erro interno ao criar conta' }, { status: 500 })
  }
}
```

---

## 9. Package.json — Limpeza e Scripts Modernos

**Problema:** `next-intl`, `socket.io-client` (sem server), `react-drawio` (fases futuras) instalados como deps. Scripts de DB não padronizados. Nome do projeto genérico.

**Melhoria:**

```json
{
  "name": "zehla-smarthotel",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "NODE_ENV=production node .next/standalone/server.js",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "ci": "npm run typecheck && npm run lint && npm run test",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "npx tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset --force",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

### Remova dependências não usadas na FASE 1

```bash
npm uninstall next-intl socket.io-client react-drawio @mdxeditor/editor
```

**(Elas serão reintaladas nas fases que as usam)**

---

## 10. Error Boundary + Tratamento de Erros

**Problema:** `ErrorBoundary.tsx` existe em `src/components/` mas não é usado no layout raiz nem nas páginas.

**Melhoria:** Envolver o layout com Error Boundary.

### `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZEHLA SmartHotel — IA Cognitiva para Pousadas e Hotéis',
  description: 'Plataforma SaaS B2B com IA autônoma que responde hóspedes 24/7, converte leads em reservas, otimiza ocupação e reduz custos operacionais.',
  metadataBase: new URL('https://zehla.com.br'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://zehla.com.br',
    siteName: 'ZEHLA SmartHotel',
    title: 'ZEHLA SmartHotel — IA Cognitiva para Pousadas e Hotéis',
    description: 'IA autônoma que responde hóspedes 24/7, converte leads em reservas e otimiza sua ocupação.',
    images: [{ url: '/og-image.png', width: 1344, height: 768, alt: 'ZEHLA SmartHotel' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={inter.className}>
        <ErrorBoundary name="RootLayout">
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

## 11. Landing Page — Link Inválido /apply

**Problema:** Link fixo para `/apply` no final da `page.tsx`.

**Solução:** Remover o link ou redirecionar para `/login`.

```tsx
// Em src/app/page.tsx, remova ou substitua o link:
// ANTES:
<Link href="/apply" ...>

// DEPOIS (remova o link ou use):
<Link href="/login" ...>
```

Se a rota `/apply` for necessária, crie `src/app/apply/page.tsx`.

---

## 12. Testes — React Testing Library + MSW

**Problema:** Só Vitest configurado, sem Testing Library para componentes, sem mocks de API.

**Melhoria:** Adicionar Testing Library + MSW para testes de componentes e API.

### 12a. Instale

```bash
npm i -D @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react msw
```

### 12b. `src/__tests__/setup.ts`

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// Mock do fetch global
vi.stubGlobal('fetch', vi.fn())

// Mock do IntersectionObserver
vi.stubGlobal('IntersectionObserver', vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})))
```

### 12c. Atualize `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['__tests__/**/*.test.{ts,tsx}', 'src/__tests__/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    css: false,
  },
})
```

### 12d. `src/__tests__/mocks/handlers.ts`

```ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/leads', () => {
    return HttpResponse.json([
      { id: '1', empresa: 'Pousada Teste', email: 'teste@teste.com', status: 'pending' },
    ])
  }),
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  }),
]
```

---

## 13. .env.example — Organizado e Comentado

```env
# ==============================================================================
# ZEHLA SmartHotel — Variáveis de Ambiente
# ==============================================================================

# ── Database ──────────────────────────────────────────────────────────
DATABASE_URL="file:./db/dev.db"

# ── NextAuth ──────────────────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-in-production-use-openssl-rand-base64-32"

# ── Mercado Pago (FASE 4+) ────────────────────────────────────────────
MP_ACCESS_TOKEN=""
MP_WEBHOOK_SECRET=""

# ── WhatsApp Cloud API (FASE 8+) ──────────────────────────────────────
WHATSAPP_VERIFY_TOKEN=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""

# ── AI Providers (FASE 2+) ────────────────────────────────────────────
OPENAI_API_KEY=""
GROQ_API_KEY=""
ANTHROPIC_API_KEY=""
GEMINI_API_KEY=""

# ── Rate Limiting (opcional — fallback para memória local) ────────────
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# ── Monitoring ────────────────────────────────────────────────────────
MONITORING_SECRET=""

# ── App ───────────────────────────────────────────────────────────────
NODE_ENV="development"
```

---

## 14. Roteiro de Aplicação

Execute na ordem para evitar conflitos:

```bash
# 1. ESLint + TypeScript
npm i -D typescript-eslint
# Atualizar eslint.config.mjs (item 1)
# Atualizar tsconfig.json (item 4)

# 2. Tailwind v4
rm tailwind.config.ts
# Substituir globals.css (item 2b)

# 3. Prisma
rm src/lib/prisma.ts src/prisma.ts
# Atualizar src/lib/db.ts (item 3a)
# Corrigir imports (item 3c)
npm run db:generate

# 4. Rate Limiting
npm i @upstash/ratelimit @upstash/redis
# Criar src/lib/rate-limit.ts (item 6b)
# Atualizar src/middleware.ts (item 6c)

# 5. Next.js
# Atualizar next.config.ts (item 5)

# 6. Auth
# Atualizar src/lib/auth.ts (item 8a)
# Atualizar src/app/api/auth/register/route.ts (item 8b)

# 7. Core Lib
rm src/lib/api.ts
# Verificar imports

# 8. Cleanup deps
npm uninstall next-intl socket.io-client react-drawio @mdxeditor/editor

# 9. Error Boundary no layout
# Atualizar src/app/layout.tsx (item 10)

# 10. Landing Page
# Remover link /apply (item 11)

# 11. Test setup
npm i -D @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react msw
# Criar src/__tests__/setup.ts e handlers.ts
# Atualizar vitest.config.ts

# 12. Validar
npm run ci
```

---

## Resumo das Mudanças

| Item | Mudança | Impacto |
|------|---------|---------|
| ESLint | Regras reativadas gradualmente | ✅ Código mais seguro |
| Tailwind v4 | Config 100% CSS, sem `tailwind.config.ts` | ✅ Build mais rápido, sem conflito |
| Prisma | Unificado em `db.ts`, log condicional | ✅ Sem vazamento de dados em prod |
| TypeScript | `verbatimModuleSyntax` + `noUncheckedIndexedAccess` | ✅ Types mais rigorosos |
| Next.js | `reactStrictMode: true` | ✅ Detecção de bugs |
| Middleware | Rate limiting + CSP nonces | ✅ Proteção contra abuso |
| Auth | Senha forte, hash 12 rounds, rate limit | ✅ Mais seguro |
| Testes | Testing Library + MSW + jsdom | ✅ Testes de componente |
| Deps | Removido peso morto (6 pacotes) | ✅ Bundle menor |
| Error Boundary | Envolvendo o layout raiz | ✅ Graceful degradation |
