# **FASE 1 — RUNTIME OPERACIONAL (O SISTEMA VIVO)**

👉 Objetivo: ter o SmartHotel **rodando de ponta a ponta**, mesmo que simples.

---

## **1.1 API \+ ORCHESTRATOR (ZEHLA CORE)**

### **🔧 Entregável**

API funcional com 4 endpoints críticos:

POST /checkin  
POST /checkout  
POST /guest/message  
POST /task/create  
---

## **🔁 Fluxo real (obrigatório implementar)**

Request → API → Orchestrator → Decision Engine → Ação  
---

## **🧠 Estrutura mínima obrigatória**

### **Orchestrator (núcleo)**

async function orchestrate(input) {  
 const intent \= detectIntent(input);

 const decision \= decisionEngine(intent);

 if (decision \=== "cache") return getCache(intent);  
 if (decision \=== "rule") return executeRule(intent);  
 if (decision \=== "llm") return callLLM(intent);  
}  
---

## **⚠️ Critério de conclusão**

* Conseguir:  
  * fazer check-in via API  
  * consultar estado do quarto  
  * responder uma mensagem simples (ex: Wi-Fi)

👉 **Sem isso, não avance**

---

# **⚡ 1.2 EVENT BUS FUNCIONANDO (SEM ISSO TUDO QUEBRA)**

---

## **🔧 Entregável**

* BullMQ rodando  
* Worker ativo  
* Retry funcionando  
* DLQ configurado

---

## **🔁 Fluxo obrigatório**

API → PostgreSQL (outbox) → Queue → Worker → Ação  
---

## **🔥 Teste crítico**

Simular:

* desligar worker  
* enviar check-in  
* religar worker

👉 evento precisa ser processado depois

---

## **⚠️ Critério de conclusão**

* Nenhum evento pode ser perdido  
* Retry funcionando  
* DLQ recebendo falhas

---

# **⏱️ 1.3 SCHEDULER (AUTOMAÇÃO REAL)**

---

## **🔧 Entregável**

* Jobs recorrentes rodando

Exemplos:

\- check-out automático  
\- limpeza programada  
\- follow-up pós check-in  
---

## **🧠 Implementação**

BullMQ:

queue.add("checkout\_job", data, {  
 repeat: { cron: "0 12 \* \* \*" }  
});  
---

## **⚠️ Critério de conclusão**

* sistema executa tarefas sozinho  
* sem intervenção manual

---

# **📊 FASE 2 — OBSERVABILIDADE (VISÃO TOTAL DO SISTEMA)**

👉 Aqui você deixa de operar “no escuro”

---

## **2.1 CORRELATION ID (OBRIGATÓRIO)**

---

### **🔧 Implementação**

Cada request:

req.correlation\_id \= uuid();

Propagar para:

* Redis  
* DB  
* Event Bus  
* Edge

---

## **2.2 LOGS ESTRUTURADOS**

---

### **🔧 Padrão obrigatório**

{  
 "level": "info",  
 "event": "checkin\_completed",  
 "correlation\_id": "...",  
 "property\_id": "...",  
 "latency\_ms": 120  
}  
---

## **2.3 MÉTRICAS**

---

### **Implementar coleta de:**

* tempo de resposta  
* cache hit rate  
* falhas de eventos  
* uso de LLM

---

## **2.4 ALERTAS**

---

### **Configurar:**

* Redis down  
* fila parada  
* erro crítico API

---

## **⚠️ Critério de conclusão**

👉 você consegue responder:

* “o que aconteceu?”  
* “onde falhou?”  
* “quanto tempo levou?”

---

# **🧠 FASE 3 — ZEHLA FUNCIONANDO (INTELIGÊNCIA REAL)**

---

## **3.1 ENGINE DE INTENT**

---

### **🔧 Implementação em 2 camadas**

**Camada 1 (rápida):**

* regex / regras  
* classificação leve

**Camada 2 (fallback):**

* LLM

---

## **3.2 PROMPT SYSTEM**

---

### **Estrutura obrigatória**

SYSTEM PROMPT (fixo)  
\+  
AGENT TEMPLATE  
\+  
CONTEXTO COMPRIMIDO  
---

## **3.3 MEMORY PIPELINE (ATIVO)**

---

### **🔁 Fluxo real**

Interação → Redis (L1)  
→ Atualiza Summary (L2)  
→ Atualiza Vector (L3)  
---

## **🔧 Automatizar:**

* resumo a cada 5 interações  
* limpeza de memória

---

## **3.4 CRAG REAL**

---

### **Implementação prática**

if (confidence \< 0.7) {  
 requery();  
}  
---

## **⚠️ Critério de conclusão**

* ZEHLA responde com contexto  
* não repete perguntas  
* reduz chamadas ao LLM

---

# **⚙️ FASE 4 — EDGE LAYER (EXECUÇÃO FÍSICA)**

---

## **4.1 EDGE GATEWAY**

---

### **🔧 Entregável**

* serviço local rodando  
* MQTT conectado  
* reconexão automática

---

## **4.2 BUFFER OFFLINE**

---

Sem internet:  
→ comandos ficam em fila local  
→ sincronizam depois  
---

## **4.3 DEVICE ABSTRACTION**

---

Padronizar:

lock.unlock()  
ac.setTemp(22)  
light.on()  
---

## **⚠️ Critério de conclusão**

* porta abre sem internet  
* ações físicas funcionam localmente

---

# **🔐 FASE 5 — SEGURANÇA**

---

## **5.1 AUTH MULTI-TENANT**

JWT com:

{  
 "property\_id": "X",  
 "role": "admin"  
}  
---

## **5.2 RATE LIMIT**

* proteger API  
* evitar spam WhatsApp

---

## **5.3 SECRETS**

* usar vault  
* nunca `.env` em produção

---

# **💰 FASE 6 — FINOPS**

---

## **6.1 TRACKING**

Registrar:

\- tokens por tenant  
\- chamadas LLM  
\- custo estimado  
---

## **6.2 LIMITES**

Se exceder:  
→ fallback automático  
---

# **🧪 FASE 7 — SIMULADOR**

---

## **🔧 Criar ambiente que simula:**

* 100 hóspedes  
* mensagens simultâneas  
* eventos IoT

---

## **⚠️ Testar:**

* race condition  
* falha de Redis  
* atraso de eventos

---

# **🔁 FASE 8 — GOVERNANÇA DE EVENTOS**

---

## **8.1 VERSIONAMENTO**

{  
 "type": "CHECKIN",  
 "version": 2  
}  
---

## **8.2 COMPATIBILIDADE**

Nunca quebrar consumers antigos

---

# **🧠 FASE 9 — UX OPERACIONAL**

---

## **9.1 DASHBOARD STAFF**

* quartos  
* tarefas  
* status

---

## **9.2 PAINEL ZEHLA**

* decisões da IA  
* logs  
* override manual

---

# **🎯 PLANO DE EXECUÇÃO (ORDEM CORRETA)**

---

## **🔴 SEMANA 1 (OBRIGATÓRIO)**

1. API \+ Orchestrator  
2. Event Bus funcionando  
3. Check-in end-to-end

---

## **🔴 SEMANA 2**

4. Observabilidade completa  
5. Scheduler ativo

---

## **🔴 SEMANA 3**

6. Engine de intent \+ memória  
7. Cache funcionando

---

## **🟡 SEMANA 4**

8. Edge gateway  
9. Segurança

---

## **🔵 SEMANA 5+**

10. FinOps  
11. Simulador  
12. Dashboard

---

# **🧠 VEREDITO FINAL**

Você já construiu o cérebro.

Agora está construindo:

👉 **sistema nervoso (runtime)**  
 👉 **sentidos (observabilidade)**  
 👉 **ação (edge)**  
 👉 **consciência (ZEHLA)**

