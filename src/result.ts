import { None, Option, Some } from "./option";
import { toString } from "./toString";

interface ResultBase<T, E> {
  /**
   * @returns Returns `true` if the result is `Ok`.
   */
  isOk(): boolean;

  /**
   * @returns Returns `true` if the result is `Ok` and the value inside of it matches a predicate.
   */
  isOkAnd(fn: (value: T) => boolean): boolean;

  /**
   * @returns Returns `true` if the result is `Err`
   */
  isErr(): boolean;

  /**
   * @returns Returns `true` if the result is `Err` and the value inside of it matches a predicate.
   */
  isErrAnd(fn: (value: E) => boolean): boolean;

  /**
   * @returns Converts from `Result<T, E>` to `Option<T>`.
   */
  ok(): Option<T>;

  /**
   * @returns Converts from `Result<T, E>` to `Option<E>`.
   */
  err(): Option<E>;

  /**
   * This function can be used to compose the results of two functions.
   *
   * @returns Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value, leaving an `Err` value untouched.
   */
  map<U>(mapper: (value: T) => U): Result<U, E>;

  /**
   * @returns Returns the provided default (if `Err`), or applies a function to the contained value (if `Ok`).
   */
  mapOr<U>(defaultValue: U, mapper: (value: T) => U): U;

  /**
   * @returns Maps a `Result<T, E>` to `U` by applying fallback function `defaultFn` to a contained `Err` value, or function `mapper` to a contained `Ok` value.
   */
  mapOrElse<U>(defaultFn: (error: E) => U, mapper: (value: T) => U): U;

  /**
   * This function can be used to pass through a successful result while handling an error.
   *
   * @returns Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value, leaving an `Ok` value untouched.
   */
  mapErr<F>(mapper: (error: E) => F): Result<T, F>;

  /**
   * Calls the provided closure with a reference to the contained value (if `Ok`).
   *
   * @returns Returns itself.
   */
  inspect<F extends (value: T) => unknown>(fn: F): ThisType<T>;

  /**
   * Calls the provided closure with a reference to the contained value (if `Err`).
   *
   * @returns Returns itself.
   */
  inspectErr<F extends (error: E) => unknown>(fn: F): ThisType<T>;

  /**
   * @param msg throw `msg`, if contained `Err`.
   * @returns Returns the contained `Ok` value, consuming the self value.
   */
  expect(msg: string): T;

  /**
   * @param msg throw `msg`, if contained `Ok`.
   * @returns Returns the contained `Err` value, consuming the self value.
   */
  expectErr(msg: string): E;

  /**
   * @returns Returns the contained `Ok` value, consuming the self value.
   */
  unwrap(): T;

  /**
   * @returns Returns the contained `Err` value, consuming the self value.
   */
  unwrapErr(): E;

  /**
   * @returns Returns the contained `Ok` value or a provided default.
   */
  unwrapOr(defaultValue: T): T;

  /**
   * @returns Returns the contained `Ok` value or computes it from a closure.
   */
  unwrapOrElse<F extends (error: E) => T>(op: F): T;

  /**
   * @returns Returns `res` if the result is `Ok`, otherwise returns the `Err` value of self.
   */
  and<U>(res: Result<U, E>): Result<U, E>;

  /**
   * @returns Calls `op` if the result is `Ok`, otherwise returns the `Err` value of self.
   */
  andThen<U>(op: (value: T) => Result<U, E>): Result<U, E>;

  /**
   * @returns Returns `res` if the result is `Err`, otherwise returns the `Ok` value of self.
   */
  or<F>(res: Result<T, F>): Result<T, F>;

  /**
   * @returns Calls `op` if the result is `Err`, otherwise returns the `Ok` value of self.
   */
  orElse<F>(op: (error: E) => Result<T, F>): Result<T, F>;
}

export class Ok<T> implements ResultBase<T, never> {
  constructor(private readonly value: T) {}

  isOk(): true {
    return true;
  }
  isOkAnd(fn: (value: T) => boolean): boolean {
    return fn(this.value);
  }
  isErr(): false {
    return false;
  }
  isErrAnd(_: (value: never) => boolean): false {
    return false;
  }
  ok(): Some<T> {
    return new Some(this.value);
  }
  err(): None {
    return new None();
  }
  map<U>(mapper: (value: T) => U): Result<U, never> {
    return new Ok(mapper(this.value));
  }
  mapOr<U>(_: U, mapper: (value: T) => U): U {
    return mapper(this.value);
  }
  mapOrElse<U>(_: (error: never) => U, mapper: (value: T) => U): U {
    return mapper(this.value);
  }
  mapErr<F>(_: (error: never) => F): Result<T, F> {
    return this;
  }
  inspect<F extends (value: T) => void>(fn: F): ThisType<T> {
    fn(this.value);

    return this;
  }
  inspectErr<F extends (error: never) => void>(_: F): ThisType<T> {
    return this;
  }
  expect(_: string): T {
    return this.value;
  }
  expectErr(msg: string): never {
    throw new Error(msg);
  }
  unwrap(): T {
    return this.value;
  }
  unwrapErr(): never {
    throw new Error(`Error with: ${toString(this.value)}`);
  }
  unwrapOr(_: T): T {
    return this.value;
  }
  unwrapOrElse<F extends (error: never) => T>(_: F): T {
    return this.value;
  }
  and<U, E>(res: Result<U, E>): Result<U, E> {
    return res;
  }
  andThen<U, E>(op: (value: T) => Result<U, E>): Result<U, E> {
    return op(this.value);
  }
  or<F>(_: Result<T, F>): Result<T, F> {
    return this;
  }
  orElse<F>(_: (error: never) => Result<T, F>): Result<T, F> {
    return this;
  }
}

export class Err<E> implements ResultBase<never, E> {
  constructor(private readonly error: E) {}
  isOk(): false {
    return false;
  }
  isOkAnd(_: (value: never) => boolean): false {
    return false;
  }
  isErr(): true {
    return true;
  }
  isErrAnd(fn: (value: E) => boolean): boolean {
    return fn(this.error);
  }
  ok(): None {
    return new None();
  }
  err(): Some<E> {
    return new Some(this.error);
  }
  map(_: unknown): Result<never, E> {
    return this;
  }
  mapOr<U>(defaultValue: U, _: (value: never) => U): U {
    return defaultValue;
  }
  mapOrElse<U>(defaultFn: (error: E) => U, _: (value: never) => U): U {
    return defaultFn(this.error);
  }
  mapErr<F>(mapper: (error: E) => F): Result<never, F> {
    return new Err(mapper(this.error));
  }
  inspect<F extends (value: never) => unknown>(_: F): Result<never, E> {
    return this;
  }
  inspectErr<F extends (error: E) => unknown>(fn: F): Result<never, E> {
    fn(this.error);

    return this;
  }
  expect(msg: string): never {
    throw new Error(msg);
  }
  expectErr(_: string): E {
    return this.error;
  }
  unwrap(): never {
    throw new Error(`Error with: ${toString(this.error)}`);
  }
  unwrapErr(): E {
    return this.error;
  }
  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }
  unwrapOrElse<T>(op: (error: E) => T): T {
    return op(this.error);
  }
  and<U>(_: Result<U, E>): Result<U, E> {
    return this;
  }
  andThen<U>(_: (value: never) => Result<U, E>): Result<U, E> {
    return this;
  }
  or<T, F>(res: Result<T, F>): Result<T, F> {
    return res;
  }
  orElse<F, T>(op: (error: E) => Result<T, F>): Result<T, F> {
    return op(this.error);
  }
}

export type Result<T, E> = Ok<T> | Err<E>;
