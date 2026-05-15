## **name: skill-bot-build description: \> Define os protocolos de orquestração visual e execução de grafos para o "ZEHLA Flow Builder". Instruções para o Google Antigravity sobre como traduzir nós visuais (@xyflow/react) em trajetórias de estados SDE e tarefas assíncronas no ZAOS. Cobre a injeção de DNA (Voice Profile), orquestração de enxame via JAX Pallas em TPUs, e a ponte estatística para automação de WhatsApp via Chrome Extension (ZEHLA Blast).**

# **ZEHLA Flow Builder Skill (ZAOS Visual Orchestration)**

O **ZEHLA Flow Builder** é a interface de design de sistemas dinâmicos para a plataforma SmartHotel. Esta Skill regula como o cérebro ZEHLA converte fluxos visuais em ações físicas e cognitivas, operando sobre o **Double Cycle Cognitive Model** \[3, 3\]. Diferente de construtores de bots legados, esta Skill exige que cada nó visual seja processado como uma transição de estado em 8 dimensões, respeitando o isolamento criptográfico via RLS e a compressão TurboQuant V3 para execução em borda .

Este documento rege a implementação e o comportamento do Agente de Desenvolvimento dentro do Google Antigravity ao manipular o motor de fluxos.

---

## **Layer 1 — Memory: A Constituição do Fluxo**

A Camada de Memória define as regras de arquitetura inquebráveis e o mapa de persistência do Flow Builder.

* **Arquitetura Poliglota (Dogma 1):** O Google Antigravity deve garantir que o Flow Builder separe o **Fast Loop** (I/O e Webhooks em Node.js) do **Slow Loop** (Raciocínio via CrewAI/Python) \[4, 4\].  
* **Convenções de Naming & Isolamento:** Todo nó gerado deve incluir obrigatoriamente o atributo property\_id para filtragem via Row-Level Security (RLS) no Supabase.  
* **Source of Truth:** O estado persistente dos fluxos reside no PostgreSQL, enquanto o **State Mirror** para execução de latência zero é mantido no Redis .  
* **ZDR (Burn-After-Use):** Dados sensíveis manipulados por nós de "Auditoria Visual" devem ser limpos da VRAM via gc.collect() imediatamente após a inferência .

---

## **Layer 2 — Skills: O Conhecimento dos Nós**

Define a lógica de processamento dos **Smart Nodes** e a injeção de contexto cognitivo.

* **Smart Nodes Mapping:**  
  * **NegotiationNode:** Aciona o Reservation Guardian para avaliar chaves de desconto e disponibilidade .  
  * **GPTNode:** Executa o pipeline de **Corrective RAG (CRAG)**, buscando embeddings no Guest Graph L3 via pgvector.  
  * **MessageNode:** Injeta dinamicamente o **Voice Profile** (DNA da pousada) com base no Indice de Formalidade detectado.  
* **Injeção de DNA:** Cada nó de saída deve consultar a lead\_memory e o perfil psicológico do hóspede (Curioso, Analítico, etc.) antes da geração da resposta.  
* **Recuperação Vetorial:** A busca por documentos RAG deve utilizar cosine similarity no PGVector, limitando a 3-5 documentos para evitar sobrecarga do prompt.

---

## **Layer 3 — Hooks: As Salvaguardas (Guardrails)**

Comandos determinísticos que garantem a integridade física e operacional do sistema.

* **PreToolUse (RLS Filter):** Antes de qualquer nó de banco de dados, o hook deve injetar SET app.current\_property\_id \= 'UUID'.  
* **Anti-Ban Hook (ZEHLA Blast):** Aplica automaticamente o **Throttling** com **Jitter** aleatório e pausas programadas para mimetizar o comportamento humano em fluxos de WhatsApp .  
* **Handoff Trigger:** Interrompe a execução automática e dispara notificação no ZCC quando:  
  1. O hóspede atinge o estado CLOSE\_READY.  
  2. O sistema detecta sentimento de "Insatisfação Grave" via BERTimbau.  
  3. A IA falha na resolução após 3 tentativas consecutivas.  
* **Stop Command:** Bloqueio imediato de qualquer comando de hardware (IoT) que não venha da Zona Operacional (Node.js).

---

## **Layer 4 — Subagents: A Delegação do Enxame**

Coordenação do enxame de agentes especialistas para tarefas de alta complexidade.

* **ZEHLA Manager (Orchestrator):** Subagente responsável por analisar a intenção e rotear para o worker Python correto no cluster de TPUs.  
* **Guardian AI:** Especialista em auditoria visual de documentos e conciliação financeira, operando sob regras de conformidade estritas.  
* **Ops AI:** Gerencia nós de logística, como agendamento de limpeza e tickets de manutenção .  
* **Physics Engine (SDE Worker):** Subagente especializado em compilar e executar o motor de SDEs via JAX Pallas para rastrear o estado do hóspede em 8 dimensões .  
  * Equação de Estado: $dX/dt \= F(X, u, t) \+ g \\cdot W(t)$.

---

## **Layer 5 — Plugins: A Distribuição e Hardware**

Define como as capacidades são empacotadas para diferentes Tiers de hardware.

* **ZEHLA Blast Plugin:** Bundle contendo a Extensão Chrome Manifest V3 e os scripts de injeção de DOM para automação direta no WhatsApp Web .  
* **Edge AI Plugin (Tier 2):** Implementa a compressão **TurboQuant V3** (Asymmetric K4/V2) para permitir que modelos Llama 3.1 rodem localmente em RTX 3090 com contexto de 72K .  
* **Antigravity Deployment:** Automação de CI/CD via GitHub Actions para isolamento de execução em microVMs AWS Firecracker .  
* **GAALOP Optimizer:** Plugin de pré-compilação que reduz operações de álgebra geométrica a expressões escalares para execução eficiente em TPU v5e .

---

## **Comandos do Agente de Desenvolvimento (Google Antigravity)**

1. **Refatoração de Fluxo:** npx tsx scripts/flow/refactor-graph.ts \--tenant-id \<uuid\> para validar integridade de grafos.  
2. **SDE Physics Check:** Invocar o sde\_physics\_engine.py para simular a trajetória de carga cognitiva de um fluxo desenhado.  
3. **Audit RLS:** Verificar se todos os novos nós de banco de dados passam pelo hook de segurança obrigatório.  
4. **TPU Compilation:** pl.pallas\_call via BlockSpec para mapear tensores de 8 dimensões em VMEM .

---

*Este artefato de engenharia é de uso exclusivo do projeto SmartHotel/ZEHLA. A quebra de qualquer pilar do Protocolo de Sincronização Mestra resultará em alerta imediato de integridade sistêmica.*

