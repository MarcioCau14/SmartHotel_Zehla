import { Result } from '../../shared/Result'

export interface UTMParamsProps {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}

export class UTMParams {
  private constructor(
    public readonly utmSource?: string,
    public readonly utmMedium?: string,
    public readonly utmCampaign?: string,
    public readonly utmContent?: string,
    public readonly utmTerm?: string
  ) {
    Object.freeze(this)
  }

  static create(props: UTMParamsProps = {}): Result<UTMParams, string> {
    return Result.ok(
      new UTMParams(
        props.utmSource,
        props.utmMedium,
        props.utmCampaign,
        props.utmContent,
        props.utmTerm
      )
    )
  }

  toJSON() {
    return {
      utmSource: this.utmSource,
      utmCampaign: this.utmCampaign,
    }
  }
}
