export class Result<T, E = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result(value)
  }

  static fail<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error)
  }

  get isOk(): boolean {
    return this._error === undefined
  }

  get isFail(): boolean {
    return this._error !== undefined
  }

  get value(): T {
    if (this.isFail) throw new Error('Cannot access value of a failed Result')
    return this._value!
  }

  get error(): E {
    if (this.isOk) throw new Error('Cannot access error of a successful Result')
    return this._error!
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFail) return Result.fail(this._error!)
    return Result.ok(fn(this._value!))
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFail) return Result.fail(this._error!)
    return fn(this._value!)
  }

  getOrElse(defaultValue: T): T {
    return this.isOk ? this._value! : defaultValue
  }
}
