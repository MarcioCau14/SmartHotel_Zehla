export type Result<T, E extends Error> = 
  | { isOk: true; value: T; isFail: false; error?: never }
  | { isOk: false; value?: never; isFail: true; error: E };

export namespace Result {
  export function ok<T, E extends Error>(value: T): Result<T, E> {
    return {
      isOk: true,
      value,
      isFail: false
    } as Result<T, E>;
  }

  export function fail<T, E extends Error>(error: E): Result<T, E> {
    return {
      isOk: false,
      value: undefined as never,
      isFail: true,
      error
    } as Result<T, E>;
  }

  export function isOk<T, E extends Error>(result: Result<T, E>): result is { isOk: true; value: T; isFail: false; error?: never } {
    return result.isOk;
  }

  export function isFail<T, E extends Error>(result: Result<T, E>): result is { isOk: false; value?: never; isFail: true; error: E } {
    return result.isFail;
  }
}