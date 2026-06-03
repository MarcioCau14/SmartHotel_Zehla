import { Result } from '../../../shared/Result'
import { FollowUpCadence } from './FollowUpSchedule'

export interface FollowUpActionProps {
  leadId: string
  scheduleType: FollowUpCadence
}

export class FollowUpAction {
  private constructor(
    public readonly leadId: string,
    public readonly scheduleType: FollowUpCadence,
    public readonly isExecuted: boolean,
    public readonly executedAt: Date | null,
    public readonly createdAt: Date,
  ) {
    Object.freeze(this)
  }

  static create(props: FollowUpActionProps): Result<FollowUpAction, Error> {
    if (!props.leadId || props.leadId.trim().length === 0) {
      return Result.fail(new Error('leadId é obrigatório'))
    }
    if (!props.scheduleType) {
      return Result.fail(new Error('scheduleType é obrigatório'))
    }

    return Result.ok(
      new FollowUpAction(props.leadId.trim(), props.scheduleType, false, null, new Date()),
    )
  }

  executar(): Result<FollowUpAction, Error> {
    if (this.isExecuted) {
      return Result.fail(new Error('Follow-up action já foi executada'))
    }
    return Result.ok(
      new FollowUpAction(this.leadId, this.scheduleType, true, new Date(), this.createdAt),
    )
  }
}
