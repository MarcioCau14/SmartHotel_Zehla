#!/bin/bash
echo "🚀 [VERCEL] Configurando variáveis de ambiente na produção (forçando sobrescrita)..."

# Adicionar variáveis uma a uma com --force para sobrescrever se já existirem
npx vercel env add DATABASE_URL production --value "postgresql://postgres:Zehla_Supabase_2026@db.yzuryspivefbgmehjfse.supabase.co:5432/postgres" --force --yes
npx vercel env add REDIS_URL production --value "rediss://default:gQAAAAAAAgAeAAIgcDEzYTlkMTc3NjA1Mzg0ZGY4OTBmNGQ4MjE1MzhhZDc5Ng@heroic-drake-131102.upstash.io:6379" --force --yes
npx vercel env add UPSTASH_REDIS_REST_URL production --value "https://heroic-drake-131102.upstash.io" --force --yes
npx vercel env add UPSTASH_REDIS_REST_TOKEN production --value "gQAAAAAAAgAeAAIgcDEzYTlkMTc3NjA1Mzg0ZGY4OTBmNGQ4MjE1MzhhZDc5Ng" --force --yes
npx vercel env add OPENROUTER_API_KEY production --value "sk-Qso15UGX1eediSxLtnw0SoqpntuvjpElYidQrHFIZHrg8vnMTs5un9hhtVZCEQl1" --force --yes
npx vercel env add NEXTAUTH_SECRET production --value "662580795c3a4f8d6fb1e204c4b6ea03f16d8a25c156fbc8a2d1e2e347781a90" --force --yes
npx vercel env add JWT_SECRET production --value "8c772be467aa79d2b1f80e9a7e37604b901a88b1b2cd4d18fa7b22a94f6c4428" --force --yes
npx vercel env add EVOLUTION_API_URL production --value "https://zehla-evolution.onrender.com" --force --yes
npx vercel env add EVOLUTION_API_KEY production --value "zehla-evolution-key-prod-2026" --force --force --yes
npx vercel env add NEXTAUTH_URL production --value "https://smart-hotel-zehla.vercel.app" --force --yes
npx vercel env add NODE_ENV production --value "production" --force --yes

echo "✅ [VERCEL] Configuração concluída com sucesso!"
