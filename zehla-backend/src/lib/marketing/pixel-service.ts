export class PixelService {
  private static BASE_URL = process.env.NEXTAUTH_URL || 'https://zehla.com.br'

  /**
   * Gera a tag HTML do pixel de rastreamento para ser inserida no final do e-mail.
   */
  static generateTag(leadId: string, campaignId?: string): string {
    const url = `${this.BASE_URL}/api/mkt/track?l=${leadId}${campaignId ? `&c=${campaignId}` : ''}&t=${Date.now()}`
    
    // Usamos um estilo inline para garantir que não ocupe espaço visual
    return `<img src="${url}" width="1" height="1" style="display:none !important; visibility:hidden; opacity:0; border:0;" alt="" />`
  }
}
