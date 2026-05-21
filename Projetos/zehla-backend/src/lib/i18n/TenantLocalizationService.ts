/**
 * TenantLocalizationService
 * 
 * Serviço utilitário isolado para formatação de moeda, data e números
 * baseado nas configurações de locale, currency e timezone do tenant.
 * 
 * Princípios:
 * 1. Banco de dados: sempre salva valores como Float (BRL) e datas em UTC
 * 2. Formatação: só acontece na camada de apresentação ou geração de relatórios
 * 3. Intl API nativa do JavaScript — sem dependências externas
 * 
 * Uso:
 *   TenantLocalizationService.formatCurrency(150.50, 'BRL', 'pt-BR') → "R$ 150,50"
 *   TenantLocalizationService.formatCurrency(150.50, 'EUR', 'es-ES') → "150,50 €"
 *   TenantLocalizationService.formatDateTime(new Date(), 'America/Sao_Paulo', 'pt-BR') → "21/05/2026, 14:30"
 */

export type SupportedLocale = 'pt-BR' | 'pt-PT' | 'es-ES' | 'en-US';
export type SupportedCurrency = 'BRL' | 'EUR' | 'USD' | 'ARS' | 'CLP' | 'COP' | 'MXN';

export class TenantLocalizationService {
  /**
   * Formata valor monetário para a moeda e idioma do tenant
   * 
   * @param amount Valor em unidades (ex: 150.50 = R$ 150,50)
   * @param currencyCode Código da moeda (BRL, EUR, USD, etc.)
   * @param locale Código do idioma (pt-BR, es-ES, en-US)
   * @returns String formatada
   * 
   * Exemplos:
   *   150.50, BRL, pt-BR → "R$ 150,50"
   *   150.50, EUR, es-ES → "150,50 €"
   *   150.50, USD, en-US → "$150.50"
   */
  static formatCurrency(
    amount: number,
    currencyCode: string = 'BRL',
    locale: string = 'pt-BR'
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Formata data/hora UTC para o fuso horário e idioma do tenant
   * 
   * @param utcDate Data em UTC
   * @param timezone Fuso horário IANA (ex: America/Sao_Paulo, Europe/Madrid)
   * @param locale Código do idioma
   * @returns String formatada
   * 
   * Exemplos:
   *   Date, America/Sao_Paulo, pt-BR → "21/05/2026, 14:30"
   *   Date, Europe/Madrid, es-ES → "21/5/2026, 14:30"
   */
  static formatDateTime(
    utcDate: Date,
    timezone: string = 'America/Sao_Paulo',
    locale: string = 'pt-BR'
  ): string {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(utcDate);
  }

  /**
   * Formata apenas a data (sem hora)
   */
  static formatDate(
    utcDate: Date,
    timezone: string = 'America/Sao_Paulo',
    locale: string = 'pt-BR'
  ): string {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeZone: timezone,
    }).format(utcDate);
  }

  /**
   * Formata apenas a hora (sem data)
   */
  static formatTime(
    utcDate: Date,
    timezone: string = 'America/Sao_Paulo',
    locale: string = 'pt-BR'
  ): string {
    return new Intl.DateTimeFormat(locale, {
      timeStyle: 'short',
      timeZone: timezone,
    }).format(utcDate);
  }

  /**
   * Formata número genérico (quantidade, porcentagem, etc.)
   */
  static formatNumber(
    value: number,
    locale: string = 'pt-BR',
    options?: Intl.NumberFormatOptions
  ): string {
    return new Intl.NumberFormat(locale, options).format(value);
  }

  /**
   * Formata porcentagem
   */
  static formatPercentage(
    value: number,
    locale: string = 'pt-BR',
    decimals: number = 1
  ): string {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }

  /**
   * Converte data local do tenant para UTC (para salvar no banco)
   * 
   * @param localDateStr Data no formato YYYY-MM-DD HH:mm
   * @param timezone Fuso horário IANA do tenant
   * @returns Date em UTC
   */
  static localToUTC(localDateStr: string, timezone: string = 'America/Sao_Paulo'): Date {
    // Usa Intl para obter o offset do timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0';

    // Cria data no timezone do tenant e converte para UTC
    const localDate = new Date(localDateStr);
    const tzDate = new Date(localDate.toLocaleString('en-US', { timeZone: timezone }));
    const offset = tzDate.getTime() - localDate.getTime();
    
    return new Date(localDate.getTime() - offset);
  }

  /**
   * Retorna o símbolo da moeda
   */
  static getCurrencySymbol(currencyCode: string = 'BRL', locale: string = 'pt-BR'): string {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    // Extrai o símbolo do formato
    const parts = formatter.formatToParts(0);
    const currencyPart = parts.find(p => p.type === 'currency');
    return currencyPart?.value || currencyCode;
  }

  /**
   * Formata um objeto de reserva completo para exibição
   */
  static formatReservation(
    reservation: {
      checkIn: Date;
      checkOut: Date;
      totalAmount: number;
      nights: number;
    },
    currencyCode: string,
    locale: string,
    timezone: string
  ) {
    return {
      checkIn: this.formatDateTime(reservation.checkIn, timezone, locale),
      checkOut: this.formatDateTime(reservation.checkOut, timezone, locale),
      totalAmount: this.formatCurrency(reservation.totalAmount, currencyCode, locale),
      perNight: this.formatCurrency(reservation.totalAmount / Math.max(reservation.nights, 1), currencyCode, locale),
      nights: reservation.nights,
    };
  }
}
