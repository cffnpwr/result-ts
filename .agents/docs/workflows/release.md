# Workflow: Releasing a New Version

Releases are fully automated via release-please and GitHub Actions. Manual steps are minimal.

## Overview

```
1. Merge PRs to main
        ↓
2. release-please creates/updates a Release PR
        ↓
3. Merge the Release PR
        ↓
4. GitHub creates a release tag automatically
        ↓
5. publish.yaml triggers and publishes to npm + JSR
```

## How release-please Works

The `release-please.yaml` workflow runs on every push to `main`. It reads commit messages (Conventional Commits format) and:

- Bumps the version in `package.json` and `jsr.json` simultaneously.
- Generates / updates `CHANGELOG.md`.
- Creates or updates a Release PR titled `chore(release): bump to v{version}`.

When the Release PR is merged, release-please creates a GitHub Release with tag `v{version}`.

### Version Bumping Rules

| Commit type | Version bump |
|---|---|
| `fix:` | patch (e.g., 1.0.0 → 1.0.1) |
| `feat:` | minor (e.g., 1.0.0 → 1.1.0) |
| `feat!:` or `BREAKING CHANGE:` footer | major (e.g., 1.0.0 → 2.0.0) |

Configuration lives in `.github/release-please/config.json` and `.github/release-please/manifest.json`.

## publish.yaml: What It Does

When a GitHub Release is published, two jobs run in parallel:

### `publish-npm`

1. Checks out the repo.
2. Installs dependencies: `nix develop .#publish --command bun install --frozen-lockfile`
3. Builds: `nix develop .#publish --command bun run build`
4. Publishes: `bunx pnpm publish --provenance --access public --no-git-checks`

The build step runs `tsdown` (produces `dist/`) followed by `build-package` (generates `dist/package.json` with corrected export paths).

### `publish-jsr`

1. Checks out the repo.
2. Installs dependencies (same as above).
3. Publishes: `bun run publish:jsr` (runs `jsr publish`).

Both jobs use OIDC (`id-token: write`) for provenance — no npm token or JSR token is stored as a secret.

## Required GitHub Secrets

| Secret | Used by |
|---|---|
| `RELEASE_APP_ID` | `release-please.yaml` — GitHub App for creating the release PR |
| `RELEASE_PRIVATE_KEY` | `release-please.yaml` — GitHub App private key |

These are already configured. Do not modify or rotate them without coordinating with the repo owner.

## Manual Release (Emergency Only)

If the automated flow fails, you can publish manually from the `publish` Nix shell:

```bash
nix develop .#publish

# Build
bun install --frozen-lockfile
bun run build
bun run build-package

# Publish to npm
bunx pnpm publish --provenance --access public --no-git-checks

# Publish to JSR
bun run publish:jsr
```

Ensure you are authenticated (`npm login`, `jsr login`) before running these commands.

## Checking Release Status

View recent releases and their publish status:

```bash
gh release list --repo cffnpwr/result-ts
gh run list --workflow publish.yaml --repo cffnpwr/result-ts
```
