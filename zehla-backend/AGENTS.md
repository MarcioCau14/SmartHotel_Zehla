<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🧠 ZEHLA BRAIN v2.5 — O Manifesto do Cérebro Central

Este documento estabelece a arquitetura conceitual e operacional do **Cérebro do ZCC (Zehla Control Center)**. Todos os agentes de Inteligência Artificial que operam neste ecossistema devem aderir a estes princípios.

## 1. Visão Geral: O Agente Central
O Cérebro do ZCC não é apenas um script; é uma entidade cognitiva unificada que orquestra a inteligência do sistema. Ele atua como o ponto de convergência de todo o aprendizado, segurança e automação do projeto.

## 2. Princípios Fundamentais

### 🔄 Auto-Ajuste & Aprendizado Contínuo
- O sistema analisa logs de execução, feedbacks de usuários e métricas de performance em tempo real.
- Ajusta dinamicamente suas estratégias de resposta e rotas de LLM (conforme definido em [llm-router.ts](file:///Users/marciocau/zehla-backend/src/lib/ai/llm-router.ts)).

### 🛡️ Auto-Regeneração & Resiliência
- Implementa o protocolo **ZccAutoHealer**.
- Em caso de falhas em componentes críticos ou telas do dashboard, o sistema isola o erro via *Error Boundaries* e inicia procedimentos de recuperação automática sem intervenção humana.

### 🚀 Orquestração Autônoma de Swarm
- O Cérebro não executa todas as tarefas sozinho; ele delega e orquestra um enxame (Swarm) de agentes especializados.
- Gerencia a fila de tarefas via BullMQ e monitora a latência e taxa de sucesso de cada agente (visualizável no [SwarmOverview.tsx](file:///Users/marciocau/zehla-backend/src/components/zcc/SwarmOverview.tsx)).

## 3. Catálogo de Skills & Agentes do Ecossistema

O Cérebro orquestra as seguintes competências especializadas:

- **Zehla Finance Agent:** Processamento de fluxos financeiros, reconciliação Stripe e webhooks seguros.
- **Zehla Validator:** Validação de integridade de dados, transição de Mocks para Real Data e testes de endpoints.
- **Zehla Guardian:** Defesa ativa, hardening de segurança e conformidade LGPD.
- **Zehla Ecologia:** Princípios de Flow, eficiência de recursos e design sistêmico.
- **Zehla WhatsApp ML Agent (Fortress Guardrails):** Treinamento adaptativo de tom de voz via histórico de WhatsApp de clientes PRO/MAX, monitorado por camadas contra exfiltração de dados e DoS.


## 5. Arquitetura de Telas, Hierarquia & Fluxo de Trabalho (CRÍTICO)

### Divisão e Acesso de Telas
1. **Página de Vendas:** Porta de entrada pública. Converte leads (donos de pousadas) e os direciona para o **Dashboard do Cliente**.
2. **Dashboard do Cliente:** Painel exclusivo do cliente final (Dono da Pousada). É onde ele se cadastra, gerencia seu estabelecimento e utiliza as ferramentas do ZEHLA.
3. **ZCC (Zehla Central Control / Zehla Control Center):** Painel de Controle Administrativo. **ACESSO EXCLUSIVO DO ADMINISTRADOR (Marcio)**. O cliente final **NUNCA** pode ver ou ter acesso a esta tela.

### Hierarquia e Controle
* **O ZCC é o Cérebro do Sistema:** Ele controla as outras duas telas (Página de Vendas e Dashboard do Cliente) em muitas ou todas as suas funções. Tudo deve ser interligado.

### Ordem Cronológica de Desenvolvimento
1. **Página de Vendas (Landpage):** Alterações e polimento atual.
2. **Dashboard do Cliente:** Configuração e regras de negócio para a pousada.
3. **ZCC:** Por último, onde interligaremos tudo e o Cérebro operará.

*Esta regra é imutável. Qualquer sugestão de fluxo deve respeitar este isolamento e ordem.*

*Que a gravidade nunca nos puxe para baixo.*


