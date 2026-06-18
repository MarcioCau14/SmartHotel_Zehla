# Plano de Implementação: ZEHLA PRIME SB8 — Adaptadores de Persistência Comerciais (Prisma)

Este plano descreve o design, a alteração de esquema e a implementação da camada de infraestrutura de persistência para o Bounded Context Comercial no `zehla-backend`. Vamos conectar as 5 Portas Segregadas (ILeadPort, IPropostaPort, IPacotePort, IPagamentoPort, IConversaoPort) a adaptadores de banco de dados reais usando Prisma.

---

## User Review Required

> [!IMPORTANT]
> **Isolamento de Modelos no Schema Prisma:**
> Para garantir isolamento absoluto e evitar efeitos colaterais no modelo de Leads e CRM existentes na plataforma Zehla, definiremos novos modelos relacionais dedicados ao Bounded Context Comercial pré-fixados com `Comercial` (`ComercialLead`, `ComercialPacote`, `ComercialProposta`, `ComercialPagamento`, `ComercialConversao`). Isso blinda a especificação e evita conflitos de tipos, migrações e chaves estrangeiras com o código legado.

> [!WARNING]
> **O Escudo do Data Mapper (A Fronteira Verde):**
> Nenhuma propriedade anêmica de tipo gerado pelo `@prisma/client` vazará dos repositórios para o domínio. O repositório realiza o mapeamento:
> - Na escrita: `entity` -> `toData()` -> `prisma.create/update`
> - Na leitura: `prisma.find` -> `hydrate()` -> `Result.ok(entity)` ou `Result.fail(error)`
> Se o `hydrate()` ler um registro corrompido que viole as invariantes de domínio dos Value Objects (ex: centavos de `Money` negativos, `Score` fora de 0-100, `Email` inválido), ele disparará uma falha imediatamente via `Result.fail()`.

> [!CAUTION]
> **Row-Level Security (RLS) Mandatório:**
> Toda e qualquer query (find, list, create, update) DEVE conter e forçar o filtro de propriedade/tenant (`propriedadeId`) silenciosamente. Operações sem isolamento serão rejeitadas.

---

## Proposed Changes

### 1. 🗄️ Esquema de Banco de Dados (Prisma)
Adição dos novos modelos de persistência específicos para o domínio Comercial no final do arquivo schema:
- **[MODIFY] [schema.prisma](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/prisma/schema.prisma)**: Adição dos modelos `ComercialLead`, `ComercialPacote`, `ComercialProposta`, `ComercialPagamento` e `ComercialConversao`.

---

### 2. 🔌 Adaptadores de Persistência (Repositories)
Implementação dos repositórios concretos Prisma na camada de persistência comercial, com Data Mapper interno para mapear entre os modelos anêmicos de banco e entidades ricas de domínio:
- **[NEW] [PrismaLeadRepository.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/infrastructure/persistence/comercial/PrismaLeadRepository.ts)**: Implementa `ILeadPort`.
- **[NEW] [PrismaPacoteRepository.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/infrastructure/persistence/comercial/PrismaPacoteRepository.ts)**: Implementa `IPacotePort`.
- **[NEW] [PrismaPropostaRepository.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/infrastructure/persistence/comercial/PrismaPropostaRepository.ts)**: Implementa `IPropostaPort`.
- **[NEW] [PrismaPagamentoRepository.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/infrastructure/persistence/comercial/PrismaPagamentoRepository.ts)**: Implementa `IPagamentoPort`.
- **[NEW] [PrismaConversaoRepository.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/src/infrastructure/persistence/comercial/PrismaConversaoRepository.ts)**: Implementa `IConversaoPort`.

---

### 3. 🧪 Suíte de Testes de Integração
Criação de testes robustos de persistência batendo contra o banco PostgreSQL real executado localmente via Docker (conforme verificado ativo na porta 5432):
- **[NEW] [ComercialPersistenciaIntegration.test.ts](file:///Users/marciocau/Downloads/SmartHotel_Zehla/zehla-backend/__tests__/infrastructure/persistence/comercial/ComercialPersistenciaIntegration.test.ts)**: Testa a gravação, atualização, validação RLS e hidratação com 100% de integridade das entidades (`Lead`, `Pacote`, `Proposta`, `Pagamento`, `Conversao`) com checagem Fail-Fast para dados corrompidos.

---

## Verification Plan

### Automated Tests
1. Rodar `npx prisma db push` para aplicar os novos modelos relacionais no banco de dados real local sem perda de dados existentes.
2. Executar os testes de integração reais via Vitest:
   ```bash
   npx vitest run __tests__/infrastructure/persistence/comercial/ComercialPersistenciaIntegration.test.ts
   ```
3. Executar toda a suíte de testes do projeto para garantir zero regressões:
   ```bash
   npx vitest run
   ```
