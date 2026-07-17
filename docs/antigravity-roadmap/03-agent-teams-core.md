# 03 - Arquitetura de Multi-Agentes e Regras de Negócio (Swarms & Faturamento)

Este documento especifica a topologia e a orquestração do ecossistema de agentes inteligentes do Seu Zélla. Ele descreve o funcionamento dos enxames (Swarms) de Pousadas e do módulo Zélla AirB (Airbnb), detalhando os mecanismos de segurança contra vazamento de pagamentos (PIX Gate) e o isolamento de cobrança e contexto.

---

## 1. Enxame de Agentes para Pousadas

A inteligência de atendimento das pousadas é estruturada sob a forma de uma Cadeia de Responsabilidade (Chain of Responsibility) orquestrada por `src/lib/brain/agent-orchestrator.ts`.

### A. Fluxo Seqüencial de Processamento (Chain of Handlers)
Toda mensagem recebida de um hóspede percorre sequencialmente os seguintes elos da cadeia:
1.  **SecurityHandler:** Sanitização de entradas, prevenção de injeção de prompt (Prompt Injection) e bloqueio de caracteres maliciosos.
2.  **IntentClassifierHandler:** Classificador NLP que deduz a intenção do usuário (ex: reservar quarto, reclamar da limpeza, pedir senha do Wi-Fi).
3.  **TrialValidatorHandler:** Verifica se o inquilino (hotel) possui saldo de cota de IA ativo ou se o período de testes expirou.
4.  **ReceiptHandler:** Confirma o recebimento e lê o status das mídias (áudio, imagem) anexadas à mensagem.
5.  **PromptBuilderHandler:** Constrói o contexto dinâmico da conversa, injetando dados da pousada, regras de hospedagem e histórico de mensagens recentes.
6.  **ToolCallingHandler:** Mapeia e prepara as ferramentas de sistema (APIs de reserva, busca de disponibilidade) que o agente pode acionar.
7.  **SemanticCacheHandler:** Consulta o Redis local buscando se uma pergunta idêntica já foi respondida recentemente, evitando custos de processamento desnecessários da API de LLM.
8.  **LLMExecutionHandler:** Despacha o prompt consolidado para o modelo de linguagem (OpenAI/Gemini/Groq/DeepSeek) e recebe a resposta textual estruturada.
9.  **LoggingHandler:** Registra o log completo da transação em banco de dados para auditoria, contagem de tokens e cálculo de custo por inquilino.
10. **VoiceHandler:** Se a entrada original foi em áudio, converte a resposta textual de saída em áudio usando serviços de síntese de voz (TTS) antes do envio final.

### B. Funções e Agentes Especializados (Sub-Agents)
Após a classificação de intenção, a requisição é direcionada ao agente especializado competente via método `getAgentName(intent)`:
*   **`RECEPTIONIST`:** Responsável pelas saudações iniciais, consulta de disponibilidade de quartos e cotação de preços básicos de diárias.
*   **`RESERVATIONS`:** Agente transacional com acesso a escritas no banco; processa check-in, check-out, modificações de datas e cancelamentos de reservas.
*   **`HOUSEKEEPING`:** Trata de pedidos práticos de hóspedes durante a estadia, tais como troca de toalhas, limpeza de quarto, ou problemas com ar-condicionado.
*   **`CONCIERGE`:** Fornece RAG sobre pontos turísticos da região, praias locais, restaurantes parceiros e comodidades internas da pousada (horário de café da manhã, regras da piscina).
*   **`FINANCIAL`:** Lida com solicitações de faturas, links de pagamento, políticas gerais de reembolso e multas de cancelamento.
*   **`SYSTEM`:** Canal de contato técnico para integrações de canais de venda externos e suporte técnico do sistema Seu Zélla.

### C. Enxame Financeiro (Sub-Agentes)
Módulo inteligente independente (`src/lib/intelligence/finance-agents-brain.ts`) para auditorias e predições:
*   **`JONY` (Sentinela Diário):** Monitora faturamento, entradas e saídas de caixa em tempo real. Identifica e alerta sobre anomalias imediatas no fluxo de caixa (ex: discrepâncias em conciliações automáticas).
*   **`MARIA` (Investigadora Orquestradora):** Executa análises quinzenais profundas do livro-caixa, identificando discrepâncias recorrentes, vazamentos e tendências macro de lucratividade.
*   **`TEDD` (Estrategista Preditivo):** Projeta o fluxo de caixa para horizontes de 30, 60 e 90 dias, sugerindo reajustes de tarifa com base em sazonalidade histórica e demanda projetada.

---

## 2. Enxame Zélla AirB (Airbnb Swarm)

Módulo especializado em interagir com a API do Airbnb e simular o atendimento humano na plataforma de aluguel por temporada.

### A. Mapeamento de Agentes (`src/lib/airb/system-prompt.ts`)
*   **`CONCIERGE`:** Executa buscas semânticas (RAG) em uma base de conhecimentos de vizinhança e localização para responder dúvidas sobre o entorno do imóvel.
*   **`CHECK_IN`:** Fornece informações detalhadas sobre as regras de check-in, instruções de fechadura eletrônica, senha do Wi-Fi e checkout.
*   **`RESOLVER`:** Direcionado a lidar com reclamações de hóspedes ou reportar problemas ao anfitrião (ex: vazamento de água, falta de luz).
*   **`RESERVAS`:** Negocia reservas diretas com preços tabelados fixos, validando a agenda de reservas.
*   **`ANFITRIAO`:** Agente padrão de acolhimento; gerencia regras da casa e saudações comuns.

### B. Proteção contra Vazamento de Pagamento: PIX Gate (`gatekeeper.ts`)
Para evitar que os anfitriões sofram banimentos na plataforma Airbnb por tentarem realizar transações financeiras fora da plataforma, o Seu Zélla aplica um filtro gatekeeper rígido.
*   **Filtro Contextual (`isPixAllowed`):**
    *   Se a origem da conversa (`platformContext`) for `airbnb_app` ou `airbnb_web`, transações via Pix são sumariamente proibidas (`false`).
    *   O Pix só é liberado para canais de contato direto (`direct`) ou WhatsApp (`whatsapp`).
*   **Sanitização de Resposta (`filterPixFromResponse`):**
    Toda resposta gerada por agentes do Airbnb passa por um filtro de regex (`PIX_PATTERNS`) que detecta e remove chaves de transferência:
    ```typescript
    const PIX_PATTERNS = [
      /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, // CPF
      /\bchave\s*pix\b/gi,
      /\bpix\b.*\bchave\b/gi,
      /\bqr\s*code\s*pix\b/gi,
      /\bR\$\s*\d+[,\.]\d{2}\b.*\bpix\b/gi,
      /\bpagamento\s*(via|por|com)\s*pix\b/gi,
      /\btransfer[êe]ncia\s*banc[áa]ria\b/gi,
      /\bdados\s*banc[áa]rios\b/gi,
      /\bchave:\s*\w+/gi,
    ];
    ```
    Caso haja correspondência, o texto vazado é substituído pela string explicativa: `[informação removida por política de segurança]`.

---

## 3. Separação de Contexto de Dados e Faturamento (Billing)

O Seu Zélla separa logicamente as entidades de Pousadas e Airbnb no banco de dados e nos modelos de faturamento.

### A. Separação de Dados por Prefixo
Todos os dados transacionais de propriedades do Airbnb são gravados em tabelas exclusivas prefixadas por `AirB` no schema do banco de dados, blindando o contexto tradicional de pousadas:
*   `AirBProperty` (cadastro de anúncios importados do Airbnb).
*   `AirBConversation` e `AirBMessage` (mensagens integradas via Airbnb Inbox).
*   `AirBRegionalKnowledge` (dados RAG exclusivos da propriedade Airbnb).
*   `AirBScrapingJob` (metadados de fila de raspagem de dados do anúncio).

### B. Separação de Faturamento e Assinaturas
*   **Assinatura Pousada:** Usa a tabela `Subscription` tradicional (Planos: Lite, Pro, Max).
*   **Assinatura Airbnb:** Usa as tabelas `AirBSubscription` e `AirBTransaction`. Os planos são geridos independentemente da pousada em `src/lib/airb/gatekeeper.ts#checkEntitlement()`:
    1.  **`airb_pro`:** Valor mensal de R$ 397,00. Dá direito ao monitoramento de até 4 propriedades e limite de 1 tarefa de raspagem de dados (scraping) concorrente. Limite de 50 conversas ativas gerenciadas por IA.
    2.  **`airb_max`:** Valor mensal de R$ 797,00. Dá direito ao monitoramento de até 12 propriedades e limite de 3 tarefas de raspagem simultâneas. Limite de 200 conversas simultâneas de IA e suporte prioritário.
