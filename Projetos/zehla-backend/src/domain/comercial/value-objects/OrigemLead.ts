import { Result } from '../../shared/Result'

export type CanalOrigem =
  | 'site'
  | 'whatsapp'
  | 'instagram'
  | 'booking_engine'
  | 'marketplace'
  | 'indicacao'
  | 'presencial'
  | 'email'
  | 'ligacao'

export type TipoSdr =
  | 'sdr1_funis'
  | 'sdr2_social_seller'
  | 'sdr3_hunter'
  | 'sdr4_sales_farmer'
  | 'closer'

export class OrigemLead {
  private constructor(
    public readonly canal: CanalOrigem,
    public readonly custoAquisicao: number,
    public readonly tipoSdrInicial: TipoSdr,
    public readonly utmSource?: string,
    public readonly utmCampaign?: string,
    public readonly utmMedium?: string
  ) {
    Object.freeze(this)
  }

  static criar(canal: string, utmSource?: string, utmCampaign?: string, utmMedium?: string): Result<OrigemLead, Error> {
    const canaisValidos: CanalOrigem[] = [
      'site', 'whatsapp', 'instagram', 'booking_engine',
      'marketplace', 'indicacao', 'presencial', 'email', 'ligacao'
    ]
    const canalLower = canal.trim().toLowerCase() as CanalOrigem
    if (!canaisValidos.includes(canalLower)) {
      return Result.fail(new Error(`ORIGEM_INVALIDA: canal '${canal}' não reconhecido`))
    }
    const { custo, sdrTipo } = this.definirCustoESdr(canalLower)
    return Result.ok(new OrigemLead(canalLower, custo, sdrTipo, utmSource, utmCampaign, utmMedium))
  }

  private static definirCustoESdr(canal: CanalOrigem): { custo: number; sdrTipo: TipoSdr } {
    switch (canal) {
      case 'site':          return { custo: 5, sdrTipo: 'sdr1_funis' }
      case 'whatsapp':      return { custo: 2, sdrTipo: 'sdr1_funis' }
      case 'instagram':     return { custo: 3, sdrTipo: 'sdr2_social_seller' }
      case 'booking_engine':return { custo: 8, sdrTipo: 'sdr1_funis' }
      case 'marketplace':   return { custo: 12, sdrTipo: 'sdr1_funis' }
      case 'indicacao':     return { custo: 0, sdrTipo: 'sdr1_funis' }
      case 'presencial':    return { custo: 0, sdrTipo: 'sdr1_funis' }
      case 'email':         return { custo: 1, sdrTipo: 'sdr1_funis' }
      case 'ligacao':       return { custo: 3, sdrTipo: 'sdr3_hunter' }
    }
  }

  get descricao(): string {
    return `Canal: ${this.canal} | Custo: R$ ${this.custoAquisicao.toFixed(2)} | SDR: ${this.tipoSdrInicial}`
  }
}
