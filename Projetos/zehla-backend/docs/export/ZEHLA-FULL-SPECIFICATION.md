# ZEHLA SmartHotel — Especificação Técnica Integral (V1.0)
## Cognição Hoteleira & Ecologia Virtual

Este documento descreve exaustivamente a arquitetura, lógica e componentes do ecossistema ZEHLA, estruturado para ser replicado, simulado ou expandido em qualquer ambiente de desenvolvimento de alta fidelidade.

---

## 1. Visão Geral (The North Star)
O **ZEHLA** não é um PMS (Property Management System) convencional; é um **Sistema Operacional Cognitivo** para a hospitalidade brasileira. Ele foca na automatização de fluxos através de agentes de IA, utilizando uma estética *premium dark* e princípios de ecologia virtual para garantir imersão e eficiência.

---

## 2. Pilares Tecnológicos (The Stack)
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript (Strict Mode)
- **Estilização**: Tailwind CSS 4 + Framer Motion (Micro-animações)
- **Banco de Dados**: PostgreSQL via Prisma ORM
- **IA Core**: `FreeLLMRouter` (Groq, NVIDIA NIM, OpenRouter)
- **Arquitetura de Dados**: ECS (Entity-Component-System) para desacoplamento de lógica e estado.

---

## 3. Ecologia Virtual & Flow (A Lógica de Simulação)
Conforme o protocolo de segurança e navegabilidade, o ZEHLA opera sob três conceitos matemáticos:

### A. Features vs. Skills
- **Features**: Propriedades mensuráveis das entidades (ex: `capacity`, `basePrice`, `trialDaysLeft`). Normalizadas via *Z-score* para evitar viés estatístico.
- **Skills**: Funções de transição de estado. Toda ação (Check-in, Reserva, Comando ZCC) é uma Skill que transforma o estado global $S$ em $S'$.

### B. Esquema de Flow
O sistema monitora o delta entre o desafio operacional $D(t)$ (ex: volume de mensagens WhatsApp) e a proficiência do sistema $P(t)$ (capacidade de resposta dos agentes). O ZCC atua como o "Diretor da Ecologia", recalibrando pesos de IA em tempo real.

### C. MDP (Markov Decision Process)
A navegação do usuário e as automações de IA são modeladas como grafos de transição estocásticos, onde o sistema prevê a próxima intenção do hóspede com base em probabilidades históricas.

---

## 4. Arquitetura de Módulos (Core Components)

### 4.1. Landing Page (`/`)
- Design ultra-premium, focado em conversão B2B.
- Fluxo de Onboarding Wizard (`/teste-gratis`) em 6 passos, com persistência em tempo real e criação automática de Tenant/Propriedade no PostgreSQL.

### 4.2. Dashboard do Cliente (`/dashboard`)
- **Terminal Cognitivo**: Monitoramento de eventos do "Brain" em tempo real.
- **Gestão de Quartos**: Mapa visual de ocupação (Grid/List).
- **Fintech Hub**: Integração de pagamentos PIX e controle de receita (RevPAR, ADR).
- **Z-Learning**: Área de treinamento de agentes onde o dono da pousada "ensina" a IA através de documentos (MAL - Malha de Aprendizado Agêntica).

### 4.3. ZCC — Zehla Central Control (`/zcc`)
- Painel Administrativo Mestre para controle de frota (Fleet Management).
- **Swarm Overview**: Visualização de todos os agentes ativos em todas as propriedades.
- **Security Watch**: Interface do "Guardian Agent" com métricas de proteção anti-fraude e conformidade LGPD.

---

## 5. Esquema de Dados (Prisma Models)
O coração do ZEHLA reside nestas entidades:
- **User**: Dono da conta, associado a múltiplas propriedades.
- **Property**: A entidade central da ecologia (hotéis, pousadas).
- **Room**: Unidades habitacionais com estados dinâmicos (Available, Dirty, Maintenance).
- **Reservation**: O motor de receita, com códigos únicos e logs de auditoria.
- **AgentLog**: Registro de cada decisão tomada pela IA (intent, confidence, latency).

---

## 6. Motor de IA: FreeLLMRouter
Implementação robusta para testes sem custo de API:
1. **Prioridade 1 (Ollama)**: Local (Llama 3.3 / Qwen 2.5) para latência zero.
2. **Prioridade 2 (Groq)**: Velocidade extrema para atendimento ao hóspede.
3. **Prioridade 3 (NVIDIA NIM)**: Modelos de larga escala (Llama 3.1 405B) para tarefas complexas de marketing.
4. **Prioridade 4 (OpenRouter)**: Modelos experimentais e fallback.

---

## 7. Segurança & Conformidade
- **ZDR (Zehla Data Registry)**: Sistema de anonimização de dados sensíveis antes de enviar para LLMs externos.
- **Guardian Agent**: Agente de IA "invisível" que valida cada transição de estado no banco de dados para evitar injeções de prompt ou fraudes financeiras.

---

## 8. Glossário de Agentes (The Fleet)
1. **🛎️ Recepcionista**: Atendimento front-end via WhatsApp.
2. **📅 Reservas**: Gestão de inventário e overbooking.
3. **💰 Financeiro**: Conciliação de pagamentos e ADR.
4. **🧹 Housekeeping**: Logística de limpeza e manutenção.
5. **🛡️ Guardião**: Segurança sistêmica e auditoria.
6. **📚 Aprendiz**: Síntese de conhecimento cross-property.

---
**Documento gerado pela inteligência Antigravity — Pronto para simulação.**
