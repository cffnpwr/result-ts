import { UnwrapError } from "./error.ts";
import { Option } from "./option.ts";

interface ResultBase<T, E> {
  /**
   * Returns true if the result is `Ok`.
   * @returns {boolean}
   */
  isOk(): boolean;

  /**
   * Returns true if the result is `Err`.
   * @returns {boolean}
   */
  isErr(): boolean;

  /**
   * Unwraps a result, yielding the content of an `Ok`.
   * @returns {T}
   * @throws {UnimplementedError}
   */
  unwrap(): T;

  /**
   * Unwraps a result, yielding the content of an `Ok`.
   * @param {T} val
   * @returns {T}
   */
  unwrapOr(val: T): T;

  /**
   * Unwraps a result, yielding the content of an `Ok`.
   * @param {() => T} fn
   * @returns {T}
   */
  unwrapOrElse(fn: () => T): T;

  /**
   * Unwraps a result, yielding the content of an `Err`.
   * @returns {E} The content of an `Err`.
   * @throws {UnimplementedError}
   */
  unwrapErr(): E;

  /**
   * Unwraps a result, yielding the content of an `Err`.
   * @param msg The error message.
   */
  expect(msg: string): T;

  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to an contained `Ok` value, leaving an `Err` value untouched.
   * @param {(val: T) => U} fn
   * @returns {Result<U, E>}
   */
  map<U>(fn: (val: T) => U): Result<U, E>;

  /**
   * Maps a `Result<T, E>` to `Result<T, U>` by applying a function to an contained `Err` value, leaving an `Ok` value untouched.
   * @param {(err: E) => U} fn
   * @returns {Result<T, U>}
   */
  mapErr<U>(fn: (err: E) => U): Result<T, U>;

  /**
   * Transforms the `Result<T, E>` into an `Option<T>`, discarding the error.
   * @returns {Option<T>}
   */
  ok(): Option<T>;

  /**
   * Transforms the `Result<T, E>` into an `Option<E>`, discarding the success value.
   * @returns {Option<E>}
   */
  err(): Option<E>;

  /**
   * Result `res` if the result is `Ok`, otherwise return the `Err` value of `res`.
   * @param {Result<U, E>} res
   * @returns {Result<U, E>}
   */
  and<U>(res: Result<U, E>): Result<U, E>;

  /**
   * Calls `fn` if the result is `Ok`, otherwise returns the `Err` value of result.
   * @param {(val: T) => U} fn
   * @returns {Result<U, E>}
   */
  andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E>;

  /**
   * Result `res` if the result is `Err`, otherwise return the `Ok` value of `res`.
   * @param {Result<T, F>} res
   * @returns {Result<T, F>}
   */
  or<F>(res: Result<T, F>): Result<T, F>;

  /**
   * Calls `fn` if the result is `Err`, otherwise returns the `Ok` value of result.
   * @param {(err: E) => F} fn
   * @returns {Result<T, F>}
   */
  orElse<F>(fn: (err: E) => Result<T, F>): Result<T, F>;
}

export namespace Result {
  class _Ok<T, E> implements ResultBase<T, E> {
    constructor(readonly value: T) {}

    isOk(): this is Ok<T, E> {
      return true;
    }

    isErr(): this is Err<T, E> {
      return false;
    }

    unwrap(): T {
      return this.value;
    }

    unwrapOr(_val: T): T {
      return this.value;
    }

    unwrapOrElse(_fn: () => T): T {
      return this.value;
    }

    unwrapErr(): E {
      throw new UnwrapError();
    }

    expect(_msg: string): T {
      return this.value;
    }

    map<U>(fn: (val: T) => U): Result<U, never> {
      return Ok(fn(this.value));
    }

    mapErr<U>(_fn: (err: E) => U): Result<T, U> {
      return Ok(this.value);
    }

    ok(): Option<T> {
      return Option.Some(this.value);
    }

    err(): Option<E> {
      return Option.None<E>();
    }

    and<U>(res: Result<U, E>): Result<U, E> {
      return res;
    }

    andThen<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
      return fn(this.value);
    }

    or<F>(_res: Result<T, F>): Result<T, F> {
      return Ok(this.value);
    }

    orElse<F>(_fn: (err: E) => Result<T, F>): Result<T, F> {
      return Ok(this.value);
    }
  }

  class _Err<T, E> implements ResultBase<T, E> {
    constructor(readonly error: E) {}

    isOk(): this is Ok<T, E> {
      return false;
    }

    isErr(): this is Err<T, E> {
      return true;
    }

    unwrap(): T {
      throw new UnwrapError();
    }

    unwrapOr(val: T): T {
      return val;
    }

    unwrapOrElse(fn: () => T): T {
      return fn();
    }

    unwrapErr(): E {
      return this.error;
    }

    expect(msg: string): T {
      throw new UnwrapError(msg);
    }

    map<U>(_fn: (val: T) => U): Result<U, E> {
      return Err(this.error);
    }

    mapErr<U>(fn: (err: E) => U): Result<T, U> {
      return Err(fn(this.error));
    }

    ok(): Option<T> {
      return Option.None<T>();
    }

    err(): Option<E> {
      return Option.Some(this.error);
    }

    and<U>(_res: Result<U, E>): Result<U, E> {
      return Err(this.error);
    }

    andThen<U>(_fn: (val: T) => Result<U, E>): Result<U, E> {
      return Err(this.error);
    }

    or<F>(res: Result<T, F>): Result<T, F> {
      return res;
    }

    orElse<F>(fn: (err: E) => Result<T, F>): Result<T, F> {
      return fn(this.error);
    }
  }

  export type Ok<T, E> = _Ok<T, E>;
  export type Err<T, E> = _Err<T, E>;
  export const Ok = <T, E = never>(
    value: T extends never ? never : T,
  ): Ok<T, E> => new _Ok(value);
  export const Err = <E, T = never>(
    error: E extends never ? never : E,
  ): Err<T, E> => new _Err(error);
}
export type Result<T, E> = Result.Ok<T, E> | Result.Err<T, E>;
export const Ok = Result.Ok;
export const Err = Result.Err;
