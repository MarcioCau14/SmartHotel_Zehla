# **ZEHLA DATA ARCHITECTURE — CAMADA DE REFORÇO E OTIMIZAÇÃO**

## **1\. 🔐 RLS MULTI-TENANT — HARDENING (PONTO CRÍTICO)**

Você definiu RLS corretamente, mas o risco aqui é **vazamento lateral entre tenants**.

### **Evolução recomendada: “Context Injection \+ Policy Binding”**

#### **1.1 Padronização obrigatória**

Toda query deve implicitamente carregar:

SET app.current\_property\_id \= 'HOTEL\_001';  
---

#### **1.2 Policy (template seguro)**

CREATE POLICY tenant\_isolation\_policy  
ON stays  
USING (property\_id \= current\_setting('app.current\_property\_id')::uuid);  
---

#### **1.3 Insight crítico**

⚠️ Nunca confiar no backend para filtrar tenant  
 → o banco deve ser a única fonte de verdade de isolamento

---

# **2\. ⚡ REDIS — EVOLUÇÃO DO STATE MIRROR**

Você já definiu bem. Agora vamos torná-lo **inteligente e auto-curativo**.

---

## **2.1 Dirty Flag Strategy (consistência eventual)**

Adicione ao seu modelo:

{  
 "status": "occupied",  
 "guest\_id": "G123",  
 "stay\_id": "S456",  
 "last\_update": "timestamp",  
 "dirty": false  
}

### **Funcionamento:**

* `dirty = true` → estado potencialmente desatualizado  
* ZEHLA decide:  
  * confiar (baixo risco)  
  * ou validar no PostgreSQL

---

## **2.2 Write-Through Cache (OBRIGATÓRIO)**

Toda escrita crítica:

API → PostgreSQL → Redis (sincronizado)

Nunca:

API → Redis → PostgreSQL (risco de inconsistência)  
---

## **2.3 Self-Healing Sync Worker**

Processo assíncrono:

1\. Varre Redis  
2\. Detecta inconsistências  
3\. Corrige via PostgreSQL

Execução:

* a cada 30–60 segundos  
* custo baixo, evita drift

---

# **3\. 🧠 JSONB — CONTROLE DE CRESCIMENTO (PONTO INVISÍVEL)**

Você está usando JSONB (correto), mas isso vira gargalo se crescer sem controle.

---

## **3.1 Schema disciplinado (anti-caos)**

Definir contrato para `preferences_snapshot`:

{  
 "room": {  
   "floor": "high",  
   "noise": "low"  
 },  
 "environment": {  
   "temperature": 22  
 },  
 "service": {  
   "housekeeping": "afternoon"  
 }  
}  
---

## **3.2 Limite técnico recomendado**

* Máximo: **2–4 KB por snapshot**  
* Acima disso:  
   → fragmentar em colunas estruturadas

---

## **3.3 Indexação seletiva**

CREATE INDEX idx\_stay\_preferences\_temperature  
ON stays ((preferences\_snapshot-\>'environment'-\>\>'temperature'));

👉 evita full scan em queries inteligentes

---

# **4\. 🧬 VECTOR \+ RELATIONAL (HÍBRIDO OTIMIZADO)**

Você já usa pgvector — agora vem o ganho real.

---

## **4.1 Separação semântica**

Não misturar:

* PostgreSQL → dados estruturados  
* pgvector → contexto comportamental

---

## **4.2 Estratégia de embeddings**

Gerar embedding baseado em:

guest\_profile \+ stay\_history \+ preferences\_snapshot  
---

## **4.3 Atualização incremental (evita custo)**

NÃO recalcular tudo.

Atualizar apenas quando:

* nova estadia  
* mudança relevante de comportamento

---

## **4.4 Hybrid Query Pattern**

SELECT \*  
FROM guests  
ORDER BY embedding \<-\> query\_embedding  
LIMIT 5;

* 

filtro:

WHERE property\_id \= X  
---

# **5\. ⏱️ TTL INTELIGENTE (EVOLUÇÃO DO SEU MODELO)**

Você já definiu TTL — vamos torná-lo adaptativo.

---

## **5.1 TTL Dinâmico por comportamento**

Exemplo:

| Tipo de Intent | TTL |
| ----- | ----- |
| Wi-Fi | 24h |
| Restaurante | 6h |
| Emergência | 0 |

---

## **5.2 Cache Promotion Strategy**

Se uma intent:

* for usada \> 100x/dia  
   → vira resposta fixa (sem LLM)

---

## **5.3 Cache com versionamento**

{  
 "intent": "wifi\_info",  
 "version": "v2",  
 "response": "...",  
 "updated\_at": "timestamp"  
}

👉 evita inconsistência após mudança de informação

---

# **6\. 🔁 EVENTOS \+ BANCO (SINCRONIZAÇÃO PERFEITA)**

Você separou bem — agora precisa garantir consistência absoluta.

---

## **6.1 Transactional Outbox Pattern (ESSENCIAL)**

Problema:

* DB grava  
* evento falha → inconsistência

---

### **Solução:**

TABLE outbox\_events

Fluxo:

1\. Salva STAY  
2\. Salva EVENTO na mesma transação  
3\. Worker publica no Pub/Sub  
---

## **6.2 Garantia**

* Nunca perde evento  
* Nunca gera estado inconsistente

---

# **7\. 🧩 EDGE \+ REDIS (INTEGRAÇÃO AVANÇADA)**

---

## **7.1 Redis como ponte Edge**

Edge devices podem consumir direto:

HOTEL:{property\_id}:ROOM:{room\_id}  
---

## **7.2 Shadow Sync (Edge Offline)**

Se cair conexão:

Edge → buffer local  
→ sincroniza depois  
---

## **7.3 Latência real**

* Cloud: \~100–300ms  
* Edge: \~5–20ms

👉 diferença brutal para experiência do hóspede

---

# **8\. 📊 OBSERVABILIDADE (FALTAVA NO SEU MODELO)**

Sem isso, você escala cego.

---

## **8.1 Tabela de métricas**

{  
 "metric": "intent\_latency",  
 "value": 120,  
 "timestamp": "timestamp"  
}  
---

## **8.2 KPIs obrigatórios**

* Latência por intent  
* % cache hit  
* % fallback PostgreSQL  
* falhas de evento  
* tempo de resposta IoT

---

# **9\. 🧠 CAMADA ANTI-CUSTO (O DIFERENCIAL)**

Isso aqui é o que separa um projeto caro de um escalável.

---

## **9.1 “LLM Bypass Layer”**

Antes de chamar IA:

1\. Cache?  
2\. Redis?  
3\. Template?  
4\. Só então LLM  
---

## **9.2 Decision Tree simplificada**

if intent in cache:  
   return cached  
elif rule\_based:  
   execute  
else:  
   call LLM  
---

# **🚀 O QUE VOCÊ CONSTRUIU (ANÁLISE DIRETA)**

Com essas diretrizes \+ o que você já tem:

Você está criando um sistema com características de:

* PMS próprio (nível enterprise)  
* Middleware de hospitalidade  
* Plataforma de IA operacional  
* Infra distribuída edge-ready 

