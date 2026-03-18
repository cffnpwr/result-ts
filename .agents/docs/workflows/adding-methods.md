# Workflow: Adding or Modifying Methods

This guide covers adding a new method or modifying an existing one on `Result<T, E>` or `Option<T>`.

## Overview of Files to Touch

| File | Change required |
|---|---|
| `src/result.ts` or `src/option.ts` | Add method to interface + both implementation classes |
| `src/result.test.ts` or `src/option.test.ts` | Add test cases |
| `docs/API.md` and `docs/API-ja.md` | Update API documentation (if user requests it) |

## Step-by-Step

### 1. Add to the interface

Open the relevant file and add the method signature to the `ResultBase<T, E>` (or `OptionBase<T>`) interface. Include a JSDoc comment following the existing style:

```typescript
interface ResultBase<T, E> {
  // ... existing methods ...

  /**
   * Returns the contained `Ok` value or computes it from the closure.
   * @param {(err: E) => T} fn
   * @returns {T}
   */
  unwrapOrElse(fn: (err: E) => T): T;
}
```

### 2. Implement in `_Ok` (or `_Some`)

Add the method to the first implementation class. For `Result`, this is `_Ok`. For `Option`, this is `_Some`.

- If the method should return the wrapped value: return `this.value` directly.
- If the method does not apply to this variant: mark parameters with `_` prefix and return the unchanged value or a no-op result.

```typescript
class _Ok<T, E> implements ResultBase<T, E> {
  // ...
  unwrapOrElse(_fn: (err: E) => T): T {
    return this.value;  // Ok always returns its own value
  }
}
```

### 3. Implement in `_Err` (or `_None`)

Add the complementary implementation to the second class (`_Err` / `_None`):

```typescript
class _Err<T, E> implements ResultBase<T, E> {
  // ...
  unwrapOrElse(fn: (err: E) => T): T {
    return fn(this.error);  // Err computes the fallback
  }
}
```

### 4. Write tests

Open the corresponding test file (`src/result.test.ts` or `src/option.test.ts`) and add a `describe` block for the new method. Follow the label conventions strictly:

```typescript
describe("unwrapOrElse()", () => {
  it("[正常系] OkでunwrapOrElse()を実行すると自身の値を返す", () => {
    expect(exOk.unwrapOrElse(() => 2)).toBe(1);
  });

  it("[正常系] ErrでunwrapOrElse()を実行すると関数の戻り値を返す", () => {
    expect(exErr.unwrapOrElse(() => 2)).toBe(2);
  });
});
```

Rules for test labels:
- `[正常系]` — expected / happy path behavior
- `[異常系]` — error thrown or unexpected input
- Describe what the variant is (`Ok`, `Err`, `Some`, `None`) and what the expected outcome is.

### 5. Verify

Run the unit tests to confirm all cases pass:

```bash
bun test src
```

If a method involves cross-type conversion (e.g., `Result → Option`), also run the other type's tests:

```bash
bun test src/result.test.ts
bun test src/option.test.ts
```

## Common Patterns

### Method that transforms the value (map-like)

- `_Ok` / `_Some`: apply the function, wrap result in the same variant.
- `_Err` / `_None`: ignore the function, re-wrap the existing error/nothing.

```typescript
// In _Ok
map<U>(fn: (val: T) => U): Result<U, E> {
  return new _Ok(fn(this.value));
}

// In _Err
map<U>(_fn: (val: T) => U): Result<U, E> {
  return new _Err(this.error);
}
```

### Method that short-circuits on one variant

- `_Ok.andThen(fn)`: call `fn(this.value)` — propagate into the chain.
- `_Err.andThen(_fn)`: return `new _Err(this.error)` — skip the chain.

### Method that converts to another type

Use the namespace factory functions — never instantiate classes directly from outside their own file:

```typescript
// In _Ok (result.ts)
ok(): Option<T> {
  return Option.Some(this.value);  // use Option namespace factory
}

// In _Err (result.ts)
ok(): Option<T> {
  return Option.None<T>();
}
```

## Notes

- Do not add methods that are not in Rust's `Result` or `Option` API without a strong justification and explicit user request.
- If the method only makes sense for one variant (e.g., `unwrapErr` only returns a value on `Err`), the other variant must throw `UnwrapError`.
- Keep implementations minimal — no logging, no side effects beyond what Rust's equivalent does.
