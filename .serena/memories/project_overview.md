# result-ts Project Overview

## Purpose
TypeScript implementation of Rust-like Result and Option types. Published to JSR as `@cffnpwr/result-ts`.

## Tech Stack
- TypeScript (source in `src/`)
- JSR for package publishing (`jsr.json`)
- Bun + pnpm for package management (`bun.lock`, `package.json`)
- ESLint (`eslint.config.ts`)
- tsdown for bundling (`tsdown.config.ts`)
- Nix + flakes (`flake.nix`)
- treefmt for formatting (`treefmt.toml`)
- GitHub Actions for CI (`.github/`)

## Structure
```
src/
  index.ts       - main exports
  result.ts      - Result<T,E> type (Ok/Err)
  option.ts      - Option<T> type (Some/None)
  error.ts       - UnwrapError
  result.test.ts
  option.test.ts
docs/
  API.md         - English API reference
  API-ja.md      - Japanese API reference
README.md        - English (main)
README-ja.md     - Japanese
```

## Key APIs
- `Ok<T,E>(value)` / `Err<T,E>(error)` → `Result<T,E>`
- `Some<T>(value)` / `None<T>()` → `Option<T>`
- Methods: isOk/isErr/unwrap/unwrapOr/unwrapOrElse/unwrapErr/expect/map/mapErr/ok/err/and/andThen/or/orElse
- Option methods: isSome/isNone/unwrap/unwrapOr/unwrapOrElse/expect/map/okOr/and/andThen/or/orElse

## README Structure
- README.md: English main (links to README-ja.md and docs/API.md)
- README-ja.md: Japanese (links to README.md and docs/API-ja.md)
- docs/API.md: English full API reference
- docs/API-ja.md: Japanese full API reference
