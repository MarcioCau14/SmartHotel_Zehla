import { Result } from '../../shared/Result'
import { SubagentProfile } from '../entities/SubagentProfile'
import { Subagent, SubagentResult } from '../entities/Subagent'

export interface SwarmStatus {
  totalSubagents: number
  idle: number
  working: number
  done: number
  failed: number
}

export class SwarmCoordinator {
  private readonly subagents: Map<string, Subagent> = new Map()

  spawnSubagent(
    profile: SubagentProfile,
    goalId: string,
    taskDescription: string
  ): Result<Subagent, string> {
    const id = `agent-${profile.role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

    const createResult = Subagent.create({
      id,
      profile,
      goalId,
      taskDescription,
    })
    if (createResult.isFail) return Result.fail(createResult.error)

    this.subagents.set(id, createResult.value)
    return Result.ok(createResult.value)
  }

  assignTask(subagentId: string, task: SubagentResult): Result<void, string> {
    const agent = this.subagents.get(subagentId)
    if (!agent) return Result.fail(`Subagent ${subagentId} not found`)

    const startResult = agent.start()
    if (startResult.isFail) return Result.fail(startResult.error as string)

    return agent.complete(task)
  }

  failSubagent(subagentId: string, reason: string): Result<void, string> {
    const agent = this.subagents.get(subagentId)
    if (!agent) return Result.fail(`Subagent ${subagentId} not found`)
    return agent.fail(reason)
  }

  getSubagent(subagentId: string): Subagent | undefined {
    return this.subagents.get(subagentId)
  }

  getActiveSubagents(): Subagent[] {
    return Array.from(this.subagents.values())
  }

  getSubagentsByGoal(goalId: string): Subagent[] {
    return Array.from(this.subagents.values()).filter(s => s.goalId === goalId)
  }

  getSubagentsByRole(role: string): Subagent[] {
    return Array.from(this.subagents.values()).filter(s => s.profile.role === role)
  }

  getStatus(): SwarmStatus {
    const all = Array.from(this.subagents.values())
    return {
      totalSubagents: all.length,
      idle: all.filter(s => s.status === 'idle').length,
      working: all.filter(s => s.status === 'working').length,
      done: all.filter(s => s.status === 'done').length,
      failed: all.filter(s => s.status === 'failed').length,
    }
  }

  clear(): void {
    this.subagents.clear()
  }

  getMetrics(): { total: number; successRate: number; avgCompletionTimeMs: number } {
    const all = Array.from(this.subagents.values())
    const done = all.filter(s => s.status === 'done')
    const completed = all.filter(s => s.isFinished())

    const totalTime = completed.reduce((acc, s) => {
      if (s.startedAt && s.completedAt) {
        return acc + (s.completedAt.getTime() - s.startedAt.getTime())
      }
      return acc
    }, 0)

    return {
      total: all.length,
      successRate: completed.length > 0 ? done.length / completed.length : 0,
      avgCompletionTimeMs: completed.length > 0 ? totalTime / completed.length : 0,
    }
  }
}
