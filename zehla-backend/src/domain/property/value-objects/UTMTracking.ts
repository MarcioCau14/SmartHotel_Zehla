import { Result } from '../../shared/Result'

export interface UTMTrackingProps {
  source?: string
  medium?: string
  campaign?: string
  content?: string
  term?: string
}

export class UTMTracking {
  private constructor(public readonly props: UTMTrackingProps) {
    Object.freeze(this)
  }

  static create(props: UTMTrackingProps): Result<UTMTracking, string> {
    if (props.source !== undefined && props.source.length > 200) {
      return Result.fail('UTM source must not exceed 200 characters')
    }
    if (props.medium !== undefined && props.medium.length > 200) {
      return Result.fail('UTM medium must not exceed 200 characters')
    }
    if (props.campaign !== undefined && props.campaign.length > 200) {
      return Result.fail('UTM campaign must not exceed 200 characters')
    }
    if (props.content !== undefined && props.content.length > 200) {
      return Result.fail('UTM content must not exceed 200 characters')
    }
    if (props.term !== undefined && props.term.length > 200) {
      return Result.fail('UTM term must not exceed 200 characters')
    }

    return Result.ok(new UTMTracking({
      source: props.source,
      medium: props.medium,
      campaign: props.campaign,
      content: props.content,
      term: props.term,
    }))
  }

  static restore(props: UTMTrackingProps): UTMTracking {
    return new UTMTracking({ ...props })
  }

  get source(): string | undefined { return this.props.source }
  get medium(): string | undefined { return this.props.medium }
  get campaign(): string | undefined { return this.props.campaign }
  get content(): string | undefined { return this.props.content }
  get term(): string | undefined { return this.props.term }

  isEmpty(): boolean {
    return !this.props.source && !this.props.medium &&
      !this.props.campaign && !this.props.content && !this.props.term
  }

  equals(other: UTMTracking): boolean {
    return this.props.source === other.props.source &&
      this.props.medium === other.props.medium &&
      this.props.campaign === other.props.campaign &&
      this.props.content === other.props.content &&
      this.props.term === other.props.term
  }
}
