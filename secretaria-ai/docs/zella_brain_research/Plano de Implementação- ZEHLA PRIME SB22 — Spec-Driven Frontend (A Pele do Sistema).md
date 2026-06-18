# Plano de Implementação: ZEHLA PRIME SB22 — Spec-Driven Frontend (A Pele do Sistema)

Este plano descreve o design, a governança e as restrições arquiteturais para a especificação da Camada de Apresentação (Frontend UI) do ecossistema ZEHLA SmartHotel, com base no paradigma **Spec-Driven Development (SDD)**.

---

## User Review Required

> [!IMPORTANT]
> **Desacoplamento Inegociável (State vs View):**
> Para evitar o acoplamento tóxico e a mistura de regras de UI com markup JSX/TSX:
> 1. **Componentes Burros (Dumb Components)**: Cuidam estritamente da renderização visual. Recebem dados tipados e emitem callbacks de eventos. Não fazem chamadas HTTP nem importam serviços.
> 2. **Hooks Personalizados (Smart Hooks)**: Isolarão 100% da lógica de estado, efeitos colaterais e conexões com APIs HTTP.
> 
> **Zero Mocks**:
> O front-end conectará diretamente com as rotas HTTP autenticadas criadas no SB21, respeitando o padrão `Result<T, E>` no cliente.

---

## Proposed Changes

### 1. 📋 Especificação de Fronteiras de UI (`SPEC_FRONTEND.md`)
Criaremos o documento centralizador de contratos do front-end no repositório. Este arquivo define as diretrizes estritas antes de codificar qualquer componente:
- **[NEW] [SPEC_FRONTEND.md](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/SPEC_FRONTEND.md)**: 
  - Regra de componentização (Smart Components vs Dumb Components).
  - Mapeamento detalhado dos custom hooks (`useAuth`, `useZehlaBrain`, `useDashboardMetrics`, `useReservations`, `useLeadsKanban`, `useOperationsTasks`).
  - Desenho arquitetural dos componentes críticos do ZCC (`CognitiveTerminal`, `LeadKanban`, `RoomsGrid`).
  - Especificação dos adaptadores de cliente HTTP puros que encapsulam chamadas de rede e processam retornos em formato `Result<T, E>`.
  - Invariantes de interface inquebráveis.

---

## Verification Plan

### Manual Verification
- O documento `SPEC_FRONTEND.md` será revisado pelo Arquiteto do projeto (o usuário) para homologar os contratos e padrões de design antes de iniciarmos qualquer codificação frontend.
