# Plano de Implementação — Integração do Campo Akáshico no ZEHLA Brain

Este plano detalha o design, as alterações de código e as verificações para incorporar o **Campo Akáshico** (as 4 camadas de memória profunda do SmartHotel) no cérebro Python do ZEHLA (`humans-zehla/server.py`).

Com essa integração, a cognição do cérebro será aprimorada ao injetar insights semânticos, anomalias e preferências locais e globais em tempo real no contexto da LLM, além de registrar cada interação viva (episódica) para alimentar o motor de cristalização assíncrono.

---

## Proposta de Alterações

### 1. Dependências do Python
Adicionaremos as bibliotecas necessárias para o funcionamento do Campo Akáshico no arquivo `requirements.txt`.
*   **requirements.txt**: `redis`, `chromadb`, `networkx`, `numpy`, `scipy`

### 2. Implantação do Core do Campo Akáshico
Copiaremos o arquivo core original dos Downloads para a pasta do cérebro.
*   **[NEW]** [campo_akashico_core.py](file:///Users/marciocau/Projetos/zehla-backend/humans-zehla/campo_akashico_core.py): Cópia direta e sem modificações do arquivo `02_campo_akashico_core.py` (fornecido pelo usuário).

### 3. Integração com o Servidor do Cérebro (`server.py`)
Modificaremos o arquivo `humans-zehla/server.py` para as seguintes integrações:

*   **Inicialização do Campo Akáshico:**
    *   No startup (lifespan ou inicialização do `ZehlaBrain`), chamaremos `initialize_akashico` passando a `REDIS_URL` do ambiente, o caminho do banco SQLite e do ChromaDB.
    *   Iniciaremos o loop de cristalização em segundo plano.

*   **Registro das Rotas da API:**
    *   No arquivo do FastAPI, incluiremos as rotas criadas por `create_akashic_routes(akashico)` mapeando sob o prefixo `/api/v2/akashic`.

*   **Injeção de Contexto Akashico no Chat:**
    *   No método `ZehlaBrain.chat(...)`, antes de montar o system prompt da LLM, faremos uma busca semântica híbrida com `akashico.query_context(...)` com base na mensagem do usuário.
    *   Os insights e preferências retornados com alta confiança serão formatados e injetados de forma limpa no System Prompt do LLM, expandindo instantaneamente a cognição do cérebro.

*   **Ingestão de Episódios em Tempo Real (Whisper Stream):**
    *   Ao finalizar uma chamada de chat (após a geração da resposta do LLM ou conclusão de tools), salvaremos os dados estruturados da interação no Campo Akáshico usando `akashico.ingest_event(...)`.
    *   Isso garantirá a alimentação em tempo real das camadas Sutil (Redis Stream), Episódica (SQLite) e Fluida (Redis Hash).

---

## Plano de Verificação

### Testes Automatizados e Diagnóstico
1.  **Instalação de Dependências:**
    Roda `pip install` das dependências especificadas.
2.  **Execução do Standalone Demo:**
    Roda o script `campo_akashico_core.py` de forma isolada para garantir que o SQLite local e o ChromaDB local funcionem sem erro.
    ```bash
    python3 humans-zehla/campo_akashico_core.py
    ```
3.  **Smoke Test da API FastAPI:**
    Inicia o servidor python local (`python3 humans-zehla/server.py`) e faz chamadas de teste aos endpoints:
    *   `GET http://localhost:8000/health` (verifica status geral e inicialização do Campo)
    *   `GET http://localhost:8000/api/v2/akashic/health` (verifica rotas do Campo)
    *   `POST http://localhost:8000/chat` (verifica que o fluxo de injeção e ingestão está íntegro)

### Manual Verification
1.  Verificar no console de logs que o loop de cristalização está executando em background sem estourar concorrência.
2.  Verificar que o arquivo de banco de dados `akashic_episodica.db` é criado no caminho correto.
