import { Result } from '../../shared/Result'

export interface ContactInfoProps {
  phone: string
  whatsapp: string
  email: string
  website?: string
  supplierContact?: string
}

const PHONE_REGEX = /^\+55\d{10,11}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^https?:\/\/.+\..+/

export class ContactInfo {
  private constructor(public readonly props: ContactInfoProps) {
    Object.freeze(this)
  }

  static create(props: ContactInfoProps): Result<ContactInfo, string> {
    if (!PHONE_REGEX.test(props.phone)) {
      return Result.fail('Phone must follow format +55XXXXXXXXXXX (11-12 digits)')
    }
    if (!PHONE_REGEX.test(props.whatsapp)) {
      return Result.fail('WhatsApp must follow format +55XXXXXXXXXXX (11-12 digits)')
    }
    if (!EMAIL_REGEX.test(props.email)) {
      return Result.fail('Invalid email format')
    }
    if (props.website && !URL_REGEX.test(props.website)) {
      return Result.fail('Invalid website URL')
    }
    if (props.supplierContact && (props.supplierContact.length < 3 || props.supplierContact.length > 200)) {
      return Result.fail('Supplier contact must be between 3 and 200 characters')
    }

    return Result.ok(new ContactInfo({
      phone: props.phone,
      whatsapp: props.whatsapp,
      email: props.email.toLowerCase().trim(),
      website: props.website,
      supplierContact: props.supplierContact,
    }))
  }

  static restore(props: ContactInfoProps): ContactInfo {
    return new ContactInfo({ ...props })
  }

  get phone(): string { return this.props.phone }
  get whatsapp(): string { return this.props.whatsapp }
  get email(): string { return this.props.email }
  get website(): string | undefined { return this.props.website }
  get supplierContact(): string | undefined { return this.props.supplierContact }

  equals(other: ContactInfo): boolean {
    return this.props.phone === other.props.phone &&
      this.props.whatsapp === other.props.whatsapp &&
      this.props.email === other.props.email &&
      this.props.website === other.props.website
  }
}
