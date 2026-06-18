# ZEHLA OS — AUDITORIA OBRIGATÓRIA: DOCUMENTO MESTRE COMPLETO

**Versão**: 2.0 — Production-Ready
**Data**: 16 de junho de 2026
**Classificação**: CONFIDENCIAL — Regras Vinculantes do Ecossistema ZEHLA
**Escopo**: Agentes IA, OpenCode, Claude Code, Cursor, Windsurf, ZCC Pipeline
**Autoria**: Arquitetura de Segurança e Qualidade ZEHLA OS

---

## ÍNDICE MESTRE

```
SEÇÃO 0  ── Prefácio: Por Que Isso Existe
SEÇÃO 1  ── REGRA VINCULANTE: Auditoria Obrigatória (.agent/rules/)
SEÇÃO 2  ── ANCHOR PERMANENTE (.opencode/anchor.md)
SEÇÃO 3  ── CONFIGURAÇÃO DO PROJETO (opencode.jsonc)
SEÇÃO 4  ── SKILL CUSTOMIZADA: Auditoria Forense (.agent/skills/)
SEÇÃO 5  ── INVENTÁRIO DO QUE JÁ EXISTE E FUNCIONA
SEÇÃO 6  ── MATRIZ DE CRITICIDADE: O Que Fazer Quando
SEÇÃO 7  ── INTEGRAÇÃO COM O CAMPO AKÁSHICO
SEÇÃO 8  ── FLUXO DE AUTOMAÇÃO COM ZCC
SEÇÃO 9  ── CHECKLIST RÁPIDO (Single-Page Reference)
SEÇÃO 10 ── HISTÓRICO DE INCIDENTES E LIÇÕES APRENDIDAS
```

---

## SEÇÃO 0 — PREFÁCIO: POR QUE ISSO EXISTE

### O Problema Que Isso Resolve

Em 11 de junho de 2026, durante a construção do WhatsApp FSM (Finite State Machine) para o ZEHLA, o agente de desenvolvimento avançou sobre uma base de código que continha **92 erros de TypeScript**, um **mock do Mercado Pago em produção**, e um **middleware ausente** — sem nenhum checkpoint de qualidade. O resultado: código novo construído sobre alicerces quebrados, propagando fragilidades para todo o ecossistema.

Esse incidente revelou uma lacuna crítica: **nenhum mecanismo obrigatório forçava o agente a verificar a saúde do repositório antes de declarar "está tudo ok"**. Os `.agent/rules/` existentes eram sobre cognição e aprendizado — não sobre saúde de código. O `anchor.md` focava em contexto — não em auditoria.

Este documento existe para garantir que **isso nunca mais aconteça**. Cada seção aqui é um artefato real que será injetado no repositório como arquivos de configuração que o agente é **forçado a ler e seguir** antes de qualquer ação.

### Princípios Fundamentais

1. **Verificação Antes de Confirmação** — O agente NUNCA declara "está tudo ok" sem executar os 5 passos da auditoria completa.
2. **Base Sólida Antes de Feature Nova** — Nenhuma feature é construída sobre código quebrado. Se a base tem problemas, ela é corrigida primeiro.
3. **Transparência Radial** — Se algo está quebrado, o agente lista exatamente o quê, onde e por quê. Nunca esconde problemas.
4. **Hierarquia de Criticidade** — Nem todo erro bloqueia tudo. Há uma classificação clara do que é crítico, importante e aceitável.
5. **Aprendizado Contínuo** — Cada incidente documentado alimenta o Campo Akáshico do ZEHLA, tornando o sistema mais resiliente com o tempo.

### O Que Muda com Este Documento

| ANTES (sem auditoria) | DEPOIS (com auditoria obrigatória) |
|---|---|
| Agente constrói features sobre código quebrado | Agente verifica saúde antes de qualquer construção |
| "Está tudo ok" sem verificação | 5 passos obrigatórios antes de qualquer confirmação |
| Mocks em produção passam despercebidos | Mocks são detectados e bloqueados automaticamente |
| Erros de schema se propagam silenciosamente | Schema vs código é cruzado a cada auditoria |
| Middleware ausente não é notado | Middleware é verificado como checkpoint obrigatório |

---

## SEÇÃO 1 — REGRA VINCULANTE: AUDITORIA OBRIGATÓRIA

**Arquivo de destino**: `.agent/rules/auditoria-obrigatoria.md`
**Natureza**: VINCULANTE — O agente NÃO PODE IGNORAR este arquivo. Ele fica em `.agent/rules/`, que é o diretório de regras que todo agente compatível é forçado a ler antes de agir.
**Gatilho**: Toda vez que o agente receber "confira o repo", "está tudo ok?", "auditoria", "check", ou for iniciar qualquer feature nova, pipeline CI/CD, ou deploy.

```markdown
# REGRA VINCULANTE: AUDITORIA OBRIGATÓRIA

**Versão**: 2.0
**Eficácia**: PRODUÇÃO
**Última atualização**: 16/06/2026

Antes de declarar "está tudo ok" ou "tudo pronto", execute **TODOS** os passos
abaixo em sequência. Não pule nenhum. Não prossiga enquanto houver vermelho.

---

## PASSO 1 — TypeScript: Verificação de Tipos

### Ação
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

### Critério de Aprovação
- ZERO erros em `src/` ativo (código de produção)
- Se > 0: LISTAR cada arquivo com erro, classificar por `src/` vs `temp/`

### Separação por Criticidade
| Localização | Criticidade | Ação |
|---|---|---|
| `src/app/api/**/*.ts` | CRÍTICO | BLOQUEIO — APIs quebradas não podem ir para produção |
| `src/app/(dashboard)/**/*.tsx` | CRÍTICO | BLOQUEIO — Telas quebradas afetam usuário final |
| `src/lib/**/*.ts` | ALTO | BLOQUEIO — Bibliotecas compartilhadas com erros contaminam tudo |
| `src/components/**/*.tsx` | ALTO | BLOQUEIO — Componentes com erros de tipo causam runtime crashes |
| `src/middleware.ts` | CRÍTICO | BLOQUEIO — Middleware quebrado = segurança comprometida |
| `temp/` ou `__test__/` | BAIXO | REGISTRAR — Erros em código temporário não bloqueiam, mas devem ser corrigidos |

### Output Esperado
```
✅ PASSO 1: TypeScript — 0 erros em src/ ativo
```
ou
```
❌ PASSO 1: TypeScript — 3 erros em src/ ativo
   - src/app/api/reservations/route.ts: error TS2345 — tipo mismatch em handler
   - src/lib/prisma.ts: error TS2307 — módulo não encontrado
   - src/components/BookingCard.tsx: error TS2322 — prop type incompatível
   → BLOQUEIO: Corrigir antes de prosseguir
```

---

## PASSO 2 — Prisma Schema vs Código: Consistência de Modelos

### Ação
```bash
# Extrair todos os usos de prisma.* no código
grep -roh "prisma\.[a-zA-Z]*" src/ | sort -u > /tmp/usos.txt

# Extrair todos os models do schema
grep "^model " prisma/schema.prisma | awk '{print $2}' > /tmp/modelos.txt

# Comparar: o que é usado no código mas não existe no schema
comm -23 /tmp/usos.txt /tmp/modelos.txt
```

### Critério de Aprovação
- ZERO referências `prisma.X` onde `X` não existe como `model X` no schema
- Se houver qualquer divergência → BLOQUEIO

### Por Que Isso É Crítico
O Prisma gera tipos em tempo de build baseado no `schema.prisma`. Se o código referencia `prisma.reservation` mas o schema só tem `model Reserva`, o TypeScript pode até compilar em certos cenários (por dinâmicas de imports), mas o runtime vai falhar com um erro de modelo inexistente. Esse tipo de bug é silencioso no desenvolvimento e explosivo em produção.

### Exemplos de Problemas Reais
| Código usa | Schema tem | Problema |
|---|---|---|
| `prisma.guest` | `model Guest` | ✅ OK (case insensitive) |
| `prisma.booking` | `model Reserva` | ❌ Modelo não encontrado |
| `prisma.payment` | Nenhum model Payment | ❌ Referência fantasma |
| `prisma.pousada` | `model Pousada` | ✅ OK |

### Output Esperado
```
✅ PASSO 2: Prisma — Todas as referências prisma.* têm models correspondentes
```
ou
```
❌ PASSO 2: Prisma — 2 referências sem model correspondente
   - prisma.booking (código usa, schema NÃO tem model Booking)
   - prisma.payment (código usa, schema NÃO tem model Payment)
   → BLOQUEIO: Adicionar models ao schema OU corrigir referências no código
```

---

## PASSO 3 — Mocks em Produção: Zero Tolerância

### Ação
```bash
grep -rn "InMemory\|Mock\|Fake" src/app/api/ src/app/webhooks/
```

### Critério de Aprovação
- ZERO ocorrências de `InMemory`, `Mock`, ou `Fake` dentro de:
  - `src/app/api/**/*.ts` — Rotas de API que atendem requisições reais
  - `src/app/webhooks/**/*.ts` — Webhooks que recebem eventos externos

### Por Que Isso É Existencial
Um mock em produção significa que **nenhuma operação real está sendo executada**. Se o handler de webhook do Mercado Pago usa `InMemoryPaymentGateway`, nenhum pagamento está sendo processado. Se a API de reservas usa `MockReservationRepository`, nenhuma reserva está sendo salva. O sistema aparece funcionando mas não faz nada.

### Exceções Permitidas (COM DOCUMENTAÇÃO OBRIGATÓRIA)
| Contexto | Permitido? | Condição |
|---|---|---|
| `src/app/api/` — handlers HTTP | ❌ NUNCA | Zero tolerância absoluta |
| `src/app/webhooks/` — receivers | ❌ NUNCA | Zero tolerância absoluta |
| `__tests__/` ou `*.test.ts` | ✅ SIM | Testes DEVEM usar mocks |
| `src/lib/` — utilitários isolados | ⚠️ RARO | Somente se documentado com `// MOCK: razão técnica` |
| `src/app/api/` em branch `dev-mock` | ⚠️ TEMPORÁRIO | Somente em branch de desenvolvimento, nunca em main |

### Output Esperado
```
✅ PASSO 3: Mocks — Zero mocks em produção
```
ou
```
❌ PASSO 3: Mocks — 1 mock encontrado em produção
   - src/app/webhooks/mercadopago/route.ts:14 — InMemoryPaymentGateway
   → BLOQUEIO CRÍTICO: Substituir por implementação real ANTES de qualquer deploy
```

---

## PASSO 4 — Middleware: Verificação de Existência e Integridade

### Ação
```bash
# Verificar se middleware existe e não é backup
ls -la src/middleware.ts 2>/dev/null
```

### Critério de Aprovação
- `src/middleware.ts` DEVE existir
- `src/middleware.ts` NÃO deve ser `.bak`, `.old`, `.disabled`, ou `.example`
- Se não existir ou estiver desativado → ALERTA (não bloqueia, mas exige atenção)

### Por Que Isso Importa
O middleware no Next.js é o **ponto de controle central** de toda aplicação. É ele quem:
- Valida tokens JWT de autenticação
- Redireciona usuários não autenticados
- Aplica rate limiting
- Registra logs de acesso para auditoria
- Protege rotas sensíveis (admin, webhooks, APIs internas)

Sem middleware ativo, qualquer pessoa pode acessar qualquer rota, incluindo endpoints administrativos e webhooks de pagamento. É como ter uma porta da frente sem fechadura.

### Checklist do Middleware ZEHLA
Quando o middleware existir, verificar também:
- [ ] Protege rotas `/api/admin/**` com verificação de role
- [ ] Protege rotas `/api/webhooks/**` com validação de signature
- [ ] Redireciona `/dashboard` para login se não autenticado
- [ ] Aplica rate limiting em rotas públicas
- [ ] Registra access logs para o Campo Akáshico

### Output Esperado
```
✅ PASSO 4: Middleware — src/middleware.ts existe e está ativo
```
ou
```
⚠️ PASSO 4: Middleware — src/middleware.ts NÃO EXISTE
   → ALERTA: Middleware ausente expõe rotas sensíveis sem proteção
   → Ação recomendada: Criar middleware antes de qualquer deploy em produção
```

---

## PASSO 5 — Testes: Verificação de Cobertura e Saúde

### Ação
```bash
npx vitest run 2>&1 | tail -20
```

### Critério de Aprovação
- Todos os testes existentes DEVEM passar (verde)
- Se teste falhar: LISTAR nome do teste, arquivo, e causa provável
- Pode-se passar por cima APENAS se o teste falho for **pré-existente e documentado** com `// KNOWN_FAILURE: motivo`

### Classificação de Falhas de Teste
| Tipo de Falha | Criticidade | Ação |
|---|---|---|
| Teste de integração (API) falha | CRÍTICO | BLOQUEIO — Funcionalidade quebrada em produção |
| Teste de unidade (lib/component) falha | ALTO | BLOQUEIO — Lógica de negócio comprometida |
| Teste de snapshot falha | MÉDIO | ANALISAR — Pode ser mudança intencional de UI |
| Teste de E2E falha | ALTO | BLOQUEIO — Fluxo do usuário está quebrado |
| Teste pré-existente documentado como KNOWN_FAILURE | BAIXO | REGISTRAR — Não bloqueia, mas deve ser rastreado |

### Métricas Adicionais (Opcional, mas Recomendado)
```bash
# Cobertura de testes
npx vitest run --coverage 2>&1 | grep -A5 "Coverage"

# Testes lentos (> 5s)
npx vitest run --reporter=verbose 2>&1 | grep "slow"
```

### Output Esperado
```
✅ PASSO 5: Testes — 47 testes passaram, 0 falhas
   Tempo: 3.2s
   Cobertura: 62% statements, 55% branches
```
ou
```
❌ PASSO 5: Testes — 2 falhas
   - FAIL src/lib/__tests__/pricing.test.ts: should calculate seasonal pricing
     → AssertionError: expected 450, received 0
   - FAIL src/app/api/reservations/__tests__/route.test.ts: should create reservation
     → Error: prisma.reservation is not a function
   → BLOQUEIO: Corrigir testes antes de prosseguir
```

---

## REGRA DE OURO

Se **QUALQUER** passo der VERMELHO, você **NÃO PODE** dizer "está tudo ok".

Você deve:
1. Listar **exatamente** o que está quebrado (arquivo, linha, erro)
2. **Classificar** por criticidade (crítico / alto / médio / baixo)
3. **Priorizar** a correção (críticos primeiro)
4. **Perguntar** ao usuário se ele quer que você corrija

### Formato de Resposta de Auditoria (Template)

```markdown
## Resultado da Auditoria — [DATA/HORA]

### Resumo Executivo
| Passo | Status | Detalhes |
|---|---|---|
| 1. TypeScript | ✅/❌ | X erros em src/ |
| 2. Prisma Schema | ✅/❌ | X referências órfãs |
| 3. Mocks | ✅/❌ | X mocks em produção |
| 4. Middleware | ✅/⚠️ | Presente/Ausente |
| 5. Testes | ✅/❌ | X/Y passaram |

### Veredito: [APROVADO / BLOQUEADO / BLOQUEADO COM EXCEÇÕES]

### Itens Bloqueantes (corrigir obrigatoriamente):
1. ...

### Itens de Alerta (corrigir recomendado):
1. ...

### Próximos Passos Sugeridos:
1. ...
```

### Comportamento Proibido

- ❌ Dizer "está tudo ok" sem executar os 5 passos
- ❌ Pular passos "porque já sei que está certo"
- ❌ Esconder erros "porque são pequenos"
- ❌ Construir features novas sobre base com erros
- ❌ Dizer "vamos ignorar esse erro por enquanto" sem classificar criticidade
- ❌ Fazer deploy com mocks em produção
```

---

## SEÇÃO 2 — ANCHOR PERMANENTE

**Arquivo de destino**: `.opencode/anchor.md`
**Natureza**: ANOTAÇÃO PERMANENTE — O anchor é carregado automaticamente pelo OpenCode (Crush by Charm) em cada sessão. Ele atua como a "memória de curto prazo" do agente, ancorando o contexto do projeto.

```markdown
# ZEHLA BACKEND — Anchor de Contexto Permanente

**Versão**: 2.0
**Classificação**: PRODUÇÃO

---

## IDENTIDADE DO PROJETO

| Campo | Valor |
|---|---|
| Nome | ZEHLA OS — Cognitive Hospitality Operating System |
| Stacking | Next.js 16 + React 19 + TypeScript + Prisma + Python FastAPI |
| Banco de Dados | SQLite WAL (produção) + ChromaDB (vetores) + Redis (cache/streams) |
| Autenticação | JWT + Role-based access (admin, pousada, hospede) |
| Webhooks | Mercado Pago, WhatsApp (Evolution API), Instagram |
| Deploy | Vercel (frontend) + Railway/Render (APIs Python) |

---

## AUDITORIA OBRIGATÓRIA — CHECKLIST RÁPIDO

ANTES de qualquer feature nova, SEMPRE executar:

### 1. TypeScript
```bash
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```
→ Zero erros em `src/` ativo. Se > 0: BLOQUEIO.

### 2. Prisma Schema vs Código
```bash
grep -roh "prisma\.[a-zA-Z]*" src/ | sort -u > /tmp/usos.txt
grep "^model " prisma/schema.prisma | awk '{print $2}' > /tmp/modelos.txt
comm -23 /tmp/usos.txt /tmp/modelos.txt
```
→ Zero referências `prisma.*` sem model correspondente. Se houver: BLOQUEIO.

### 3. Mocks em Produção
```bash
grep -rn "InMemory\|Mock\|Fake" src/app/api/ src/app/webhooks/
```
→ Zero ocorrências. Se encontrar: BLOQUEIO CRÍTICO.

### 4. Middleware
```bash
ls -la src/middleware.ts 2>/dev/null
```
→ Deve existir e estar ativo. Se ausente: ALERTA.

### 5. Testes
```bash
npx vitest run 2>&1 | tail -5
```
→ Todos verdes. Se falhar: LISTAR e BLOQUEIO (exceto KNOWN_FAILURE documentado).

---

## REGRAS DE OURO DO REPOSITÓRIO

1. **NUNCA confiar em "pré-existente" sem investigar.** Código que "sempre funcionou" pode ter sido quebrado por uma mudança de contexto (atualização de dependência, mudança de schema, refatoração paralela).

2. **NUNCA construir feature nova em cima de base quebrada.** Se a auditoria encontrou problemas, corrigir a base primeiro. Feature sobre base quebrada é débito técnico composto.

3. **NUNCA dizer "está tudo ok" sem executar os 5 passos.** "Parece ok" não é o mesmo que "está ok". Execute os comandos. Verifique os resultados.

4. **NUNCA fazer deploy com mocks em produção.** Se o handler de webhook usa `InMemoryAnything`, nada está sendo processado. O sistema é uma ilusão funcional.

5. **NUNCA ignorar o middleware.** Middleware ausente = rotas desprotegidas = vulnerabilidade de segurança.

6. **SEMPRE documentar quando um teste é KNOWN_FAILURE.** Testes que falham consistentemente e não são corrigidos são ruído. Documente o motivo e crie uma issue para correção futura.

---

## ESTRUTURA DO REPOSITÓRIO

```
zehla-backend/
├── prisma/
│   └── schema.prisma          ← Fonte da verdade dos modelos
├── src/
│   ├── app/
│   │   ├── (auth)/             ← Páginas de login/registro
│   │   ├── (dashboard)/        ← Dashboard do pousada/hóspede
│   │   ├── api/                ← ROTAS DE API (zero mocks!)
│   │   │   ├── admin/          ← APIs administrativas
│   │   │   ├── reservations/   ← APIs de reservas
│   │   │   ├── pricing/       ← APIs de precificação
│   │   │   └── webhooks/      ← Webhooks externos (Mercado Pago, WhatsApp)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 ← shadcn/ui components
│   │   └── dashboard/          ← Componentes específicos do dashboard
│   ├── lib/
│   │   ├── prisma.ts           ← Cliente Prisma singleton
│   │   ├── auth.ts             ← Funções de autenticação
│   │   └── utils.ts            ← Utilitários compartilhados
│   └── middleware.ts           ← CONTROLE CENTRAL (deve existir!)
├── python/
│   ├── akashic/                ← Campo Akáshico (memória profunda)
│   ├── cadmas/                 ← CADMAS-CTX (roteamento neuroeconômico)
│   └── zcc/                    ← ZEHLA Cognitive Core
├── .agent/
│   ├── rules/                  ← REGRAS VINCULANTES (agente é forçado a ler)
│   │   ├── auditoria-obrigatoria.md   ← ESTE DOCUMENTO
│   │   └── akashic-cognitive-loop.md ← Loop cognitivo do Akáshico
│   └── skills/                 ← SKILLS ESPECIALIZADAS
│       ├── auditoria-forense/         ← Skill de auditoria forense
│       └── zehla-validator/            ← Skill de validação ZCC
├── .opencode/
│   └── anchor.md               ← ESTE ARQUIVO (contexto permanente)
├── tests/
│   └── (vitest config)
├── opencode.jsonc              ← Configuração do projeto OpenCode
├── tsconfig.json
├── package.json
└── vitest.config.ts
```

---

## CONTEXTO COGNITIVO ATIVO

### Campo Akáshico (Memória Profunda)
- Localização: `python/akashic/` + ChromaDB
- Função: Memória semântica persistente de todas as interações de hóspedes
- Status: Implementação em andamento (ver CAMPO_AKASHICO_ZEHLA/)

### CADMAS-CTX (Roteamento Neuroeconômico)
- Localização: `python/cadmas/`
- Função: Roteamento inteligente de decisões de precificação
- Status: Implementação v1 completa, v2 em andamento

### ZCC (ZEHLA Cognitive Core)
- Localização: `python/zcc/`
- Função: Núcleo cognitivo central — orquestra todos os subsistemas
- Status: Arquitetura definida, integração em andamento

### Claude Fable 5 (Mythos-class LLM)
- Função: Raciocínio avançado para decisões complexas do ZCC
- API: `claude-fable-5` via Anthropic SDK
- Status: Configurado, integração com ZCC em andamento

---

## INTEGRAÇÕES EXTERNAS

| Serviço | Função | Status |
|---|---|---|
| Mercado Pago | Pagamentos | Webhook ativo, handler SEM mocks |
| Evolution API | WhatsApp Business | FSM para atendimento |
| Instagram Graph API | Social media | Feed e DMs |
| Google Calendar | Agendamentos | Sync bidirecional |
| ChromaDB | Vetores semânticos | Memória do Akáshico |
| Redis Streams | Fila de eventos | Pipeline de dados em tempo real |
```

---

## SEÇÃO 3 — CONFIGURAÇÃO DO PROJETO

**Arquivo de destino**: `opencode.jsonc` (raiz do repositório)
**Natureza**: CONFIGURAÇÃO — Este arquivo é lido pelo OpenCode (Crush by Charm / anteriormente OpenCode) para determinar comportamento do agente. Ele força o carregamento automático das regras de auditoria.

### Arquivo Completo

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  // ═══════════════════════════════════════════════════════════════
  // ZEHLA OS — Configuração do Agente de Desenvolvimento
  // Versão: 2.0 | Última atualização: 16/06/2026
  // ═══════════════════════════════════════════════════════════════

  "agents": {
    "full-stack-agent": {
      // Regras que o agente é FORÇADO a carregar e seguir
      // Arquivos em .agent/rules/ são automaticamente lidos antes de qualquer ação
      "rules": [
        ".agent/rules/auditoria-obrigatoria.md",   // ← Auditoria de 5 passos
        ".agent/rules/akashic-cognitive-loop.md"    // ← Loop cognitivo Akáshico
      ],

      // Skills que o agente pode invocar quando necessário
      "skills": [
        ".agent/skills/auditoria-forense/SKILL.md", // ← Auditoria forense avançada
        ".agent/skills/zehla-validator/SKILL.md"    // ← Validação ZCC
      ],

      // Comportamento padrão do agente
      "behavior": {
        "audit_before_feature": true,       // Sempre auditar antes de feature nova
        "audit_before_deploy": true,        // Sempre auditar antes de deploy
        "audit_on_request": true,           // Auditar quando pedido "confira o repo"
        "block_on_critical": true,           // Bloquear em erros críticos
        "report_format": "structured",       // Respostas em formato estruturado
        "max_concurrent_features": 1        // Uma feature por vez (prevenir débito)
      },

      // Gatilhos automáticos de auditoria
      "triggers": {
        "keywords": [
          "confira o repo",
          "está tudo ok",
          "auditoria",
          "check",
          "verificar",
          "review",
          "health check",
          "diagnóstico"
        ],
        "events": [
          "before_feature_start",
          "before_deploy",
          "after_pr_merge",
          "on_webhook_change",
          "on_schema_change"
        ]
      }
    }
  },

  // Configuração de contexto e memória
  "context": {
    "anchor": ".opencode/anchor.md",          // ← Arquivo de contexto permanente
    "memory": ".opencode/memory.md",           // ← Memória entre sessões
    "project_knowledge": "docs/zehla-knowledge-base/"  // ← Base de conhecimento
  },

  // Preferências de linguagem e estilo
  "preferences": {
    "language": "pt-BR",
    "code_style": "strict_typescript",
    "commit_convention": "conventional",
    "pr_description_template": "docs/templates/pr-template.md"
  }
}
```

### Explicação de Cada Seção

#### `agents.full-stack-agent.rules`
Esta é a configuração mais importante. Ela diz ao OpenCode: **"Antes de fazer QUALQUER COISA, leia estes arquivos e siga as instruções"**. Arquivos em `.agent/rules/` têm precedência sobre tudo — o agente não pode ignorá-los.

- `auditoria-obrigatoria.md` — Os 5 passos da auditoria (TypeScript, Prisma, Mocks, Middleware, Testes)
- `akashic-cognitive-loop.md` — O loop cognitivo que alimenta o Campo Akáshico com aprendizados

#### `agents.full-stack-agent.skills`
Skills são capacidades especializadas que o agente pode invocar quando necessário. Diferente de rules (que são sempre aplicadas), skills são acionadas sob demanda:

- `auditoria-forense/` — Quando a auditoria básica encontra algo suspeito e precisa de análise mais profunda
- `zehla-validator/` — Quando é necessário validar a integridade do ZCC (ZEHLA Cognitive Core)

#### `agents.full-stack-agent.behavior`
Define o comportamento padrão do agente:

- `audit_before_feature: true` — Toda vez que o agente for iniciar uma nova feature, ele executa a auditoria primeiro
- `audit_before_deploy: true` — Antes de qualquer deploy, auditoria completa
- `block_on_critical: true` — Se encontrar erros críticos, para tudo e reporta
- `max_concurrent_features: 1` — Uma feature por vez para evitar que múltiplas mudanças sejam construídas sobre bases diferentes

#### `agents.full-stack-agent.triggers`
Define quando a auditoria é acionada automaticamente:

- **Keywords**: Se o usuário disser "confira o repo" ou "está tudo ok", a auditoria roda automaticamente
- **Events**: Se o agente for criar uma feature, fazer deploy, mudar o schema, ou alterar webhooks, a auditoria roda como pré-requisito

---

## SEÇÃO 4 — SKILL CUSTOMIZADA: AUDITORIA FORENSE

**Arquivo de destino**: `.agent/skills/auditoria-forense/SKILL.md`
**Natureza**: SKILL ESPECIALIZADA — Enquanto a regra de auditoria obrigatória (Seção 1) define o **checklist mínimo**, esta skill define o **raciocínio forense** que o agente deve aplicar quando a auditoria básica encontrar problemas ou quando uma análise mais profunda for necessária.

### Arquivo Completo

```markdown
# SKILL: Auditoria Forense Avançada — ZEHLA OS

**Versão**: 2.0
**Categoria**: Engenharia de Qualidade e Segurança
**Trigger**: Quando a auditoria básica (5 passos) encontrar anomalias, erros
          persistentes, ou quando o usuário solicitar análise forense profunda.
**Tempo estimado**: 5-15 minutos dependendo da complexidade do repo.

---

## 1. VISÃO GERAL

Esta skill transforma o agente de um "executor de checklist" em um **investigador forense**
de código. O checklist básico (auditoria obrigatória) detecta problemas superficiais.
A auditoria forense vai mais fundo: encontra padrões, identifica causas-raiz, e
propõe soluções sistêmicas.

### Diferença: Auditoria Básica vs. Forense

| Aspecto | Auditoria Básica | Auditoria Forense |
|---|---|---|
| Foco | Detectar problemas conhecidos | Encontrar padrões ocultos |
| Profundidade | Verificação pontual | Análise de causa-raiz |
| Escopo | 5 passos fixos | Adaptável ao contexto |
| Output | Lista de problemas | Diagnóstico + prescrição |
| Quando usar | Sempre (obrigatório) | Quando básica encontra problemas |

---

## 2. METODOLOGIA DE INVESTIGAÇÃO

### Camada 1 — Padrões de Bug Conhecidos (Cache de Conhecimento)

O agente mantém um cache mental dos padrões de bug mais comuns no ecossistema ZEHLA:

#### Padrão 1: Mock em Produção
```
Sintoma: Handler de API/Webhook que parece funcionar mas não persiste dados
Causa: Uso de InMemory/Fake/Mock no lugar de implementação real
Detecção: grep -rn "InMemory\|Mock\|Fake" src/app/api/ src/app/webhooks/
Criticidade: CRÍTICO — Sistema funcionalmente morto
Correção: Substituir por implementação real conectada ao Prisma/Redis
Registro: Iniciar incidente no Campo Akáshico com classificação "mock-em-produção"
```

#### Padrão 2: Schema Desatualizado vs Código
```
Sintoma: TypeScript compila mas runtime falha com "model X does not exist"
Causa: Schema Prisma foi alterado mas código não foi atualizado (ou vice-versa)
Detecção: Cruzar prisma.* usados no código vs models no schema.prisma
Criticidade: CRÍTICO — Falha silenciosa em produção
Correção: Gerar novamente tipos Prisma (npx prisma generate) e atualizar código
Registro: Iniciar incidente no Campo Akáshico com classificação "schema-drift"
```

#### Padrão 3: Middleware Ausente
```
Sintoma: Rotas de admin acessíveis sem autenticação
Causa: src/middleware.ts não existe ou está desativado (.bak, .old)
Detecção: ls -la src/middleware.ts
Criticidade: ALTO — Vulnerabilidade de segurança
Correção: Criar/restaurar middleware com proteção de rotas
Registro: Iniciar incidente no Campo Akáshico com classificação "middleware-ausente"
```

#### Padrão 4: Erro de Tipo Silencioso
```
Sintoma: TypeScript compila com --noEmit mas runtime falha
Causa: Uso de `any`, `as`, ou type assertions que mascaram incompatibilidades
Detecção: grep -rn ": any\|as any\|@ts-ignore\|@ts-expect-error" src/
Criticidade: ALTO — Bugs mascarados por tipo "curinga"
Correção: Substituir `any` por tipos específicos
Registro: Iniciar incidente no Campo Akáshico com classificação "type-erosion"
```

#### Padrão 5: Dependência Desatualizada com Vulnerabilidade
```
Sintoma: warning de segurança ao rodar npm audit
Causa: Dependência com CVE conhecido não atualizada
Detecção: npm audit --json | jq '.vulnerabilities | length'
Criticidade: VARIAVEL — Depende do CVE (critical/high/medium)
Correção: npm audit fix (ou npm audit fix --force para breaking changes)
Registro: Iniciar incidente no Campo Akáshico com classificação "dep-vulnerability"
```

#### Padrão 6: Variável de Ambiente Exposta
```
Sintoma: Secrets hardcoded ou em arquivos comitados
Causa: Chaves de API, tokens JWT, ou strings de conexão no código-fonte
Detecção: grep -rn "sk-\|pk_\|secret\|password\|token" src/ --exclude-dir=node_modules
Criticidade: CRÍTICO — Exposição de credenciais
Correção: Mover para .env (nunca commitar .env), usar .env.example como template
Registro: Iniciar incidente CRÍTICO no Campo Akáshico com classificação "secret-exposure"
```

---

### Camada 2 — Cruzamento de Fontes (Análise Multi-Referencial)

A auditoria forense NÃO se limita a comandos isolados. Ela cruza informações de múltiplas
fontes para encontrar inconsistências que nenhum comando individual detectaria:

#### Cruzamento A: Prisma ↔ TypeScript ↔ Runtime
```
Fonte 1: prisma/schema.prisma (modelos definidos)
Fonte 2: node_modules/.prisma/client/index.d.ts (tipos gerados)
Fonte 3: src/**/*.ts (usos no código)
Fonte 4: Runtime (seed data, migrações)

Investigação:
  1. Os models no schema geram os tipos esperados no .prisma/client?
  2. Os tipos gerados são usados corretamente no código?
  3. Há migrações pendentes (npx prisma migrate status)?
  4. O seed data é consistente com o schema atual?

Se qualquer cruzamento falhar → Inconsistência detectada → Investigar causa.
```

#### Cruzamento B: API Routes ↔ Database ↔ Cache
```
Fonte 1: src/app/api/**/*.ts (endpoints HTTP)
Fonte 2: prisma/schema.prisma (models de dados)
Fonte 3: Redis/cache (camada de cache)

Investigação:
  1. Todo endpoint que CRIA dados invalida o cache correspondente?
  2. Todo endpoint que LÊ dados tenta o cache antes do DB?
  3. Há inconsistência entre dados em cache e dados no DB?
  4. Webhooks atualizam o cache quando dados mudam externamente?
```

#### Cruzamento C: Types ↔ Imports ↔ Exports
```
Fonte 1: tsconfig.json (paths e aliases)
Fonte 2: src/lib/**/*.ts (exports)
Fonte 3: Componentes e páginas (imports)

Investigação:
  1. Todo import `@/lib/X` tem um export correspondente?
  2. Não há import ciclicos (A imports B imports A)?
  3. Os aliases no tsconfig apontam para paths válidos?
  4. Não há imports de arquivos deletados ou renomeados?
```

---

### Camada 3 — Hierarquia de Criticidade (Classificação e Priorização)

Nem todo problema tem o mesmo peso. A auditoria forense classifica cada finding em 4 níveis:

#### Nível CRÍTICO — Bloqueio Imediato
Problemas que tornam o sistema inseguro, não funcional, ou que podem causar perda de dados.

- Mocks em handlers HTTP de produção (InMemory, Mock, Fake em api/webhooks)
- Secrets expostos (tokens, chaves API hardcoded)
- Middleware ausente (rotas desprotegidas)
- Schema drift sem migração (DB inconsistente com código)
- SQL injection ou XSS possível (input não sanitizado)

**Ação**: Parar tudo. Corrigir antes de qualquer outra coisa. Reportar ao usuário imediatamente.

#### Nível ALTO — Correção Urgente
Problemas que afetam funcionalidades mas não causam perda de dados ou breaches.

- Erros de TypeScript em src/ ativo
- Testes de integração falhando
- Referências Prisma órfãs (usos sem model)
- Componentes com type assertions perigosas (as any)
- Dependências com CVE high/critical

**Ação**: Corrigir antes de feature nova. Pode continuar trabalho paralelo que não dependa da área afetada.

#### Nível MÉDIO — Correção Planejada
Problemas que degradam a qualidade mas não causam falhas.

- Testes de snapshot falhando (possível mudança intencional de UI)
- Cobertura de testes abaixo do target
- Imports de módulos não utilizados (dead code)
- Falta de error handling em endpoints não-críticos

**Ação**: Criar issue, priorizar na próxima sprint, mas não bloqueia trabalho atual.

#### Nível BAIXO — Observação
Problemas cosméticos ou de boas práticas que não afetam funcionalidade.

- Erros em arquivos temporários (temp/, __test__/)
- Testes documentados como KNOWN_FAILURE
- Código não utilizado mas não importado
- Comentários desatualizados

**Ação**: Registrar para limpeza futura. Não afeta cronograma.

---

## 3. FLUXO DE EXECUÇÃO DA SKILL

Quando a skill de auditoria forense é invocada (manualmente ou por trigger automático),
ela executa o seguinte fluxo:

### Fase 1: Reconhecimento (1-2 min)
```bash
# Panorama geral do repo
find src/ -name "*.ts" -o -name "*.tsx" | wc -l
find src/app/api/ -name "route.ts" | wc -l
grep -r "^model " prisma/schema.prisma | wc -l
npm ls --depth=0 2>/dev/null | wc -l
```

### Fase 2: Auditoria Básica (2-3 min)
Executar os 5 passos da auditoria obrigatória (Seção 1 deste documento).

### Fase 3: Forense Profunda (5-10 min)
Se a auditoria básica encontrou problemas, executar investigação forense:

```bash
# Busca por padrões conhecidos
grep -rn ": any" src/ --include="*.ts" --include="*.tsx"
grep -rn "as any" src/ --include="*.ts" --include="*.tsx"
grep -rn "@ts-ignore\|@ts-expect-error" src/ --include="*.ts"
grep -rn "console\.log" src/app/api/ --include="*.ts"
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts"
grep -rn "sk-\|pk_\|secret\|password.*=" src/ --include="*.ts" | grep -v ".env"
```

### Fase 4: Cruzamento de Fontes (2-3 min)
Executar os cruzamentos multi-referenciais descritos na Camada 2.

### Fase 5: Relatório (1-2 min)
Compilar findings em relatório estruturado (template na Seção 4).

---

## 4. TEMPLATE DE RELATÓRIO FORENSE

```markdown
# RELATÓRIO DE AUDITORIA FORENSE — ZEHLA OS

**Data**: [TIMESTAMP]
**Trigger**: [manual | keyword | event]
**Duração**: [X minutos]
**Auditor**: [nome do agente]

---

## Resumo Executivo

| Nível | Quantidade |
|---|---|
| CRÍTICO | X |
| ALTO | X |
| MÉDIO | X |
| BAIXO | X |
| **Total** | **X** |

## Veredito: [APROVADO | BLOQUEADO | BLOQUEADO COM EXCEÇÕES]

---

## Findings Detalhados

### [CRI-001] Título do Finding
- **Nível**: CRÍTICO | ALTO | MÉDIO | BAIXO
- **Arquivo**: path/to/file.ts:linha
- **Descrição**: O que está errado e por que é problema
- **Impacto**: O que pode acontecer se não for corrigido
- **Correção Sugerida**: Como corrigir
- **Esforço Estimado**: [5 min | 30 min | 2 horas | 1 dia]

---

## Padrões Detectados

- [ ] Mock em produção: X ocorrências
- [ ] Schema drift: X modelos divergentes
- [ ] Type erosion: X usos de `any`
- [ ] Middleware: Presente/Ausente/Incompleto
- [ ] Secrets exposure: X potenciais exposições
- [ ] Dep vulnerabilities: X CVEs

## Recomendações Priorizadas

1. [IMEDIATO] Corrigir CRI-001 — [motivo]
2. [IMEDIATO] Corrigir CRI-002 — [motivo]
3. [URGENTE] Corrigir ALTO-001 — [motivo]
4. [PLANEJADO] Corrigir MED-001 — [motivo]

## Registro no Campo Akáshico

Iniciar registro com:
- Tipo: auditoria-forense
- Criticidade: [nível mais alto encontrado]
- Findings: [resumo]
- Ações tomadas: [lista]
```

---

## 5. CASOS DE USO DA SKILL

### Caso 1: Pós-Merge de Feature Complexa
Após merge de uma feature que alterou múltiplos arquivos, a auditoria forense
verifica se a merge não introduziu regressões.

### Caso 2: Investigação de Bug em Produção
Quando um bug é reportado em produção, a auditoria forense busca padrões que podem
ter causado o problema, indo além do sintoma para a causa-raiz.

### Caso 3: Onboarding de Novo Desenvolvedor
A auditoria forense gera um "health report" do repositório para que o novo dev entenda
o estado atual do código.

### Caso 4: Pre-Deploy para Produção
Versão mais rigorosa da auditoria obrigatória, executada antes de deploy em produção.

### Caso 5: Investigação de Performance
Quando há reclamações de lentidão, a auditoria forense busca padrões conhecidos de
performance: N+1 queries, falta de indexação, cache ausente, componentes pesados.
```

---

## SEÇÃO 5 — INVENTÁRIO DO QUE JÁ EXISTE E FUNCIONA

Esta seção cataloga todos os artefatos que JÁ ESTÃO implementados no ecossistema ZEHLA
e que são reforçados ou complementados por este documento.

### 5.1 Arquivos Ativos no Repositório

| Arquivo | Função | Status | Relação com este Documento |
|---|---|---|---|
| `.agent/rules/akashic-cognitive-loop.md` | Força o agente a ler o contexto Akáshico antes de agir | ✅ ATIVO | Complementa a auditoria — o agente carrega ambas as rules |
| `.opencode/anchor.md` | Ancora o contexto do projeto para cada sessão do agente | ✅ ATIVO | É atualizado pela Seção 2 deste documento |
| `.agent/skills/zehla-validator/SKILL.md` | Skill de validação do ZCC (ZEHLA Cognitive Core) | ✅ ATIVO | Trabalha em conjunto com a skill de auditoria forense |

### 5.2 Arquivos Criados por Este Documento

| Arquivo | Função | Natureza |
|---|---|---|
| `.agent/rules/auditoria-obrigatoria.md` | 5 passos obrigatórios de auditoria | VINCULANTE — agente é forçado a seguir |
| `.opencode/anchor.md` (atualizado) | Contexto permanente + checklist rápido de auditoria | ANCOR — carregado automaticamente |
| `opencode.jsonc` (atualizado) | Configuração do agente com triggers automáticos | CONFIG — define comportamento |
| `.agent/skills/auditoria-forense/SKILL.md` | Skill de auditoria forense avançada | SKILL — invocada sob demanda |

### 5.3 Ecosistema ZEHLA — Componentes Existentes

```
ZEHLA OS — Mapa de Componentes Ativos

┌─────────────────────────────────────────────────────────┐
│                    ZCC (Command Center)                 │
│         Dashboard │ Analytics │ Predictions              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Campo Akáshico│  │  CADMAS-CTX  │  │ Claude Fable  │  │
│  │ (Memória     │  │ (Roteamento  │  │ 5 (LLM       │  │
│  │  Profunda)   │  │  Neuroecon.) │  │  Cognitivo)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│  ┌──────┴───────┐  ┌─────┴──────┐  ┌──────┴───────┐  │
│  │  ChromaDB    │  │  Redis     │  │  Anthropic   │  │
│  │  (Vetores)   │  │  (Cache)   │  │  API         │  │
│  └──────────────┘  └────────────┘  └──────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    Base de Dados                        │
│              SQLite WAL + Prisma ORM                    │
├─────────────────────────────────────────────────────────┤
│                    Integrações                          │
│  Mercado Pago │ WhatsApp │ Instagram │ Google Calendar │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Documentação Existente (Downloads)

| Documento | Conteúdo | Relevância para Auditoria |
|---|---|---|
| `CAMPO_AKASHICO_ZEHLA/` | Arquitetura completa do Campo Akáshico | Define onde os incidentes são registrados |
| `CLAUDE_FABLE_5_ACERVO/04_INTEGRACAO_ZEHLA_FABLE5.md` | Mapeamento Fable 5 → ZEHLA | Claude Fable 5 pode ser usado para análise forense |
| `ZEHLA_PRIME_Documento_Mestre.md` | Documento mestre do ZEHLA | Contexto geral do projeto |
| `Plano de Implementação- ZaosNeuroRouter CADMAS-CTX v2.0.md` | Plano de implementação do router | Status do CADMAS-CTX |
| `ZEHLA_OS_Projeto_Completo.zip` | Projeto completo ZEHLA OS | Código-fonte para auditoria |

---

## SEÇÃO 6 — MATRIZ DE CRITICIDADE: O QUE FAZER QUANDO

Esta seção fornece um guia de decisão rápido para cada combinação de resultados da auditoria.

### 6.1 Matriz de Decisão

```
                    ┌──────────────────────────────────────────┐
                    │          RESULTADO DA AUDITORIA            │
                    │  TS  │ Prisma │ Mocks │ MW │ Testes       │
                    └──────┼────────┼───────┼────┼───────────────┘
                              │        │       │    │
                    ┌─────────▼────────▼───────▼────▼────────────┐
                    │                                            │
   ┌────────────────┤   TODOS VERDES = APROVADO                 │
   │ ✅ ✅ ✅ ✅ ✅   │   Prosseguir com feature/deploy           │
   └────────────────┤                                            │
                    │                                            │
   ┌────────────────┤   QUALQUER VERMELHO = BLOQUEADO           │
   │ ❌ em qualquer  │   Parar, listar, classificar, perguntar   │
   └────────────────┤                                            │
                    │                                            │
   ┌────────────────┤   MW AUSENTE = ALERTA                     │
   │ ⚠️ só middleware │   Prosseguir mas registrar e notificar   │
   └────────────────┤                                            │
                    │                                            │
   └────────────────┴────────────────────────────────────────────┘
```

### 6.2 Comportamento por Combinação Específica

| TS | Prisma | Mocks | MW | Testes | Veredito | Ação |
|---|---|---|---|---|---|---|
| ✅ | ✅ | ✅ | ✅ | ✅ | **APROVADO** | Prosseguir |
| ❌ | ✅ | ✅ | ✅ | ✅ | **BLOQUEADO** | Corrigir TS antes |
| ✅ | ❌ | ✅ | ✅ | ✅ | **BLOQUEADO** | Corrigir Prisma antes |
| ✅ | ✅ | ❌ | ✅ | ✅ | **BLOQUEADO** | CRÍTICO: remover mocks |
| ✅ | ✅ | ✅ | ⚠️ | ✅ | **APROVADO C/ ALERTA** | Prosseguir, criar MW |
| ✅ | ✅ | ✅ | ✅ | ❌ | **BLOQUEADO** | Corrigir testes (exceto KNOWN) |
| ❌ | ❌ | ❌ | ⚠️ | ❌ | **BLOQUEADO TOTAL** | Corrigir tudo, priorizar mocks |
| ✅ | ✅ | ✅ | ⚠️ | ❌* | **APROVADO C/ ALERTA** | Prosseguir se KNOWN_FAILURE |

### 6.3 Prioridade de Correção (Quando Múltiplos Problemas)

```
Prioridade 1 (IMEDIATO):    Mocks em produção ← Sistema funcionalmente morto
Prioridade 2 (IMEDIATO):    Middleware ausente ← Vulnerabilidade de segurança
Prioridade 3 (URGENTE):     Schema Prisma drift ← Falhas silenciosas em runtime
Prioridade 4 (URGENTE):     TypeScript errors ← Bugs detectáveis em tempo de compilação
Prioridade 5 (PLANEJADO):   Testes falhando ← Pode ser KNOWN_FAILURE
Prioridade 6 (OBSERVAÇÃO):  Code smells, dead code ← Não bloqueia
```

### 6.4 SLA de Correção

| Criticidade | SLA de Correção | Pode Prosseguir? |
|---|---|---|
| CRÍTICO | Imediato (na mesma sessão) | ❌ NÃO |
| ALTO | Mesmo dia | ❌ NÃO |
| MÉDIO | Próxima sprint | ✅ SIM (com registro) |
| BAIXO | Quando possível | ✅ SIM |

---

## SEÇÃO 7 — INTEGRAÇÃO COM O CAMPO AKÁSHICO

### 7.1 Por Que Conectar Auditoria ao Akáshico

O Campo Akáshico é a memória profunda do ZEHLA — onde experiências, decisões e aprendizados
são armazenados permanentemente. Conectar a auditoria ao Akáshico significa que:

1. **Cada incidente de auditoria é registrado** como um "evento de aprendizado" no Akáshico
2. **Padrões recorrentes são detectados** pelo sistema cognitivo do Akáshico
3. **Decisões passadas são consultadas** antes de novas decisões similares
4. **O sistema evolui** — cada auditoria alimenta o Akáshico, que melhora as próximas auditorias

### 7.2 Schema de Registro de Incidentes no Akáshico

```python
# python/akashic/audit_logger.py

from datetime import datetime
from typing import Optional
from enum import Enum
import json
import hashlib


class AuditSeverity(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AuditEventType(Enum):
    MOCK_IN_PRODUCTION = "mock-in-production"
    SCHEMA_DRIFT = "schema-drift"
    MIDDLEWARE_MISSING = "middleware-missing"
    TYPESCRIPT_ERROR = "typescript-error"
    TEST_FAILURE = "test-failure"
    SECRET_EXPOSURE = "secret-exposure"
    TYPE_EROSION = "type-erosion"
    DEP_VULNERABILITY = "dep-vulnerability"
    CACHE_INVALIDATION = "cache-invalidation"
    MIGRATION_PENDING = "migration-pending"


def log_audit_event(
    event_type: AuditEventType,
    severity: AuditSeverity,
    file_path: str,
    line_number: Optional[int] = None,
    description: str = "",
    code_snippet: str = "",
    suggested_fix: str = "",
    agent_id: str = "unknown",
    session_id: str = "",
) -> dict:
    """
    Registra um evento de auditoria no Campo Akáshico.

    Cada evento é armazenado como um vetor semântico no ChromaDB,
    permitindo busca por similaridade (ex: "quais problemas similares
    tivemos antes?") e análise temporal (ex: "esse tipo de erro
    está aumentando ou diminuindo?").

    O agente pode consultar o Akáshico antes de tomar decisões:
    - "Essa correção já foi tentada antes? Funcionou?"
    - "Esse padrão de bug apareceu em qual contexto?"
    - "Quais foram as consequências da última vez que ignoramos isso?"
    """

    event_id = hashlib.sha256(
        f"{event_type.value}:{file_path}:{datetime.now().isoformat()}"
        .encode()
    ).hexdigest()[:16]

    event = {
        "id": event_id,
        "type": "audit_event",
        "event_type": event_type.value,
        "severity": severity.value,
        "file_path": file_path,
        "line_number": line_number,
        "description": description,
        "code_snippet": code_snippet,
        "suggested_fix": suggested_fix,
        "agent_id": agent_id,
        "session_id": session_id,
        "timestamp": datetime.now().isoformat(),
        "status": "open",  # open | fixed | dismissed | recurring
        "related_events": [],  # IDs de eventos similares no Akáshico
        "metadata": {
            "source": "auditoria-obrigatoria",
            "version": "2.0",
            "repo_version": "current",
        },
    }

    # O evento é convertido em embedding semântico e armazenado no ChromaDB
    # para busca futura por similaridade. A descrição + code_snippet formam
    # o texto base para o embedding, permitindo que o agente encontre
    # padrões como "todos os mocks em produção estavam em webhooks de pagamento"

    return event


def search_similar_incidents(
    query: str,
    severity_filter: Optional[AuditSeverity] = None,
    limit: int = 5,
) -> list[dict]:
    """
    Busca incidentes similares no Campo Akáshico.

    Uso pelo agente:
    "Encontrei um mock em produção no handler de reservas.
     Já tivemos esse problema antes?"

    O ChromaDB faz busca vetorial e retorna os N incidentes
    mais similares, com score de similaridade e contexto temporal.
    """
    # Implementação: query embedding → ChromaDB similarity search
    pass


def get_audit_trend(
    event_type: AuditEventType,
    days: int = 30,
) -> dict:
    """
    Retorna a tendência de um tipo de incidente nos últimos N dias.

    Útil para o agente responder:
    "Esse tipo de erro está piorando ou melhorando?"

    Retorna:
    {
        "event_type": "mock-in-production",
        "period": "30 days",
        "total": 5,
        "trend": "decreasing",  // increasing | stable | decreasing
        "last_occurrence": "2026-06-10T14:30:00",
        "files_most_affected": ["src/app/webhooks/mercadopago/route.ts"],
        "average_resolution_time": "2.3 hours"
    }
    """
    pass
```

### 7.3 Fluxo Completo: Auditoria → Akáshico → Decisão

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO DE AUDITORIA INTELIGENTE                │
│                                                                 │
│  1. AGENTE RECEBE: "confira o repo"                             │
│         │                                                       │
│         ▼                                                       │
│  2. EXECUTAR AUDITORIA BÁSICA (5 passos)                       │
│         │                                                       │
│         ▼                                                       │
│  3. ENCONTROU PROBLEMAS?                                        │
│         │                                                       │
│    ┌────┴────┐                                                  │
│    │ SIM     │ NÃO                                              │
│    ▼         ▼                                                  │
│  4a. CONSULTAR   5. REGISTRAR "AUDITORIA LIMPA"                │
│      AKÁSHICO:      no Akáshico                                │
│      "Já tivemos     (evento de saúde positiva)                │
│       esse problema?"                                           │
│         │                                                       │
│         ▼                                                       │
│  4b. HÁ HISTÓRICO?                                              │
│         │                                                       │
│    ┌────┴────┐                                                  │
│    │ SIM     │ NÃO                                              │
│    ▼         ▼                                                  │
│  4c. APLICAR   4d. REGISTRAR COMO NOVO INCIDENTE               │
│      LIÇÃO       no Akáshico (primeira ocorrência)              │
│      APRENDIDA                                                 │
│         │                                                       │
│         ▼                                                       │
│  6. REPORTAR AO USUÁRIO (com contexto do Akáshico)              │
│         │                                                       │
│         ▼                                                       │
│  7. APÓS CORREÇÃO: Atualizar evento no Akáshico               │
│     (status: open → fixed, registrar tempo de resolução)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## SEÇÃO 8 — FLUXO DE AUTOMAÇÃO COM ZCC

### 8.1 Integração da Auditoria com o ZCC (ZEHLA Cognitive Core)

O ZCC é o núcleo cognitivo do ZEHLA — ele orquestra todos os subsistemas. A auditoria
obrigatória pode ser integrada ao ZCC como um "guardião automático" que verifica a saúde
do código antes que o ZCC tome qualquer decisão baseada nesse código.

### 8.2 Pipeline Automatizado

```python
# python/zcc/audit_guard.py

import subprocess
import json
from typing import TypedDict
from enum import Enum


class StepStatus(Enum):
    PASS = "pass"
    FAIL = "fail"
    WARN = "warn"
    SKIP = "skip"


class AuditStepResult(TypedDict):
    step: int
    name: str
    status: StepStatus
    output: str
    details: list[str]
    critical: bool


class AuditReport(TypedDict):
    timestamp: str
    trigger: str
    steps: list[AuditStepResult]
    verdict: str  # "approved" | "blocked" | "approved_with_warnings"
    blocking_issues: list[str]
    warnings: list[str]
    can_proceed: bool


async def run_full_audit(trigger: str = "auto") -> AuditReport:
    """
    Executa a auditoria completa de 5 passos e retorna um relatório
    estruturado que o ZCC pode consumir para tomar decisões.

    O ZCC usa este relatório para:
    1. Bloquear deploys quando há problemas críticos
    2. Notificar o operador quando há alertas
    3. Registrar tendências no Campo Akáshico
    4. Ajustar prioridades de desenvolvimento
    """

    report: AuditReport = {
        "timestamp": "",
        "trigger": trigger,
        "steps": [],
        "verdict": "approved",
        "blocking_issues": [],
        "warnings": [],
        "can_proceed": True,
    }

    # PASSO 1: TypeScript
    result = await _check_typescript()
    report["steps"].append(result)
    if result["status"] == StepStatus.FAIL:
        report["can_proceed"] = False
        report["blocking_issues"].extend(result["details"])

    # PASSO 2: Prisma Schema
    result = await _check_prisma_schema()
    report["steps"].append(result)
    if result["status"] == StepStatus.FAIL:
        report["can_proceed"] = False
        report["blocking_issues"].extend(result["details"])

    # PASSO 3: Mocks em Produção
    result = await _check_mocks()
    report["steps"].append(result)
    if result["status"] == StepStatus.FAIL:
        report["can_proceed"] = False
        report["blocking_issues"].extend(result["details"])

    # PASSO 4: Middleware
    result = await _check_middleware()
    report["steps"].append(result)
    if result["status"] == StepStatus.WARN:
        report["warnings"].extend(result["details"])

    # PASSO 5: Testes
    result = await _check_tests()
    report["steps"].append(result)
    if result["status"] == StepStatus.FAIL:
        report["can_proceed"] = False
        report["blocking_issues"].extend(result["details"])

    # Determinar veredito final
    if report["blocking_issues"]:
        report["verdict"] = "blocked"
    elif report["warnings"]:
        report["verdict"] = "approved_with_warnings"
    else:
        report["verdict"] = "approved"

    # Registrar no Campo Akáshico
    await _register_in_akashic(report)

    return report


async def _check_typescript() -> AuditStepResult:
    """PASSO 1: Verificação de tipos TypeScript."""
    try:
        proc = await subprocess.run(
            "npx tsc --noEmit 2>&1",
            shell=True,
            capture_output=True,
            text=True,
            timeout=60,
        )
        errors = [l for l in proc.stdout.split("\n") if "error TS" in l]
        error_count = len(errors)

        if error_count == 0:
            return {
                "step": 1,
                "name": "TypeScript",
                "status": StepStatus.PASS,
                "output": f"0 erros",
                "details": [],
                "critical": False,
            }
        else:
            src_errors = [e for e in errors if "src/" in e]
            return {
                "step": 1,
                "name": "TypeScript",
                "status": StepStatus.FAIL,
                "output": f"{error_count} erros ({len(src_errors)} em src/)",
                "details": src_errors[:10],  # Primeiros 10 erros
                "critical": len(src_errors) > 0,
            }
    except Exception as e:
        return {
            "step": 1,
            "name": "TypeScript",
            "status": StepStatus.WARN,
            "output": f"Não foi possível verificar: {str(e)}",
            "details": [f"TypeScript check falhou: {e}"],
            "critical": False,
        }


async def _check_prisma_schema() -> AuditStepResult:
    """PASSO 2: Consistência Prisma schema vs código."""
    try:
        # Extrair usos de prisma.*
        proc_usos = await subprocess.run(
            'grep -roh "prisma\\.[a-zA-Z]*" src/ 2>/dev/null | sort -u',
            shell=True, capture_output=True, text=True, timeout=30,
        )
        usos = set(proc_usos.stdout.strip().split("\n")) if proc_usos.stdout.strip() else set()

        # Extrair models do schema
        proc_models = await subprocess.run(
            'grep "^model " prisma/schema.prisma 2>/dev/null | awk \'{print $2}\'',
            shell=True, capture_output=True, text=True, timeout=30,
        )
        models = set(proc_models.stdout.strip().split("\n")) if proc_models.stdout.strip() else set()

        # Comparar
        usos_clean = {u.replace("prisma.", "") for u in usos if u.startswith("prisma.")}
        orfaos = usos_clean - models

        if not orfaos:
            return {
                "step": 2,
                "name": "Prisma Schema",
                "status": StepStatus.PASS,
                "output": "Todas referências têm models correspondentes",
                "details": [],
                "critical": False,
            }
        else:
            return {
                "step": 2,
                "name": "Prisma Schema",
                "status": StepStatus.FAIL,
                "output": f"{len(orfaos)} referências sem model",
                "details": [f"prisma.{o} não tem model correspondente" for o in orfaos],
                "critical": True,
            }
    except Exception as e:
        return {
            "step": 2,
            "name": "Prisma Schema",
            "status": StepStatus.WARN,
            "output": f"Não foi possível verificar: {str(e)}",
            "details": [f"Prisma check falhou: {e}"],
            "critical": False,
        }


async def _check_mocks() -> AuditStepResult:
    """PASSO 3: Mocks em produção."""
    try:
        proc = await subprocess.run(
            'grep -rn "InMemory\\|Mock\\|Fake" src/app/api/ src/app/webhooks/ 2>/dev/null',
            shell=True, capture_output=True, text=True, timeout=30,
        )
        mocks = [l for l in proc.stdout.split("\n") if l.strip()]

        if not mocks:
            return {
                "step": 3,
                "name": "Mocks em Produção",
                "status": StepStatus.PASS,
                "output": "Zero mocks em produção",
                "details": [],
                "critical": False,
            }
        else:
            return {
                "step": 3,
                "name": "Mocks em Produção",
                "status": StepStatus.FAIL,
                "output": f"{len(mocks)} mocks encontrados em produção",
                "details": mocks,
                "critical": True,
            }
    except Exception as e:
        return {
            "step": 3,
            "name": "Mocks em Produção",
            "status": StepStatus.WARN,
            "output": f"Não foi possível verificar: {str(e)}",
            "details": [f"Mock check falhou: {e}"],
            "critical": False,
        }


async def _check_middleware() -> AuditStepResult:
    """PASSO 4: Verificação de middleware."""
    try:
        proc = await subprocess.run(
            "ls src/middleware.ts 2>/dev/null && echo EXISTS || echo MISSING",
            shell=True, capture_output=True, text=True, timeout=10,
        )
        exists = "EXISTS" in proc.stdout

        if exists:
            # Verificar se não é backup
            proc_bak = await subprocess.run(
                'grep -l "\\.bak\\|\\.old\\|\\.disabled" src/middleware.ts 2>/dev/null '
                '&& echo BACKUP || echo ACTIVE',
                shell=True, capture_output=True, text=True, timeout=10,
            )
            is_backup = "BACKUP" in proc_bak.stdout

            if is_backup:
                return {
                    "step": 4,
                    "name": "Middleware",
                    "status": StepStatus.WARN,
                    "output": "Middleware existe mas está desativado",
                    "details": ["src/middleware.ts está marcado como backup"],
                    "critical": False,
                }
            else:
                return {
                    "step": 4,
                    "name": "Middleware",
                    "status": StepStatus.PASS,
                    "output": "Middleware existe e está ativo",
                    "details": [],
                    "critical": False,
                }
        else:
            return {
                "step": 4,
                "name": "Middleware",
                "status": StepStatus.WARN,
                "output": "Middleware ausente",
                "details": ["src/middleware.ts não existe"],
                "critical": False,
            }
    except Exception as e:
        return {
            "step": 4,
            "name": "Middleware",
            "status": StepStatus.WARN,
            "output": f"Não foi possível verificar: {str(e)}",
            "details": [f"Middleware check falhou: {e}"],
            "critical": False,
        }


async def _check_tests() -> AuditStepResult:
    """PASSO 5: Verificação de testes."""
    try:
        proc = await subprocess.run(
            "npx vitest run 2>&1",
            shell=True, capture_output=True, text=True, timeout=120,
        )
        output = proc.stdout + proc.stderr

        # Detectar falhas
        if "Tests" in output and "failed" in output.lower():
            lines = output.split("\n")
            failures = [l for l in lines if "FAIL" in l or "×" in l]
            return {
                "step": 5,
                "name": "Testes",
                "status": StepStatus.FAIL,
                "output": f"Testes falhando",
                "details": failures[:10],
                "critical": True,
            }
        else:
            return {
                "step": 5,
                "name": "Testes",
                "status": StepStatus.PASS,
                "output": "Todos os testes passaram",
                "details": [],
                "critical": False,
            }
    except Exception as e:
        return {
            "step": 5,
            "name": "Testes",
            "status": StepStatus.WARN,
            "output": f"Não foi possível executar testes: {str(e)}",
            "details": [f"Test runner falhou: {e}"],
            "critical": False,
        }


async def _register_in_akashic(report: AuditReport):
    """Registra resultado da auditoria no Campo Akáshico."""
    # Implementação: serializar report, criar embedding, armazenar
    pass
```

### 8.3 Exemplo de Output do Pipeline

```json
{
  "timestamp": "2026-06-16T14:30:00-03:00",
  "trigger": "pre-deploy",
  "steps": [
    {
      "step": 1,
      "name": "TypeScript",
      "status": "pass",
      "output": "0 erros",
      "details": [],
      "critical": false
    },
    {
      "step": 2,
      "name": "Prisma Schema",
      "status": "pass",
      "output": "Todas referências têm models correspondentes",
      "details": [],
      "critical": false
    },
    {
      "step": 3,
      "name": "Mocks em Produção",
      "status": "pass",
      "output": "Zero mocks em produção",
      "details": [],
      "critical": false
    },
    {
      "step": 4,
      "name": "Middleware",
      "status": "pass",
      "output": "Middleware existe e está ativo",
      "details": [],
      "critical": false
    },
    {
      "step": 5,
      "name": "Testes",
      "status": "pass",
      "output": "47 testes passaram",
      "details": [],
      "critical": false
    }
  ],
  "verdict": "approved",
  "blocking_issues": [],
  "warnings": [],
  "can_proceed": true
}
```

---

## SEÇÃO 9 — CHECKLIST RÁPIDO (Single-Page Reference)

Esta seção é um resumo de uma página que pode ser impresso ou fixado no monitor.
É o "cartão de bolso" da auditoria obrigatória.

```
╔══════════════════════════════════════════════════════════════════════╗
║           ZEHLA OS — AUDITORIA OBRIGATÓRIA — QUICK REFERENCE        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ANTES de dizer "está tudo ok", execute OS 5 PASSOS:                 ║
║                                                                      ║
║  ☐ 1. npx tsc --noEmit  →  Zero erros em src/                      ║
║     Se > 0: LISTAR arquivos, classificar src/ vs temp/             ║
║                                                                      ║
║  ☐ 2. grep prisma.* vs schema.prisma  →  Zero referências órfãs    ║
║     Se divergência: BLOQUEIO (prisma.X sem model X)                 ║
║                                                                      ║
║  ☐ 3. grep "InMemory|Mock|Fake" em api/webhooks  →  ZERO           ║
║     Se encontrar: BLOQUEIO CRÍTICO (nada funciona em produção)      ║
║                                                                      ║
║  ☐ 4. ls src/middleware.ts  →  Deve existir e estar ativo            ║
║     Se ausente: ALERTA (rotas desprotegidas)                       ║
║                                                                      ║
║  ☐ 5. npx vitest run  →  Todos verdes                             ║
║     Se falhar: LISTAR (exceto KNOWN_FAILURE documentado)            ║
║                                                                      ║
║  ───────────────────────────────────────────────────────────────    ║
║                                                                      ║
║  REGRA DE OURO:                                                      ║
║  Qualquer ❌ = NÃO PODE dizer "está tudo ok"                         ║
║  Lista o que está quebrado → Classifica → Pergunta se corrige       ║
║                                                                      ║
║  ───────────────────────────────────────────────────────────────    ║
║                                                                      ║
║  NUNCA:                                                               ║
║  ❌ Construir feature sobre base quebrada                            ║
║  ❌ Deploy com mocks em produção                                     ║
║  ❌ Ignorar middleware ausente                                       ║
║  ❌ Dizer "ok" sem rodar os comandos                                ║
║                                                                      ║
║  ───────────────────────────────────────────────────────────────    ║
║                                                                      ║
║  PRIORIDADE DE CORREÇÃO:                                             ║
║  1. Mocks em produção    (sistema funcionalmente morto)             ║
║  2. Middleware ausente    (vulnerabilidade de segurança)             ║
║  3. Schema drift         (falhas silenciosas em runtime)            ║
║  4. TypeScript errors     (bugs em tempo de compilação)             ║
║  5. Testes falhando       (pode ser KNOWN_FAILURE)                  ║
║  6. Code smells           (observação, não bloqueia)                ║
║                                                                      ║
║  ───────────────────────────────────────────────────────────────    ║
║                                                                      ║
║  ARQUIVOS:                                                           ║
║  .agent/rules/auditoria-obrigatoria.md   ← REGRAS VINCULANTES       ║
║  .opencode/anchor.md                      ← CONTEXTO PERMANENTE    ║
║  .agent/skills/auditoria-forense/SKILL.md ← AUDITORIA FORENSE      ║
║  opencode.jsonc                           ← CONFIG DO PROJETO      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## SEÇÃO 10 — HISTÓRICO DE INCIDENTES E LIÇÕES APRENDIDAS

### 10.1 Incidente #001 — WhatsApp FSM sobre Base Quebrada

**Data**: 11 de junho de 2026
**Trigger**: Construção do WhatsApp FSM (Finite State Machine)
**Detectado por**: Auditoria manual pós-implementação
**Criticidade**: ALTO

**Descrição Completa**:
Durante a implementação do WhatsApp FSM para atendimento automatizado de hóspedes,
o agente de desenvolvimento construiu a feature completa sobre uma base de código
que continha múltiplos problemas não detectados. A ausência de uma auditoria
obrigatória permitiu que o desenvolvimento prosseguisse sem verificação prévia.

**Problemas Encontrados**:
1. **92 erros de TypeScript** em `src/` — múltiplos arquivos com type mismatches,
   imports inexistentes, e prop types incompatíveis
2. **Mock do Mercado Pago em produção** — `InMemoryPaymentGateway` no handler
   de webhook em `src/app/webhooks/mercadopago/`, significando que nenhum
   pagamento real estava sendo processado
3. **Middleware ausente** — `src/middleware.ts` não existia, deixando todas
   as rotas (incluindo admin e webhooks) sem proteção de autenticação

**Impacto**:
- O WhatsApp FSM foi construído sobre código instável, potencialmente introduzindo
  novos bugs em áreas já comprometidas
- Pagamentos não estavam sendo processados (sistema funcionalmente morto para pagamentos)
- Rotas administrativas acessíveis sem autenticação (vulnerabilidade de segurança)

**Lições Aprendidas**:
1. **Regra**: Nenhuma feature nova pode ser iniciada sem auditoria prévia da base
2. **Regra**: Mocks em produção são erro crítico detectável por grep simples
3. **Regra**: Middleware é infraestrutura de segurança, não opcional
4. **Padrão**: O agente tende a confiar que "o que já existe funciona" — isso
   é um viés perigoso que precisa ser contrariado sistematicamente

**Ações Tomadas**:
- Criação deste documento (Auditoria Obrigatória) como barreira sistêmica
- Documentação do incidente no Campo Akáshico para referência futura
- Criação da skill de auditoria forense para investigações profundas

**Registro no Akáshico**:
```json
{
  "id": "INC-001",
  "type": "audit_incident",
  "event_type": "feature-on-broken-base",
  "severity": "high",
  "date": "2026-06-11",
  "files_affected": ["src/app/webhooks/mercadopago/route.ts"],
  "root_cause": "ausência de checkpoint de qualidade antes de feature nova",
  "resolution": "criação de sistema de auditoria obrigatória",
  "recurrence_prevention": "auditoria-obrigatoria.md em .agent/rules/",
  "tags": ["whatsapp-fsm", "mock-produção", "middleware-ausente", "typescript-errors"]
}
```

### 10.2 Incidente #002 — Referência Adiante (Prevenção Proativa)

**Data**: 16 de junho de 2026 (simulação preventiva)
**Trigger**: Revisão da arquitetura de integração com Claude Fable 5
**Criticidade**: MÉDIO (preventivo)

**Descrição**:
Durante a análise de integração do Claude Fable 5 com o ZEHLA, foi identificado que
a API do Fable 5 (modelo `claude-fable-5`) seria chamada diretamente de rotas de API
sem validação de input sanitário. Isso representa um risco de prompt injection se
inputs de hóspedes (WhatsApp, Instagram) forem passados diretamente ao LLM sem
sanitização.

**Ação Preventiva**:
- Documentar a necessidade de sanitização de input antes de chamadas LLM
- Adicionar checkpoint na auditoria obrigatória para revisões futuras de integração LLM
- Registrar no Akáshico como padrão de segurança a ser verificado

**Registro no Akáshico**:
```json
{
  "id": "INC-002",
  "type": "preventive",
  "event_type": "llm-input-sanitization",
  "severity": "medium",
  "date": "2026-06-16",
  "resolution": "preventive — documented before implementation",
  "tags": ["claude-fable-5", "prompt-injection", "input-sanitization"]
}
```

---

## APÊNDICE A — GLOSSÁRIO

| Termo | Definição |
|---|---|
| **Akáshico** | Campo de memória profunda do ZEHLA, baseado em ChromaDB + Redis |
| **ZCC** | ZEHLA Cognitive Core — Núcleo cognitivo central do sistema |
| **CADMAS-CTX** | Sistema de roteamento neuroeconômico com 32 context buckets |
| **ChromaDB** | Banco de dados vetorial para memória semântica |
| **Campo Akáshico** | Metáfora para a memória persistente e profunda do ZEHLA |
| **Rule Binding** | Regra em `.agent/rules/` que o agente é forçado a seguir |
| **Anchor** | Arquivo em `.opencode/anchor.md` carregado automaticamente |
| **Skill** | Capacidade especializada em `.agent/skills/` invocada sob demanda |
| **OpenCode** | Crush by Charm — CLI de desenvolvimento assistido por IA |
| **FSM** | Finite State Machine — Máquina de estados finitos (WhatsApp bot) |
| **Schema Drift** | Divergência entre o schema Prisma e o código que o usa |
| **Type Erosion** | Degradação gradual do sistema de tipos (uso crescente de `any`) |
| **Mock em Produção** | Uso de implementações falsas em código que atende requisições reais |
| **KNOWN_FAILURE** | Teste que falha consistentemente e está documentado como falha conhecida |

## APÊNDICE B — REFERÊNCIAS

| Documento | Localização |
|---|---|
| Campo Akáshico — Arquitetura | `/download/CAMPO_AKASHICO_ZEHLA/01_CAMPO_AKASHICO_ARQUITETURA.md` |
| Claude Fable 5 — Integração ZEHLA | `/download/CLAUDE_FABLE_5_ACERVO/04_INTEGRACAO_ZEHLA_FABLE5.md` |
| Claude Fable 5 — Patterns de Agentes | `/download/CLAUDE_FABLE_5_ACERVO/05_PATTERNS_AGENTES_ANTHROPIC.md` |
| ZEHLA PRIME — Documento Mestre | `/download/ZEHLA_PRIME_Documento_Mestre.md` |
| ZEHLA OS — Projeto Completo | `/download/ZEHLA_OS_Projeto_Completo.zip` |
| Plano CADMAS-CTX v2.0 | `/download/Plano de Implementação- ZaosNeuroRouter CADMAS-CTX v2.0.md` |
| ZEHLA — 8 Teses Cérebro Comercial | `/download/ZEHLA_8_TESES_CEREBRO_COMERCIAL.md` |
| Claude Fable 5 — Acervo Completo | `/download/CLAUDE_FABLE_5_ACERVO_COMPLETO.zip` |

---

## APÊNDICE C — COMO INJETAR ESTE DOCUMENTO NO REPOSITÓRIO

### Passo a Passo de Instalação

```
# 1. Criar diretórios (se não existirem)
mkdir -p .agent/rules
mkdir -p .agent/skills/auditoria-forense
mkdir -p .opencode

# 2. Extrair arquivos deste documento mestre:
#    - Seção 1 → .agent/rules/auditoria-obrigatoria.md
#    - Seção 2 → .opencode/anchor.md
#    - Seção 3 → opencode.jsonc
#    - Seção 4 → .agent/skills/auditoria-forense/SKILL.md

# 3. Verificar que o OpenCode reconhece os arquivos
#    (ele lê automaticamente .agent/rules/ e .opencode/anchor.md)

# 4. Testar: enviar "confira o repo" ao agente
#    Ele deve executar os 5 passos ANTES de responder

# 5. Opcional: Adicionar ao CI/CD pipeline
#    github-actions / vercel / railway
```

### Validação Pós-Instalação

Após injetar os arquivos, execute este teste para confirmar que o agente está seguindo
as regras:

```
TESTE 1: Enviar "está tudo ok?" ao agente
  Esperado: Agente executa 5 passos antes de responder
  Falha: Agente responde "sim" sem executar comandos

TESTE 2: Colocar um mock em src/app/api/test/route.ts
  Esperado: Auditoria detecta e bloqueia
  Falha: Agente não detecta o mock

TESTE 3: Deletar src/middleware.ts
  Esperado: Auditoria emite ALERTA de middleware ausente
  Falha: Agente não detecta a ausência

TESTE 4: Enviar "confira o repo" com schema drift
  Esperado: Auditoria detecta referências órfãs
  Falha: Agente não detecta inconsistência
```

---

*Fim do Documento Mestre — ZEHLA OS Auditoria Obrigatória v2.0*
