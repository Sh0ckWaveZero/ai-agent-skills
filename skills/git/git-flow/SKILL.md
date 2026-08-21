---
name: git-flow
description: Git workflow for MEDcury HIS repos — branch naming, per-repo commit message styles, MR merge targets, and release tagging. Use when creating a branch, starting feature/bugfix/hotfix/release work, writing a commit message, deciding where to merge, or tagging a release. Supports Core (feature→develop→main) and per-site (prefixed) variants.
---

# Git Flow

## Branch Naming

| Type | Pattern | Base branch |
|------|---------|-------------|
| Feature | `feature/PROJ-XXX-short-description` | `develop` |
| Bug fix | `bugfix/PROJ-XXX-short-description` | `main` |
| Hotfix | `hotfix/PROJ-XXX-short-description` | `main` |
| Release | `release/vX.Y.Z` | `develop` |

Customer site variant — prefix the branch with `<site>-` and swap the base/target branches:

```
<site>-feature/PROJ-XXX-short-description   (base: <site>-develop)
<site>-hotfix/PROJ-XXX-short-description    (base: <site>-main)
<site>-release/vX.Y.Z
```

If the ticket already has a branch (check `git branch -a | grep PROJ-XXX`), continue on it instead of creating a new one. Some existing branches carry a base-branch suffix such as `feature/MPD-XXX-desc-develop` — keep that suffix when continuing.

## Commit Message — match the repo's existing style first

Run `git log --oneline -10` and use the dominant style of that repo:

| Repo family | Format | Example |
|-------------|--------|---------|
| `centrix` (core product) | `[PROJ-XXX] <type>: <description>` | `[MPD-1075] feat: show blood fields in order profile` |
| Frontend modules (`dental-module`, `bloodbank_module`) | `[PROJ-XXX] - [Area] <Description>` | `[MPD-1014] - [Dental] Sort submitted items oldest-first` |
| API services (`medhis-*-services`) | `<type>(<scope>): <description>` | `feat(order): expose Blood Bank infusion duration` |

Types: `feat` `fix` `refactor` `test` `docs` `chore` `style` `perf` `ci` `build` `revert`

## MR Targets

| Branch | Merge into | Follow-up |
|--------|-----------|-----------|
| `feature/*` | `develop` | delete branch after merge |
| `bugfix/*` | `main` | cherry-pick back to `develop` (use the git-cherry-pick skill) |
| `hotfix/*` | `main` | cherry-pick back to `develop` |
| `release/*` | `main` | merge `main` back into `develop` (bugfix only on release branches) |

Not every repo has a `develop` — single-stream repos (e.g. `bloodbank_module`, `medhis-closed-api-services`) merge `feature/*` straight into `main`. Verify with `git log --merges --oneline -5` before opening the MR, and fall back to the repo's default branch when in doubt.

Customer sites: swap `main`/`develop` → `<site>-main`/`<site>-develop`.

Open MRs with glab (see the glab-mr skill); never push directly to `main` or `develop`.

## Tag

Semver `X.Y.Z`, no leading zeros. Pushing a tag triggers the CI/CD `create-tag` pipeline.

## Quick Commands

```bash
# Feature
git checkout develop && git pull origin develop
git checkout -b feature/PROJ-XXX-description

# Bugfix / Hotfix
git checkout main && git pull origin main
git checkout -b bugfix/PROJ-XXX-description

# Tag
git tag X.Y.Z && git push origin X.Y.Z
```

## Rules

- No direct push to `main` or `develop` — always via MR
- One branch per ticket, named after the ticket ID
- Feature branch lifetime = sprint (delete after merge)
- Release branch: bugfix only, no new features
