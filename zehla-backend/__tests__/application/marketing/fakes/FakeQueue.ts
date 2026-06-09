export class FakeQueue {
  public jobs: Array<{ name: string; data: unknown; opts: unknown }> = []

  async addBulk(jobs: Array<{ name: string; data: unknown; opts?: unknown }>): Promise<void> {
    for (const job of jobs) {
      this.jobs.push({ name: job.name, data: job.data, opts: job.opts })
    }
  }

  async add(name: string, data: unknown, opts?: unknown): Promise<void> {
    this.jobs.push({ name, data, opts })
  }

  getJobCount(): number {
    return this.jobs.length
  }

  clear(): void {
    this.jobs = []
  }
}
