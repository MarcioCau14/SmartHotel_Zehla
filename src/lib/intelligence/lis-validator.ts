export interface ValidatedLead {
  id: string;
  pousadaName: string;
  decisionMaker: string;
  whatsapp: string;
  isValidWA: boolean;
  painType: 'financeiro' | 'operacional' | 'desconhecido';
  qualificationScore: number;
}

export class LISBatchValidator {
  async processBatch(leads: any[]): Promise<ValidatedLead[]> {
    console.log(`🚀 [LIS] Processando ${leads.length} leads (Limite: 300).`);
    const batch = leads.slice(0, 300);
    const validatedLeads: ValidatedLead[] = [];

    for (const lead of batch) {
      try {
        const isValid = await this.validateContact(lead);
        if (!isValid) continue;
        validatedLeads.push(await this.enrichAndIdentifyPain(lead));
      } catch (error) {
        console.error(`[LIS] Erro no lead ${lead.pousadaName || lead.id}:`, (error as any).message);
      }
    }

    console.log(`✅ [LIS] ${validatedLeads.length} leads válidos.`);
    return validatedLeads.sort((a, b) => b.qualificationScore - a.qualificationScore).slice(0, 100);
  }

  private async validateContact(lead: any): Promise<boolean> {
    const email = lead.email || lead.contato_email;
    const whatsapp = lead.whatsapp || lead.telefone || lead.contato_whats;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return false;
    }
    return !!whatsapp;
  }

  private async enrichAndIdentifyPain(lead: any): Promise<ValidatedLead> {
    const content = (lead.notes || lead.description || lead.history || "").toLowerCase();
    let painType: "financeiro" | "operacional" | "desconhecido" = "desconhecido";
    const financeiroKeywords = ["comissão", "taxa", "custo", "pagar", "porcentagem", "booking", "expedia"];
    const operacionalKeywords = ["vazio", "ocupação", "baixa", "reserva", "calendar", "gestão", "planilha"];
    if (financeiroKeywords.some(k => content.includes(k))) painType = "financeiro";
    else if (operacionalKeywords.some(k => content.includes(k))) painType = "operacional";

    let score = lead.score || 50;
    if (painType === "financeiro") score += 30;
    if (painType === "operacional") score += 20;
    if (lead.qtdQuartos > 10) score += 10;

    return {
      id: lead.id || `lead_${Math.random().toString(36).substr(2, 9)}`,
      pousadaName: lead.pousadaName || lead.name || "Pousada Desconhecida",
      decisionMaker: lead.owner || lead.responsavel || "Proprietário",
      whatsapp: lead.whatsapp || lead.telefone || lead.contato_whats,
      isValidWA: true,
      painType,
      qualificationScore: score,
    };
  }
}
