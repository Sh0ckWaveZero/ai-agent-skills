---
name: git-flow
description: Git workflow for MEDcury HIS repos — branch naming, per-repo commit message styles, MR merge targets, and release tagging. Use when creating a branch, starting feature/bugfix/hotfix/release work, writing a commit message, deciding where to merge, or tagging a release. Supports Core (feature→develop→main) and per-site (prefixed) variants.
---

# Git Flow

## Resolve the repository context first

Read repository instructions, `git status --short --branch`, `git remote -v`, `git branch -a`, and recent commit/merge history before choosing a branch or command. Fetch the relevant remote refs before comparing them.

Resolve source, base, target, and naming in this order: explicit user instruction → repository instructions → verified remote/MR/PR context → the conventions below. A default branch alone does not prove the intended merge target. Ask one focused question only if remaining ambiguity changes the result.

These tables describe MEDcury conventions, not every repository. For other repositories, use their verified conventions. Preserve an existing task branch and unrelated staged/unstaged work; use an isolated worktree when switching would disturb it. If no ticket was supplied, use the repository's descriptive branch convention without inventing a ticket ID.

Before mutation, state the selected base, working branch, and intended target. Continue within authorization already given; creating a branch or committing does not itself authorize pushing, publishing a release, or merging.

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

If the ticket already has a branch (check `git branch -a` for the ticket), continue on it instead of creating a new one. Some existing branches carry a base-branch suffix such as `feature/MPD-XXX-desc-develop` — keep that suffix when continuing.

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

Not every repo has a `develop` — single-stream repos (e.g. `bloodbank_module`, `medhis-closed-api-services`) merge `feature/*` straight into `main`. Verify the applicable target using repository instructions, remote branches, and existing MR/PR history before opening the request. If these disagree and the user has not selected a target, ask rather than silently changing it.

Customer sites: swap `main`/`develop` → `<site>-main`/`<site>-develop`.

Use `glab` for a verified GitLab remote (see the glab-mr skill) and the GitHub workflow for a verified GitHub remote. Use MR/PRs for protected integration branches.

## Tag

Use the repository's verified tag convention; the MEDcury convention is Semver `X.Y.Z`, no leading zeros. Inspect CI configuration to determine what pushing a tag triggers. Verify the release commit and existing tags, and publish only within explicit release authorization.

## Quick Commands

```bash
# After verifying the remote and base, and protecting local changes:
git fetch <remote> <base>
git switch -c <working-branch> <remote>/<base>

# When updating an existing local branch with its verified upstream:
git pull --ff-only
```

Before reporting completion, verify the current branch and requested diff. Report checks actually run and distinguish local changes, commits, pushed changes, open MR/PRs, pending CI, and merged work. Apply deletion and backport follow-ups only when authorized.

## Rules

- Use MR/PRs for protected integration branches, including applicable site-prefixed branches
- Keep each working branch scoped to its ticket/task and target; preserve existing naming
- Feature branch lifetime = sprint (delete after merge)
- Release branch: bugfix only, no new features
