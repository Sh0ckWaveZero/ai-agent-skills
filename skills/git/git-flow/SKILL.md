---
name: git-flow
description: Git workflow reference — branch naming, commit format, MR targets, and tag conventions. Use when the user creates a branch, starts a feature/hotfix/bugfix/release, writes a commit message, tags a release, or asks where to merge. Supports Core (feature→develop→main) and per-site (prefixed) variants.
---

# Git Flow — Module

## Branch Naming

### Core
| Type | Pattern |
|------|---------|
| Feature | `feature/PROJ-XXX-short-description` |
| Bug fix | `bugfix/PROJ-XXX-short-description` |
| Hotfix | `hotfix/PROJ-XXX-short-description` |
| Release | `release/vX.Y.Z` |

### Customer Site (prefix required)
```
<site>-feature/PROJ-XXX-short-description
<site>-hotfix/PROJ-XXX-short-description
<site>-release/vX.Y.Z
```
Sites: replace `<site>` with the customer's site prefix (e.g. `site-a`, `site-b`)

## Commit Message (Angular)
```
<type>(<scope>): <short description>
```
Types: `feat` `fix` `refactor` `test` `docs` `chore` `style` `perf` `ci` `build` `revert`

Common scopes: `<module>` `<feature-area>` `<component>` (match the project's existing scopes)

## MR Targets

| Branch | Merge into | Note |
|--------|-----------|------|
| `feature/*` | `develop` | — |
| `bugfix/*` | `main` | cherry-pick → `develop` |
| `hotfix/*` | `main` | cherry-pick → `develop` |
| `release/*` | `main` → `develop` | bugfix only |

Customer: swap `main`/`develop` → `<site>-main`/`<site>-develop`

## Tag Format
Semver `X.Y.Z` — no leading zeros. Used by the project's CI/CD `create-tag` pipeline.

## Quick Commands
```bash
# Feature
git checkout develop && git pull origin develop
git checkout -b feature/PROJ-XXX-description

# Bugfix / Hotfix
git checkout main && git pull origin main
git checkout -b bugfix/PROJ-XXX-description

# Tag (via glab)
git tag X.Y.Z && git push origin X.Y.Z
```

## Rules
- No direct push to `main` or `develop` — always via MR
- Feature branch lifetime = sprint (delete after merge)
- Release branch: bugfix only, no new features
