import { Err, Ok, Result } from "./result";

interface OptionBase<T> {
  /**
   * @returns Returns `true` if the option is a `Some` value.
   */
  isSome(): boolean;

  /**
   * @returns Returns `true` if the option is a `Some` and the value inside of it matches a predicate.
   */
  isSomeAnd(fn: (value: T) => boolean): boolean;

  /**
   * @returns Returns `true` if the option is a `None` value.
   */
  isNone(): boolean;

  /**
   * @param msg throw `msg`, if contained `None`.
   * @returns Returns the contained `Some` value, consuming the self value.
   */
  expect(msg: string): T;

  /**
   * @returns Returns the contained `Some` value, consuming the self value.
   */
  unwrap(): T;

  /**
   * @returns Returns the contained `Some` value or a provided default.
   */
  unwrapOr(defaultValue: T): T;

  /**
   * @returns Returns the contained `Some` value or computes it from a closure.
   */
  unwrapOrElse(op: () => T): T;

  /**
   * @returns Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if `Some`) or returns `None` (if `None`).
   */
  map<U>(op: (value: T) => U): Option<U>;

  /**
   * @returns Returns the provided default result (if none), or applies a function to the contained value (if any).
   */
  mapOr<U>(defaultValue: U, mapper: (value: T) => U): U;

  /**
   * @returns Computes a default function result (if none), or applies a different function to the contained value (if any).
   */
  mapOrElse<U>(defaultFn: () => U, mapper: (value: T) => U): U;

  /**
   * Calls the provided closure with a reference to the contained value (if `Some`).
   *
   * @returns Returns itself.
   */
  inspect<F extends (value: T) => unknown>(fn: F): ThisType<T>;

  /**
   * @returns Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(error)`.
   */
  okOr<E>(error: E): Result<T, E>;

  /**
   * @returns Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)` and `None` to `Err(error())`.
   */
  okOrElse<E>(error: () => E): Result<T, E>;

  /**
   * @returns Returns `None` if the option is `None`, otherwise returns `optb`.
   */
  and<U>(optb: Option<U>): Option<U>;

  /**
   * @returns Returns `None` if the option is `None`, otherwise calls `op` with the wrapped value and returns the result.
   */
  andThen<U>(op: (value: T) => Option<U>): Option<U>;

  /**
   * @returns Returns `None` if the option is `None`, otherwise calls `predicate` with the wrapped value and returns:
   */
  filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * @returns Returns the option if it contains a value, otherwise returns `optb`.
   */
  or(optb: Option<T>): Option<T>;

  /**
   * @returns Returns the option if it contains a value, otherwise calls `op` and returns the result.
   */
  orElse(op: () => Option<T>): Option<T>;

  /**
   * @returns Returns `Some` if exactly one of self, `optb` is `Some`, otherwise returns `None`.
   */
  xor(optb: Option<T>): Option<T>;
}

export class Some<T> implements OptionBase<T> {
  constructor(private readonly value: T) {}

  isSome(): true {
    return true;
  }
  isSomeAnd(fn: (value: T) => boolean): boolean {
    return fn(this.value);
  }
  isNone(): false {
    return false;
  }
  expect(_: string): T {
    return this.value;
  }
  unwrap(): T {
    return this.value;
  }
  unwrapOr(_: T): T {
    return this.value;
  }
  unwrapOrElse(_: () => T): T {
    return this.value;
  }
  map<U>(op: (value: T) => U): Option<U> {
    return new Some(op(this.value));
  }
  mapOr<U>(_: U, mapper: (value: T) => U): U {
    return mapper(this.value);
  }
  mapOrElse<U>(_: () => U, mapper: (value: T) => U): U {
    return mapper(this.value);
  }
  inspect(fn: (value: T) => unknown): ThisType<T> {
    fn(this.value);

    return this;
  }
  okOr<E>(_: E): Result<T, E> {
    return new Ok(this.value);
  }
  okOrElse<E>(_: () => E): Result<T, E> {
    return new Ok(this.value);
  }
  and<U>(optb: Option<U>): Option<U> {
    return optb;
  }
  andThen<U>(op: (value: T) => Option<U>): Option<U> {
    return op(this.value);
  }
  filter(predicate: (value: T) => boolean): Option<T> {
    return predicate(this.value) ? this : new None();
  }
  or(_: Option<T>): Option<T> {
    return this;
  }
  orElse(_: () => Option<T>): Option<T> {
    return this;
  }
  xor(optb: Option<T>): Option<T> {
    return optb.isSome() ? new None() : this;
  }
}

export class None implements OptionBase<never> {
  isSome(): false {
    return false;
  }
  isSomeAnd(_: (value: never) => boolean): false {
    return false;
  }
  isNone(): true {
    return true;
  }
  expect(msg: string): never {
    throw new Error(`Error with: ${msg}`);
  }
  unwrap(): never {
    throw new Error("Error with: None");
  }
  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }
  unwrapOrElse<T>(op: () => T): T {
    return op();
  }
  map<U>(_: (value: never) => U): Option<U> {
    return this;
  }
  mapOr<U>(defaultValue: U, _: (value: never) => U): U {
    return defaultValue;
  }
  mapOrElse<U>(defaultFn: () => U, _: (value: never) => U): U {
    return defaultFn();
  }
  inspect<T>(_: (value: T) => unknown): ThisType<T> {
    return this;
  }
  okOr<E>(error: E): Result<never, E> {
    return new Err(error);
  }
  okOrElse<E>(error: () => E): Result<never, E> {
    return new Err(error());
  }
  and<U>(_: Option<U>): Option<U> {
    return this;
  }
  andThen<U>(_: (value: never) => Option<U>): Option<U> {
    return this;
  }
  filter(_: (value: never) => boolean): Option<never> {
    return this;
  }
  or<T>(optb: Option<T>): Option<T> {
    return optb;
  }
  orElse<T>(op: () => Option<T>): Option<T> {
    return op();
  }
  xor<T>(optb: Option<T>): Option<T> {
    return optb.isNone() ? this : optb;
  }
}
export type Option<T> = Some<T> | None;
