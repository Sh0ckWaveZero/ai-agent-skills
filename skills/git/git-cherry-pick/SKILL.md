---
name: git-cherry-pick
description: Safely apply focused Git commits from one branch or ref onto another branch. Use for cherry-picking fixes, backporting ticket changes, or moving selected commits between release lines.
---

# Git Cherry-pick

Apply only the requested commits onto a branch without merging unrelated changes. This skill is repository- and hosting-provider-agnostic.

## Rules

- Never assume branch names, ticket prefixes, sites, environments, or hosting providers.
- Infer missing values from the user request, repository instructions, branch history, and existing MR/PR context.
- Do not ask the user to fill out a form. Show one inferred plan and ask only when ambiguity changes the result.
- Create the working branch from the target branch, never from the source branch.
- Cherry-pick commits oldest-first with `git cherry-pick -x`.
- Preserve unrelated local changes; use a temporary worktree when needed.
- Never modify environment files, secrets, certificates, private keys, or generated local backups.
- Do not force-push, rewrite published history, or merge directly into a protected branch without explicit permission.

## 1. Infer the intent

Classify the request:

- Explicit commit: use the named commit.
- Ticket from source to target: find and verify the ticket's commits.
- Backport/fix target: select the smallest relevant commit set.
- Merge source branch into target: do not cherry-pick; hand off to the normal MR/PR workflow.

Inspect context first:

```bash
git status --short --branch
git log --oneline --decorate -10
git branch --all --no-color
```

Fetch named refs before comparing them. If source, target, or scope is unclear, ask one focused question.

Before mutation, show:

```text
Plan:
- Mode: <ticket-focused cherry-pick>
- Source: <source ref>
- Target: <target branch>
- Commits: <short SHAs and count>
- Files: <paths or count>
- New branch: <working branch>
Proceed?
```

## 2. Select commits and create the branch

Compare source and target:

```bash
git log --oneline --decorate <target>..<source>
git show --stat --oneline <commit>
git diff --stat <target>...<source>
```

For ticket-focused work:

- Prefer commits explicitly named by the user.
- Otherwise filter by ticket/issue reference and verify each commit's files and parent.
- Include prerequisites only when the selected change depends on them.
- Reject unrelated modules, tickets, or an entire integration branch included by accident.

After confirmation:

```bash
git fetch <remote> <target>
git switch -c <working-branch> <remote>/<target>
```

If the branch already exists, inspect it. Do not reset or overwrite it without permission.

## 3. Cherry-pick

Apply selected commits oldest-first:

```bash
git cherry-pick -x <oldest-commit>
git cherry-pick -x <next-commit>
```

For a merge commit, inspect its parents and do not guess the mainline. Prefer the original non-merge commit when available.

On conflict:

1. Stop and report the conflicting files.
2. Inspect both sides and the target context.
3. Resolve only when the intended behavior is clear.
4. Run focused checks.
5. Continue with `git cherry-pick --continue`, or abort with `git cherry-pick --abort`.

For an empty cherry-pick, verify whether the change already exists in the target. Report it and skip only after verification.

## 4. Verify and publish

Before pushing, confirm scope:

```bash
git diff --name-status <remote>/<target>...HEAD
git diff --stat <remote>/<target>...HEAD
git diff --check
git log --oneline <remote>/<target>..HEAD
```

Run the narrowest relevant checks. Stop if the diff contains secrets, environment files, unrelated changes, unexpected dependency changes, or a different file/commit set than the plan.

After confirmation to publish:

```bash
git push -u <remote> <working-branch>
```

Use the repository's hosting-specific skill for MR/PR creation. Pass explicit source and target branches; never assume a default target. Check for an existing request with the same source/target before creating a duplicate.

After creating or updating the MR/PR, re-read it and verify:

- Source and target are correct.
- State is open, mergeable, or intentionally merged.
- Displayed SHA matches the pushed branch.
- File count and checks match the verified scope.

If the hosting service shows stale status, refetch or poll once before reporting success. Do not close or delete another request automatically unless the user authorizes superseding it.

## Safety Boundaries

This skill prepares and publishes a focused branch. It does not perform a full branch merge or final merge by default. Report the branch, selected commits, changed files, checks, push result, and MR/PR status.
