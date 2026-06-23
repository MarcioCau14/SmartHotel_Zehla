Para implantar essas novas funcionalidades e salvar os dados automaticamente na sua planilha do Google Sheets, você deve integrar um motor de **Enriquecimento de Leads (Email OSINT)** e um rastreador de **Sinais de Intenção**.

Abaixo está o roteiro técnico e os métodos para automatizar essa atualização diretamente na sua ferramenta:

### **1\. Sistema de Verificação de Cadastros (Email OSINT)**

Para saber se o dono da pousada possui conta em sites como Booking, TripAdvisor ou Airbnb usando apenas o e-mail captado, você não precisa de senhas. O método consiste em usar a técnica de **"Account Enumeration"** via API ou bibliotecas Python.

* **Ferramenta recomendada:** **User-Scanner** (mais moderno que o antigo *Holehe*). Ele verifica simultaneamente em mais de 120 plataformas se um e-mail está cadastrado.  
* **Sites Alvo para sua planilha:** Booking.com, TripAdvisor, Airbnb, Expedia e redes sociais (Instagram/Facebook).  
* **Como implantar:** Crie um script que receba o e-mail da sua planilha e retorne Verdadeiro/Falso para cada site. Isso revela onde o lead está investindo tempo e presença digital.

### **2\. Monitoramento de Comportamento de Compra e Atividade**

O comportamento de compra no setor de pousadas é identificado por **sinais de investimento ou urgência**:

* **Scraping de Reviews (Frequência):** Use APIs como as do **Apify** (específicas para TripAdvisor e Booking). Se a pousada recebeu 10 novos reviews nos últimos 15 dias, o comportamento indica "Lead Quente" e alta taxa de ocupação.  
* **Sinais Sociais:** Use ferramentas como **PhantomBuster** para monitorar se o dono da pousada está interagindo em grupos de hotelaria ou comentando em posts de concorrentes.  
* **Dores do Lead:** Uma IA (como o GPT-4o ou Claude 3.5 via API) pode ler as últimas críticas negativas da pousada no Google Maps e categorizar o comportamento de compra: "Lead precisa de reforma (críticas sobre móveis)" ou "Lead precisa de tecnologia (críticas sobre Wi-Fi)".

### **3\. Como salvar automaticamente no Google Sheets (Via Python)**

Como sua ferramenta já entrega os leads em formato Google Sheets, a melhor forma de atualizar é usar a biblioteca **gspread**.

**Lógica de Implementação no seu Código:**

1. **Conexão:** O script abre sua planilha existente via ID ou URL.  
2. **Mapeamento:** O script lê a coluna "e-mail".  
3. **Processamento:** Para cada linha, ele dispara as funções de OSINT (verificar cadastros) e Scrapers (verificar atividade recente).  
4. **Escrita Cirúrgica:** Em vez de criar uma nova planilha, o script usa o comando worksheet.update\_cell(row, col, value) ou append\_row para preencher as novas colunas de comportamento no mesmo arquivo.

### **Sugestão de Novas Colunas para sua Planilha**

Para que sua estratégia de busca de leads seja superior, seu script deve adicionar automaticamente estes campos:

| Nova Coluna | O que ela revela | Fonte de Dados |
| :---- | :---- | :---- |
| **Conta Booking** | Presença em canais de venda | User-Scanner / Holehe |
| **Atividade Digital** | Recência de posts e respostas | Scraper TripAdvisor/Google |
| **Nível de Intenção** | Se está em momento de compra/investimento | IA analisando reviews |
| **Sombra Digital** | Outras contas ligadas ao mesmo dono | Triangulação de e-mail |

### **Próximo Passo Prático**

Para automatizar isso, você precisará configurar uma **Service Account** no Google Cloud Console para dar permissão de escrita ao seu script de busca. Assim, no momento em que a ferramenta termina de captar os dados básicos (Nome, Telefone), ela já "corre" os e-mails nos sites de hotelaria e salva o dossiê completo na sua pasta de download.

