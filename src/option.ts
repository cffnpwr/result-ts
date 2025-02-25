import { UnwrapError } from "./error.ts";
import { Result } from "./result.ts";

interface OptionBase<T> {
  /**
   * Returns true if the option is `Some`.
   * @returns {boolean}
   */
  isSome(): boolean;

  /**
   * Returns true if the option is `None`.
   * @returns {boolean}
   */
  isNone(): boolean;

  /**
   * Unwraps an option, yielding the content of a `Some`.
   * @returns {T}
   * @throws {UnimplementedError}
   */
  unwrap(): T;

  /**
   * Unwraps an option, yielding the content of a `Some`.
   * @param {T} val
   * @returns {T}
   */
  unwrapOr(val: T): T;

  /**
   * Unwraps an option, yielding the content of a `Some`.
   * @param {() => T} fn
   * @returns {T}
   */
  unwrapOrElse(fn: () => T): T;

  /**
   * Unwraps an option, yielding the content of a `None`.
   * @returns {never}
   * @throws {UnimplementedError}
   */
  expect(msg: string): T;

  /**
   * Maps an `Option<T>` to `Option<U>` by applying a function to an contained `Some` value, leaving a `None` value untouched.
   * @param {(val: T) => U} fn
   * @returns {Option<U>}
   */
  map<U>(fn: (val: T) => U): Option<U>;

  /**
   * Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(err)`.
   * @param {E} err
   * @returns {Result<T, E>}
   */
  okOr<E>(err: E): Result<T, E>;

  /**
   * Returns `None` if the option is `None`, otherwise returns `optb`.
   * @param {Option<U>} obtb
   */
  and<U>(obtb: Option<U>): Option<U>;

  /**
   * Calls `fn` if the option is `Some`, otherwise returns `None`.
   * @param {(val: T) => Option<U>} fn
   */
  andThen<U>(fn: (val: T) => Option<U>): Option<U>;

  /**
   * Returns the option if it contains a value, otherwise returns `optb`.
   * @param {Option<T>} optb
   */
  or(optb: Option<T>): Option<T>;

  /**
   * Calls `fn` if the option is `None`, otherwise returns the option.
   * @param {() => Option<T>} fn
   */
  orElse(fn: () => Option<T>): Option<T>;
}

export namespace Option {
  export type Some<T> = _Some<T>;
  export type None<T> = _None<T>;

  export class _Some<T> implements OptionBase<T> {
    constructor(readonly value: T) {}

    isSome(): this is Some<T> {
      return true;
    }

    isNone(): this is None<T> {
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

    expect(_msg: string): T {
      return this.value;
    }

    map<U>(fn: (val: T) => U): Option<U> {
      return Some(fn(this.value));
    }

    okOr<E>(_: E): Result<T, E> {
      return Result.Ok(this.value);
    }

    and<U>(obtb: Option<U>): Option<U> {
      return obtb;
    }

    andThen<U>(fn: (val: T) => Option<U>): Option<U> {
      return fn(this.value);
    }

    or(_optb: Option<T>): Option<T> {
      return Some(this.value);
    }

    orElse(_fn: () => Option<T>): Option<T> {
      return Some(this.value);
    }
  }

  export class _None<T = never> implements OptionBase<T> {
    isSome(): this is Some<T> {
      return false;
    }

    isNone(): this is None<T> {
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

    expect(msg: string): T {
      throw new UnwrapError(msg);
    }

    map<U>(_fn: (val: T) => U): Option<U> {
      return None<U>();
    }

    okOr<E>(err: E): Result<T, E> {
      return Result.Err(err);
    }

    and<U>(_obtb: Option<U>): Option<U> {
      return None<U>();
    }

    andThen<U>(_fn: (val: T) => Option<U>): Option<U> {
      return None<U>();
    }

    or(optb: Option<T>): Option<T> {
      return optb;
    }

    orElse(fn: () => Option<T>): Option<T> {
      return fn();
    }
  }

  export const Some = <T>(value: T): Some<T> => new _Some(value);
  export const None = <T = never>(): None<T> => new _None();
}
export type Option<T> = Option.Some<T> | Option.None<T>;
export const Some = Option.Some;
export const None = Option.None;
