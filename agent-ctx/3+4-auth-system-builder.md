# Task 3+4: Auth System Builder

## Summary
Built a modern authentication system with Magic Link + Google OAuth + existing Credentials for the Seu Zélla project.

## Changes Made

### 1. Prisma Schema Updates (`prisma/schema.prisma`)
- Added `niche` field to Tenant model (String @default("pousada"))
- Added `emailVerified`, `image` fields to User model
- Added `accounts Account[]`, `sessions Session[]` relations to User
- Added Account model (NextAuth OAuth adapter)
- Added Session model (NextAuth session adapter)
- Added VerificationToken model (Magic Link tokens)

### 2. Auth Config (`src/lib/auth.ts`)
- Added PrismaAdapter for NextAuth adapter support
- Added GoogleProvider with allowDangerousEmailAccountLinking
- Removed EmailProvider (requires nodemailer) — custom magic link flow instead
- Updated JWT/session callbacks with niche field
- Added signIn callback for Google OAuth auto-tenant creation
- Added redirect callback for niche-based routing
- Kept 123/123 dev bypass and BYPASS_MIDDLEWARE_AUTH working

### 3. Magic Link API (`src/app/api/auth/magic-link/route.ts`)
- POST: Generate token, store in VerificationToken, return dev URL
- GET: Verify token, redirect to login with magicLogin flag
- 10-minute token expiry
- Auto-creates tenant for new emails

### 4. Magic Verify API (`src/app/api/auth/magic-verify/route.ts`)
- POST: Sets temp password for credentials sign-in completion
- Bridges magic link flow to NextAuth credentials provider

### 5. Register API (`src/app/api/auth/register/route.ts`)
- Added niche field (pousada | airbnb)
- Agent config varies by niche
- Niche saved to Tenant model

### 6. Login Page (`src/app/login/page.tsx`)
- Modern LLM-style auth UI (ChatGPT/Claude-like)
- Three view modes: signin, signup, magic-sent
- Google OAuth button with SVG icon
- Magic Link email form with success animation
- Expandable credentials section
- Niche selector cards (Pousada emerald / Airbnb blue)
- framer-motion animations throughout
- All text in Portuguese (pt-BR)
- Mobile-first responsive design
- Dev bypass hint

## Verification
- Login page loads: HTTP 200 ✅
- Magic Link API: generates and verifies tokens ✅
- 123/123 dev bypass works ✅
- Homepage unaffected ✅
- No new lint errors in auth files ✅
