import { encrypt, decrypt } from './encryption';


/**
 * PII_GUARD: O Escudo de Dados Sensíveis do ZEHLA
 * Garante que dados governamentais (FNRH) e PII sejam criptografados at-rest.
 */

const PII_FIELDS = [
  'guestCpf',
  'guestPhone',
  'guestEmail',
  'guestAddress',
  'guestZipCode',
  'guestDistrict',
  'guestCity',
  'guestState',
  'guestBirthDate',
  'fnrhManagerCpf'
];

export const PiiGuard = {
  /**
   * Protege um objeto criptografando seus campos PII.
   */
  protect<T extends Record<string, any>>(data: T): T {
    if (!data) return data;
    const protectedData = { ...data };

    for (const field of PII_FIELDS) {
      if (protectedData[field] && typeof protectedData[field] === 'string') {
        // Evita criptografia dupla se já estiver criptografado (checa formato iv:tag:hex)
        if (!protectedData[field].includes(':')) {
          protectedData[field] = encrypt(protectedData[field]) as any;
        }
      }
    }

    return protectedData;
  },

  /**
   * Revela um objeto descriptografando seus campos PII.
   */
  reveal<T extends Record<string, any>>(data: T): T {
    if (!data) return data;
    const revealedData = { ...data };

    for (const field of PII_FIELDS) {
      if (revealedData[field] && typeof revealedData[field] === 'string') {
        revealedData[field] = decrypt(revealedData[field]) as any;
      }
    }

    return revealedData;
  },

  /**
   * Revela uma lista de objetos.
   */
  revealMany<T extends Record<string, any>>(items: T[]): T[] {
    if (!items || !Array.isArray(items)) return items;
    return items.map(item => this.reveal(item));
  }
};
