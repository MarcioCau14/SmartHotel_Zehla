import { Result } from '../../shared/Result'

export interface LeadContactInfoProps {
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  phoneSecondary?: string
  socialMedia?: string
  site?: string
}

export class LeadContactInfo {
  private constructor(
    public readonly name: string,
    public readonly email?: string,
    public readonly phone?: string,
    public readonly whatsapp?: string,
    public readonly phoneSecondary?: string,
    public readonly socialMedia?: string,
    public readonly site?: string
  ) {
    Object.freeze(this)
  }

  static create(props: LeadContactInfoProps): Result<LeadContactInfo, string> {
    if (!props.name || props.name.trim().length < 2) {
      return Result.fail('Nome deve ter no mínimo 2 caracteres')
    }
    const hasPhone = !!props.phone || !!props.whatsapp
    const hasEmail = !!props.email
    if (!hasPhone && !hasEmail) {
      return Result.fail('Pelo menos um contato (telefone, WhatsApp ou e-mail) deve ser fornecido')
    }
    if (props.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.email)) {
      return Result.fail('E-mail inválido')
    }
    if (props.phone && props.phone.replace(/\D/g, '').length < 10) {
      return Result.fail('Telefone deve ter no mínimo 10 dígitos')
    }
    if (props.whatsapp && props.whatsapp.replace(/\D/g, '').length < 10) {
      return Result.fail('WhatsApp deve ter no mínimo 10 dígitos')
    }
    return Result.ok(
      new LeadContactInfo(
        props.name.trim(),
        props.email?.trim(),
        props.phone?.replace(/\D/g, ''),
        props.whatsapp?.replace(/\D/g, ''),
        props.phoneSecondary?.replace(/\D/g, ''),
        props.socialMedia?.trim(),
        props.site?.trim()
      )
    )
  }

  toJSON() {
    return {
      name: this.name,
      email: this.email ? this.email.replace(/.+@.+/, '***@***') : undefined,
      phone: this.phone ? '***' : undefined,
      whatsapp: this.whatsapp ? '***' : undefined,
      phoneSecondary: this.phoneSecondary ? '***' : undefined,
      socialMedia: this.socialMedia,
      site: this.site,
    }
  }
}
