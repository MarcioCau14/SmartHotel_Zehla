/**
 * Função auxiliar para formatar números de forma consistente (server/client)
 * Usa locale fixo 'pt-BR' para evitar erros de hidratação
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR');
}

/**
 * Formata número com separador de milhar (padrão pt-BR)
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

/**
 * Formata número decimal com casas decimais
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}