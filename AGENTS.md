# AGENTS.md

`@cffnpwr/result-ts` is a zero-dependency TypeScript library that ports Rust's `Result<T, E>` and `Option<T>` types.
It targets multiple runtimes (Node.js, Bun, Deno) and publishes to both npm and JSR.
The codebase uses a namespace + type alias + factory function merge pattern to encapsulate class internals.

## Critical Rules

- **Namespace pattern is mandatory**: All types live inside a `namespace` block; private implementation classes (`_Ok`, `_Err`, `_Some`, `_None`) are never exported directly.
- **Zero runtime dependencies**: Do not add entries to `dependencies` in `package.json`. Dev tools only.
- **Tests are written in Japanese**: `describe`/`it` labels use Japanese. Case labels follow `[正常系]` (happy path) and `[異常系]` (error path) conventions.
- **Imports use `.ts` extensions**: All local imports must include the `.ts` extension (e.g., `import { ... } from "./error.ts"`).
- **VCS is Jujutsu (jj)**: Use `jj` for all version control operations; `git` is a backend only.

→ Full rules: `.agents/docs/critical/rules.md`

## Quick Start

```bash
# Install dependencies
bun install

# Run unit tests
bun test src

# Build (ESM + CJS + DTS)
bun run build

# Lint
bun run lint

# Runtime tests (node | bun | deno)
bun run runtime-test node
bun run runtime-test bun
bun run runtime-test deno
```

## Task Navigation

### Working on source code
**Adding or modifying a method on `Result` or `Option`**

→ Read: `.agents/docs/workflows/adding-methods.md`
→ Read: `.agents/docs/reference/architecture.md`

**Understanding module structure or type design**

→ Read: `.agents/docs/reference/architecture.md`

### Running and verifying
**Understanding all available commands**

→ Read: `.agents/docs/reference/commands.md`

### Releasing
**Publishing a new version to npm or JSR**

→ Read: `.agents/docs/workflows/release.md`

## Project Structure

```
src/
├── index.ts          # Barrel export (re-exports only)
├── result.ts         # Result<T, E> implementation
├── option.ts         # Option<T> implementation
├── error.ts          # UnwrapError, UnimplementedError
├── result.test.ts    # Unit tests for Result
└── option.test.ts    # Unit tests for Option
scripts/
├── build-package.ts  # Generates dist/package.json after build
├── runtime-test.ts   # Orchestrates multi-runtime test execution
├── load-package-json.ts
└── util.ts
runtime-test/
├── templates/        # Template files for generated test projects
├── node/             # Generated Node.js runtime test (gitignored)
├── bun/              # Generated Bun runtime test (gitignored)
└── deno/             # Generated Deno runtime test (gitignored)
.github/
└── workflows/        # CI/CD (lint, test, release-please, publish)
```

## Development Environment

Development tools are managed by [mise](https://mise.jdx.dev/) via `mise.toml`.
Run `mise install` to install them (bun, node, pnpm, deno, treefmt, yamlfmt).

Tools not listed in `mise.toml` are expected to come from the global environment.
