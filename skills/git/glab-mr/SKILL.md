---
name: glab-mr
description: Prepare and create or update a GitLab merge request with scoped commits, repository conventions, and verified source and target branches.
disable-model-invocation: true
---

# glab-mr

User-invoked: `/glab-mr` to prepare or publish a GitLab MR. Follow the user's requested scope: a draft-only request ends with a local draft; an explicit request to push and create an MR authorizes those steps without asking again. It does not authorize merging.

## 1. Resolve context and intent

Inspect repository instructions, `git status --short --branch`, `git remote -v`, `git branch -a`, and `git log --oneline -10`. Verify the hosting service and project; use this workflow only for GitLab. For GitHub, use its corresponding workflow.

Use the installed `git-flow` skill when available for repository conventions. When installed alone, resolve base/target and commit style from explicit user instructions, repository instructions, then verified remote branches and MR history. Do not assume `develop`, `origin`, a ticket prefix, or a universal commit format.

Fetch relevant refs and inspect existing MRs for the source/target pair before creating one. Reuse an open matching MR; if a prior MR merged, compare against the current target and isolate only remaining requested changes. Ask only when ambiguity about scope or target would change the result.

Inspect repository MR templates and the existing MR description, including required sections and established language. Infer the title and description from the complete verified MR diff and ticket context, including previously committed changes. Use requested assignee/reviewer values, otherwise repository defaults if available; omit optional assignments when no evidence identifies them. Verify exact usernames before assigning them.

Completion: project/host, remote, source, target, requested publication scope, and existing MR state are known.

## 2. Select and verify changes

Read unstaged and staged diffs and inspect relevant untracked files. Preserve unrelated work, including changes already in the index. Stage explicit paths or hunks only; if unrelated staged work would enter the commit, isolate the operation without discarding or committing that work.

Exclude secrets, environment files, and local development configuration unless the user explicitly included a reviewed, safe change. Read the contents of untracked files before selecting them; `git diff <file>` does not show their content.

Inspect both the selected local changes and the complete source-versus-target diff, including previously committed changes. Run repository-required checks and relevant tests. Record actual results, failures, and checks that could not run. Resolve failures within scope before publication; do not silently bypass hooks or claim unrun checks passed.

Completion: the proposed commit and complete MR contain only the requested scope, and validation results are recorded.

## 3. Commit when needed

Use the repository's observed commit style, taking explicit instructions first. If all requested changes are already committed, skip this step.

```bash
git add <explicit-paths>
git diff --cached --check
git diff --cached
git commit -m "<repository-style-message>"
```

Confirm the staged diff immediately before committing. If a hook fails, inspect whether a commit was actually created, fix the failure, re-stage only the intended changes, and retry as appropriate. Preserve published history.

## 4. Publish or return the draft

Read and apply the [MR description guide](references/mr-description.md) before preparing or updating the title and body. Prepare the final title, description, source, target, scope summary, and validation results before requesting any missing publication authorization. Respect prior authorization. For draft-only requests, return these details and stop before push/create/update.

Before publishing, verify the source is the intended working branch and inspect:

```bash
git log --oneline <remote>/<target>..HEAD
git diff --name-status <remote>/<target>...HEAD
git diff --check <remote>/<target>...HEAD
```

Push only the selected working branch. Use the installed `glab` command help to confirm supported create/update options; pass explicit source and target. Prepare multiline descriptions as literal text in a temporary file and use a supported file-input option or structured API body, preserving newlines. The prepared description must meet the guide's completion criteria and the repository template; remove unused optional sections and example placeholders.

Recheck for an existing matching MR immediately before creating one. Update the matching open MR rather than creating a duplicate. Re-read the current description before updating to preserve concurrent human edits, useful attachments, and unrelated content. Refresh stale generated text to match the final scope. If human-authored claims conflict with verified behavior, resolve the conflict rather than silently retaining a misleading claim or deleting the author's context. Preserve human review discussions.

## 5. Verify the result

Re-read the created or updated MR and compare its project, source, target, head SHA, and changed-file scope with the verified local result. Verify the published title/body, ticket and attachment links, and validation claims against the prepared draft and current head. Read pipeline/check status. If the response is uncertain, inspect the remote and existing MRs before retrying a write.

Return the MR URL, branch pair, commit result, checks, and any pending CI or unresolved failure. A successful push or MR creation does not mean CI passed or the MR was merged.

## Optional arguments

`/glab-mr assignee=<username> reviewer=<username> target=<branch>`

Arguments override inferred values. Target has no hardcoded default; an omitted reviewer does not automatically mean the assignee should review their own work.
