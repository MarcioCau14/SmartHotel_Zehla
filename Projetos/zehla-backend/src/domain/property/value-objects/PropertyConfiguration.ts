import { Result } from '../../shared/Result'
import { WhatsappChannelType } from '../enums'
import { OperationalWindow, OperationalWindowProps } from './OperationalWindow'
import { ISO_4217_CURRENCIES, RFC_5646_LOCALES, IANA_TIMEZONES } from '../enums'

export interface PropertyConfigurationProps {
  operationalWindow: OperationalWindow
  currencyCode: string
  locale: string
  timezone: string
  whatsappChannelType: WhatsappChannelType
}

export class PropertyConfiguration {
  private constructor(public readonly props: PropertyConfigurationProps) {
    Object.freeze(this)
  }

  static create(
    overrides?: Partial<{
      operationalWindow: OperationalWindow
      currencyCode: string
      locale: string
      timezone: string
      whatsappChannelType: WhatsappChannelType
    }>
  ): Result<PropertyConfiguration, string> {
    const opWindowResult = overrides?.operationalWindow
      ? Result.ok(overrides.operationalWindow)
      : OperationalWindow.create({})
    if (opWindowResult.isFail) return Result.fail(opWindowResult.error)

    const currencyCode = overrides?.currencyCode ?? 'BRL'
    if (!ISO_4217_CURRENCIES.includes(currencyCode.toUpperCase())) {
      return Result.fail('Invalid ISO 4217 currency code')
    }

    const locale = overrides?.locale ?? 'pt-BR'
    if (!RFC_5646_LOCALES.includes(locale)) {
      return Result.fail('Invalid RFC 5646 locale')
    }

    const timezone = overrides?.timezone ?? 'America/Sao_Paulo'
    if (!IANA_TIMEZONES.includes(timezone)) {
      return Result.fail('Invalid IANA timezone')
    }

    const whatsappChannelType = overrides?.whatsappChannelType ?? WhatsappChannelType.GUESTS_ONLY

    return Result.ok(new PropertyConfiguration({
      operationalWindow: opWindowResult.value,
      currencyCode: currencyCode.toUpperCase(),
      locale,
      timezone,
      whatsappChannelType,
    }))
  }

  static restore(props: PropertyConfigurationProps): PropertyConfiguration {
    return new PropertyConfiguration({ ...props })
  }

  get operationalWindow(): OperationalWindow { return this.props.operationalWindow }
  get currencyCode(): string { return this.props.currencyCode }
  get locale(): string { return this.props.locale }
  get timezone(): string { return this.props.timezone }
  get whatsappChannelType(): WhatsappChannelType { return this.props.whatsappChannelType }

  update(props: Partial<PropertyConfigurationProps>): Result<PropertyConfiguration, string> {
    return PropertyConfiguration.create({
      operationalWindow: props.operationalWindow ?? this.props.operationalWindow,
      currencyCode: props.currencyCode ?? this.props.currencyCode,
      locale: props.locale ?? this.props.locale,
      timezone: props.timezone ?? this.props.timezone,
      whatsappChannelType: props.whatsappChannelType ?? this.props.whatsappChannelType,
    })
  }

  equals(other: PropertyConfiguration): boolean {
    return this.props.operationalWindow.equals(other.props.operationalWindow) &&
      this.props.currencyCode === other.props.currencyCode &&
      this.props.locale === other.props.locale &&
      this.props.timezone === other.props.timezone &&
      this.props.whatsappChannelType === other.props.whatsappChannelType
  }
}
