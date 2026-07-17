# 02 - Isolamento Multi-Tenant e Segurança do Banco de Dados

Este documento mapeia as falhas de isolamento de dados identificadas na arquitetura do Seu Zélla e apresenta um plano de ação detalhado para reforçar as barreiras multi-tenant, migrar o banco de dados local (SQLite) para PostgreSQL corporativo e implementar segurança de dados a nível de banco (RLS).

---

## 1. Brechas no Schema do Prisma (`prisma/schema.prisma`)

A arquitetura do banco de dados atual possui omissões na tipagem de campos de isolamento, abrindo margem para vazamentos acidentais.

### A. Campo `tenantId` Anulável em Modelos Críticos
*   **Problema:** Os modelos `Lead`, `Target` e `Campaign` definem o campo `tenantId` como anulável (`String?`).
*   **Risco de Segurança:** Registros podem ser criados acidentalmente sem um inquilino associado (registros órfãos). Consultas genéricas que buscam dados sem filtrar explicitamente por inquilino ativo retornarão esses registros globais, vazando leads e campanhas para inquilinos concorrentes.
*   **Ação Recomendada:**
    1.  Tornar o campo `tenantId` obrigatório (`tenantId String`) nesses três modelos.
    2.  Criar uma migration no Prisma para atualizar registros órfãos existentes antes de alterar o tipo de dado para não nulo.

### B. Ausência de `tenantId` em Modelos Globais
*   **Problema:** As tabelas `SwipeTemplate` (modelos de mensagens de resposta rápida) e `AgentLog` (logs de telemetria dos agentes de IA) não contêm o campo `tenantId`.
*   **Risco de Segurança:**
    *   `SwipeTemplate` expõe modelos criados por um hotel para todos os outros inquilinos do sistema.
    *   `AgentLog` armazena dados confidenciais (incluindo prompts do usuário, inputs, outputs de LLMs e custos de API tokens) em uma tabela puramente global. Qualquer falha na interface administrativa pode permitir que um inquilino visualize logs de conversas de hóspedes de outro estabelecimento.
*   **Ação Recomendada:**
    1.  Alterar o schema do Prisma para introduzir a coluna `tenantId String` nos modelos `SwipeTemplate` e `AgentLog`.
    2.  Atualizar as relações do Prisma vinculando-os ao modelo `Tenant`.

---

## 2. Ignorância da Criptografia de Credenciais de API

As chaves de API integradas (como tokens do Mercado Pago e da Graph API da Meta) devem ser descriptografadas apenas no runtime sob demanda. No entanto, o sistema contorna esse mecanismo de segurança em locais específicos.

### A. Instanciações Diretas de `new PrismaClient()`
Três serviços críticos no motor de funil instanciam o cliente do Prisma de forma crua, sem registrar a extensão de criptografia (`prismaEncryptionExtension`):
1.  **Classifier:** `src/lib/intelligence/funnel/classifier.ts` (linha 7)
2.  **Event Processor:** `src/lib/intelligence/funnel/event-processor.ts` (linha 9)
3.  **Scorer:** `src/lib/intelligence/funnel/scorer.ts` (linha 8)
*   **Impacto de Segurança:** Ao ler registros de `ApiConfig` usando estas instâncias, as propriedades `apiKey` e `apiSecret` não serão descriptografadas automaticamente, resultando no envio de strings em formato ciphertext (`iv:authTag:ciphertext`) para as APIs de LLMs, resultando em falhas de autenticação de IA. Do mesmo modo, qualquer escrita realizada por essas instâncias salvará credenciais em texto simples no banco de dados, violando a política de criptografia em repouso.
*   **Ação Recomendada:**
    *   Remover todas as linhas `const prisma = new PrismaClient();` nos arquivos indicados.
    *   Substituir pela importação da instância estendida centralizada:
        ```typescript
        import { db } from '@/lib/db';
        ```

### B. Rotas Legadas Importando o Cliente Inseguro
As rotas de relatórios e agendamento importam o arquivo original `prisma/db.ts` em vez de usar o invólucro estendido e seguro:
1.  **Metrics Route:** `src/app/api/v1/metrics/route.ts` (linha 2)
2.  **Reservations Route:** `src/app/api/v1/reservations/route.ts` (linha 2)
*   **Ação Recomendada:** Alterar a importação de `import prisma from '../../../../../prisma/db'` para `import { db as prisma } from '@/lib/db'`.

---

## 3. Falhas Graves no Proxy Dinâmico de Tenant (`withTenant`)

O helper `withTenant(tenantId)` em `src/lib/tenant-extension.ts` atua como um interceptador de consultas Prisma. No entanto, sua implementação atual é ineficaz para operações destrutivas ou de atualização de registro único.

### A. Modelos Omitidos
*   O objeto `TENANT_SCOPED` omite completamente os modelos `Lead`, `Target`, `Campaign`, `SwipeTemplate`, `AgentLog` e todas as entidades Airbnb (ex: `AirBProperty`, `AirBConversation`, `AirBMessage`). Consultas realizadas via proxy nestes modelos não aplicarão o filtro automático de inquilino.

### B. Métodos Vulneráveis (`findUnique`, `update`, `delete`, `upsert`)
*   **A falha:** Veja como o proxy trata a exclusão de registros:
    ```typescript
    delete: (args: { where: Record<string, unknown> }) => {
      return (prismaModel.delete as (...args: any[]) => any)(args);
    }
    ```
*   **Vazamento Lateral:** O argumento `args` não é modificado. O filtro `tenantId` nunca é injetado. Se um tenant autenticado descobrir o ID de registro (`id`) de uma propriedade, reserva ou API Key pertencente a outro hotel e realizar uma requisição de exclusão (`delete`), a exclusão ocorrerá com sucesso, cruzando a fronteira de tenant.
*   **Ação Recomendada:** Refatorar todos os proxies de métodos unitários para fundir o filtro `{ tenantId }` nos argumentos `where`:
    ```typescript
    findUnique: (args: { where: Record<string, unknown>; include?: Record<string, unknown> }) => {
      const mergedWhere = { ...args.where, [field]: tenantId };
      return (prismaModel.findFirst as (...args: any[]) => any)({ ...args, where: mergedWhere });
    },
    update: (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const mergedWhere = { ...args.where, [field]: tenantId };
      return (prismaModel.updateMany as (...args: any[]) => any)({ where: mergedWhere, data: args.data });
    },
    delete: (args: { where: Record<string, unknown> }) => {
      const mergedWhere = { ...args.where, [field]: tenantId };
      return (prismaModel.deleteMany as (...args: any[]) => any)({ where: mergedWhere });
    }
    ```
    *(Nota: Ao usar `updateMany` e `deleteMany`, evitamos bypasses de ID, pois esses métodos filtram estritamente por todas as chaves fornecidas no `where`).*

---

## 4. Vazamento de Dados Administrativos em `/api/tenants`

*   **Vulnerabilidade:** O arquivo `src/app/api/tenants/route.ts` lista todos os inquilinos do banco de dados de forma aberta. Embora use o middleware `withSecurity`, não há checagem de nível de permissão administrativo (`admin`) ou validação de ID, tornando a rota pública e vazando informações estratégicas como nomes, e-mails, planos contratados e IDs de acesso.
*   **Mitigação:** Adicionar validação de permissão de administrador nas funções manipuladoras da rota antes da execução da consulta no banco:
    ```typescript
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    ```

---

## 5. Roadmap de Migração para PostgreSQL Row Level Security (RLS)

O isolamento em SQLite no nível da aplicação é propenso a falhas humanas de desenvolvimento. O roadmap abaixo projeta a migração segura para o PostgreSQL com segurança a nível de linha de dados (RLS).

### Fase 1: Atualização e Harmonização do Schema (1 semana)
1.  Modificar o provider no arquivo `prisma/schema.prisma` de `sqlite` para `postgresql`.
2.  Mapear todas as chaves estrangeiras (`foreign keys`) e índices necessários. Garantir que todas as tabelas escopadas tenham a coluna `tenant_id` como obrigatória.

### Fase 2: Configuração de Políticas RLS no PostgreSQL (2 dias)
Executar migrações em SQL bruto para ativar o RLS em todas as tabelas protegidas:
```sql
-- Ativar RLS
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;

-- Criar política de isolamento
CREATE POLICY tenant_isolation_policy ON "Property"
  AS RESTRICTIVE
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''))
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));
```

### Fase 3: Integração das Query Extensions do Prisma (3 dias)
Utilizar a funcionalidade de Client Extensions do Prisma para definir o contexto do inquilino no nível de transação SQL antes de cada requisição. O runtime automaticamente executará:
```typescript
export const prismaRlsClient = (tenantId: string) => {
  return db.$extends({
    query: {
      $allOperations({ model, operation, args, query }) {
        return db.$transaction([
          db.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${tenantId}';`),
          query(args)
        ]).then(results => results[1]);
      }
    }
  });
};
```
Isso garante que, mesmo que o programador esqueça de passar o filtro `tenantId` na cláusula `where`, o motor do PostgreSQL bloqueará e filtrará os dados de forma transparente, eliminando qualquer risco de vazamento de dados lateral.
