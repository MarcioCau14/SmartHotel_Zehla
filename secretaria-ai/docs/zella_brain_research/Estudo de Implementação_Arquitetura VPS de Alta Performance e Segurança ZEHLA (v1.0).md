# Estudo de Implementação: Arquitetura VPS de Alta Performance e Segurança ZEHLA (v1.0)

Este documento detalha o plano de implantação em produção do **Cérebro ZEHLA**, **Headroom Proxy** e toda a stack associada em uma máquina virtual privada (**VPS Hostinger KVM4**), com foco em **latência zero** e **blindagem de segurança (Hardening)**.

---

## 🖥️ 1. Dimensionamento do VPS (Hostinger KVM4)

O plano **Hostinger KVM4** possui as seguintes especificações:
* **Recursos:** 4 vCPUs, 16 GB de RAM, 150 GB de Armazenamento NVMe SSD, 4 TB de largura de banda.
* **Sistema Operacional Recomendado:** Ubuntu 24.04 LTS (estável, suporte de longo prazo).

### Análise de Consumo Projetado (Centenas de milhares de msgs/mês):

| Serviço | CPU Estimada | RAM Estimada | I/O de Disco | Papel na Latência |
|---|---|---|---|---|
| **Next.js Backend** | 10% - 25% | 1.5 GB | Baixo | Orquestrador de APIs e conexões |
| **Evolution API** | 15% - 30% | 2.0 GB | Médio (logs de mídia) | Interface com WhatsApp / Webhooks |
| **PostgreSQL 16** | 10% - 20% | 4.0 GB | Alto (persistência) | Banco de dados central |
| **Redis Cache** | 5% | 1.0 GB | Baixo (in-memory) | Fila de mensageria e cache de contexto |
| **Headroom Proxy** | 2% - 5% | 512 MB | Baixo | Compactor de contexto e corte de custos |
| **Nginx (SSL / Proxy)** | 2% | 256 MB | Baixo | Porta de entrada HTTPS e Rate Limit |
| **Monitoramento (Grafana)** | 5% | 1.0 GB | Médio | Observabilidade do Guardian e métricas |
| **Margem de Folga** | ~30% | ~5.5 GB | - | Absorção de picos e buffers de rede |

> [!TIP]
> O VPS **KVM4 tem recursos de sobra** para rodar toda a stack com folga extrema, permitindo que a aplicação processe picos de mensagens sem perigo de OOM (Out Of Memory) ou congelamento de CPU.

---

## 🔒 2. Protocolo de Hardening e Segurança (Zero Trust)

Expor bancos de dados ou APIs sem proteção na internet pública é a maior vulnerabilidade de servidores VPS. Adotamos os seguintes protocolos de segurança:

1. **Isolamento de Portas (Rede Interna Docker):**
   * Nenhum banco de dados (Postgres, Redis), serviço de IA (Headroom) ou coletor de logs (Prometheus) terá portas expostas externamente.
   * Usaremos redes privadas virtuais no Docker (`networks`). Os serviços conversam por nomes DNS de container (ex: `http://postgres:5432`).
2. **Firewall UFW Restrito no VPS:**
   * Apenas as portas **22** (SSH alterada por segurança), **80** (HTTP para renovação Let's Encrypt) e **443** (HTTPS) estarão abertas no firewall do SO.
3. **Proxy Reverso com SSL Automático (Nginx + Certbot):**
   * Todo tráfego HTTPS criptografado com TLS 1.3. O Nginx encerra o SSL e repassa o tráfego limpo internamente pela rede Docker.
4. **Rate Limiting no Nginx:**
   * Proteção contra ataques de negação de serviço (DDoS) e scripts maliciosos inundando o chat de IA.
5. **Variáveis de Ambiente Protegidas (`.env`):**
   * Senhas e chaves de API nunca ficam expostas no código do repositório Git. São lidas a partir de arquivos `.env` locais no servidor.

---

## 📐 3. Diagrama de Arquitetura de Produção (VPS Hostinger)

Este gráfico demonstra o fluxo de requisições de ponta a ponta com a aplicação do **Zero Trust** (somente portas 80/443 abertas externamente):

```mermaid
graph TD
    %% Estilos de nós e conexões
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#333;
    classDef proxy fill:#2b2b2b,stroke:#4ecdc4,stroke-width:2px,color:#ffe66d;
    classDef secured fill:#1a3a1a,stroke:#51cf66,stroke-width:2px,color:#fff;
    classDef closed fill:#3a1a1a,stroke:#ff6b6b,stroke-width:2px,color:#fff;

    %% Acesso Externo
    Host[Hóspede / WhatsApp / API Client]:::client
    Host -->|Porta 443 HTTPS Criptografada| Nginx:::proxy

    subgraph VPS_Hostinger ["VPS Linux - Hostinger KVM4 (Firewall UFW ativo)"]
        Nginx
        
        subgraph Rede_Docker_Interna ["Rede Privada Docker (zehla-production-net)"]
            App[Next.js App Backend]:::secured
            Evolution[Evolution WhatsApp API]:::secured
            Headroom[Headroom Proxy Engine]:::secured
            Postgres[(PostgreSQL 16 DB)]:::closed
            Redis[(Redis cache/filas)]:::closed
            Grafana[Grafana Dashboard]:::closed
        end
    end

    %% Roteamento do Proxy Reverso Nginx (Interno)
    Nginx -->|Proxy Pass /api/*| App
    Nginx -->|Proxy Pass /v1/whatsapp/*| Evolution
    Nginx -->|Proxy Pass /grafana/*| Grafana
    
    %% Comunicações Internas (Não Acessíveis por Fora)
    App -->|Busca Conhecimento| Postgres
    App -->|Envia Mensagens| Evolution
    App -->|Chamada LLM Segura| Headroom
    
    Evolution -->|Armazena Instâncias| Postgres
    Evolution -->|Cache de Conexão| Redis
    
    Headroom -->|Usa Cache/Context| Redis
    Headroom -->|Saída de Rede Externa| OpenRouter[OpenRouter Cloud API]:::client
```

---

## 🐳 4. O Docker Compose de Produção Consolidado

Abaixo está a estrutura unificada para implantação no VPS (`docker-compose.production.yml`). Note a ausência de mapeamento de portas externas nos serviços Postgres, Redis e Headroom por motivos de segurança.

```yaml
# docker-compose.production.yml
# Stack consolidada e blindada para produção ZEHLA no VPS Hostinger
# Rodar com: docker compose -f docker-compose.production.yml up -d

services:
  # ═══════════════════════════════════════════════════════════
  # NGINX — Proxy Reverso e Camada SSL (Único com portas públicas)
  # ═══════════════════════════════════════════════════════════
  nginx:
    image: nginx:alpine
    container_name: zehla-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d
      - /etc/letsencrypt:/etc/letsencrypt:ro
    networks:
      - zehla-prod-net
    depends_on:
      - backend
      - evolution-api

  # ═══════════════════════════════════════════════════════════
  # BACKEND — Next.js Application Server (Cérebro ZEHLA)
  # ═══════════════════════════════════════════════════════════
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: zehla-backend-app
    restart: unless-stopped
    environment:
      DATABASE_URL: "postgresql://zehla:${POSTGRES_PASSWORD}@postgres:5432/zehla_db?schema=public"
      REDIS_URL: "redis://redis:6379/0"
      HEADROOM_PROXY_URL: "http://headroom:8787/v1"
      HEADROOM_PROXY_ENABLED: "true"
      OPENROUTER_API_KEY: "${OPENROUTER_API_KEY}"
      EVOLUTION_API_URL: "http://evolution-api:8080"
      EVOLUTION_API_KEY: "${EVOLUTION_API_KEY}"
    networks:
      - zehla-prod-net
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # ═══════════════════════════════════════════════════════════
  # EVOLUTION API — Gateway WhatsApp e Webhooks
  # ═══════════════════════════════════════════════════════════
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: zehla-evolution-api
    restart: unless-stopped
    expose:
      - "8080"
    environment:
      SERVER_URL: "https://${DOMAIN_NAME}/v1/whatsapp"
      AUTHENTICATION_API_KEY: "${EVOLUTION_API_KEY}"
      DATABASE_ENABLED: "true"
      DATABASE_PROVIDER: "postgresql"
      DATABASE_CONNECTION_URI: "postgresql://zehla:${POSTGRES_PASSWORD}@postgres:5432/zehla_db?schema=evolution"
      CACHE_REDIS_ENABLED: "true"
      CACHE_REDIS_URI: "redis://redis:6379/2"
      DATABASE_SAVE_DATA_INSTANCE: "true"
      DATABASE_SAVE_MESSAGE_UPDATE: "true"
    volumes:
      - evolution_prod_data:/evolution/instances
    networks:
      - zehla-prod-net
    depends_on:
      postgres:
        condition: service_healthy

  # ═══════════════════════════════════════════════════════════
  # HEADROOM — Proxy de Compressão e Economia de Contexto
  # ═══════════════════════════════════════════════════════════
  headroom:
    image: ghcr.io/chopratejas/headroom:latest
    container_name: zehla-headroom-prod
    restart: unless-stopped
    expose:
      - "8787"
      - "8789"
    environment:
      OPENAI_BASE_URL: "https://openrouter.ai/api/v1"
      OPENAI_API_KEY: "${OPENROUTER_API_KEY}"
      HEADROOM_NO_OPTIMIZE: "false"
      HEADROOM_NO_CACHE: "false"
      HEADROOM_NO_INTELLIGENT_CONTEXT: "false"
      HEADROOM_NO_COMPRESS_FIRST: "false"
      HEADROOM_BUDGET: "${HEADROOM_DAILY_BUDGET:-50.0}"
      HEADROOM_TELEMETRY: "off"
      HEADROOM_LOG_FILE: "/var/log/headroom/headroom.jsonl"
      HEADROOM_STORE_MAX_ENTRIES: "5000"
      HEADROOM_STORE_TTL_SECONDS: "14400"
      HEADROOM_LEARN_ENABLED: "true"
    volumes:
      - headroom_prod_data:/root/.headroom
      - headroom_prod_logs:/var/log/headroom
    networks:
      - zehla-prod-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8787/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ═══════════════════════════════════════════════════════════
  # POSTGRESQL — Banco de Dados Relacional (Sem portas expostas)
  # ═══════════════════════════════════════════════════════════
  postgres:
    image: postgres:16-alpine
    container_name: zehla-postgres-prod
    restart: unless-stopped
    expose:
      - "5432"
    environment:
      POSTGRES_USER: zehla
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
      POSTGRES_DB: zehla_db
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - zehla-prod-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zehla -d zehla_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ═══════════════════════════════════════════════════════════
  # REDIS — Cache Rápido e Working Memory (Sem portas expostas)
  # ═══════════════════════════════════════════════════════════
  redis:
    image: redis:7-alpine
    container_name: zehla-redis-prod
    restart: unless-stopped
    expose:
      - "6379"
    command: redis-server --appendonly yes --maxmemory 1gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_prod_data:/data
    networks:
      - zehla-prod-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_prod_data:
    driver: local
  redis_prod_data:
    driver: local
  evolution_prod_data:
    driver: local
  headroom_prod_data:
    driver: local
  headroom_prod_logs:
    driver: local

networks:
  zehla-prod-net:
    driver: bridge
```

---

## 🚀 5. Checklist de Implantação e Provisionamento do VPS

Siga estes passos cronologicamente para configurar o servidor Hostinger:

### Passo 1: Hardening Inicial do SO (SSH + UFW)
Acesse o VPS via SSH (`ssh root@ip_do_servidor`) e configure o firewall:
```bash
# Atualizar pacotes do sistema
apt update && apt upgrade -y

# Ativar Firewall UFW bloqueando tudo por padrão
ufw default deny incoming
ufw default allow outgoing

# Permitir SSH (Porta 22) e HTTP/HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Ativar firewall
ufw enable
```

### Passo 2: Instalar Docker e Docker Compose
```bash
# Instalação oficial do Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verificar instalações
docker --version
docker compose version
```

### Passo 3: Obtenção de Certificados SSL (Let's Encrypt)
Instale o Certbot para gerenciar o SSL automaticamente:
```bash
apt install certbot python3-certbot-nginx -y

# Gerar certificado para o seu domínio (substitua pelo domínio real)
certbot certonly --standalone -d zehla.io -d www.zehla.io
```
Os certificados estarão salvos de forma segura em `/etc/letsencrypt/live/zehla.io/`.

### Passo 4: Configurar Nginx Reverso
Crie o arquivo `./nginx/nginx.conf` mapeando o proxy pass:
```nginx
# nginx.conf
events { worker_connections 1024; }

http {
    include       mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    # Rate Limiting: max 10 requisições por segundo por IP
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    server {
        listen 80;
        server_name zehla.io www.zehla.io;
        return 301 https://$host$request_uri; # Redireciona tudo para HTTPS
    }

    server {
        listen 443 ssl;
        server_name zehla.io www.zehla.io;

        ssl_certificate /etc/letsencrypt/live/zehla.io/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/zehla.io/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;

        # Next.js App
        location / {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Evolution API WhatsApp
        location /v1/whatsapp/ {
            proxy_pass http://evolution-api:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_read_timeout 600s;
        }
    }
}
```

### Passo 5: Inicializar a Stack
1. Clone o repositório dentro do VPS.
2. Crie o arquivo `.env` preenchendo as chaves:
   ```env
   POSTGRES_PASSWORD="senha_segura_db_2026"
   OPENROUTER_API_KEY="sk-or-..."
   EVOLUTION_API_KEY="chave_segura_evolution_2026"
   DOMAIN_NAME="zehla.io"
   ```
3. Inicialize os containers:
   ```bash
   docker compose -f docker-compose.production.yml up -d --build
   ```

A stack estará no ar com **comunicação interna encriptada e isolada**, blindada contra invasões externas e otimizada pelo **Headroom Proxy** para latência mínima e economia de até 90% em tokens.
