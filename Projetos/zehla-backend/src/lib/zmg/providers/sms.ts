/**
 * ZMG SMS Provider
 * Integrates with Z-API (Flat rate) and Twilio (Enterprise)
 */

export interface SMSResponse {
  success: boolean;
  externalId?: string;
  error?: string;
}

export class SMSProvider {
  static async send(phone: string, text: string): Promise<SMSResponse> {
    try {
      // TODO: Implementar chamada real para Z-API (instância de SMS)
      // O ZMG Blueprint recomenda Z-API pelo custo fixo mensal (ilimitado)
      
      
      
      // Simulação de sucesso
      return { 
        success: true, 
        externalId: 'zapi-sms-' + Date.now() 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
