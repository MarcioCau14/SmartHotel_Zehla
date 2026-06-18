# PLAYBOOK COMERCIAL: ZÉLLA, O CONSULTOR DE NEGÓCIOS
*(Adaptado do Método Full Sales System para o Ecossistema Hoteleiro e Arquitetura ZAOS)*

> **CORREÇÃO DE ROTA (Diretriz Arquitetural)**: O Zélla não é um "vendedor de quartos chato" que tenta fechar vendas a cada "Bom dia" do hóspede no WhatsApp. O Zélla é o **Cérebro Inteligente da Pousada**. O conhecimento comercial deste Playbook será utilizado de duas formas maestrais:
> 1. **Classificação de Intenção (Silenciosa):** Saber diferenciar instantaneamente um hóspede recorrente pedindo uma toalha de um novo lead interessado em reservas, roteando a conversa para o comportamento correto (Suporte vs Vendas).
> 2. **Consultoria Ativa para o Dono da Pousada (ZCC Dashboard):** A inteligência Full Sales System será usada pelo Zélla para analisar os dados da pousada e dar "Dicas e Estratégias" proativas para o nosso cliente (o dono), ajudando-o a faturar mais.

---

## 1. O Cérebro Analítico (Consultor do Dono da Pousada)
O ZEHLA entende que uma diária é apenas um dos produtos. A IA é treinada para realizar análise e sugerir Upsell e Cross-Sell mapeando a escada de valor da pousada, alertando o dono via Dashboard:

- **Isca (Entrada):** Zélla sugere ao dono oferecer E-books do destino turístico ou early check-in.
- **Front-End (Primeira Venda):** Diária Padrão ou Pacote Fim de Semana básico.
- **Back-End (Core Product / Maior Lucro):** Zélla identifica baixa ocupação no futuro e sugere ao dono a criação de Pacotes de Feriado Prolongado.
- **High-End (Tickets Altíssimos):** Sugere fechamento da pousada para casamentos na baixa temporada.

---

## 2. A Inteligência de Triagem (Hóspede Final)
Quando um hóspede entra em contato pelo WhatsApp, o Zélla usa a inteligência de Vendas não para empurrar produto, mas para ler o contexto:

### 2.1. Triagem e Onboarding (Setup do Cliente)
Durante o cadastro da pousada no sistema, o Cérebro Zélla faz perguntas-chave ao dono (ICP da pousada, ticket médio, principais atrações). Isso cria o contexto vetorial (`pgvector`) para aquela pousada específica.

### 2.2. Intent Classifier (O Filtro de Ouro)
- Se o hóspede diz: *"A que horas é o café da manhã?"* -> O Zélla usa a rota de **Suporte** e entrega a resposta amigavelmente. Nenhuma tentativa de venda é forçada.
- Se o hóspede diz: *"Quero ver os valores para o feriado"* -> O Zélla aciona a rota de **Vendas (Setter/Closer)**. Somente aqui ele aplica a condução de vendas, qualificação e ancogarem aprendida no Playbook Comercial.

---

## 3. Consultoria Comercial no ZCC (Zehla Command Center)
O valor real do conhecimento comercial é repassado ao dono da pousada. O ZEHLA:
- Analisa a Taxa de Agendamento/Conversão no Dashboard do dono.
- Avisa o dono: *"Sua taxa de conversão está em 12%. O ideal no nosso Playbook é acima de 20%. Sugiro adicionarmos um 'Bônus de Decisão Imediata' nas suas ofertas."*
- O Cérebro ZAOS não empurra quartos; ele constrói valor em escala educando os milhares de donos de pousadas no Brasil.
