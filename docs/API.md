# API Reference

[日本語版APIリファレンスはこちら](./API-ja.md)

## Result\<T, E\>

Represents either success (`Ok<T, E>`) or failure (`Err<T, E>`).

### Constructors

| Function | Description |
|---|---|
| `Ok<T, E>(value: T): Result<T, E>` | Creates a success value. |
| `Err<T, E>(error: E): Result<T, E>` | Creates a failure value. |

### Methods

| Method | Signature | Description |
|---|---|---|
| `isOk` | `() => boolean` | Returns `true` if the result is `Ok`. |
| `isErr` | `() => boolean` | Returns `true` if the result is `Err`. |
| `unwrap` | `() => T` | Returns the `Ok` value. Throws `UnwrapError` if the result is `Err`. |
| `unwrapOr` | `(val: T) => T` | Returns the `Ok` value, or `val` if the result is `Err`. |
| `unwrapOrElse` | `(fn: () => T) => T` | Returns the `Ok` value, or the return value of `fn` if the result is `Err`. |
| `unwrapErr` | `() => E` | Returns the `Err` value. Throws `UnwrapError` if the result is `Ok`. |
| `expect` | `(msg: string) => T` | Returns the `Ok` value. Throws `UnwrapError` with `msg` if the result is `Err`. |
| `map` | `<U>(fn: (val: T) => U) => Result<U, E>` | Applies `fn` to the `Ok` value, leaving `Err` untouched. |
| `mapErr` | `<U>(fn: (err: E) => U) => Result<T, U>` | Applies `fn` to the `Err` value, leaving `Ok` untouched. |
| `ok` | `() => Option<T>` | Converts to `Option<T>`, discarding the error. |
| `err` | `() => Option<E>` | Converts to `Option<E>`, discarding the success value. |
| `and` | `<U>(res: Result<U, E>) => Result<U, E>` | Returns `res` if the result is `Ok`, otherwise returns the `Err` value. |
| `andThen` | `<U>(fn: (val: T) => Result<U, E>) => Result<U, E>` | Calls `fn` with the `Ok` value if the result is `Ok`, otherwise returns the `Err` value. |
| `or` | `<F>(res: Result<T, F>) => Result<T, F>` | Returns the `Ok` value if the result is `Ok`, otherwise returns `res`. |
| `orElse` | `<F>(fn: (err: E) => Result<T, F>) => Result<T, F>` | Returns the `Ok` value if the result is `Ok`, otherwise calls `fn` with the `Err` value. |

### Examples

```typescript
import { type Result, Ok, Err } from "@cffnpwr/result-ts";

// Basic usage
const ok: Result<number, string> = Ok(42);
const err: Result<number, string> = Err("something went wrong");

ok.isOk();     // true
ok.isErr();    // false
ok.unwrap();   // 42

err.isOk();       // false
err.isErr();      // true
err.unwrapErr();  // "something went wrong"

// unwrapOr / unwrapOrElse
err.unwrapOr(0);            // 0
err.unwrapOrElse(() => -1); // -1

// map / mapErr
Ok(42).map((n) => n * 2);         // Ok(84)
Err("err").mapErr((e) => e.toUpperCase()); // Err("ERR")

// and / andThen
Ok(1).and(Ok(2));   // Ok(2)
Err("e").and(Ok(2)); // Err("e")

Ok(1).andThen((n) => Ok(n + 1));    // Ok(2)
Err("e").andThen((n) => Ok(n + 1)); // Err("e")

// or / orElse
Ok(1).or(Ok(2));    // Ok(1)
Err("e").or(Ok(2)); // Ok(2)

Ok(1).orElse(() => Ok(2));    // Ok(1)
Err("e").orElse(() => Ok(2)); // Ok(2)

// ok / err (convert to Option)
Ok(42).ok();    // Some(42)
Ok(42).err();   // None
Err("e").ok();  // None
Err("e").err(); // Some("e")
```

---

## Option\<T\>

Represents either a value (`Some<T>`) or no value (`None`).

### Constructors

| Function | Description |
|---|---|
| `Some<T>(value: T): Option<T>` | Creates an option with a value. |
| `None<T>(): Option<T>` | Creates an option with no value. |

### Methods

| Method | Signature | Description |
|---|---|---|
| `isSome` | `() => boolean` | Returns `true` if the option is `Some`. |
| `isNone` | `() => boolean` | Returns `true` if the option is `None`. |
| `unwrap` | `() => T` | Returns the `Some` value. Throws `UnwrapError` if the option is `None`. |
| `unwrapOr` | `(val: T) => T` | Returns the `Some` value, or `val` if the option is `None`. |
| `unwrapOrElse` | `(fn: () => T) => T` | Returns the `Some` value, or the return value of `fn` if the option is `None`. |
| `expect` | `(msg: string) => T` | Returns the `Some` value. Throws `UnwrapError` with `msg` if the option is `None`. |
| `map` | `<U>(fn: (val: T) => U) => Option<U>` | Applies `fn` to the `Some` value, leaving `None` untouched. |
| `okOr` | `<E>(err: E) => Result<T, E>` | Converts `Some(v)` to `Ok(v)` and `None` to `Err(err)`. |
| `and` | `<U>(optb: Option<U>) => Option<U>` | Returns `optb` if the option is `Some`, otherwise returns `None`. |
| `andThen` | `<U>(fn: (val: T) => Option<U>) => Option<U>` | Calls `fn` with the `Some` value if the option is `Some`, otherwise returns `None`. |
| `or` | `(optb: Option<T>) => Option<T>` | Returns the option if it is `Some`, otherwise returns `optb`. |
| `orElse` | `(fn: () => Option<T>) => Option<T>` | Returns the option if it is `Some`, otherwise calls `fn`. |

### Examples

```typescript
import { type Option, Some, None } from "@cffnpwr/result-ts";

// Basic usage
const some: Option<number> = Some(42);
const none: Option<number> = None();

some.isSome();  // true
some.isNone();  // false
some.unwrap();  // 42

none.isSome();         // false
none.isNone();         // true
none.unwrapOr(-1);     // -1
none.unwrapOrElse(() => -1); // -1

// map
Some(42).map((n) => n * 2); // Some(84)
None<number>().map((n) => n * 2); // None

// okOr (convert to Result)
Some(42).okOr("error");  // Ok(42)
None().okOr("error");    // Err("error")

// and / andThen
Some(1).and(Some(2));  // Some(2)
None().and(Some(2));   // None

Some(1).andThen((n) => Some(n + 1));  // Some(2)
None<number>().andThen((n) => Some(n + 1)); // None

// or / orElse
Some(1).or(Some(2));  // Some(1)
None().or(Some(2));   // Some(2)

Some(1).orElse(() => Some(2));  // Some(1)
None<number>().orElse(() => Some(2)); // Some(2)
```

---

## Errors

### UnwrapError

Thrown when calling `unwrap()`, `unwrapErr()`, or `expect()` on a value that does not contain the expected variant.

```typescript
import { Err } from "@cffnpwr/result-ts";

try {
  Err("error").unwrap();
} catch (e) {
  // e is UnwrapError
}
```
