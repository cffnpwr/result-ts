# Command Reference

## Development Environment

Development tools are managed by [mise](https://mise.jdx.dev/). Versions are pinned in `mise.toml`:

| Tool | Used for |
|---|---|
| `bun` | Package management, unit tests, build, scripts |
| `node` | Node.js runtime test, npm publishing (`npm` ships with it) |
| `pnpm` | Node.js runtime test |
| `deno` | Deno runtime test |
| `treefmt`, `yamlfmt` | Formatting |

Install them with:

```bash
mise install
```

`mise` activation in the shell puts these tools on `PATH`; otherwise prefix commands with `mise exec --`.

## npm Scripts

All scripts are run with `bun run <script>` or directly with `bun <script>` where noted.

### `bun install`

Installs all dev dependencies from `bun.lock`. Use `--frozen-lockfile` in CI.

### `bun test src`

Runs unit tests with `bun:test` against source files in `src/`. Produces lcov coverage output.

```bash
bun test src
bun test src --coverage   # with coverage report
```

### `bun run build`

Bundles the library using `tsdown` (configured in `tsdown.config.ts`). Outputs:

- `dist/index.mjs` — ESM
- `dist/index.cjs` — CommonJS
- `dist/index.d.ts` — Type declarations

### `bun run build-package`

Runs `build`, then generates `dist/package.json` by rewriting `publishConfig.exports` paths from the root `package.json`. Used by `runtime-test.yaml`; the npm publish flow does not run it.

```bash
bun run build-package
```

### `bun run lint`

Runs ESLint over all files (configured in `eslint.config.ts`).

```bash
bun run lint          # check only
bun run lint:fix      # auto-fix
```

### `bun run runtime-test <runtime>`

Generates a test project for the specified runtime, installs dependencies, and runs tests.

```bash
bun run runtime-test node   # Node.js via pnpm + vitest
bun run runtime-test bun    # Bun via bun + vitest
bun run runtime-test deno   # Deno via deno + @std/testing
```

Requires node, pnpm and deno, which `mise.toml` provides.

Generated test projects are written to `runtime-test/{node,bun,deno}/` (gitignored).

### `bun run publish:jsr`

Publishes the package to JSR (`jsr.io`). Requires authentication and should only be run from CI.

## CI/CD Workflows (`.github/workflows/`)

| Workflow | Trigger | What it does |
|---|---|---|
| `unit-test.yaml` | PR → main | `bun test --coverage`, posts coverage with octocov |
| `runtime-test.yaml` | PR → main (TS/JSON changes) | Runs runtime tests for all three runtimes |
| `eslint.yaml` | push main, PR → main | ESLint check |
| `treefmt.yaml` | push main, PR → main | treefmt format check (YAML) |
| `github-actions-lint.yaml` | push main, PR → main (workflows changes) | Lints workflow YAML files |
| `semantic-pr-title.yaml` | PR opened/edited | Validates Conventional Commits title format |
| `status-check.yaml` | PR → main | Aggregates all required checks |
| `release-please.yaml` | push → main | Creates/updates release PR, publishes to npm and JSR, then publishes the draft GitHub Release |

All workflows use mise (`jdx/mise-action`) for environment setup and pin all action versions to commit SHAs.

## Formatting

TypeScript/JavaScript is formatted by Deno formatter (configured in VSCode via `.vscode/settings.json`). YAML files are formatted by `treefmt`:

```bash
treefmt
```

The `treefmt.yaml` CI job checks that all YAML files are correctly formatted.
