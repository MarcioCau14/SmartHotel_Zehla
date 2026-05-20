#!/usr/bin/env bash
# ============================================================
# HARDEN — Endurecimento de Segurança para .env
# ============================================================
# Uso: bash scripts/harden.sh
# Define permissões restritivas, valida chaves e configura hooks
# ============================================================

set -euo pipefail

ENV_FILES=(
  ".env"
  ".env.local"
  ".env.production"
  ".env.development"
  ".env.encrypted"
  ".master-key"
)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔒 ENV GUARDIAN — Hardening de Segurança"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Permissões 600 em todos os arquivos .env
echo ""
echo "📁 Permissões 600..."
for file in "${ENV_FILES[@]}"; do
  if [ -f "$file" ]; then
    chmod 600 "$file"
    echo "  ✓ $file → 600 (owner only)"
  fi
done

# 2. Verifica placeholders
echo ""
echo "🔍 Verificando placeholders..."
if [ -f .env.local ]; then
  while IFS= read -r line; do
    if echo "$line" | grep -q 'sua-chave\|your-key\|change-me\|placeholder'; then
      KEY=$(echo "$line" | cut -d= -f1)
      echo "  ⚠ Placeholder: $KEY"
    fi
  done < .env.local
fi

# 3. Verifica permissões do diretório
echo ""
echo "📂 Verificando diretórios..."
if [ -d .git ]; then
  chmod 700 .git
  echo "  ✓ .git → 700"
fi

# 4. Instala hooks do git
echo ""
echo "🔗 Instalando git hooks..."
if [ -d .githooks ]; then
  git config core.hooksPath .githooks
  echo "  ✓ git hooks apontando para .githooks/"
fi

# 5. Gera .env.encrypted se .env existir e .env.encrypted não existir
if [ -f .env ] && [ ! -f .env.encrypted ]; then
  echo ""
  echo "🔐 .env encontrado sem .env.encrypted"
  echo "  Deseja criptografar? Execute: npx tsx scripts/secure-env.ts seal"
fi

# 6. Sumário
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ HARDENING CONCLUÍDO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Próximos passos:"
echo "  1. Gere uma chave mestra:  npx tsx scripts/secure-env.ts rotate"
echo "  2. Criptografe .env:       npx tsx scripts/secure-env.ts seal"
echo "  3. Carregue no runtime:    defina ZEHLA_MASTER_KEY"
echo ""
