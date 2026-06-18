# Estudo e Classificação dos Agentes de Conhecimento (NotebookLM)

Este documento atua como um catálogo de referência e mapeamento estratégico dos 5 cadernos ativos no **NotebookLM**. A partir de agora, cada caderno é tratado como um **Agente de Conhecimento Especializado**, com escopos, tecnologias e gatilhos de consulta claros para guiar nossas decisões de desenvolvimento, arquitetura e prospecção.

---

## 1. ZEHLA MASTER ARCHITECT
> **Codinome:** *Agente Estrategista & Integrações*
> **Notebook ID:** `722707cf-2a2e-4189-abc1-491e763ab872`

### 🎯 Perfil e Escopo Principal
Focado em integrações de infraestrutura, automação de escritório/Workspace e estratégias de validação técnica sob a premissa de custo inicial zero (*Zero Cost*). É o repositório oficial da visão estratégica e do roadmap do ZEHLA SmartHotel.

### 🛠️ Tecnologias e Conceitos Domínio
*   **Integrações de Pagamento:** API Mercado Pago.
*   **DevOps/CI/CD:** Github Actions para pipelines de deploy iOS.
*   **Cloud Productivity:** Google Workspace CLI integrado a I.A.
*   **Simulação de Carga:** Suíte `XTRESS_TEST` para stress testing e simulação de alto volume.
*   **Precificação Dinâmica:** Engine `ZCC-TRENDS` (ajustes em tempo real por IA baseados em dados de mercado).
*   **Design System:** Diretrizes do minimalismo hoteleiro `COS™`.
*   **UX Conversacional:** Framework de conversa de hospitalidade.

### 🧭 Quando Consultar (Gatilhos)
*   Sempre que precisarmos definir ou ajustar fluxos de pagamento (Mercado Pago).
*   Ao desenhar testes de carga massivos para a API (`XTRESS_TEST`).
*   Para regras de negócio de variação automática de tarifa baseada em concorrência (`ZCC-TRENDS`).
*   Ao integrar ferramentas administrativas usando scripts do Google Workspace.

---

## 2. mano deyvin
> **Codinome:** *Agente DevCulture & Mercado*
> **Notebook ID:** `7d0b582f-dcfa-451d-8483-d01b2806ffd7`

### 🎯 Perfil e Escopo Principal
Focado em cultura de engenharia de software brasileira, tendências do mercado global de tecnologia, transição profissional e os impactos da Inteligência Artificial na identidade do desenvolvedor de software tradicional. Contém também discussões práticas sobre refatoração e arquiteturas flexíveis aplicadas a projetos.

### 🛠️ Tecnologias e Conceitos Domínio
*   **Cultura & Carreira:** Discussões sobre especialização vs. generalismo, salários internacionais (mercado de Portugal), precarização de carreira.
*   **Engenharia de Software:** Padrões práticos como refatoração de Máquinas de Estado e soluções Serverless.
*   **Tendências de IA:** O futuro da programação e a transição da codificação bruta para habilidades de arquitetura e orquestração.
*   **Segurança Física/Social:** Riscos do desenvolvedor moderno (sequestro, engenharia social, etc.).

### 🧭 Quando Consultar (Gatilhos)
*   Para embasamento de arquiteturas dinâmicas baseadas em máquinas de estado.
*   Ao planejar decisões de carreira de desenvolvedores ou entender dinâmicas do mercado de contratação de TI e Portugal.
*   Para discussões sobre o papel da IA na automação do código fonte do projeto.

---

## 3. Cod3r SMARTHOTEL ZEHLA
> **Codinome:** *Agente Cod3r Zehla (Práticas de IA & Modularidade)*
> **Notebook ID:** `c355153c-c0e3-4d91-a7a2-17209e3dbb5f`

### 🎯 Perfil e Escopo Principal
Especialista em orquestrações de backend automatizadas por IA, design de prompts inteligentes para evitar alucinações, e práticas modernas de engenharia com foco em arquitetura modular.

### 🛠️ Tecnologias e Conceitos Domínio
*   **Ferramentas de Automação:** Orquestração com n8n e agentes autônomos.
*   **Engenharia de Contexto:** Técnicas de blindagem e engenharia de contexto para mitigar alucinações de modelos de linguagem.
*   **Metodologia:** Spec Driven Development (SDD) e isolamento de escopo para resolução de bugs complexos.
*   **Programação Core:** Padrões JSON vs Object Literals em JavaScript/TypeScript.
*   **Estrutura de Código:** Modularidade técnica e código limpo (*clean code*).

### 🧭 Quando Consultar (Gatilhos)
*   Ao projetar integrações complexas de webhooks e automação usando n8n.
*   Ao projetar prompts de I.A. que exijam conformidade e zero desvio de padrão.
*   Ao aplicar a metodologia Spec Driven Development para documentar uma nova funcionalidade do backend.

---

## 4. Fernanda Kipper | Dev
> **Codinome:** *Agente Kipper System Design & Pipelines*
> **Notebook ID:** `4ebe763b-d850-45ab-8d3f-e9333e7c8649`

### 🎯 Perfil e Escopo Principal
Especialista em infraestrutura em nuvem (AWS), System Design escalável, testes de software e fundamentos do ecossistema empresarial Java/Node.js/React.

### 🛠️ Tecnologias e Conceitos Domínio
*   **Nuvem & Infraestrutura:** AWS Lambda, arquiteturas serverless e System Design escalável.
*   **DevOps:** GitHub Actions configurado para deploys serverless.
*   **Ecosystems:** Node.js, React e Fundamentos de Java (JVM e paradigma orientado a objetos).
*   **QA & Testes:** Testes unitários com Jest e mockings de API.
*   **SaaS Hoteleiro:** Análises arquiteturais de SaaS de gerenciamento de hotéis (identificação de riscos e gargalos em arquiteturas multi-tenant).

### 🧭 Quando Consultar (Gatilhos)
*   Sempre que precisarmos configurar pipelines de CI/CD para serviços em nuvem ou AWS Lambda.
*   Ao arquitetar sistemas multi-tenant para hotéis no SaaS do ZEHLA.
*   Ao desenhar políticas de testes unitários ou refatorar componentes baseados em React/Node/Java.

---

## 5. [KIMI] KIMI 3k - Kimi
> **Codinome:** *Agente KIMI Zaos-Shield (Clean Architecture & Segurança)*
> **Notebook ID:** `b66d8c91-1ce1-4ba1-a693-f43394814f50`

### 🎯 Perfil e Escopo Principal
O guardião da conformidade, segurança estrita e arquitetura limpa (*Clean Architecture*) do ecossistema ZEHLA SmartHotel. Contém as diretrizes mais rigorosas do projeto para escala de alta segurança.

### 🛠️ Tecnologias e Conceitos Domínio
*   **Arquitetura Limpa:** Clean Architecture de alta fidelidade aplicada a microsserviços.
*   **Segurança & Compliance:** Núcleo cognitivo `Zaos-Shield` e conformidade rigorosa com a LGPD (Lei Geral de Proteção de Dados).
*   **Fila & Processamento Assíncrono:** Uso do BullMQ.
*   **Algoritmos de Leads:** Thompson Sampling (lead scoring dinâmico para escala comercial).
*   **Infraestrutura:** Docker multi-stage para imagens otimizadas e seguras.
*   **Pipelines de Segurança:** Zero-Trust CI barrier (análise de vulnerabilidades em tempo de build) e isolamento multi-tenant rígido no banco de dados.
*   **Mensageria Inteligente:** Automação de marketing usando disparos com atraso Gaussiano (evitando bloqueios e simulando comportamento humano natural).

### 🧭 Quando Consultar (Gatilhos)
*   Sempre que implementarmos novas regras de banco de dados que mexam em dados de hóspedes/LGPD.
*   Ao definir regras de segurança Zero-Trust ou novas rotas que exijam blindagem do `Zaos-Shield`.
*   Para implementações de filas de background (BullMQ) ou algoritmos matemáticos como Thompson Sampling.
*   Ao construir e publicar contêineres Docker produtivos.

---

*Estudo e catálogo de referência consolidados em 15 de Junho de 2026.*
