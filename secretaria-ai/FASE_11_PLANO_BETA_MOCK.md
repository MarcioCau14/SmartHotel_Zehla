# FASE 11 — Plano Beta (6 Pousadas Amigas) em Modo Mock

Este documento estabelece as especificações de implementação das 6 tarefas de código para a preparação do sistema em **Modo Mock Chaveável**, garantindo a estrutura pronta (cano e fiação passados) para ativação imediata após a resolução dos itens legais e de infraestrutura.

---

## 🛠️ Detalhamento das Tarefas de Código (Modo Mock)

### ❶ Tarefa 1 — Webhook ➔ Brain ➔ DDC (End-to-End Message Pipeline)
* **Objetivo**: Conectar o fluxo completo de mensageria localmente de forma que o envio simulado pelo hóspede reflita no dashboard DDC em tempo real e salve no banco de dados.
* **Componentes**:
  * **Webhook (`/api/webhook-whatsapp`)**: Capaz de receber tanto payloads da API oficial da Meta quanto da Evolution/Z-API. Deve ler o número do remetente e o conteúdo da mensagem.
  * **Identificação do Tenant**: Buscar no banco qual pousada possui a configuração ou o número associado àquele webhook.
  * **Processamento (NeuroRouter)**: Acionar a engine de decisão para gerar a resposta.
  * **Persistência**: Salvar automaticamente no SQLite (`ConversationLog`, `ConversationMessage` e `Guest`).
  * **DDC Live Feed**: Disparar eventos (via SSE/WebSocket) para atualizar a interface de conversas do atendente sem precisar de refresh.

### ❷ Tarefa 2 — Conectar LLM Real no ZaosNeuroRouter
* **Objetivo**: Implementar o adaptador de requisição HTTP real para a Groq (Llama 3) e OpenAI (GPT-4o), mantendo o roteamento inteligente (Thompson Sampling/Circuit Breaker) funcionando.
* **Mecanismo Chaveável**:
  * Adicionar lógica no roteador que verifica a existência de `LLM_API_KEY` no `.env`.
  * Se a chave for `"sk-mock..."` ou estiver vazia, o roteador desvia para o método `mockResponse()` (gerando respostas sintéticas).
  * Se a chave for válida (ex: `gsk_...` ou `sk-proj-...`), ele executa um fetch direto para a API REST correspondente.

### ❸ Tarefa 3 — Onboarding Automático de Pousadas
* **Objetivo**: Facilitar o cadastro de novas pousadas amigas configurando automaticamente a infraestrutura mínima de dados de cada tenant.
* **Lógica no Endpoint de Registro (`/api/auth/register`)**:
  * Ao criar o tenant e o primeiro usuário administrador:
    * Inserir `AgentConfig` padrão (com a persona padrão de atendimento de pousada).
    * Inserir `ApiConfig` padrão (configurando os limites e apontando para o provedor mock).
    * Cadastrar 5-10 `KnowledgeEntry` genéricos contendo respostas padrão sobre check-in, checkout, regras de silêncio, café da manhã e Wi-Fi (placeholders fáceis de editar).

### ❹ Tarefa 4 — DDC Dinâmico e Sem Mocks Hardcoded
* **Objetivo**: Fazer com que as telas do dashboard DDC leiam exclusivamente do banco de dados SQLite.
* **Ajustes**:
  * Remover os fallbacks estáticos de strings de métricas e de nomes de propriedade (ex: "Pousada Serenity" passa a ler `tenant.name` vindo da sessão do usuário).
  * Atualizar o componente `RevenueMetrics` para calcular ganhos com base nas reservas reais salvas no banco Prisma (`db.booking`), em vez de mock estático no frontend.
  * O botão de "Enviar Mensagem" no chat do DDC deve acionar o endpoint real da API do WhatsApp.

### ❺ Tarefa 5 — Feedback Loop para Calibração de Respostas
* **Objetivo**: Oferecer um painel simples e um mecanismo para os donos de pousadas sinalizarem a eficácia das respostas dadas pelo cérebro da IA.
* **Componentes**:
  * **Componente de UI**: Componente de avaliação simples (joinha para cima/baixo ou 1 a 5 estrelas) acoplado a cada mensagem no feed de conversas.
  * **API de Feedback (`/api/feedback`)**: Endpoint POST para gravar a avaliação e notas do atendente vinculados à mensagem correspondente.
  * **Dashboard Admin**: Uma mini-tela de visualização consolidada dos feedbacks acumulados no banco de dados para auxiliar no ajuste fino de prompts.

### ❻ Tarefa 6 — Seed Customizado para as 6 Pousadas Beta
* **Objetivo**: Alimentar o banco SQLite local com os dados específicos das 6 pousadas de teste.
* **Script (`prisma/seed-beta.ts` ou similar)**:
  * Criar 6 inquilinos (Tenants) com seus respectivos dados de teste (emails, telefones e nomes reais das pousadas beta).
  * Popular a base de conhecimento (`KnowledgeEntry`) de cada uma delas com as suas regras específicas de negócio (ex: Pousada A tem piscina aquecida, Pousada B aceita pets, Pousada C tem café da manhã das 7h às 10h).

---

## 📌 Status das Fases de Preparação e Transição

```
Semana 1: Conexão Groq + Webhook completo (Mock) ➔ [ ] 0%
Semana 2: DDC Real + Onboarding Automático        ➔ [ ] 0%
Semana 3: Seed 6 Pousadas + Rollout Beta           ➔ [ ] 0%
Semana 4: Feedback Loop + Ajustes Finos            ➔ [ ] 0%
```
