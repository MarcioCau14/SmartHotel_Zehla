# 01 - Infraestrutura de Deploy e Segurança de Reverse Proxy (Vercel & Nginx)

Este documento estabelece o roadmap de infraestrutura para o projeto Seu Zélla, analisando as configurações serverless da Vercel, vulnerabilidades críticas na camada de proxy reverso e diretrizes para o empacotamento standalone do Next.js.

---

## 1. Configurações Serverless na Vercel (`vercel.json`)

Atualmente, o arquivo `vercel.json` do projeto define agendamentos cron, cabeçalhos de controle de cache e restrições geográficas, mas carece de parâmetros fundamentais de execução para funções serverless.

### A. Região Hardcoded (`gru1`)
*   **Situação Atual:** A região de deploy está explicitamente configurada como `["gru1"]` (São Paulo, Brasil).
*   **Implicação:** Isso garante latências muito baixas para o público-alvo brasileiro e otimiza a velocidade de processamento de webhooks do WhatsApp recebidos do Facebook. Contudo, impede a redundância geográfica e a distribuição global automática da Vercel.
*   **Ação:** Manter a região fixa em `gru1` para cargas de processamento de IA/RAG e banco de dados localizados no Brasil, mas preparar o pipeline para expansões multi-região caso a infraestrutura de banco de dados migre para uma topologia global (ex: Supabase, Aurora Global).

### B. Limites Ausentes: Timeouts (`maxDuration`) e Memória
*   **Problema:** A configuração global ou por função de `maxDuration` e `memory` está completamente omissa.
    *   No plano Vercel Hobby, o timeout padrão de funções serverless é de **15 segundos**.
    *   No plano Vercel Pro, o padrão varia, mas o limite pode ser estendido até **900 segundos** (15 minutos).
*   **Impacto no Negócio:** Processos complexos como geração de embeddings, chamadas para LLMs de múltiplos turnos (como no fluxo dos agentes do WhatsApp), ou sincronização em lote de calendários externos (`/api/integrations/sync`) frequentemente excedem 15 segundos, resultando em erros HTTP `504 Gateway Timeout` silenciosos.
*   **Roadmap de Ajuste:**
    1.  Adicionar uma chave `functions` no `vercel.json` especificando limites sob medida para rotas críticas de processamento pesado de IA:
        ```json
        "functions": {
          "src/app/api/webhook-whatsapp/route.ts": {
            "maxDuration": 60,
            "memory": 1024
          },
          "src/app/api/intelligence/**/*.ts": {
            "maxDuration": 90,
            "memory": 1024
          }
        }
        ```
    2.  Reduzir o processamento síncrono no webhook: ao receber uma mensagem no webhook do WhatsApp, delegar o processamento pesado de agentes a uma fila em background ou job assíncrono, respondendo imediatamente com HTTP `200 OK` para a Meta (evitando retentativas duplicadas causadas por latência superior a 5s exigida pelo protocolo de webhook do WhatsApp).

### C. Cron Jobs Configurados
*   `/api/cron/budget-reset`: Executado diariamente à meia-noite UTC (`0 0 * * *`) para reiniciar limites de cota de uso de IA dos tenants.
*   `/api/cron/metrics-snapshot`: Executado diariamente às 6:00 AM UTC (`0 6 * * *`) para consolidar métricas de uso e performance dos tenants.

---

## 2. Análise de Vulnerabilidade Crítica no Proxy Reverso (`Caddyfile`)

O arquivo `Caddyfile` contém uma brecha de segurança grave que expõe toda a rede interna do servidor de produção.

### A. Vulnerabilidade de Query-Based Proxying (`XTransformPort`)
*   **Trecho Vulnerável:**
    ```caddy
    :81 {
        @transform_port_query {
            query XTransformPort=*
        }

        handle @transform_port_query {
            reverse_proxy localhost:{query.XTransformPort} {
                header_up Host {host}
                header_up X-Forwarded-For {remote_host}
                header_up X-Forwarded-Proto {scheme}
                header_up X-Real-IP {remote_host}
            }
        }
        ...
    }
    ```
*   **Mecanismo do Ataque:** O servidor escuta na porta pública `81` e, se encontrar o parâmetro de busca `XTransformPort` na URL (por exemplo, `http://meuservidor.com:81/?XTransformPort=5432` ou `?XTransformPort=6379`), repassa a requisição HTTP inteira diretamente para o serviço rodando localmente nessa porta.
*   **Vetor de Exploração:**
    1.  **Port Scanning Interno:** Um atacante pode enviar requisições sequenciais para mapear quais serviços locais estão ativos (ex: `localhost:5432` para PostgreSQL, `localhost:6379` para Redis, `localhost:2375` para a API de Socket do Docker).
    2.  **Bypass de Firewall:** Serviços configurados para escutar apenas em `localhost` (para evitar exposição pública) tornam-se acessíveis de fora através do Caddyfile.
    3.  **Execução Remota de Comandos (RCE):** Se a porta HTTP do Docker ou serviços administrativos inseguros estiverem rodando localmente sem senha, o atacante pode mandar comandos arbitrários.
*   **Ação Corretiva Imediata:**
    *   Remover sumariamente o bloco `@transform_port_query` e a regra `handle` associada no `Caddyfile`.
    *   Se for estritamente necessário realizar proxy dinâmico para serviços de teste, o Caddy deve aplicar uma lista branca estática (Whitelist) de portas autorizadas e exigir cabeçalhos de autorização robustos (ex: Basic Auth ou Bearer Token).

---

## 3. Configurações do Nginx (`seuzella.conf`)

Para deploys VPS auto-hospedados (on-premise/VMs), a configuração do Nginx no caminho `nginx/seuzella.conf` atua como primeira barreira de segurança.

### A. Timeout de Proxy de 60s
A diretiva garante que requisições presas ou processos lentos na aplicação Next.js sejam interrompidos após 60 segundos, protegendo o pool de conexões do servidor contra exaustão (Slowloris/DoS):
```nginx
proxy_connect_timeout 60s;
proxy_send_timeout    60s;
proxy_read_timeout    60s;
```

### B. Zonas de Rate Limiting (Mitigação de Abuso)
A configuração implementa limites granulares de taxa de requisição para diferentes perfis de rotas:
1.  **Zona Global (`global`):** Limite de `10r/s` (requisições por segundo) por IP. Focada no tráfego comum de páginas estáticas e renderizações SSR.
2.  **Zona de Autenticação (`auth`):** Limite restritivo de `3r/s` por IP. Aplica-se às rotas `/api/auth/signin` e `/api/auth/callback`, mitigando ataques de força bruta contra senhas de usuários.
3.  **Zona de Webhook (`webhook`):** Limite de `30r/s` por IP. Projetado para suportar rajadas de tráfego de webhooks do WhatsApp em momentos de alto fluxo, permitindo ingestão rápida sem gargalos.
4.  **Zona de API (`api`):** Limite de `5r/s` por IP para endpoints gerais `/api/v1/` e `/api/ddc/` de dashboards, protegendo recursos do banco de dados de scraping automatizado.

### C. Restrições de Arquivos Sensíveis e Tamanho de Upload
*   **Proteção de Arquivos:** Retorna explicitamente HTTP `404 Not Found` (em vez de `403 Forbidden` para ocultar a existência do recurso) para requisições direcionadas a extensões sensíveis: `.env`, `.git`, `.md`, `.log`, `.sql`, e `.db`.
*   **Tamanho Máximo do Corpo (`client_max_body_size 10M`):** Restringe o upload de arquivos a 10MB. Isso previne estouros de buffer e exaustão de disco no servidor por uploads massivos maliciosos.

---

## 4. Empacotamento de Dependências com `next.config.ts`

### A. Standalone Build (`output: 'standalone'`)
O Next.js gera um diretório enxuto contendo apenas os arquivos necessários para rodar a aplicação em um ambiente Node.js limpo. Isso reduz drasticamente o tamanho do contêiner Docker final (de gigabytes para menos de 100MB, excluindo o `node_modules` completo de desenvolvimento).

### B. Exclusão de Bundling (`serverExternalPackages`)
*   **Variáveis Configuradas:** `["@prisma/client", "prisma", "bcryptjs", "sharp"]`
*   **Por que é necessário:**
    *   **Prisma Client:** Utiliza engines de consulta compiladas em C++ específicas do sistema operacional (Query Engine Binaries). Se o Next.js tentar empacotá-lo no arquivo JS minificado, o caminho para as engines binárias quebra no runtime.
    *   **Bcryptjs & Sharp:** Contêm extensões nativas do Node.js compiladas em C/C++ (ou dependências complexas de processamento de imagem que exigem bibliotecas nativas de sistema).
*   **Ação:** Manter esses pacotes declarados na lista `serverExternalPackages` para forçar o Next.js a importá-los diretamente de `node_modules` na imagem final do servidor.

---

## 5. Secrets de Ambiente Críticos / Ausentes

Para uma implantação segura do Seu Zélla na Vercel ou VPS, os seguintes segredos devem ser provisionados de forma segura e nunca versionados em arquivos públicos:

| Variável de Ambiente | Descrição / Uso no Código | Criticidade |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexão com o banco (PostgreSQL em prod). | **Crítica** (Acesso total aos dados) |
| `ENCRYPTION_SECRET` | Chave simétrica usada pelo middleware do Prisma para criptografar tokens e chaves de APIs integradas de terceiros (AES-256-GCM). | **Crítica** (Se vazada, descriptografa todas as chaves de API dos hotéis) |
| `NEXTAUTH_SECRET` | Assinatura e criptografia dos tokens de sessão JWT dos usuários. | **Crítica** (Se vazada, permite falsificação de sessões/hijack) |
| `CRON_SECRET` | Token enviado no cabeçalho `Authorization: Bearer <secret>` para proteger as rotas de cron. | **Alta** (Se ausente, qualquer usuário pode forçar a rota de reset de cotas) |
| `CALENDAR_SYNC_SECRET` | Token de segurança de integração do webhook de calendários. | **Média** |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Token cadastrado na console Meta Developer para autorizar o webhook. | **Alta** |
| `WHATSAPP_APP_SECRET` | Segredo do aplicativo Meta para validar a assinatura SHA256 dos payloads recebidos. | **Alta** (Impede falsificação de mensagens recebidas) |
| `MP_ACCESS_TOKEN` | Chave privada do Mercado Pago para gerar Pix de assinaturas. | **Crítica** (Acesso financeiro à conta do recebedor) |
| `MP_WEBHOOK_SECRET` | Token secreto do webhook do Mercado Pago. | **Alta** (Evita ataques de confirmação de pagamento falsa) |
| `GEMINI_API_KEY`, `GROQ_API_KEY`, `DEEPSEEK_API_KEY` | Chaves de acesso às APIs de LLM / Embeddings. | **Alta** (Uso indevido pode gerar custos massivos) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Acesso ao Redis Serverless para Cache Semântico e limites de requisições. | **Alta** |
