import { Result } from '../../shared/Result'
import { TransactionType } from '../enums'

export class TransactionReference {
  private constructor(
    public readonly externalId: string,
    public readonly internalId: string,
    public readonly type: TransactionType
  ) {
    Object.freeze(this)
  }

  static create(props: {
    externalId: string
    internalId: string
    type: TransactionType
  }): Result<TransactionReference, string> {
    if (!props.externalId || props.externalId.trim().length === 0) {
      return Result.fail('External ID is required')
    }
    if (!props.internalId || props.internalId.trim().length === 0) {
      return Result.fail('Internal ID is required')
    }
    return Result.ok(new TransactionReference(props.externalId.trim(), props.internalId.trim(), props.type))
  }
}
