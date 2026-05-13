# ESPECIFICAÇÃO TÉCNICA: ZEHLA FINANCE (Jony, Maria & Tedd)

Esta especificação define o módulo financeiro inteligente do ZCC, focado na filosofia "Conversa, não Dashboard", com agentes de elite que integram capacidades investigativas e preditivas.

## 1. A TRINDADE DE AGENTES FINANCEIROS

### JONY (O Sentinela Diário)
- **Ciclo:** Diário.
- **Foco:** Operação imediata.
- **Capacidades:** Monitora reservas, check-ins, faturamento bruto/líquido do dia. Alerta sobre anomalias imediatas via integração WhatsApp.
- **Poder:** Resposta rápida e vigilância constante.

### MARIA (A Investigadora Orquestradora)
- **Ciclo:** Quinzenal.
- **Foco:** Auditoria e Tendências.
- **Capacidades:** Utiliza lógica de `investigador_pro` (Secretaria-AI) para auditar contas, identificar discrepâncias entre notas e extratos, e coordenar as prioridades de Jony e Tedd.
- **Poder:** Identificação de padrões ocultos e validação de integridade.

### TEDD (O Estrategista Preditivo)
- **Ciclo:** Mensal.
- **Foco:** Projeções e Estratégia.
- **Capacidades:** Integra o motor `Polymathic xVal` para prever receita, ocupação e ADR dos próximos 90 dias. Sugere rebalanceamento de preços por canal (Booking, Airbnb, Direto).
- **Poder:** Antecipação de mercado e simulação de cenários financeiros.

---

## 2. FILOSOFIA UX: ESTILO PIERRE FINANCE
- O usuário não deve navegar por abas complexas.
- A primeira tela apresenta o **Resumo Inteligente** (gerado pelos agentes).
- Interações complexas são resolvidas via **Chat Financeiro** (Conversacional).

---

## 3. ARQUITETURA DE DADOS (PRISMA)

### Modelos a serem criados:
- `PousadaFinance`: Armazena o snapshot diário agregado (Receita, ADR, RevPAR, Ocupação).
- `FinanceTransaction`: Registra cada entrada/saída detalhada para auditoria da Maria.
- `FinanceAlert`: Alertas gerados pelos agentes (Info, Warning, Critical).

---

## 4. ROTEIRO DE IMPLANTAÇÃO
1. Atualização do `schema.prisma`.
2. Criação do `finance-agents-brain.ts` (A "mente" dos 3 agentes).
3. Implementação da API de Dashboard e Chat.
4. Desenvolvimento dos componentes UI premium (Hero e Chat).
