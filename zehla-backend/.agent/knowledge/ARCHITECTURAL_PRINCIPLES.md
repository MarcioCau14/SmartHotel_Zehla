# PRINCÍPIOS ARQUITETURAIS — Conhecimento Sistêmico Avançado

*Destilado do documento "Da Arquitetura Estrutural à Orquestração de Sistemas Distribuídos"*

---

## 1. CLEAN ARCHITECTURE — REGRA DE DEPENDÊNCIA

A regra é categórica: dependências apontam exclusivamente para dentro. Nenhum círculo interno (Entidades, Casos de Uso) pode conhecer círculos externos (Controllers, Gateways, UI).

### Implicações para o ZEHLA:
- ✅ Já seguimos: domain/ não importa nada de infraestrutura
- ✅ Ports e adaptadores via Inversão de Dependência
- ⚠️ Cuidado: abstrair bibliotecas matemáticas/utilitárias puras introduz complexidade desnecessária — discernimento é obrigatório
- ❌ Objetos ORM (Prisma) NUNCA podem vazar para domain/ — já é regra no SKILL.md

### O que o documento alerta:
"O fracasso em observar os sinais orgânicos do domínio frequentemente resulta em superengenharia. Arquiteturas hexagonais puras em domínios que requerem iteração rápida podem asfixiar a inovação."

---

## 2. NEXT.JS — SERVER COMPONENTS VS CLIENT COMPONENTS

| Aspecto | Server Component | Client Component |
|---|---|---|
| Execução | Servidor (tempo de requisição/compilação) | Navegador (pré-renderizado, hidratação) |
| Acesso a dados | Direto a Banco de Dados e chaves secretas | Restrito (fetch/XHR via API) |
| Interatividade | Estático — sem useState, useEffect, eventos | Suporta ciclos de vida, eventos sintéticos |
| Sintaxe | Padrão para novos arquivos | Exige "use client" no topo |

### Regra prática:
Manter componentes de layout pesados ancorados no servidor. Usar "use client" apenas em folhas interativas da árvore.

---

## 3. NODE.JS EVENT LOOP — ARQUITETURA OCULTA

O Event Loop do Node.js opera em fases: **timers → poll → check → close**. Entre cada fase, duas filas de microtarefas são esvaziadas:

### Ordem de Prioridade:
1. **process.nextTick()** — resolvido IMEDIATAMENTE após a fase atual, antes de qualquer outra coisa
2. **Microtarefas comuns** — Promises, queueMicrotask
3. **Fases do Event Loop** — timers, poll, check, close

### Perigo crítico:
- `process.nextTick()` recursivo e infinito → **starvation do Event Loop** (nunca chega na fase poll, servidor morre)
- `setImmediate()` → segura e delega à fase check subsequente

### Regra prática:
- Usar `setImmediate()` para adiar trabalho. Reservar `process.nextTick()` apenas para resoluções síncronas de exceções prementes.
- Isso afeta diretamente nossos workers BullMQ e o agent-orchestrator.

---

## 4. POSTGRESQL MVCC — O CUSTO DO ISOLAMENTO

O PostgreSQL nunca deleta tuplas fisicamente. Cada UPDATE ou DELETE cria tuplas novas; as antigas viram "tuplas mortas" até o VACUUM limpá-las.

### Mecanismo:
- **xmin**: transação que criou a tupla
- **xmax**: transação que deletou/substituiu a tupla
- Cada transação enxerga apenas o snapshot coerente com seu ID

### Problema: inchaço (bloat)
Tuplas mortas acumulam → tabelas e índices incham → performance degrada.

### Solução: VACUUM
- `autovacuum` precisa estar configurado corretamente
- Configurações negligentes = ruína de performance
- Monitorar `pg_stat_user_tables.n_dead_tup` vs `n_live_tup`

### Relevância ZEHLA:
Temos Prisma + PostgreSQL. Tabelas de log (MLInteractionLog, FinancialAudit) são propensas a bloat. Precisamos de estratégia de VACUUM ou particionamento para tabelas de alta escrita.

---

## 5. REDIS — PERSISTÊNCIA E ALTA DISPONIBILIDADE

O Redis é single-threaded por design (event loop), mas oferece 3 estratégias de persistência:

| Estratégia | Como funciona | Trade-off |
|---|---|---|
| **RDB** (snapshots) | Dump completo periódico do dataset em disco | Perda de dados entre snapshots |
| **AOF** (Append Only File) | Log textual de cada operação de escrita | Mais seguro, arquivo maior |
| **RDB + AOF** (híbrido) | Snapshot RDB + replay incremental AOF | Melhor dos dois mundos |

### Alta Disponibilidade:
- **Redis Sentinel**: Eleição automática de novo mestre em caso de falha (HA simples)
- **Redis Cluster**: Distribuição automática em 16.384 hash slots (escala horizontal)
  - Cliente mongos (coordenação) roteia para o shard correto
  - Falhas em um shard não afetam outros shards

### Relevância ZEHLA:
Usamos Redis para: sessões, cache, BullMQ, rate-limit, idempotency barrier. Precisamos decidir se usamos RDB, AOF ou híbrido baseado no risco de perda de dados de cada caso de uso.

---

## 6. OAUTH 2.0 — SEGURANÇA PARA AGENTES AI

### Refresh Token Rotation (RTR)
Cada vez que o refresh token é usado para obter um novo access token:
- O refresh token velho é **invalidado**
- Um **novo** refresh token é emitido
- Se um atacante rouba o refresh token e tenta usá-lo depois da rotação legítima → **curto-circuito**: todas as credenciais são revogadas

### Token Downscoping para Agentes AI
Agentes autônomos NUNCA devem receber o token mestre completo. O padrão correto:
1. Token mestre (humano) faz login
2. Troca por um **token secundário de escopo reduzido** (ex: apenas ler calendário, sem permissão de escrita)
3. O agente opera APENAS com o token reduzido
4. Se o agente for comprometido, o dano é cirurgicamente limitado

### Relevância ZEHLA:
Nossos agentes (Zé-Sales, Zé-Marketer, Zé-Analyst) que operam autonomamente precisam de tokens com escopo mínimo. Implementar troca de identidade com downscoping.

---

## 7. SEGURANÇA OWASP — VETORES CRÍTICOS

### Prepared Statements (A03:2021 Injection)
A defesa não é bloquear caracteres — é usar Prepared Statements. O protocolo processa a estrutura SQL antes de inserir dados. (No ZEHLA, Prisma já faz isso.)

### CI/CD Security Gates:
- ✅ Aprovação humana obrigatória antes de deploy em produção (MFA)
- ✅ DAST/SAST scanning automatizado
- ❌ Flags Docker `--privileged` são risco de escalonamento — evitar

### Docker userns-remap:
UID 0 dentro do container = UID 231072 (ou similar) no host. Impede breakout mesmo se container for comprometido.

---

## 8. GO GMP — MODELO DE CONCORRÊNCIA (REFERÊNCIA FUTURA)

Se migrarmos workers para Go no futuro:
- **G**oroutine (thread leve, ~4KB stack)
- **M**achine (thread real do OS)
- **P**rocessor (contexto + fila local de goroutines)

Relação M:N. Quando uma goroutine bloqueia em I/O, a Machine se desprende, o Scheduler acopla o Processor a outra Machine limpa. Vazão ininterrupta.

Canais tipados evitam mutações concorrentes corrompidas (sync.Mutex disponível para exceções).

---

## 9. KUBERNETES — RECONCILIAÇÃO CONTÍNUA (REFERÊNCIA FUTURA)

O core do K8s não é "executar scripts" — é o **loop de reconciliação**: comparar estado desejado (manifesto YAML) vs estado atual (cluster real) e corrigir diferenças.

### CRDs + Operators:
- **CRD**: Estende a API do K8s com recursos customizados
- **Operator** = CRD + Custom Controller
- O Operator incorpora conhecimento de domínio (ex: backup de banco, rotação de senhas) que antes exigia DBA humano

### Relevância ZEHLA:
Se escalarmos para multi-tenant com deploy por pousada em clusters separados, Operators gerenciariam ciclos de vida automaticamente.

---

## 10. GIT — BANCO DE DADOS ORIENTADO A CONTEÚDO (DAG)

Git não é "cópias de arquivos" — é um banco de dados de objetos endereçados por hash SHA-1:

| Objeto | O que armazena |
|---|---|
| **Blob** | Conteúdo puro do arquivo (sem nome) |
| **Tree** | Mapeamento nome → hash do Blob (diretório) |
| **Commit** | Metadados + ponteiro para Tree + ponteiro para parent(s) |

### Objetos órfãos (dangling):
Rebases e resets descartam commits que ficam sem referência. Antes do `git gc`, são recuperáveis via `git reflog`. Após o GC, são perdidos permanentemente.

### Relevância ZEHLA:
Importante para operações de recovery em caso de rebase ou reset acidental no repositório.

---

## 11. MONGODB WIREDTIGER — CONCORRÊNCIA (CONTRASTE COM PG)

| PostgreSQL | MongoDB |
|---|---|
| MVCC com tuplas mortas, xmin/xmax | Document-level locking via WiredTiger |
| Leitura nunca bloqueia escrita | Tickets controlam concorrência |
| VACUUM necessário para saúde | Sharding nativo automático |
| Deadlocks clássicos relacionais | Conteção restrita à partição local (shard) |

### Relevância ZEHLA:
No momento usamos PostgreSQL + Redis. Se algum domínio exigir esquema flexível (ex: perfis de hóspede com campos customizados por pousada), MongoDB pode ser considerado como store complementar.

---

## 12. AVALIADOR-OTIMIZADOR — O CICLO FALTANTE

O documento menciona 6 padrões de agentes. O que temos:

| Padrão | ZEHLA | Status |
|---|---|---|
| LLM Aumentado (tools) | 12 schemas definidos, sem executor | ⚠️ Parcial |
| Chainagem | agent-orchestrator de 11 passos | ✅ Completo |
| Roteamento | 3 routers (ZehlaRouter, LLMRouter, free-llm-router) | ✅ Completo |
| Paralelização | 8 BullMQ queues, 7 workers | ✅ Completo |
| Orquestrador-Trabalhadores | agent-orchestrator + workers | ✅ Completo |
| **Avaliador-Otimizador** | **Apenas Thompson Sampling de custo** | **❌ Ausente** |

### O que falta:
Um evaluator que:
1. Recebe a resposta do LLM
2. Score de 0-10 em: precisão, tom, completude
3. Se score < threshold → refaz chamada com feedback
4. Log de cada ciclo para auditoria

---

## 13. PRINCÍPIO POKA-YOKE — DESIGN À PROVA DE ERROS

Do documento: "A estrutura dos parâmetros deve ser projetada para inviabilizar entradas inválidas."

Aplicações:
- Zod schemas com validação runtime (já temos nos tool schemas)
- `safe_write_file` com `approvalRequired: true` (já temos no schema, falta o runtime)
- Design de APIs que impossibilitam estados inválidos
- Tipos que tornam impossível representar estado inválido (TypeScript discriminated unions)

---

## 14. MEMOIZATION — DATALOADER E CACHE DE CONSULTAS

Para evitar o problema N+1 em APIs GraphQL ou REST aninhadas:
- **DataLoader**: Agrega chamadas individuais em lote (batch) e as deduplica
- Cache em memória por requisição (escopo de request)
- Se migrarmos para GraphQL Federada no futuro:
  - Cache de borda (CDN): baseado em URL + hash da query
  - Memoização em resolvedores individuais
  - DataLoader no nível de banco
