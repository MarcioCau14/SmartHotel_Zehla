# 04 - Validação de Segurança e Automação de Deploy (CI/CD)

Este documento descreve o funcionamento do script de teste de estresse multi-tenant `stress-test-seuzella.js`, detalha a sua automação no pipeline de CI/CD para impedir deploys vulneráveis e define os protocolos de revisão de código (Gatekeeper approval) exigidos antes de qualquer fusão em produção.

---

## 1. Fases de Execução do Script de Estresse (`stress-test-seuzella.js`)

O script de teste de estresse simula concorrência real de acessos paralelos para verificar se a camada de isolamento de tenants da aplicação resiste a condições de alta carga sem apresentar vazamentos laterais de dados (Cross-Tenant Leaks). Ele é estruturado em 5 fases sequenciais:

```
[Fase 1: Auth] ──> [Fase 2: Leak Verification] ──> [Fase 3: Webhook Stress] ──> [Fase 4: DDC API Stress] ──> [Fase 5: Brute Force]
```

### Fase 1: Autenticação de Tenants (`authenticateTenants`)
*   **Ação:** O script gera instâncias virtuais de inquilinos (`tenant-stress-001`, `tenant-stress-002`, etc.) e inicializa um Cookie Jar (gerenciador de cookies) para cada um deles.
*   **Procedimento:**
    1.  Efetua uma chamada HTTP `GET` em `/api/auth/csrf` para obter um token CSRF válido.
    2.  Dispara uma requisição HTTP `POST` para `/api/auth/callback/credentials` com o cabeçalho `x-www-form-urlencoded` contendo os dados de login padrão de homologação (`email=123&password=123`) juntamente com o token CSRF recebido.
    3.  Salva o `session-token` retornado nos cookies do jar local.
    4.  Valida a integridade da autenticação consultando `/api/auth/session` para identificar qual o ID de inquilino (`tenantId`) real foi atribuído àquela sessão.

### Fase 2: Verificação Inicial de Vazamento (`testCrossTenantIsolation`)
*   **Ação:** Valida se as barreiras básicas de isolamento estão operacionais sob requisições normais.
*   **Procedimento:** Cada inquilino realiza chamadas sequenciais para a rota `/api/ddc/property-name`. O script analisa se a rota consegue identificar corretamente a propriedade correspondente ao ID da sessão do inquilino atual e rejeita chamadas que tentam interpolar IDs cruzados.

### Fase 3: Estresse de Webhooks (`stressWebhooks`)
*   **Ação:** Simula uma rajada intensa de mensagens de clientes chegando ao webhook de processamento de IA do WhatsApp.
*   **Procedimento:**
    1.  O script abre conexões paralelas assíncronas (limitadas pelo parâmetro `--concurrency`) direcionadas para a rota `/api/webhook-whatsapp`.
    2.  Envia payloads contendo dados e mensagens em formato JSON (`messages.upsert`, `connection.update`) simulando novos diálogos de hóspedes.
    3.  O teste se estende até estourar a janela de tempo configurada em `--duration`. A taxa de requisições bem-sucedidas (`2xx`), erros de servidor (`5xx`) e rate limits (`429`) é monitorada.

### Fase 4: Estresse de APIs do Dashboard DDC (`stressDDCApi`)
*   **Ação:** Esta é a fase mais crítica de auditoria de isolamento. Ela faz chamadas cruzadas de alta velocidade em todas as APIs administrativas simulando acessos concorrentes de múltiplos hotéis.
*   **Procedimento:**
    1.  Para cada inquilino autenticado, o script realiza requisições simultâneas para os endpoints: `/api/ddc/metrics`, `/api/ddc/property-name`, `/api/ddc/ai-status`, `/api/ddc/conversations`, `/api/ddc/guests`, `/api/ddc/bookings`, `/api/ddc/notifications` e `/api/ddc/training`.
    2.  O script analisa as cargas úteis (payloads) de resposta JSON. Se o JSON retornado contiver uma propriedade `tenantId` e este valor for diferente do ID do inquilino associado à sessão do cookie de autenticação utilizado na chamada, o script contabiliza um **Cross-Tenant Leak**.

### Fase 5: Proteção de Força Bruta (`stressLogin`)
*   **Ação:** Valida se as barreiras de Rate Limiting de infraestrutura estão ativas.
*   **Procedimento:** Envia uma rajada de requisições de login inválidas com e-mails e senhas incorretas. O teste é considerado bem-sucedido se o servidor começar a retornar erros HTTP `429 Rate Limited`, atestando que a proteção contra força bruta bloqueou IPs abusivos.

---

## 2. Automação no Pipeline de CI/CD (GitHub Actions)

Para atuar como barreira ativa de proteção, o script de estresse deve ser executado obrigatoriamente antes de cada deploy em ambiente de homologação ou produção.

### Exemplo de Configuração de Pipeline (`.github/workflows/security-gate.yml`)

```yaml
name: Security & Multi-Tenant Isolation Gate

on:
  pull_request:
    branches: [ main, develop ]
  push:
    branches: [ main ]

jobs:
  security-stress-test:
    runs-on: ubuntu-latest

    services:
      # Caso precise rodar serviços auxiliares como Redis para cache semântico
      redis:
        image: redis:alpine
        ports:
          - 6379:6379

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-size: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci --legacy-peer-deps

      - name: Setup Environment Variables
        run: |
          cp .env.example .env
          echo "ENCRYPTION_SECRET=test-secret-key-32-chars-long-for-ci" >> .env
          echo "NEXTAUTH_SECRET=ci-nextauth-secret-key-for-jwt-signing" >> .env
          echo "UPSTASH_REDIS_REST_URL=http://localhost:6379" >> .env
          echo "UPSTASH_REDIS_REST_TOKEN=ci-token" >> .env

      - name: Run Prisma Database Migrations (SQLite Local CI)
        run: |
          npx prisma db push
          npx prisma db seed

      - name: Build Next.js Application
        run: npm run build

      - name: Start Application Server in Background
        run: npm run start &
        env:
          PORT: 3000

      - name: Wait for Server to be Responsive
        run: |
          npx wait-on http://localhost:3000 --timeout 30000

      - name: Run Multi-Tenant Stress and Leak Verification
        run: |
          # Executa o teste simulando 10 tenants e 30 conexões paralelas por 15 segundos
          node stress-test-seuzella.js --url http://localhost:3000 --tenants 10 --duration 15 --concurrency 30

      # O script stress-test-seuzella.js encerra com código de saída 1 (process.exit(1))
      # se "stats.crossTenantLeaks > 0". O GitHub Actions interceptará esse código de erro,
      # interromperá a esteira imediatamente e bloqueará o deploy.
```

---

## 3. Protocolos de Aprovação de Gatekeeper (Revisão de Código)

Além da verificação automatizada em CI/CD, todos os pull requests direcionados para as branches de produção devem passar por auditoria manual obrigatória focada nos seguintes checklists de segurança:

### A. Lista de Verificação (Checklist) para Revisores de Código

1.  **Imports Inseguros do Prisma Client:**
    *   [ ] O código adicionado realiza `import prisma from '...'` ou `new PrismaClient()`?
    *   *Regra:* Rejeitar qualquer instância direta. Toda chamada de banco deve referenciar o cliente seguro centralizado: `import { db } from '@/lib/db'`.
2.  **Associação de Tenant em Novos Modelos:**
    *   [ ] Foi adicionada alguma nova tabela ao arquivo `schema.prisma` que armazene dados de hotéis, hóspedes ou logs?
    *   *Regra:* O campo `tenantId String` deve ser definido como obrigatório (não nulo) e possuir índice explícito no banco.
3.  **Configuração de Proxy de Consultas:**
    *   [ ] Se um novo modelo de banco de dados foi criado, ele foi registrado na constante `TENANT_SCOPED` em `src/lib/tenant-extension.ts`?
    *   *Regra:* Todo modelo de dados isolado por inquilino deve constar no array de escopo do proxy para evitar bypasses.
4.  **Operações de Registro Único (`where` filters):**
    *   [ ] Chamadas do tipo `findUnique`, `update`, `delete` e `upsert` estão validando o inquilino?
    *   *Regra:* Certifique-se de que o filtro `tenantId` está contido no argumento `where` ou que há validação ativa na camada de rotas antes da execução da query.
5.  **Sanitização Financeira de Agentes:**
    *   [ ] O Pull Request altera fluxos de respostas geradas por IA (módulo Airbnb)?
    *   *Regra:* Verificar se as rotas de IA passam a resposta pela função `filterPixFromResponse()` da classe `gatekeeper.ts` antes de renderizá-la ao usuário final.
6.  **Proteção de Endpoints de Rotas (`/api/`):**
    *   [ ] Novas rotas de API possuem chamadas de validação de sessão e inquilino ativo (como `requireTenantId()`)?
    *   *Regra:* Proibir rotas de leitura/escrita expostas de forma pública, a menos que o propósito de uso seja explicitamente aberto (como recebimento de webhooks com verificação de assinatura).
