# 🧠 ZEHLA BRAIN v3.0 — O Manifesto Supremo do Ecossistema

Este documento é a base de conhecimento absoluta para todos os agentes de IA que operam no ecossistema ZEHLA. Ele consolida a visão, a arquitetura, os protocolos de segurança e o estado operacional atual do projeto.

---

## 🚀 1. VISÃO: O SISTEMA OPERACIONAL COGNITIVO
O ZEHLA não é apenas um software de gestão hoteleira (PMS); é um **Sistema Operacional Cognitivo**. 
- **Objetivo**: Automatizar a inteligência de negócios, prospecção e hospitalidade através de um enxame (Swarm) de agentes autônomos.
- **Diferencial**: Interface premium "Pitch-Black", foco em Revenue Management (RM) e blindagem de segurança de nível bancário.
- **Filosofia de Execução**: **Postura Adversária** (Auditoria Cética) e **Spec-driven Development** (SDD).

### 🏛️ 1.1 A Trindade Zehla (Arquitetura de Domínios)
O ecossistema é dividido em três domínios soberanos que se comunicam mas nunca se misturam:

1.  **LANDPAGE (Portão de Entrada)**: A vitrine de vendas e conversão. Foco em estética, persuasão e captura de leads.
2.  **DASHBOARD DO CLIENTE (Operação)**: A ferramenta de trabalho do hoteleiro. Foco em produtividade, reservas, financeiro local e atendimento. **Layout: Top-Nav (Horizontal).**
3.  **ZCC - ZEHLA CONTROL CENTER (Cérebro Central)**: O hub administrativo e de inteligência. O ZCC monitora e orquestra tudo o que acontece na Landpage e nos Dashboards dos Clientes em tempo real. **Layout: Sidebar (Vertical) + Radar Neural Fullscreen.**

---

## 🏛️ 2. ARQUITETURA DE INTELIGÊNCIA (SISTEMA ADK)
O ZEHLA opera sob o framework de 5 camadas do **Agent Development Kit (ADK)**, garantindo estabilidade e escalabilidade:

### 🧠 Layer 1: MEMORY (A Constituição)
- **Documento**: `AGENTS.md`.
- **Função**: Regras de arquitetura, padrões de nomenclatura e mapa do repositório. Sempre carregado.
- **Regra de Ouro**: O agente deve consultar esta camada antes de propor qualquer mudança estrutural.

### 📚 Layer 2: SKILLS (Conhecimento Modular)
- **Pasta**: `.agents/skills/`.
- **Função**: Conhecimento específico invocado sob demanda (ex: `skill-hormozi`, `skill-validator`).
- **Isolamento**: Cada skill mantém o contexto limpo e focado na tarefa.

### 🛡️ Layer 3: HOOKS (Guardrails de Segurança)
- **Função**: Protocolos determinísticos de pré e pós-ação.
- **Exemplo**: Validar PII (dados sensíveis) antes de logs, bloquear `rm -rf` e auditoria de "Pousadês" em textos de vendas.

### 🤝 Layer 4: SUBAGENTS (Delegação)
- **Função**: Delegar tarefas específicas para evitar poluição de contexto.
- **Executores**: `browser_subagent` (Navegação), `code-reviewer` (Auditoria), `test-runner` (Validação).

### 🕵️ Layer (Secretaria): SECRETARIA-IA (Inteligência de Campo)
- **Função**: Atuar como o braço de pesquisa e prospecção autônoma.
- **Responsabilidades**: Buscar elementos de mercado, estudar leads profundamente, captar dados via scraping e alimentar o Cognitive Core.
- **Mantra**: "Captar, Classificar, Validar e Enriquecer".

### 📦 Layer 5: PLUGINS (Distribuição de Poder)
- **Função**: Bundles de capacidades que podem ser replicados em diferentes módulos do ecossistema (ex: Motor de Vendas, Motor de IA de Voz).

---

## 🏗️ 3. ARQUITETURA TÉCNICA (O CORPO)

### 🧩 Core Stack
- **Frontend**: Next.js 16+ (App Router) com Tailwind CSS v4. Estética premium inspirada no design "Dark Geometric".
- **Backend**: Serverless Functions (Next API Routes) integradas com **BullMQ** para tarefas de longa duração.
- **Persistência**: PostgreSQL via **Prisma ORM**. Foco total em **Real Data** (0% mocks).
- **Sistema Nervoso**: **Redis** Master/Replica para filas, cache de sessões e controle de idempotência.

---

## 📁 3. MAPA SOBERANO DO SISTEMA (ARQUITETURA DE PASTAS)

Para garantir um **Flow Perfeito**, o ecossistema ZEHLA segue esta hierarquia rigorosa:

### 🏛️ 3.1 Nível Raiz (Core Files)
- `AGENTS.md`: O Manifesto e Protocolos de IA (Você está aqui).
- `DESIGN.md`: A Bíblia Visual e Semântica do projeto.
- `README.md`: Guia rápido de inicialização.

### 📁 3.2 Pastas de Domínio
- **`src/`**: **O Código Vivo**. Lógica Next.js, APIs, Components e Motor de IA.
- **`BLUEPRINTS/`**: **O Conhecimento Mestre**. PDFs de marca, ToneDNA, estratégias de segurança e protótipos hi-fi.
- **`INTELLIGENCE/`**: **A Memória Operacional**. Auditorias, logs de missão, análises ofensivas e checkpoints de sessão.
- **`INFRA/`**: **O Coração do Sistema**. Docker, Prisma, Grafana e Prometheus.

---

## 📍 4. ESTADO ATUAL DA OPERAÇÃO

### 📍 Checkpoint (11/05 - 22:00):
- **Status**: **Máquina de Conversão (v4.0) Operacional**.
- **Inovação**: Agent Closing Engine com raciocínio tático (DeepSeek-R1) e integração de Disponibilidade Real (Prisma).
- **Performance**: Vitrine PRO com score 100/100 no Lighthouse via SSG (Server-side Static Generation).
- **Inteligência**: LIS (Lead Intelligence System) assíncrono com Raio-X autônomo via Secretaria-IA (BullMQ).
- **Segurança**: Handover automático para o ZCC em caso de frustração detectada.
- **Prioridade Próxima**: Validar o Dashboard Financeiro de ROI e a integração de Pagamentos Reais (PIX/Stripe).

### ✅ Conquistas Recentes:
- **Lighthouse 100/100**: Eliminação de render-blocking na Landing Page PRO.
- **LIS Assíncrono**: Ingestão de leads com resposta < 50ms e processamento em background.
- **Persona DNA**: Closer mimetizando o tom de voz do hoteleiro via logs históricos.
- **ZCC-Trends Integration**: IA consciente de clima e feriados para ofertas sazonais.

### 🚧 Em Andamento:
- **Swipe Intelligence (V2)**: Implementação de matching 4-dimensional e gerador autônomo (MAX tier).
- **ZCC Foundations**: Preparação para migração PostgreSQL/Next-Auth (Fase 1 do Plano Fullstack).
- **Graphify Analysis**: Mapeamento completo do "Cérebro" para auditoria de lógica matemática.

---

## 📜 5. PADRÕES DE MODERNIZAÇÃO (HOSPITALIDADE 2026)
O ZEHLA opera sob o novo marco regulatório do Ministério do Turismo:
1. **FNRH Digital**: O check-in deve ser Mobile-First via QR Code. Integração obrigatória com Gov.br.
2. **Ciclo de 24h**: O sistema gerencia automaticamente a diária de 24h, reservando 3h para higienização (Ex: In 14h -> Out 11h).
3. **Regularidade Cadastur**: O sistema monitora ativamente a validade do registro da pousada para garantir o funcionamento do canal FNRH.

---

## ⚡ 6. TÁTICA OPERACIONAL: SECRETÁRIA-IA (MANTRA ZEHLA)
A Secretaria-IA opera sob o mantra **"Captar, Classificar, Validar e Enriquecer"**.

### 🚀 ZEHLA Blast (WhatsApp Bulk Messenger)
O motor de disparos em massa foi projetado para escala de 10.000+ mensagens:
- **Protocolo Anti-Ban**: Warmup automático e Janela de Respeito (08h-20h).
- **Auto Opt-Out**: Remoção imediata de leads que desejam sair.
- **Integração Neural**: Cada interação retroalimenta o score do lead no ZEHLA Brain.

### 🎯 Protocolo de Extração (18 Colunas)
`#` | `Pousada` | `E-mail` | `Whatsapp` | `Qtd Quartos` | `Local / Praia` | `Cidade` | `UF` | `Valores Estimados` | `Qualificação` | `Validação` | `Comportamento de Compra` | `Sinais de Intenção` | `Redes Sociais` | `LATITUDE` | `LONGITUDE` | `Score Qual.` | `Score Valid.`

---

## 🤖 7. AGENTE MANAGER 2.0 (WHATSAPP CONVERSION)
O **Agente Manager** é o "Gêmeo Digital" do proprietário, projetado para converter conversas em reservas reais.

### 🧠 Arquitetura Cognitiva (Persona-Flow-Boundaries)
1. **Persona**: Mimetiza gírias e tom de voz único extraído via logs de WhatsApp (DNA Mapping).
2. **Flow (Closing Engine)**: Conduz o hóspede da Qualificação à Cotação, tratando Objeções até o Fechamento.
3. **Boundaries**: Regras rígidas de "NUNCA" para evitar alucinações e proteger a margem da pousada.

### 🛠️ Protocolo de Handover (AI -> Human)
Monitoramento de sentimento. Se detectar frustração ou perguntas complexas, o agente silencia a IA e alerta o proprietário no ZCC.

---

## 🧠 8. ZEHLA COGNITIVE CORE v4.0 (NÚCLEO DE DECISÃO)
A inteligência central segue um modelo de 4 camadas para garantir aprendizado contínuo:

1. **Camada 1: Ingestão de Eventos**: Tracking real de cada clique e resposta.
2. **Camada 2: Memory Engine**: Memória estruturada por lead.
3. **Camada 3: Scoring Engine**: Pontuação dinâmica baseada em eventos e geolocalização.
4. **Camada 4: Action Manager**: Dispara a "Next Best Action" mimetizando a persona do hoteleiro.

### 📍 Radar de Guerra (Geolocation Ops)
- **Land-Lock Protocol**: Mantém os leads em terra firme com geocodificação de precisão.
- **Tracking de Calor**: Identidade visual dinâmica (Orange Base -> Green Converted) para visualização de ROI.

---

## 🏗️ 9. DIRETRIZES PARA AGENTES DE CODIFICAÇÃO
- **Zero Mocks**: Use dados reais do PostgreSQL ou scripts de `seed`.
- **Estética High-Fidelity**: Siga o `DESIGN.md`. Pitch-black, glassmorphism e micro-animações.
- **Segurança Sênior**: Valide CPFs, Emails e HMAC em todos os webhooks de entrada.
- **Anti-AI Slop**: Evite componentes genéricos. Todo elemento deve ser premium e funcional.

---

## 🛡️ 10. PROTOCOLO ADVERSÁRIO & CONTEXTO (GSD STANDARDS)
O ZEHLA adota a postura de "Endurecimento de Contexto" para evitar a degradação da IA:

1. **Postura Adversária (Adversarial Stance)**: Os agentes de auditoria (Secretaria-IA) devem assumir que o dado está errado ou é de baixa qualidade até que provem o contrário via Deep Scrape.
2. **Spec-driven Development (SDD)**: Antes de qualquer ação de codificação ou automação, o agente deve consultar o `BLUEPRINTS/AGENTS/` para garantir que está seguindo a "alma" do projeto.
3. **Snapshot de Contexto**: A cada 5 interações no WhatsApp, o Agente Manager deve gerar um resumo de estado para resetar a janela de contexto e evitar alucinações.

---

---

## 🚀 11. PROCEDIMENTO DE INICIALIZAÇÃO DO ZCC

Quando o usuário pedir para abrir o ZCC no navegador:

1. **Verificar se o servidor está rodando**:
   ```bash
   lsof -i :3000 2>/dev/null | head -5
   ```
   Se não estiver, iniciar:
   ```bash
   npx next dev -p 3000 &
   sleep 12  # Aguardar compilação inicial
   ```

2. **Verificar se responde** (curl confirmatório):
   ```bash
   curl -s -o /dev/null -w "HTTP %{http_code} - %{size_download}bytes - %{time_total}s\n" http://localhost:3000/zcc-login
   ```

3. **Abrir no navegador** (usar AppleScript para garantir):
   ```bash
   osascript -e 'tell application "Google Chrome" to open location "http://localhost:3000/zcc-login"' -e 'tell application "Google Chrome" to activate'
   ```

4. **Credenciais ZCC** (client-side, armazenadas em localStorage):
   - Email: `admin@smarthotel.com`
   - Senha: `zehla2026`
   - O login cria cookie `__session=fake-admin-token` com validade de 24h
   - Após login, redireciona para `/zcc`

5. **Observações**:
   - O login é client-side (NENHUMA chamada de API é feita)
   - A senha vem de `NEXT_PUBLIC_ZCC_ADMIN_PASSWORD` no `.env` (fallback `zehla2026`)
   - O email vem de `NEXT_PUBLIC_ZCC_ADMIN_EMAIL` (fallback `admin@smarthotel.com`)

*Que a gravidade nunca nos puxe para baixo. O ZEHLA é o futuro da hospitalidade autônoma.*
