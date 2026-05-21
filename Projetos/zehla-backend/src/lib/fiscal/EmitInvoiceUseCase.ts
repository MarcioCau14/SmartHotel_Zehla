import { prisma } from '@/lib/prisma';
import axios from 'axios';

/**
 * Use Case: Emitir Nota Fiscal (NFS-e / NF-e)
 * 
 * Fluxo:
 * 1. Busca TaxProfile da propriedade
 * 2. Valida configurações fiscais
 * 3. Monta payload para provedor (Focus NFe / eNotas)
 * 4. Envia para provedor em ambiente de homologação ou produção
 * 5. Salva FiscalInvoice com status EMITINDO
 * 6. Webhook do provedor atualiza status para EMITIDA
 * 
 * Custo Zero: Ambiente HOMOLOGACAO por padrão (sem custo de emissão)
 */

interface EmitInvoiceInput {
  propertyId: string;
  reservationId?: string;
  tomadorNome: string;
  tomadorCpfCnpj?: string;
  tomadorEmail?: string;
  valorServicos: number;
  descricaoServico: string;
}

interface EmitInvoiceResult {
  success: boolean;
  invoiceId: string;
  status: string;
  message: string;
}

export class EmitInvoiceUseCase {
  async execute(input: EmitInvoiceInput): Promise<EmitInvoiceResult> {
    console.log(`📄 [FISCAL] Iniciando emissão de NF para propriedade ${input.propertyId}`);

    // 1. Buscar perfil fiscal da propriedade
    const taxProfile = await prisma.taxProfile.findUnique({
      where: { propertyId: input.propertyId },
    });

    if (!taxProfile) {
      throw new Error('Perfil fiscal não configurado. Configure o CNPJ e dados da propriedade antes de emitir NF.');
    }

    if (!taxProfile.isActive) {
      throw new Error('Perfil fiscal inativo. Ative o perfil nas configurações fiscais.');
    }

    if (!taxProfile.cnpj || !taxProfile.razaoSocial) {
      throw new Error('CNPJ e Razão Social são obrigatórios para emissão de NF.');
    }

    // 2. Calcular impostos baseado no regime tributário
    const aliquota = this.calcularAliquota(taxProfile.regimeTributario);
    const valorImpostos = input.valorServicos * (aliquota / 100);
    const valorLiquido = input.valorServicos - valorImpostos;

    // 3. Criar registro da nota fiscal
    const invoice = await prisma.fiscalInvoice.create({
      data: {
        propertyId: input.propertyId,
        reservationId: input.reservationId,
        type: taxProfile.tipoNFS,
        status: 'EMITINDO',
        valorServicos: input.valorServicos,
        valorImpostos,
        valorLiquido,
        aliquota,
        tomadorNome: input.tomadorNome,
        tomadorCpfCnpj: input.tomadorCpfCnpj,
        tomadorEmail: input.tomadorEmail,
        provedor: taxProfile.provedorNF,
        ambienteEmissao: taxProfile.ambienteEmissao,
      },
    });

    console.log(`📄 [FISCAL] Nota ${invoice.id} criada com status EMITINDO`);

    // 4. Enviar para provedor fiscal (Focus NFe, eNotas, etc.)
    try {
      const provedorResponse = await this.enviarParaProvedor({
        taxProfile,
        invoice,
        input,
        valorImpostos,
        valorLiquido,
      });

      // 5. Atualizar nota com resposta do provedor
      await prisma.fiscalInvoice.update({
        where: { id: invoice.id },
        data: {
          provedorId: provedorResponse.id,
          provedorResponse: provedorResponse.raw,
        },
      });

      console.log(`✅ [FISCAL] Nota enviada ao provedor com sucesso: ${provedorResponse.id}`);

      return {
        success: true,
        invoiceId: invoice.id,
        status: 'EMITINDO',
        message: 'Nota fiscal enviada ao provedor. Aguardando confirmação via webhook.',
      };

    } catch (error) {
      console.error(`❌ [FISCAL] Erro ao enviar nota ao provedor:`, error);

      await prisma.fiscalInvoice.update({
        where: { id: invoice.id },
        data: {
          status: 'ERRO',
          error: error instanceof Error ? error.message : 'Erro desconhecido ao comunicar com provedor',
        },
      });

      throw error;
    }
  }

  /**
   * Calcula alíquota baseada no regime tributário
   * Valores aproximados para serviços de hospedagem
   */
  private calcularAliquota(regime: string): number {
    switch (regime) {
      case 'SIMPLES_NACIONAL':
        return 6.0; // Anexo III - média para hospedagem
      case 'LUCRO_PRESUMIDO':
        return 14.53; // IRPJ + CSLL + PIS + COFINS + ISS
      case 'LUCRO_REAL':
        return 25.0; // IRPJ + CSLL + PIS + COFINS + ISS
      default:
        return 6.0;
    }
  }

  /**
   * Envia dados para provedor fiscal (Focus NFe como exemplo)
   * Em homologação, simula resposta sem custo
   */
  private async enviarParaProvedor(params: {
    taxProfile: any;
    invoice: any;
    input: EmitInvoiceInput;
    valorImpostos: number;
    valorLiquido: number;
  }): Promise<{ id: string; raw: any }> {
    const { taxProfile, input, valorImpostos } = params;

    // Modo homologação: simula emissão sem custo
    if (taxProfile.ambienteEmissao === 'HOMOLOGACAO') {
      console.log('🧪 [FISCAL] Ambiente de homologação — simulando emissão');
      
      // Simula delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        id: `HOMOLOGACAO-${Date.now()}`,
        raw: {
          status: 'simulado',
          message: 'Emissão simulada em ambiente de homologação',
          ambiente: 'homologacao',
        },
      };
    }

    // Modo produção: envia para provedor real
    if (!taxProfile.chaveAPIProvedor) {
      throw new Error('Chave API do provedor fiscal não configurada.');
    }

    // Integração com Focus NFe (exemplo)
    if (taxProfile.provedorNF === 'focus_nfe') {
      return this.enviarFocusNFe(taxProfile, input, valorImpostos);
    }

    // Integração com eNotas (exemplo)
    if (taxProfile.provedorNF === 'enotas') {
      return this.enviarENotas(taxProfile, input, valorImpostos);
    }

    throw new Error(`Provedor fiscal não suportado: ${taxProfile.provedorNF}`);
  }

  /**
   * Integração com Focus NFe
   * Docs: https://focusnfe.com.br/docs/
   */
  private async enviarFocusNFe(
    taxProfile: any,
    input: EmitInvoiceInput,
    valorImpostos: number
  ): Promise<{ id: string; raw: any }> {
    const baseUrl = 'https://api.focusnfe.com.br/v2/nfse';
    
    const payload = {
      tomador_cnpj: input.tomadorCpfCnpj,
      tomador_nome: input.tomadorNome,
      tomador_email: input.tomadorEmail,
      valor_servicos: input.valorServicos.toFixed(2),
      valor_deducoes: '0.00',
      base_calculo: input.valorServicos.toFixed(2),
      aliquota: taxProfile.aliquota || '6.00',
      valor_iss: valorImpostos.toFixed(2),
      descricao: input.descricaoServico,
      codigo_servico: taxProfile.codigoAtividade || '9201-1/00',
    };

    const response = await axios.post(baseUrl, payload, {
      auth: {
        username: taxProfile.chaveAPIProvedor,
        password: '',
      },
      params: { teste: taxProfile.ambienteEmissao === 'HOMOLOGACAO' ? '1' : '0' },
    });

    return {
      id: response.data.numero || response.data.id,
      raw: response.data,
    };
  }

  /**
   * Integração com eNotas
   * Docs: https://api.enotasgw.com.br/docs/
   */
  private async enviarENotas(
    taxProfile: any,
    input: EmitInvoiceInput,
    valorImpostos: number
  ): Promise<{ id: string; raw: any }> {
    const baseUrl = 'https://api.enotasgw.com.br/api/v1/empresas/{cnpj}/nfes';
    
    const payload = {
      tomador: {
        nome: input.tomadorNome,
        cpfCnpj: input.tomadorCpfCnpj,
        email: input.tomadorEmail,
      },
      servico: {
        valorServicos: input.valorServicos,
        valorImpostos: valorImpostos,
        aliquota: taxProfile.aliquota || 6.0,
        descricao: input.descricaoServico,
        codigoServico: taxProfile.codigoAtividade || '9201-1/00',
      },
    };

    const response = await axios.post(
      baseUrl.replace('{cnpj}', taxProfile.cnpj),
      payload,
      {
        headers: { 'Authorization': `Bearer ${taxProfile.chaveAPIProvedor}` },
      }
    );

    return {
      id: response.data.id,
      raw: response.data,
    };
  }
}

/**
 * Use Case: Cancelar Nota Fiscal
 */
export class CancelInvoiceUseCase {
  async execute(invoiceId: string, motivo: string): Promise<void> {
    console.log(`🚫 [FISCAL] Cancelando nota ${invoiceId}`);

    const invoice = await prisma.fiscalInvoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new Error('Nota fiscal não encontrada.');
    }

    if (invoice.status !== 'EMITIDA' && invoice.status !== 'HOMOLOGADA') {
      throw new Error(`Não é possível cancelar nota com status: ${invoice.status}`);
    }

    // Atualizar status local
    await prisma.fiscalInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'CANCELADA',
        canceladoEm: new Date(),
        motivoCancelamento: motivo,
      },
    });

    // Enviar cancelamento ao provedor (se produção)
    if (invoice.provedor && invoice.provedorId) {
      await this.cancelarNoProvedor(invoice, motivo);
    }

    console.log(`✅ [FISCAL] Nota ${invoiceId} cancelada com sucesso`);
  }

  private async cancelarNoProvedor(invoice: any, motivo: string): Promise<void> {
    // Implementar cancelamento via API do provedor
    console.log(`📡 [FISCAL] Enviando cancelamento ao provedor ${invoice.provedor}`);
  }
}
