# 🧠 ZEHLA COGNITIVE ENGINE: CLAUDE FABLE 5 INTEGRATION & AGENT PROTOCOLS

## 1. Visão Geral do Modelo: Claude Fable 5

*   **Identificador na API:** `claude-fable-5`
*   **Classe:** *Mythos-class* (Estado da arte em autonomia e raciocínio multi-etapa).
*   **Diferenciação (Fable 5 vs. Mythos 5):** Compartilham o mesmo modelo base. O Fable 5 possui salvaguardas (safeguards) completas para uso de mercado geral (antidistilação, restrições cibernéticas e biológicas ativas), enquanto o Mythos 5 as flexibiliza para parceiros selecionados.
*   **Preços:**
    *   **Input:** US$ 10.00 / 1M tokens
    *   **Output:** US$ 50.00 / 1M tokens
*   **Capacidade de Destaque:** *Extended Thinking* (Pensamento Estendido com budget de tokens de até 20.000 para raciocínio analítico profundo).

---

## 2. Padrões de Design de Agentes (Anthropic Patterns)

O FULL STACK AGENT e os agentes do ZEHLA OS utilizam cinco padrões arquiteturais fundamentais para estruturação de tarefas, conforme detalhado no manifesto *Building Effective Agents* da Anthropic:

### A. Prompt Chaining (Encadeamento de Prompts)
Divide tarefas complexas em etapas lineares e previsíveis.
*   *Exemplo:* A extração de dados e a geração de estratégias de pricing são divididas de forma que a saída de cada etapa passe por sanitização PII antes de alimentar a seguinte.

### B. Routing (Roteamento Dinâmico)
Classifica a entrada e delega para o modelo/agente especializado com melhor relação custo/benefício.
*   *Exemplo:* O ZEHLA Router direciona interações casuais para o **Sonnet-class** e decisões financeiras críticas de RevPAR para o **Fable 5**.

### C. Parallelization (Paralelização de Tarefas)
Roda múltiplos LLMs concorrentemente e consolida as respostas via código.
*   *Exemplo:* O monitoramento de competidores varre concorrentes de Tiradentes e Gramado de forma concorrente em workers dedicados, mesclando tudo no agregador da Matriz de Inteligência de Mercado.

### D. Orchestrator-Workers (Orquestrador e Executores)
O orquestrador central planeja o escopo geral, delega tarefas bem definidas aos workers e sintetiza a entrega.
*   *Exemplo:* O Maestro (Fable 5) quebra a análise operacional de uma pousada em auditoria de finanças, reviews e marketing, coordenando a síntese de forma organizada.

### E. Evaluator-Optimizer (Loop de Qualidade)
Um loop gerador-avaliador onde uma instância cria a resposta e a outra audita-a contra diretrizes estritas, retroalimentando o gerador até que atinja a qualidade desejada.
*   *Exemplo:* O gerador cria a campanha de e-mail e o avaliador revisa se há violações de LGPD ou tom discrepante (Voice DNA).

---

## 3. Diretrizes de HCI/ACI (Interface Agente-Computador)

Para maximizar a eficiência em tarefas de longa execução (ex: programação SWE, análises de mercado, etc.), as ferramentas de agentes devem respeitar as seguintes regras de ACI:

1.  **Espaço para Pensamento:** Configure o parâmetro `thinking` com um `budget_tokens` suficiente (mínimo de 5.000 a 10.000 para tarefas complexas), permitindo que o modelo planeje e avalie abordagens antes de realizar chamadas de escrita.
2.  **Interface Humanizada:** Desenhe ferramentas (LSPs, CLI tools, APIs) com documentações claras, exemplos práticos de JSON e parâmetros simples, tratando a máquina como se fosse um programador júnior inteligente.
3.  **Persistência de Memória:** O agente deve registrar o estado atual em arquivos de histórico `.opencode/memory/` ou `.brain/memory/` para cross-sessão, prevenindo a perda de contexto (*clock drift* de sessoes longas) e permitindo que se recupere autonomamente de bugs e bloqueios.

---

## 4. Estratégia de Alocação e Custo no ZEHLA OS

| Agente ZEHLA | Tipo de Fluxo | Modelo Atribuído | Nível de Esforço |
| :--- | :--- | :--- | :--- |
| **Orquestrador Central** | Orchestrator-Workers | `claude-fable-5` | Médio (Thinking Budget: 5.000) |
| **Revenue Pricing Scientist** | Prompt Chaining | `claude-fable-5` | Alto (Thinking Budget: 10.000) |
| **Analista Competitivo (OSINT)** | Parallelization | `claude-fable-5` | Alto (Thinking Budget: 10.000) |
| **Atendimento de Hóspedes** | Routing | `claude-sonnet-4-5` | Baixo / Sem Thinking |
| **Copywriter / Campanhas** | Evaluator-Optimizer | `claude-fable-5` | Médio (Thinking Budget: 5.000) |
| **Booking Manager** | Previsível | `claude-sonnet-4-5` | Baixo / Sem Thinking |
| **Code Reviewer / QA** | Evaluator-Optimizer | `claude-fable-5` | Alto (Thinking Budget: 10.000) |
