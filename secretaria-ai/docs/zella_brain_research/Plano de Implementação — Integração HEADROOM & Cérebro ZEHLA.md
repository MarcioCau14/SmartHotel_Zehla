# Plano de Implementação — Integração HEADROOM & Cérebro ZEHLA

Este plano descreve as alterações necessárias para integrar o **HEADROOM** (camada de otimização de contexto e cache de tokens) ao ecossistema **ZEHLA**, permitindo que as chamadas em nuvem (via OpenRouter) sejam otimizadas e que o conhecimento acumulado no repositório (specs e guias) seja sincronizado ativamente com a memória do sistema.

## User Review Required

> [!IMPORTANT]
> **Roteamento Transparente do OpenRouter:** 
> Para que o Headroom otimize as requisições em nuvem do OpenRouter, configuraremos o container do Headroom com a variável `OPENAI_BASE_URL=https://openrouter.ai/api/v1`. Dessa forma, o Headroom interceptará o tráfego do protocolo OpenAI de forma transparente localmente e encaminhará os dados otimizados para o OpenRouter na nuvem.
>
> Não há alterações de regras de negócio em intents sensíveis (como transações financeiras), preservando a segurança sistêmica garantida pelo **Guardian Agent**.

## Proposed Changes

### 🐳 Infraestrutura Docker

Adição declarativa do serviço `headroom` no arquivo do Docker Compose do projeto, garantindo que toda a infraestrutura suba em harmonia.

#### [MODIFY] [docker-compose.yml](file:///Users/marciocau/zehla-backend/docker-compose.yml)
* Adicionar o serviço `headroom` com suporte a volumes persistentes (`headroom_data`) e redirecionamento de URL base da OpenAI para o OpenRouter.
* Declarar o volume nomeado `headroom_data`.

---

### ⚙️ Configurações & Variáveis de Ambiente

Habilitação e parametrização do proxy do Headroom no backend.

#### [MODIFY] [.env.example](file:///Users/marciocau/zehla-backend/.env.example)
#### [MODIFY] [.env](file:///Users/marciocau/zehla-backend/.env)
* Adicionar as variáveis:
  ```env
  # HEADROOM Otimizador de Contexto
  HEADROOM_PROXY_ENABLED="true"
  HEADROOM_PROXY_URL="http://localhost:8787"
  ```

---

### 🧠 Camada de Inteligência (Roteamento de IA)

Roteamento inteligente do tráfego do OpenRouter através do proxy local do Headroom.

#### [MODIFY] [llm-router.ts](file:///Users/marciocau/zehla-backend/src/lib/ai/llm-router.ts)
* Alterar o `OPENROUTER_URL` para apontar dinamicamente para o proxy local do Headroom (com sufixo `/v1`) quando `HEADROOM_PROXY_ENABLED` for verdadeiro.
* Garantir compatibilidade total com o cabeçalho de autorização.

---

### 🔄 Ingestão de Conhecimento (Sincronização do Cérebro ZEHLA)

Criação de um script para indexar as especificações do repositório no banco de memórias do Campo Akáshico, permitindo que a IA acesse o entendimento estruturado.

#### [NEW] [sync-brain-to-akashico.ts](file:///Users/marciocau/zehla-backend/scripts/sync-brain-to-akashico.ts)
* Script TypeScript que lê arquivos markdown chave (ex. `SPEC_COMERCIAL.md`, `SPEC_OPERACIONAL.md`, `SPEC_MARKETING.md`).
* Segmenta o conteúdo por seções temáticas e o ingere na base vetorial do Campo Akáshico via `akashicBridge.ingestEvent()`.

---

## Verification Plan

### Automated Tests
* Rodar a suíte de testes de integração e unitários do backend para garantir que o fluxo de qualificação de leads, checkouts e lógica de IA local/nuvem continuam operando normalmente:
  ```bash
  npm test
  ```
  *(ou `pnpm test` conforme o gerenciador de pacotes do projeto).*

### Manual Verification
1. **Subir a Infraestrutura:** Executar `docker compose up -d` para inicializar a nova pilha (incluindo o container `headroom`).
2. **Sincronizar Conhecimento:** Executar o script de sincronização e validar se as specs foram ingeridas corretamente:
   ```bash
   npx tsx scripts/sync-brain-to-akashico.ts
   ```
3. **Teste de Tráfego:** Enviar uma consulta de teste ao `llmRouter` e inspecionar os logs do Headroom para comprovar que a requisição passou pelo proxy e foi comprimida/cacheada com sucesso.
