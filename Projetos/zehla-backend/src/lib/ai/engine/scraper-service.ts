import { chromium, Browser, Page } from 'playwright';

import { llmRouter } from '../llm-router';


export interface ScrapedLeadData {
  pousadaName?: string;
  email?: string;
  whatsapp?: string;
  roomsCount?: number;
  location?: string;
  city?: string;
  state?: string;
  estimatedValues?: string;
  qualification?: string;
  socialMedia?: string;
  website?: string;
  buyingBehavior?: string;
  intentSignals?: string;
}

export class ScraperService {
  private browser: Browser | null = null;

  private async getBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  /**
   * Executa uma raspagem profunda em uma URL para extrair dados da pousada.
   */
  async deepScrape(url: string): Promise<ScrapedLeadData> {
    const browser = await this.getBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    try {
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Captura o conteúdo relevante
      const content = await page.evaluate(() => {
        // Remove scripts e styles para diminuir o tamanho do HTML enviado ao LLM
        const scripts = document.querySelectorAll('script, style, noscript, iframe');
        scripts.forEach(s => s.remove());
        return document.body.innerText;
      });

      await context.close();

      // Envia o conteúdo ao LLM para extração estruturada
      return await this.extractDataFromText(content, url);
    } catch (error) {
      console.error(`❌ [Scraper 2.0] Erro ao raspar ${url}:`, error);
      await context.close();
      return {};
    }
  }

  private async extractDataFromText(text: string, sourceUrl: string): Promise<ScrapedLeadData> {
    const systemPrompt = `
      Você é o motor de extração da Secretaria-IA (ZEHLA). 
      Sua tarefa é analisar o texto de um site de pousada e extrair dados para o nosso CRM de 18 colunas.
      
      Retorne um JSON estritamente com estes campos:
      - pousadaName: Nome do estabelecimento.
      - email: E-mail de contato detectado.
      - whatsapp: WhatsApp de contato (formatado: 55...).
      - roomsCount: Quantidade estimada de quartos/unidades (se mencionado).
      - location: Descrição da localização (ex: "Frente ao mar", "No centro").
      - city: Cidade.
      - state: Estado (UF).
      - estimatedValues: Faixa de preço (se houver).
      - qualification: Breve descrição estética/nível (ex: "Boutique de Luxo", "Pousada Simples").
      - socialMedia: Link do Instagram/Facebook.
      - buyingBehavior: Perfil de compra (ex: "Tecnológico", "Tradicional", "Resistente").
      - intentSignals: Qualquer sinal de que eles precisam de automação (ex: "Chat manual", "Sem motor de reserva").

      TEXTO DO SITE:
      ${text.substring(0, 10000)}
      
      RETORNE APENAS O JSON.
    `;

    const response = await llmRouter.generate({
      model: 'general',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extraia os dados da pousada do site: ${sourceUrl}` }
      ],
      temperature: 0.1,
    });

    try {
      const jsonContent = response.content.replace(/```json|```/g, '').trim();
      const data = JSON.parse(jsonContent);
      return { ...data, website: sourceUrl };
    } catch (e) {
      console.error('❌ [Scraper 2.0] Falha no parsing do LLM:', response.content);
      return { website: sourceUrl };
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const scraperService = new ScraperService();
