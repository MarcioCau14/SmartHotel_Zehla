/**
 * ZMG Content Transformer
 * Transforma templates mestres em conteúdo específico para cada canal
 */

export class ZMGContentTransformer {
  /**
   * Substitui variáveis {{NOME}} no conteúdo
   */
  static transform(content: string, variables: Record<string, string>): string {
    let transformed = content;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key.toUpperCase()}}}`;
      transformed = transformed.replace(new RegExp(placeholder, 'g'), value);
    }

    return transformed;
  }

  /**
   * Adapta o conteúdo para o canal específico (ex: adiciona emojis para WA, remove para SMS)
   */
  static adaptForChannel(content: string, channel: string): string {
    switch (channel) {
      case 'sms':
        // Remove emojis e caracteres especiais pesados para SMS
        return content.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').trim();
      
      case 'email':
        // Envolve em um template HTML básico (Mock)
        return `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #FF5500;">ZEHLA SmartHotel</h2>
            <p>${content.replace(/\n/g, '<br>')}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <small style="color: #888;">Esta é uma mensagem automática enviada via ZMG.</small>
          </div>
        `;

      default:
        return content;
    }
  }
}
