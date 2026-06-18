# Plano de Implementação — ZEHLA Readiness & AI Transformation (ZRT)

Este plano detalha a adaptação prática dos frameworks de transformação de IA mapeados no OSINT do `conducting.ai` para o ecossistema do **ZEHLA SmartHotel**. O objetivo é implementar de forma funcional o que o concorrente teoriza de forma estática, focado na realidade e regulação (LGPD) do mercado hoteleiro brasileiro.

---

## User Review Required

> [!IMPORTANT]
> **INTEGRAÇÃO COM O NÚCLEO COGNITIVO (CADMAS-CTX & THOMPSON SAMPLING)**
> O motor de recomendação de agentes de IA (`AgentRecommender`) e o roadmap evolutivo devem utilizar Thompson Sampling para ponderar dinamicamente quais agentes trarão maior retorno operacional imediato, baseando-se no preenchimento de perfil da pousada.

> [!WARNING]
> **FOCO EM LEGISLAÇÃO E LGPD BRASILEIRA**
> O módulo de compliance analisará fluxos comuns de recepção de pousadas (coleta de passaporte, formulário impresso de check-in, armazenamento de WhatsApp) e gerará um relatório de risco LGPD personalizado com validade jurídica de boas práticas brasileiras.

---

## Proposta de Mudanças

O módulo será construído sob uma arquitetura modularizada e isolada no diretório `src/lib/readiness/` dentro do workspace `secretaria-ai`.

### 1. Núcleo de Domínio (`src/lib/readiness/`)

#### [NEW] [ReadinessEvaluator.ts](file:///Users/marciocau/secretaria-ai/src/lib/readiness/ReadinessEvaluator.ts)
Implementará a classe principal de avaliação de prontidão de IA:
- Avalia respostas estruturadas de 5 dimensões (Infraestrutura Digital, Automação Atual, Maturidade de Dados, Equipe, Compliance LGPD).
- Calcula o score global `0-100` e categoriza em fases: **Co-Pilots** (< 40), **Brains** (40-75) e **Autonomous Agents** (> 75).
- Avalia risco de compliance LGPD (Baixo, Médio, Alto) com base na política de tratamento de dados informada.

#### [NEW] [RoiPredictor.ts](file:///Users/marciocau/secretaria-ai/src/lib/readiness/RoiPredictor.ts)
Modelo determinístico para previsão de ganhos reais de ROI após a adoção da stack ZEHLA:
- Aumento de Ocupação (% estimada e valor correspondente em R$).
- Tempo operacional economizado na recepção (minutos/dia e horas/mês).
- Economia com comissões de OTAs (Booking/Airbnb) recuperadas para canais diretos (Pix nativo).
- Redução de custos de staffing através da automação inteligente.

#### [NEW] [AgentRecommender.ts](file:///Users/marciocau/secretaria-ai/src/lib/readiness/AgentRecommender.ts)
Recomendador dinâmico de agentes de IA prioritários para a pousada:
- Mapeia gargalos operacionais indicados no questionário aos agentes correspondentes do ecossistema ZEHLA (ex: Recepcionista WhatsApp, Gestor de Ocupação, Respostador de Reviews, Social Seller).

#### [NEW] [PlaybookGenerator.ts](file:///Users/marciocau/secretaria-ai/src/lib/readiness/PlaybookGenerator.ts)
Gera um Playbook dinâmico de transformação de IA personalizado para a pousada em formato Markdown/HTML interativo, contendo:
- Diagnóstico detalhado de maturidade e gap analysis.
- Cronograma de rollout prático em 3 fases (Fase 1: Co-Pilots, Fase 2: Brains, Fase 3: Agents).
- Planilha de impacto financeiro (ROI).
- Checklist de conformidade LGPD.

---

### 2. Camada de API (`src/app/api/readiness/`)

#### [NEW] [evaluate/route.ts](file:///Users/marciocau/secretaria-ai/src/app/api/readiness/evaluate/route.ts)
Endpoint POST que recebe as respostas do formulário de diagnóstico da pousada, executa as avaliações no domínio e retorna a análise completa de maturidade, estimativas de ROI, recomendações de agentes e o playbook de transformação formatado.

---

### 3. Interface Visual do Dashboard (`src/app/dashboard/readiness/`)

#### [NEW] [page.tsx](file:///Users/marciocau/secretaria-ai/src/app/dashboard/readiness/page.tsx)
Tela interativa de avaliação com estética premium e layout adaptativo:
- **Painel Interativo:** Questionário simples de 10 perguntas focado no cotidiano da pousada.
- **Visualização de Resultados:** Gráficos interativos em gauge do Readiness Score e nível de conformidade LGPD.
- **Painel de ROI Financeiro:** Simulador onde o usuário arrasta sliders de diária média e número de quartos para ver as economias e lucros previstos em tempo real.
- **Playbook Viewer:** Visualizador integrado para ler e baixar o playbook gerado dinamicamente.

---

## Plano de Verificação

### Testes Automatizados
Desenvolver testes unitários abrangentes na suíte do Vitest para isolar as lógicas matemáticas e heurísticas do domínio puro:
- **`ReadinessEvaluator.test.ts`**: Testar cálculos de maturidade sob diferentes perfis de resposta.
- **`RoiPredictor.test.ts`**: Validar o motor de cálculo financeiro contra fixtures de pousadas de teste (ex: Pousada pequena com 10 quartos, Pousada média com 25 quartos).
- **`AgentRecommender.test.ts`**: Validar a coerência e priorização das recomendações de agentes.

Comando para rodar a suíte readiness:
```bash
npx vitest run src/__tests__/readiness/
```

### Validação Manual
- Submeter formulários com respostas extremas (todo "sim" / todo "não") para assegurar resiliência das fórmulas matemáticas.
- Verificar o visual da interface no navegador garantindo alinhamento responsivo e contrastes a11y em mobile/desktop.
