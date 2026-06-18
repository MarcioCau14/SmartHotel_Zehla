# SPEC_DOMINIO_ZEHLA.md
## Blueprint de Domínio - Clean Architecture & DDD

### A. Entidades de Domínio e Value Objects (Modelos Ricos)
O núcleo da aplicação. Não possuem dependência de Prisma, Next.js ou React.

*   **Pousada (Aggregate Root)**
    *   *Atributos:* ID, Nome, Slug, Contatos (WhatsApp, Instagram), Localização, Quartos.
    *   *Invariantes:* Uma Pousada deve ter pelo menos um canal de contato válido. O Slug deve ser único e formatado corretamente.
    *   *Comportamento:* `adicionarQuarto()`, `atualizarContatos()`.
*   **Lead (Entity)**
    *   *Atributos:* ID, Origem (Tracking), Pontuação de Funil, Status.
    *   *Invariantes:* Todo Lead deve possuir uma origem rastreável.
    *   *Comportamento:* `qualificar()`, `converterParaReserva()`.
*   **Plano (Value Object)**
    *   *Atributos:* Tipo (FREE, LITE, PRO, MAX), Valor, Limite de Quartos.
    *   *Comportamento:* `isTaxaZero()`, `podeFazerUpgrade(novoPlano)`.
*   **Comissao (Value Object)**
    *   *Atributos:* Percentual, ValorBase.
    *   *Invariantes:* Percentual não pode ser negativo. Se Plano for LITE, PRO ou MAX, percentual = 0%. Se Plano for FREE, percentual = 5%.
    *   *Comportamento:* `calcularValorFinal()`.
*   **Reserva (Entity)**
    *   *Atributos:* ID, Pousada, Lead, DataInicio, DataFim, ValorTotal.
    *   *Comportamento:* `confirmarReserva()`, `aplicarComissao()`.
*   **PerfilPousada (Aggregate)**
    *   *Atributos:* PousadaID, Links (Linktree), Fotos, Configurações de Tema.

### B. Casos de Uso (Application Services)
A orquestração do domínio. Recebem inputs, aplicam as regras usando entidades e retornam outputs.

1.  **CriarPerfilPousada**
    *   *Input:* Dados da pousada e plano desejado.
    *   *Regras:* Valida o slug, aplica a configuração inicial de links, define comissão baseada no plano.
2.  **CalcularComissao**
    *   *Input:* Lead, ValorReserva, Plano.
    *   *Output:* Valor monetário da comissão.
    *   *Regras:* Executado de forma isolada; invoca o Value Object `Comissao`.
3.  **RecomendarPlano**
    *   *Input:* Gaps competitivos e tamanho da pousada (quartos).
    *   *Output:* Plano ideal.
    *   *Regras:* Pousadas < 5 quartos = Lite. Pousadas com gaps de automação = Pro/Max.
4.  **RegistrarLead**
    *   *Input:* Origem e dados de contato.
    *   *Output:* Lead classificado.
5.  **RegistrarReservaViaWhatsApp**
    *   *Regras:* Integração com API de WhatsApp, mudança de status de Lead, geração de comissão se aplicável.

### C. Portas (Interfaces de Adaptação)
Contratos que definem o que os Casos de Uso precisam do mundo externo.

*   `PousadaRepository`: `salvar(Pousada)`, `buscarPorSlug(slug)`
*   `LeadRepository`: `registrar(Lead)`
*   `ReservaRepository`: `salvar(Reserva)`
*   `WhatsAppNotifier`: `enviarMensagem(numero, conteudo)`

### D. Adaptadores (Implementações Concretas)
A infraestrutura que obedece aos contratos (Portas).

*   **PrismaPousadaRepository:** Implementa `PousadaRepository` usando o Prisma Client.
*   **NextApiController:** Controladores em `app/api/` que recebem o Request, mapeiam para DTOs, invocam os Casos de Uso e retornam JSON.
*   **ZehlaReactComponents:** Apenas renderizam estados e despacham ações (ex: cliques em botões) que chamam APIs. Não contém regras de cálculo.
