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
4. release-please creates the tag and a draft GitHub Release
        ↓
5. publish-npm and publish-jsr run in parallel
        ↓
6. Once both succeed, the draft GitHub Release is published
```

Everything after step 1 happens inside `release-please.yaml`. The GitHub Release stays a draft until both registries have accepted the package, so a public release always implies npm and JSR are live.

## How release-please Works

The `release-please.yaml` workflow runs on every push to `main`. It reads commit messages (Conventional Commits format) and:

- Bumps the version in `package.json` and `jsr.json` simultaneously.
- Generates / updates `CHANGELOG.md`.
- Creates or updates a Release PR titled `chore(release): bump to v{version}`.

When the Release PR is merged, release-please creates tag `v{version}` and a **draft** GitHub Release (`"draft": true` in the config).

### Version Bumping Rules

| Commit type | Version bump |
|---|---|
| `fix:` | patch (e.g., 1.0.0 → 1.0.1) |
| `feat:` | minor (e.g., 1.0.0 → 1.1.0) |
| `feat!:` or `BREAKING CHANGE:` footer | major (e.g., 1.0.0 → 2.0.0) |

Configuration lives in `.github/release-please/config.json` and `.github/release-please/manifest.json`.

## Publish Jobs

When `releases_created` is `true`, two jobs run in parallel. Both check out the release commit (`sha` output of release-please).

### `publish-npm`

1. Checks out the release commit.
2. Installs dependencies: `bun install --frozen-lockfile`
3. Builds: `bun run build` (runs `tsdown`, produces `dist/`)
4. Applies `publishConfig.exports` to the manifest with `jq` and drops `publishConfig`
5. Packs the tarball: `bun pm pack`
6. Publishes: `npm publish "$TARBALL" --access public --provenance`

npm has no equivalent of pnpm's `publishConfig` field replacement, so step 4 rewrites `exports` explicitly before packing.

### `publish-jsr`

1. Checks out the release commit.
2. Installs dependencies (same as above).
3. Publishes: `bun run publish:jsr` (runs `jsr publish`).

Both jobs use OIDC (`id-token: write`) for provenance — no npm token or JSR token is stored as a secret.

### `publish-release`

Runs only after both publish jobs succeed. Flips the draft release to public with `gh release edit "$TAG" --draft=false`, using the same GitHub App token (`contents: write`) that created the release.

If either registry fails, this job is skipped and the release stays a draft. Fix the cause and re-run the failed jobs; the draft is published once they pass.

## Required GitHub Secrets

| Secret | Used by |
|---|---|
| `RELEASE_APP_ID` | `release-please.yaml` — GitHub App for creating the release PR and publishing the draft release |
| `RELEASE_PRIVATE_KEY` | `release-please.yaml` — GitHub App private key |

These are already configured. Do not modify or rotate them without coordinating with the repo owner.

## Manual Release (Emergency Only)

If the automated flow fails, you can publish manually:

```bash
mise install

# Build
bun install --frozen-lockfile
bun run build

# Publish to npm
jq '.exports = .publishConfig.exports | del(.publishConfig)' package.json > package.json.tmp
mv package.json.tmp package.json
npm publish "$(bun pm pack --quiet | tail -n1)" --access public --provenance
jj restore package.json   # revert the manifest rewrite

# Publish to JSR
bun run publish:jsr
```

Ensure you are authenticated (`npm login`, `jsr login`) before running these commands.

## Checking Release Status

View recent releases and their publish status:

```bash
gh release list --repo cffnpwr/result-ts
gh run list --workflow release-please.yaml --repo cffnpwr/result-ts
```
