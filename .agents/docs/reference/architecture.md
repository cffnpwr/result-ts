# Architecture Reference

## Overview

`@cffnpwr/result-ts` is a zero-dependency TypeScript library that ports Rust's `Result<T, E>` and `Option<T>` types. It is designed to be runtime-agnostic (Node.js, Bun, Deno) and is published to both npm and JSR.

## Module Structure

```
src/
├── index.ts        # Barrel re-exports only — no logic here
├── result.ts       # Result<T, E> type: Ok, Err, ResultBase interface
├── option.ts       # Option<T> type: Some, None, OptionBase interface
└── error.ts        # UnwrapError, UnimplementedError
```

`src/index.ts` re-exports everything from the other modules. It must never contain implementation logic.

## The Namespace + Type Alias + Factory Function Pattern

This pattern is the architectural core of the library. It achieves three goals simultaneously:

1. **Encapsulation**: Implementation classes (`_Ok`, `_Err`, `_Some`, `_None`) are never accessible to consumers.
2. **Ergonomic API**: Consumers write `Ok(value)` and `Err(error)`, not `new Ok(value)`.
3. **Type-safe narrowing**: `result.isOk()` narrows the type to `Result.Ok<T, E>`.

### Pattern in `result.ts`

```
src/result.ts
│
├── interface ResultBase<T, E>        ← shared method contract
│     isOk(), isErr(), unwrap(), ...
│
└── export namespace Result
      ├── class _Ok<T, E>             ← private implementation
      │     implements ResultBase<T,E>
      ├── class _Err<T, E>            ← private implementation
      │     implements ResultBase<T,E>
      │
      ├── export type Ok<T, E> = _Ok<T, E>    ← public type alias
      ├── export type Err<T, E> = _Err<T, E>  ← public type alias
      ├── export const Ok = (value) => new _Ok(value)   ← factory
      └── export const Err = (error) => new _Err(error) ← factory

export type Result<T, E> = Result.Ok<T, E> | Result.Err<T, E>  ← union
export const Ok = Result.Ok   ← top-level shorthand
export const Err = Result.Err
```

### Pattern in `option.ts`

`option.ts` follows the same pattern with one difference: `_Some` and `_None` are declared as `export class` inside the namespace (not purely private). This allows `result.ts` to instantiate them directly when converting between `Result` and `Option` (e.g., `ok()` returns `Option.Some(value)`).

```
export namespace Option
  ├── export class _Some<T>           ← exported (needed by result.ts)
  ├── export class _None<T>           ← exported (needed by result.ts)
  ├── export type Some<T> = _Some<T>
  ├── export type None<T> = _None<T>
  ├── export const Some = (value) => new _Some(value)
  └── export const None = () => new _None()

export type Option<T> = Option.Some<T> | Option.None<T>
export const Some = Option.Some
export const None = Option.None
```

## Type Relationships

```
Result<T, E>
├── Result.Ok<T, E>   — holds value: T, returned by Ok(value)
└── Result.Err<T, E>  — holds error: E, returned by Err(error)

Option<T>
├── Option.Some<T>    — holds value: T, returned by Some(value)
└── Option.None<T>    — holds nothing, returned by None()
```

### Cross-type Conversions

| From | Method | To |
|---|---|---|
| `Result.Ok<T, E>` | `.ok()` | `Option.Some<T>` |
| `Result.Err<T, E>` | `.ok()` | `Option.None<T>` |
| `Result.Ok<T, E>` | `.err()` | `Option.None<E>` |
| `Result.Err<T, E>` | `.err()` | `Option.Some<E>` |
| `Option.Some<T>` | `.okOr(err)` | `Result.Ok<T, E>` |
| `Option.None<T>` | `.okOr(err)` | `Result.Err<T, E>` |

## Error Classes (`src/error.ts`)

| Class | When thrown |
|---|---|
| `UnwrapError` | `unwrap()` on `Err`, `unwrapErr()` on `Ok`, `expect()` on `Err`, `unwrap()` on `None` |
| `UnimplementedError` | Reserved for future use; currently not thrown anywhere |

Both extend `Error` and override `name` as a `const` literal for reliable `instanceof` checks.

## Build Output

`tsdown` produces three output formats from `src/index.ts`:

| Format | File | Consumer |
|---|---|---|
| ESM | `dist/index.mjs` | Node.js (ESM), Bun, bundlers |
| CJS | `dist/index.cjs` | Node.js (CommonJS), legacy tooling |
| Type declarations | `dist/index.d.ts` | TypeScript consumers |

The `package.json` `publishConfig.exports` field maps the package entry point to these dist files at publish time. During development, `exports["."]` points to `src/index.ts` for direct source consumption.

## Runtime Test Architecture

`scripts/runtime-test.ts` generates isolated test projects under `runtime-test/{node,bun,deno}/` at test time:

1. Reads test files from `src/*.test.ts` using `ts-morph`.
2. Strips `bun:test` imports and local relative imports.
3. Re-adds imports from the published package name (`@cffnpwr/result-ts`) and the runtime-appropriate test framework (vitest for Node/Bun, `@std/testing` for Deno).
4. Copies template files (`runtime-test/templates/`) to the generated directory.
5. Installs dependencies and runs tests using the target runtime.

Generated directories (`runtime-test/node/`, `runtime-test/bun/`, `runtime-test/deno/`) are gitignored.
