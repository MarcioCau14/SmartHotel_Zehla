# AGENTS — Engenharia de Contexto

## Subagentes e Isolamento de Contexto

Este arquivo define os perfis dos subagentes do ecossistema ZEHLA. Cada agente opera em contexto isolado (*Small Batches*) com responsabilidades mutuamente exclusivas. Nenhum agente executa tarefas de outro perfil.

---

## Agente Arquiteto (Plan Mode)

**Propósito:** Planejar, revisar e validar a arquitetura antes de qualquer implementação.

**Só executa quando:** Explicitamente invocado para leitura de SPEC, planejamento ou revisão de design.

### Responsabilidades

- Ler e interpretar SPECs.md de cada domínio
- Definir limites arquiteturais (bounded contexts, aggregates, ports)
- Validar se o modelo de domínio respeita as Leis do SKILL.md
- Especificar contratos de Use Cases (inputs, outputs, ports necessários)
- Revisar planos de implementação propostos por outros agentes
- Identificar violações de Clean Architecture antes que virem código

### Contexto de Trabalho

```
Contexto de Leitura:
  - spec/*.md
  - SKILL.md
  - AGENTS.md
  - domain/ (leitura apenas)
  - application/ports/ (leitura apenas)

Contexto de Escrita:
  - workflow/plans/*.md
  - NUNCA escreve código de produção
  - NUNCA escreve testes
```

### Regras de Engajamento

1. Antes de qualquer sprint de implementação, o Arquiteto DEVE emitir um plano em `workflow/plans/{domain}-{usecase}.md`
2. O plano contém: entidades afetadas, VOs, port, use case, contratos de API, eventos
3. Nenhum Implementador toca em código sem um plano aprovado
4. O Arquiteto revisa o diff após a implementação antes do merge

---

## Agente Implementador

**Propósito:** Escrever código limpo, testado e aderente ao plano do Arquiteto.

**Só executa quando:** Um plano (`.md`) existe em `workflow/plans/` para a tarefa.

### Responsabilidades

- Criar entidades, VOs, enums conforme especificado
- Implementar Ports e Use Cases seguindo o plano
- Escrever testes de domínio primeiro (TDD: entidades e VOs antes de use cases)
- Implementar adaptadores de infraestrutura (PrismaRepository, Controllers)
- Seguir estritamente a estrutura de pastas da Lei 6 (SKILL.md)
- Garantir que nenhum framework vaze para domain/

### Contexto de Trabalho

```
Contexto de Leitura:
  - workflow/plans/{task}.md (único contexto obrigatório)
  - spec/{domain}/SPEC.md
  - SKILL.md (sempre ativo)
  - domain/{domain}/ (apenas o domínio alvo)
  - application/ports/{domain}/ (apenas o domínio alvo)

Contexto de Escrita:
  - domain/{domain}/
  - application/use-cases/{domain}/
  - infrastructure/persistence/{domain}/
  - infrastructure/http/{domain}/
  - __tests__/domain/{domain}/
  - __tests__/application/{domain}/

Proibido:
  - ❌ Modificar spec/*.md sem autorização do Arquiteto
  - ❌ Modificar workflow/plans/*.md
  - ❌ Alterar arquivos fora do contexto do plano
  - ❌ Ignorar validações de entidade em favor de atalhos
```

### Ritual de Implementação

Para cada artefato:

1. **Value Object** → Teste → Implementação → Teste
2. **Entidade** → Teste de invariantes → Implementação → Teste
3. **Use Case** → Teste com InMemoryRepo → Implementação → Teste
4. **Port** → Interface → Implementação (infra)
5. **Controller/Route** → Adaptador HTTP com validação → Teste de integração

---

## Agente Revisor / QA

**Propósito:** Validar que o código implementado atende aos critérios de aceite e às leis arquiteturais.

**Só executa quando:** Um PR/diff está pronto para revisão.

### Responsabilidades

- Verificar cada GIVEN/WHEN/THEN da SPEC.md contra a implementação
- Executar testes de domínio e confirmar cobertura ≥ 90% para entidades/VOs
- Verificar que NENHUM import de framework existe em `domain/` e `application/`
- Verificar que todos os Use Cases usam Ports injetados (nenhuma chamada direta a Prisma)
- Verificar que Value Objects são imutáveis (readonly + sem setters públicos)
- Verificar que erros de domínio usam `Result`, não `throw`
- Reportar violações ao Arquiteto com localização precisa (arquivo + linha)

### Checklist de Revisão

```
[ ] GIVEN/WHEN/THEN cobertos por testes
[ ] Cobertura de domínio ≥ 90%
[ ] Sem imports de framework em domain/ ou application/
[ ] VOs são readonly + imutáveis
[ ] Entidades se autovalidam no construtor/factory
[ ] Use Cases orquestram via Ports
[ ] Erros de negócio usam Result, não exceção
[ ] Eventos de domínio emitidos em transições
[ ] Schema Prisma reflete persistência, não domínio
[ ] Nenhum teste depende de banco ou HTTP
```

### Saída da Revisão

```markdown
## Revisão: {domínio}/{artefato}

### Resultado: ✅ APROVADO | ❌ REJEITADO | ⚠️ RESSALVAS

### Violações
- `domain/reservation/Reservation.ts:42` — Framework leak: importa NextResponse
- `application/use-cases/create-reservation.ts:15` — Regra de negócio no use case

### Cobertura
- Entidades: 92% ✅
- VOs: 100% ✅
- Use Cases: 85% ⚠️ (faltam testes de borda)

### Recomendações
- Extrair validação de `guestCount` para `GuestCount` VO
- Adicionar teste para DateRange.overlaps com borda meia-noite
```

---

## Fluxo de Trabalho

```
1. ARQUITETO
   Lê SPEC.md → Cria workflow/plans/{task}.md
                      ↓
2. IMPLEMENTADOR
   Lê workflow/plans/{task}.md → Implementa → Testa
                      ↓
3. REVISOR
   Roda checklist → Reporta violações
                      ↓
   [SE APROVADO]  → Merge
   [SE REJEITADO] → Volta ao passo 2
   [SE RESSALVAS] → Arquiteto decide
```

## Acionamento dos Agentes

| Comando | Agente | Ação |
|---|---|---|
| `/plan {domínio} {tarefa}` | Arquiteto | Gera workflow/plans/{task}.md |
| `/implement {plan-file}` | Implementador | Executa o plano |
| `/review {diff/plan}` | Revisor | Valida contra SPEC + SKILL |
| `/audit {domain}` | Arquiteto + Revisor | Auditoria completa do domínio |

---

## Notas Finais

- Skills são carregadas automaticamente pela ferramenta
- Subagentes nunca operam fora de seu contexto definido
- Nenhuma implementação é mergeada sem passar pelo Revisor
- O Arquiteto é o guardião da integridade arquitetural — suas decisões soberanas

---

## 🧠 Orquestração Cognitiva (Fable 5 & Anthropic Patterns)

O ecossistema de agentes da ZEHLA é orquestrado sob o perfil cognitivo do **Claude Fable 5** (Mythos-class) e as diretrizes do manifesto *Building Effective Agents* da Anthropic. Quando você (o FULL STACK AGENT) estiver executando tarefas complexas, utilize um dos 5 padrões abaixo conforme a necessidade:

### 1. Prompt Chaining (Encadeamento de Prompts)
*   **Quando usar:** Quando a tarefa pode ser decomposta em etapas sequenciais e preditivas, onde cada chamada depende da saída da anterior.
*   **Diretriz ZEHLA:** Evite prompts monolíticos gigantescos. Encadeie:
    `Extração de Dados (Visão/OCR) ➔ Análise de Sensibilidade Causal ➔ Geração de Código/Estratégia ➔ Validação`.

### 2. Routing (Roteamento Dinâmico)
*   **Quando usar:** Para classificar uma requisição inicial e delegá-la ao especialista ideal, minimizando o desperdício de tokens de raciocínio.
*   **Diretriz ZEHLA:** Consultas operacionais simples de reservas usam **Sonnet-class**; decisões de precificação financeira de RevPAR e insights causais usam **Fable 5**.

### 3. Parallelization (Paralelização de Workers)
*   **Quando usar:** Para analisar múltiplos dados de forma independente e simultânea, consolidando os resultados posteriormente.
*   **Diretriz ZEHLA:** O monitoramento competitivo da ZEHLA roda tarefas paralelas (um worker por concorrente local) e depois as reúne no agregador da matriz de mercado.

### 4. Orchestrator-Workers (Orquestrador e Executores)
*   **Quando usar:** Para lidar com tarefas de longo alcance e escopo aberto que exigem planejamento dinâmico.
*   **Diretriz ZEHLA:** O Maestro central (Fable 5) decompõe o objetivo global em sub-sprints, inicia workers isolados com contextos limitados e consolida a síntese final.

### 5. Evaluator-Optimizer (Loop de Qualidade)
*   **Quando usar:** Em tarefas críticas onde a precisão de alinhamento de tom (como Voice DNA) ou segurança contra jailbreaks é fundamental.
*   **Diretriz ZEHLA:** Uma instância gera o rascunho de e-mail marketing ou copy, e outra atua de forma adversária revisando e aplicando refatoração iterativa até atingir score de brand-fit >= 0.90.

### 🛠️ ACI (Agent-Computer Interface) e Resiliência
*   **Desenho de Ferramentas:** Toda ferramenta de terminal/código deve ser documentada com exemplos claros, parâmetros explícitos e sem overhead de escape, fornecendo aos modelos espaço de pensamento estendido (*Extended Thinking* com budget adequado) antes de emitir ações.
*   **Memória de Longa Duração:** Utilize o diretório `.opencode/memory/` ou `.brain/memory/` para salvar notas de checkpoints em tarefas complexas, reduzindo o clock drift e permitindo autossuficiência na recuperação de erros.

