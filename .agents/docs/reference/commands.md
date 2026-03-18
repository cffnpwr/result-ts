# Command Reference

## Development Environment

This project uses Nix flakes. Three shells are defined in `flake.nix`:

| Shell | Contents | When to use |
|---|---|---|
| `default` | bun, git, nil, nixd, nixfmt, treefmt, yamlfmt | Everyday development |
| `runtime-test` | bun, node, pnpm, deno | Cross-runtime testing |
| `publish` | bun, pnpm | Publishing to npm and JSR |

Enter a shell:

```bash
nix develop          # default shell
nix develop .#runtime-test
nix develop .#publish
```

With `direnv` configured (`.envrc` present), the default shell activates automatically on `cd`.

If a tool is not available outside Nix, run it via:

```bash
nix-shell -p <package> --run "<cmd>"
```

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

Runs after `build`. Generates `dist/package.json` by rewriting `publishConfig.exports` paths from the root `package.json`. This is required before publishing to npm.

```bash
bun run build && bun run build-package
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

Requires the `runtime-test` Nix shell (or all three runtimes available globally).

Generated test projects are written to `runtime-test/{node,bun,deno}/` (gitignored).

### `bun run publish:jsr`

Publishes the package to JSR (`jsr.io`). Requires authentication and should only be run from CI.

## CI/CD Workflows (`.github/workflows/`)

| Workflow | Trigger | What it does |
|---|---|---|
| `unit-test.yaml` | PR → main | `bun test --coverage`, posts coverage with octocov |
| `runtime-test.yaml` | PR → main (TS/JSON changes) | Runs runtime tests for all three runtimes |
| `eslint.yaml` | push main, PR → main | ESLint check |
| `treefmt.yaml` | push main, PR → main | treefmt format check (Nix, YAML) |
| `flake-check.yaml` | push main, PR → main (*.nix changes) | `nix flake check` |
| `github-actions-lint.yaml` | push main, PR → main (workflows changes) | Lints workflow YAML files |
| `semantic-pr-title.yaml` | PR opened/edited | Validates Conventional Commits title format |
| `status-check.yaml` | PR → main | Aggregates all required checks |
| `release-please.yaml` | push → main | Creates/updates release PR via release-please |
| `publish.yaml` | release published | Publishes to npm and JSR |

All workflows use Nix (`DeterminateSystems/determinate-nix-action`) for environment setup and pin all action versions to commit SHAs.

## Formatting

TypeScript/JavaScript is formatted by Deno formatter (configured in VSCode via `.vscode/settings.json`). Nix and YAML files are formatted by `treefmt`:

```bash
nix fmt            # run treefmt (Nix shell required)
```

The `treefmt.yaml` CI job checks that all Nix/YAML files are correctly formatted.
