# SPEC — Governança de Produção e Go-Live (Zehla SmartHotel)

> **Propósito:** Especificar a governança crítica de produção para o Go-Live do ZEHLA SmartHotel. Define a integridade transacional de pagamentos (Mercado Pago), a máquina de estados (FSM) de mensageria (Evolution API), e as salvaguardas financeiras e de rede (FinOps Circuit Breaker).
>
> **Arquitetura:** DDD Estrito + Ports & Adapters + Zero-Trust Mesh de Agentes
>
> **Linguagem:** Natural (Português) — ubíqua, não técnica

---

## 1. Máquina de Estados Finitos (FSM) do WhatsApp

O ciclo de vida da instância de mensageria (Evolution API) não pode ser exposto ou tratado como um simples booleano. Ele deve ser governado por uma Máquina de Estados Finitos (FSM) rica no Domínio Operacional.

### 1.1 Entidade de Domínio: `WhatsAppSession`
Representa o estado rico da instância conectada a uma propriedade (tenant).

**Identidade:** `sessionId: UUIDv7`
**Associação:** `propertyId: UUIDv7` (Unique compound key / RLS)

**Atributos:**
- `status` — enum `WhatsAppState` (ver abaixo)
- `qrCode` — string (Base64 do QR Code para leitura, ou null se não aplicável)
- `expiresAt` — timestamp (validade do QR Code gerado, nulo se conectado/desconectado)
- `error` — string (detalhes de falhas do terminal, nulo em regimes normais)
- `updatedAt` — timestamp da última mutação de estado

### 1.2 Máquina de Estados (`WhatsAppState`)
Os estados estritos permitidos na FSM são:

1.  **`DISCONNECTED`**: A sessão está criada no sistema, mas não há conexão ativa de rede nem QR Code gerado.
2.  **`AWAITING_QR`**: A Evolution API gerou o QR Code para pareamento. A sessão aguarda leitura. Possui um tempo limite (TTL) de expiração de 40 segundos.
3.  **`CONNECTED`**: Dispositivo pareado via WhatsApp Web. Fluxo de mensagens de entrada e saída ativo.
4.  **`FAILED`**: Erro de inicialização, chip banido/bloqueado, timeout do QR Code sem leitura, ou queda abrupta do contêiner da Evolution API.

#### Transições Permitidas (Regras de Transição):
```
DISCONNECTED ──(inicializar)──→ AWAITING_QR
AWAITING_QR ──(ler_qr_com_sucesso)──→ CONNECTED
AWAITING_QR ──(timeout_leitura)──→ FAILED
CONNECTED ──(webhook_desconexao)──→ DISCONNECTED
CONNECTED ──(queda_rede/desconexao)──→ FAILED
FAILED ──(forçar_reinicializacao)──→ AWAITING_QR
```

### 1.3 Contrato de API (`GET /api/zcc/evolution/instances`)
O endpoint HTTP deve ser anêmico e mapear o estado da FSM:
- **Autenticação:** JWT obrigatório. O `propertyId` é extraído estritamente do token de sessão.
- **Formato do Output:**
```json
{
  "status": "DISCONNECTED" | "AWAITING_QR" | "CONNECTED" | "FAILED",
  "qrCode": "string_or_null",
  "expiresAt": "ISOString_or_null",
  "error": "string_or_null"
}
```

---

## 2. Barreira de Idempotência (Mercado Pago Webhook)

Para mitigar a repetição de requisições causadas por retries automáticos de rede e instabilidades do gateway do Mercado Pago, implementamos uma barreira rígida de idempotência antes da execução da lógica financeira de compensação.

### 2.1 Fluxo do Webhook (`/api/webhooks/mercadopago`)
Toda notificação de pagamento enviada pelo Mercado Pago deve cruzar a barreira de idempotência em nível de infraestrutura, utilizando a mônada `Result`.

```
Notificação MP Recebida
          │
          ▼
Validação de Assinatura HMAC (x-signature) ──[Inválida]──→ Abortar (401 Unauthorized)
          │
          ▼ [Válida]
Consulta IdempotencyBarrier (Redis SETNX)
          │
          ├── [ID Existente] ──→ Retornar Result.fail("IDEMPOTENCY_VIOLATION") (HTTP 200 OK)
          │
          └── [ID Novo] ──→ Registrar ID (TTL 24h)
                      │
                      ▼
            ConfirmarPagamentoUseCase
                      │
                      ├── [Sucesso] ──→ Retornar HTTP 200 OK
                      │
                      └── [Falha de Banco/Lógica] ──→ Logar e Retornar HTTP 200 OK (Evita retry-storm)
```

### 2.2 Regras de Idempotência
1.  **Chave de Idempotência:** `mp_evt_{notificacao_id}` ou hash SHA256 do corpo da requisição caso o ID não esteja disponível.
2.  **Tecnologia:** Armazenamento distribuído em Redis utilizando comando `SETNX` (Set if Not Exists) atômico, com expiração automática (TTL) de 24 horas.
3.  **Compensação Segura:** Se o webhook falhar em etapas internas (ex: indisponibilidade do banco de dados), a requisição é interceptada, a barreira não é desfeita de forma a permitir double charge, e retorna-se `200 OK` para mitigar o loop de retentativas do Mercado Pago. A equipe de Overwatch é notificada via telemetria para conciliação humana manual.

---

## 3. Circuit Breaker Financeiro (FinOps)

Para evitar vazamento financeiro e estouro de faturamento causado por consumo excessivo de tokens de LLM (GPT/Gemini/Claude), o Zelador Autônomo atua como um supervisor financeiro rígido (FinOps).

### 3.1 O Gatilho Matemático
Definimos que cada propriedade (tenant) possui um orçamento diário $D$ (em reais). O `BudgetTracker` soma continuamente o custo de cada requisição:

$$\text{CustoDiario} = \sum_{\text{hoje}} \text{agentLog.cost}$$

O `BudgetCircuitBreaker` monitora o threshold:

$$\text{CustoDiario} \ge 0.95 \times D$$

Se o threshold de $95\%$ for violado, o Circuit Breaker transita para o estado `OPEN` (Disparado) imediatamente.

### 3.2 O Fluxo de Hard Block (Tier 1 Fallback)
1.  **Detecção Periódica:** O Zelador Autônomo monitora a soma de custos através de um cron job no BullMQ rodando a cada 15 minutos.
2.  **Corte Hard Block:** Ao violar os 95%, o `BudgetCircuitBreaker` atualiza o cadastro da propriedade no banco:
    - `planTier` é alterado temporariamente para `Tier 1 (Zero-Cost)`.
3.  **Redirecionamento estrito:** A partir deste carimbo, qualquer mensagem de hóspede que chegue no webhook de mensageria da propriedade é desviada **imediatamente** para o Rules Engine local estático.
    - É estritamente **proibida** qualquer chamada para modelos de linguagem (LLMs).
    - O Rules Engine responde com scripts prontos (ex: "No momento, nosso canal automático está em manutenção/indisponível. Por favor, fale com a recepção ligando para X").
4.  **Notificação e Reset:** O administrador recebe um e-mail/alerta crítico de faturamento. A FSM do Circuit Breaker é redefinida para `CLOSED` automaticamente às 00:00 UTC, restabelecendo a cota diária do plano do cliente.

---

## 4. Invariantes do Go-Live

| # | Invariante | Validação |
|---|---|---|
| 1 | Sessão com QR expirado vai para `FAILED` | `WhatsAppSession.verificarExpiracao()` |
| 2 | Transição para `CONNECTED` exige pareamento | `WhatsAppSession.confirmarConexao()` |
| 3 | Assinatura HMAC é requerida no webhook MP | Rota do Webhook |
| 4 | Duplicações em menos de 24h são bloqueadas | `IdempotencyBarrier.acquire()` |
| 5 | Custo de IA $\ge 95\%$ do budget diário corta LLM | `BudgetCircuitBreaker.verificar()` |
| 6 | Reset diário do Circuit Breaker financeiro às 00:00 UTC | Cron do Zelador Autônomo |
