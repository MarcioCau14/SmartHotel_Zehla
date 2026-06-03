import { Result } from '../../../shared/Result'
import { FollowUpCadence, FOLLOW_UP_INTERVALS_MS, FOLLOW_UP_ORDER } from './FollowUpSchedule'

export interface CadenceClockProps {
  lastInteractionAt: Date
  currentDate: Date
}

export class CadenceClock {
  private constructor(
    public readonly lastInteractionAt: Date,
    public readonly currentDate: Date,
    public readonly triggeredCadence: FollowUpCadence | null,
    public readonly elapsedMs: number,
  ) {
    Object.freeze(this)
  }

  static create(props: CadenceClockProps): Result<CadenceClock, Error> {
    if (!(props.lastInteractionAt instanceof Date) || isNaN(props.lastInteractionAt.getTime())) {
      return Result.fail(new Error('lastInteractionAt deve ser uma data válida'))
    }
    if (!(props.currentDate instanceof Date) || isNaN(props.currentDate.getTime())) {
      return Result.fail(new Error('currentDate deve ser uma data válida'))
    }
    if (props.currentDate < props.lastInteractionAt) {
      return Result.fail(new Error('currentDate não pode ser anterior a lastInteractionAt'))
    }

    const elapsedMs = props.currentDate.getTime() - props.lastInteractionAt.getTime()
    let triggeredCadence: FollowUpCadence | null = null

    for (const cadence of FOLLOW_UP_ORDER) {
      const threshold = FOLLOW_UP_INTERVALS_MS[cadence]
      if (elapsedMs >= threshold) {
        triggeredCadence = cadence
      }
    }

    return Result.ok(new CadenceClock(props.lastInteractionAt, props.currentDate, triggeredCadence, elapsedMs))
  }

  hasTriggered(): boolean {
    return this.triggeredCadence !== null
  }

  get mostAdvancedCadence(): FollowUpCadence | null {
    return this.triggeredCadence
  }
}
