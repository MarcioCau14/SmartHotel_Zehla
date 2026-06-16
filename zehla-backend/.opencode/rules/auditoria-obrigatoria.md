# REGRA VINCULANTE: AUDITORIA OBRIGATÓRIA

Antes de declarar "está tudo ok" ou "tudo pronto" ou "pré-existente", execute **TODOS** os passos abaixo em sequência. Não pule nenhum. Não prossiga enquanto houver vermelho.

## PASSO 1 — TypeScript
Rodar `npx tsc --noEmit 2>&1 | grep "error TS" | wc -l`. Se > 0: LISTAR cada arquivo com erro, classificar por src/ vs temp/. Só prosseguir se src/ ativo tiver ZERO erros.

## PASSO 2 — Prisma Schema vs Código
```
grep -roh "prismasrs\.[a-zA-Z]*" src/ | sort -u > /tmp/usos.txt
grep "^model " prisma/schema.prisma | awk '{print $2}' > /tmp/modelos.txt
comm -23 /tmp/usos.txt /tmp/modelos.txt
```
Se algum `prisma.X` for usado mas não existir como model → BLOQUEIO.

## PASSO 3 — Mocks em Produção
Grepar `InMemory` OU `Mock` OU `Fake` dentro de `src/app/api/` e `src/app/webhooks/`. Se encontrar → BLOQUEIO. Nada de mock em handler HTTP.

## PASSO 4 — Middleware
Verificar se `src/middleware.ts` existe e NÃO é `.bak`. Se não existir → ALERTA.

## PASSO 5 — Testes
Rodar `npx vitest run 2>&1 | tail -5`. Se teste falhar → LISTAR nome do teste e causa. Só passar por cima se for teste pré-existente documentado com causa conhecida.

## REGRA DE OURO
Se qualquer passo der VERMELHO, você NÃO pode dizer "está tudo ok". Você deve: listar exatamente o que está quebrado, priorizar por criticidade, e perguntar se o usuário quer que você corrija ANTES de continuar.
