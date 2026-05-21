import ptBR from '@/i18n/dictionaries/pt-BR.json';
import esES from '@/i18n/dictionaries/es-ES.json';
import enUS from '@/i18n/dictionaries/en-US.json';

/**
 * Serviço de Internacionalização (i18n) do ZEHLA
 * 
 * Suporta: pt-BR, es-ES, en-US (e extensível para mais idiomas)
 * 
 * Uso no Dashboard (Client Components):
 *   const t = useI18n(property.locale);
 *   t('dashboard.title') → "Painel" | "Panel" | "Dashboard"
 * 
 * Uso em Server Components / API Routes:
 *   const t = getI18n('pt-BR');
 *   t('common.save') → "Salvar"
 */

export type SupportedLocale = 'pt-BR' | 'es-ES' | 'en-US';
export type SupportedCurrency = 'BRL' | 'EUR' | 'USD' | 'ARS' | 'CLP' | 'COP' | 'MXN';

const dictionaries: Record<SupportedLocale, any> = {
  'pt-BR': ptBR,
  'es-ES': esES,
  'en-US': enUS,
};

/**
 * Obtém função de tradução para um locale específico
 */
export function getI18n(locale: SupportedLocale = 'pt-BR') {
  const dict = dictionaries[locale] || dictionaries['pt-BR'];

  return (key: string): string => {
    const keys = key.split('.');
    let value: any = dict;
    for (const k of keys) {
      if (value === undefined || value === null) return key;
      value = value[k];
    }
    return value || key;
  };
}

/**
 * Hook para Client Components
 * Uso: const t = useI18n(locale);
 */
export function useI18n(locale: SupportedLocale = 'pt-BR') {
  return getI18n(locale);
}

/**
 * Lista de locales suportados
 */
export const SUPPORTED_LOCALES: { code: SupportedLocale; label: string; flag: string }[] = [
  { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'es-ES', label: 'Español (España)', flag: '🇪🇸' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
];

/**
 * Lista de moedas suportadas
 */
export const SUPPORTED_CURRENCIES: { code: SupportedCurrency; symbol: string; label: string }[] = [
  { code: 'BRL', symbol: 'R$', label: 'Real Brasileiro' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'Dólar Americano' },
  { code: 'ARS', symbol: 'ARS$', label: 'Peso Argentino' },
  { code: 'CLP', symbol: 'CLP$', label: 'Peso Chileno' },
  { code: 'COP', symbol: 'COP$', label: 'Peso Colombiano' },
  { code: 'MXN', symbol: 'MX$', label: 'Peso Mexicano' },
];
