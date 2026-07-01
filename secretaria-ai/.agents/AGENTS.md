# PROTOCOLO DE EXECUÇÃO: CRONOGRAMA ZEHLA (PLANO BETA - 6 POUSADAS)

O cronograma de trabalho a seguir é uma regra imutável para a execução do projeto ZEHLA e deve ser seguido estritamente. O foco mudou para a preparação completa em **Modo Mock Estruturado** (fiação e encanamento prontos no código para abrir a torneira no futuro) voltado para **6 pousadas beta**.

---

## 🛠️ Arquitetura Mock-to-Real (Instalação das Torneiras)
O código deve rodar o pipeline de ponta a ponta. A transição de mock para produção deve ser uma camada fina controlada por variáveis no arquivo `.env`:
* **API Keys (Groq/OpenAI)**: `LLM_API_KEY="sk-mock..."` (chaveável para `sk-groq-real-...`)
* **Provedor WhatsApp**: `WHATSAPP_PROVIDER="mock"` (chaveável para `meta` ou `evolution`)
* **Base de Conhecimento**: Totalmente lida do banco (`db.knowledgeEntry`) mesmo sob mock.
* **Infraestrutura**: Configurações de PM2 e Nginx prontas para a VPS Hostinger KVM 4.

---

## 📅 Cronograma de 4 Semanas (Beta Plan)

### SEMANA 1 — Fundação Real & Pipeline Mock Chaveável
* **Dia 1-2**: **Conexão de IA & Provedor WhatsApp (Abstrato)**
  * Implementar as classes abstratas e adaptadores no `ZaosNeuroRouter` para aceitar chamadas reais via Groq/OpenAI, controlados por chave `.env`, mas mantendo o fallback do mock.
* **Dia 3**: **Seed das 6 Pousadas Beta**
  * Criar o script de seed que preenche o SQLite local com os dados específicos das 6 pousadas parceiras (quartos, políticas, Wi-Fi, etc. em `KnowledgeEntry`).
* **Dia 4-5**: **Conexão Webhook ➔ Brain ➔ Resposta**
  * Montar o pipeline de mensagens: webhook simula/recebe payload ➔ resolve o tenant pelo número de telefone no banco ➔ consulta o `ZaosNeuroRouter` ➔ simula/envia resposta ➔ persiste a conversa no banco (`ConversationLog` / `ConversationMessage`).

### SEMANA 2 — DDC Real & Onboarding Automatizado
* **Dia 1-2**: **Remover Mocks do Dashboard DDC**
  * Vincular o painel do DDC a dados reais agregados do banco (ex: `RevenueMetrics`, `AILiveFeed` lido do banco, mensagens enviadas via API real/mock).
* **Dia 3-4**: **Onboarding Automatizado**
  * Ao registrar uma pousada (tenant), o sistema cria automaticamente o `AgentConfig` padrão e popula o banco com 10 `KnowledgeEntry` de FAQ genérico de pousadas.
* **Dia 5**: **Testes de Integração End-to-End**
  * Validação local de ponta a ponta: envio fictício de mensagem por WhatsApp ➔ IA respondendo conforme base do tenant no banco ➔ visualização em tempo real no DDC.

### SEMANA 3 — Rollout do Beta (6 Pousadas)
* **Dia 1-2**: **Instalação e Configuração Manual**
  * Acompanhamento e onboarding manual das 6 pousadas beta (cadastros, carga de FAQ e configuração).
* **Dia 3**: **Mecanismo de Feedback**
  * Inclusão de um componente simples de avaliação (1-5 estrelas) das respostas da IA no DDC e endpoint `/api/feedback`.
* **Dia 4-5**: **Monitoramento Inicial**
  * Acompanhamento das conversas reais (simuladas/reais) e refinamento de prompts e base de conhecimento.

### SEMANA 4 — Ajustes de Calibração e Escala
* **Dia 1-3**: **Ajuste da IA com base nos Feedbacks**
  * Refinamento das FAQs, ajuste de temperatura de modelo e correção de alucinações.
* **Dia 4-5**: **Coleta de Depoimentos e Finalização do Staging**
  * Coleta de depoimentos das pousadas amigas para inserção na landing page e encerramento oficial da fase beta.

---

## 📋 Lista de Decisões e Infra Externa (Usuário)
1. **Marca**: Registro INPI (Classes 42/43).
2. **Legal**: Abertura de CNPJ (MEI).
3. **Domínio**: Registro de `zehla.com.br`.
4. **Hospedagem**: Contratação de VPS Hostinger KVM 4.
5. **Configurações**: DNS + certificados SSL (Let's Encrypt / Cloudflare).
