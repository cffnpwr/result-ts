# Critical Rules

These rules must be followed on every interaction. Violating them causes incorrect behavior, broken builds, or type-safety regressions.

## Namespace + Type Alias + Factory Function Pattern

All type implementations **must** use the merge declaration pattern:

```typescript
// 1. Private implementation classes live inside the namespace (never exported directly)
export namespace Result {
  class _Ok<T, E> implements ResultBase<T, E> { ... }   // private
  class _Err<T, E> implements ResultBase<T, E> { ... }  // private

  // 2. Export only type aliases (not the class itself)
  export type Ok<T, E> = _Ok<T, E>;
  export type Err<T, E> = _Err<T, E>;

  // 3. Export factory functions (not constructors)
  export const Ok = <T, E = never>(value: T): Ok<T, E> => new _Ok(value);
  export const Err = <E, T = never>(error: E): Err<T, E> => new _Err(error);
}

// 4. Union type at top level
export type Result<T, E> = Result.Ok<T, E> | Result.Err<T, E>;

// 5. Re-export factory functions at top level for convenience
export const Ok = Result.Ok;
export const Err = Result.Err;
```

**Prohibited:**
- `export class Ok<T, E> { ... }` — exposes implementation details
- `new Ok(value)` at call sites — callers must use factory functions
- Adding `public` / `protected` constructors to implementation classes

**Exception for `Option`:** `_Some` and `_None` are `export class` inside the namespace (not purely private) because they are referenced in cross-type operations within `result.ts`. This is intentional; do not change it.

## Zero Runtime Dependencies

- **Never** add entries to `dependencies` in `package.json`.
- Dev tooling (TypeScript, ESLint, tsdown, zod, ts-morph, etc.) belongs in `devDependencies` only.
- The published package must be self-contained with no install-time peers.

## Local Import Extensions

All local imports **must** include the `.ts` extension:

```typescript
// ✅ Correct
import { UnwrapError } from "./error.ts";
import { Option } from "./option.ts";

// ❌ Wrong — will break under Bun and Deno
import { UnwrapError } from "./error";
```

This is required by `allowImportingTsExtensions` and `verbatimModuleSyntax` in `tsconfig.json`.

## Test Language and Labels

Tests are written in Japanese. Follow these conventions exactly:

```typescript
describe("unwrap()", () => {
  it("[正常系] Okでunwrap()を実行すると値が返る", () => { ... });
  it("[異常系] Errでunwrap()を実行するとUnwrapErrorを吐く", () => { ... });
});
```

- `describe` label: method name or feature name (Japanese or ASCII)
- `it` label: starts with `[正常系]` for happy paths, `[異常系]` for error/edge paths
- Test file imports use `bun:test` (not vitest): `import { describe, expect, it } from "bun:test";`

## TypeScript Strict Mode

`tsconfig.json` enables the full strict suite plus additional checks:

| Option | Effect |
|---|---|
| `strict` | Enables all strict type checks |
| `noUncheckedIndexedAccess` | Array/object index access returns `T \| undefined` |
| `noImplicitReturns` | All code paths must return a value |
| `noImplicitOverride` | `override` keyword is required on overriding methods |
| `verbatimModuleSyntax` | Type-only imports must use `import type` |

Follow these constraints in all new code. Do not add `// @ts-ignore` or `as unknown as T` casts.

## Unused Parameters

Prefix intentionally unused parameters with `_` to satisfy the linter:

```typescript
unwrapOr(_val: T): T {
  return this.value;  // _Ok always returns its own value
}
```

## Version Control

Use `jj` (Jujutsu) for all VCS operations. Git is only the backend.

- `jj describe` — amend the current commit message
- `jj new` — start a new change
- `jj bookmark` — manage branches
- `jj git push` — push to remote

Never run `git commit`, `git add`, or `git push` directly.
