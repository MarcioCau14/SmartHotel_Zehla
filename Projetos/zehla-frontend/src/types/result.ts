export class Result<T, E = Error> {
  private constructor(
    readonly isOk: boolean,
    readonly value?: T,
    readonly error?: E,
  ) {}

  get isFail(): boolean {
    return !this.isOk
  }

  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined)
  }

  static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error)
  }

  fold<R>(onOk: (value: T) => R, onFail: (error: E) => R): R {
    if (this.isOk) return onOk(this.value as T)
    return onFail(this.error as E)
  }

  map<R>(fn: (value: T) => R): Result<R, E> {
    if (this.isOk) return Result.ok(fn(this.value as T))
    return Result.fail(this.error as E)
  }

  getOrThrow(): T {
    if (this.isOk) return this.value as T
    throw this.error
  }
}
