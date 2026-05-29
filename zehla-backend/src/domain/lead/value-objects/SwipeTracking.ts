import { Result } from '../../shared/Result'

export interface SwipeTrackingProps {
  lastSwipeAction?: string
  lastSwipeUsedId?: string
  swipeUsageIds?: string[]
}

export class SwipeTracking {
  private constructor(
    public readonly lastSwipeAction?: string,
    public readonly lastSwipeUsedId?: string,
    public readonly swipeUsageIds: string[] = []
  ) {
    Object.freeze(this)
  }

  static create(props: SwipeTrackingProps = {}): Result<SwipeTracking, string> {
    return Result.ok(
      new SwipeTracking(
        props.lastSwipeAction,
        props.lastSwipeUsedId,
        props.swipeUsageIds ?? []
      )
    )
  }

  recordUsage(swipeId: string, action: string): SwipeTracking {
    return new SwipeTracking(action, swipeId, [...this.swipeUsageIds, swipeId])
  }

  toJSON() {
    return {
      lastSwipeAction: this.lastSwipeAction,
      lastSwipeUsedId: this.lastSwipeUsedId,
      swipeCount: this.swipeUsageIds.length,
    }
  }
}
