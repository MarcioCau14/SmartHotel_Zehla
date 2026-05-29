import { Result } from '../../shared/Result'
import { SubagentProfile } from './SubagentProfile'

export type SubagentStatus = 'idle' | 'working' | 'done' | 'failed'

export interface SubagentResult {
  taskId: string
  data: Record<string, unknown>
  evidence: string
  completedAt: Date
}

export interface SubagentData {
  id: string
  profile: SubagentProfile
  goalId: string
  taskDescription: string
  status: SubagentStatus
  result: SubagentResult | null
  failureReason: string | null
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
}

export class Subagent {
  private constructor(private data: SubagentData) {}

  static create(props: {
    id: string
    profile: SubagentProfile
    goalId: string
    taskDescription: string
  }): Result<Subagent, string> {
    if (!props.id) return Result.fail('Subagent ID is required')
    if (!props.goalId) return Result.fail('Goal ID is required')
    if (!props.taskDescription || props.taskDescription.trim().length === 0) {
      return Result.fail('Task description is required')
    }

    return Result.ok(new Subagent({
      id: props.id,
      profile: props.profile,
      goalId: props.goalId,
      taskDescription: props.taskDescription.trim(),
      status: 'idle',
      result: null,
      failureReason: null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
    }))
  }

  get id(): string { return this.data.id }
  get profile(): SubagentProfile { return this.data.profile }
  get goalId(): string { return this.data.goalId }
  get taskDescription(): string { return this.data.taskDescription }
  get status(): SubagentStatus { return this.data.status }
  get result(): SubagentResult | null { return this.data.result }
  get failureReason(): string | null { return this.data.failureReason }
  get startedAt(): Date | null { return this.data.startedAt }
  get completedAt(): Date | null { return this.data.completedAt }
  get createdAt(): Date { return this.data.createdAt }

  start(): Result<void, string> {
    if (this.data.status !== 'idle') {
      return Result.fail(`Cannot start subagent from status ${this.data.status}`)
    }
    this.data.status = 'working'
    this.data.startedAt = new Date()
    return Result.ok(undefined)
  }

  complete(result: SubagentResult): Result<void, string> {
    if (this.data.status !== 'working') {
      return Result.fail(`Cannot complete subagent from status ${this.data.status}`)
    }
    this.data.status = 'done'
    this.data.result = result
    this.data.completedAt = new Date()
    return Result.ok(undefined)
  }

  fail(reason: string): Result<void, string> {
    if (this.data.status !== 'working') {
      return Result.fail(`Cannot fail subagent from status ${this.data.status}`)
    }
    if (!reason || reason.trim().length === 0) {
      return Result.fail('Failure reason is required')
    }
    this.data.status = 'failed'
    this.data.failureReason = reason.trim()
    this.data.completedAt = new Date()
    return Result.ok(undefined)
  }

  isFinished(): boolean {
    return this.data.status === 'done' || this.data.status === 'failed'
  }
}
