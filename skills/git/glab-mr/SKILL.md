---
name: glab-mr
description: Create a GitLab Merge Request from the current branch via glab CLI — smart staging, project-standard commit, push, open MR with assignee/reviewer.
disable-model-invocation: true
---

# glab-mr

Automates commit → push → GitLab MR creation with smart staging and proper assignee/reviewer tagging.

## Trigger

User-invoked: `/glab-mr` — or any variant asking to open a GitLab merge request ("สร้าง MR", "create MR", "push and create MR", "push MR").

## Workflow

### 1. Gather context

```bash
git status
git log --oneline -5
git branch --show-current   # extract TICKET-ID from branch name
```

Ask the user if not clear:
- **Files to commit** (if ambiguous — see exclusions below)
- **MR title / description** (if no Jira ticket context)
- **Assignee / Reviewer** usernames (default: ask user)
- **Target branch** (default: `develop`)

### 2. Smart staging — what to SKIP

Never stage these unless user explicitly asks:

| Pattern | Reason |
|---|---|
| `*.env`, `.env*` | secrets |
| Files with only local dev config changes | not for production |

Run `git diff <file>` on each modified file to verify the change is feature-related, not local config noise.

### 3. Commit

Format: `[TICKET-ID] - [Module] Description`

Examples:
- `[ABC-001] - [Module Name] Short description`
- `[ABC-002] - [Module Name] Fix issue description`

```bash
git add <relevant-files-only>
git commit -m "[TICKET-ID] - [Module] Description"
```

### 4. Push

```bash
git push origin <current-branch>
```

### 5. Lookup reviewer/assignee

```bash
glab api "users?search=<username>"
```

Confirm the `username` field matches before using.

### 6. Create MR

```bash
glab mr create \
  --source-branch <current-branch> \
  --target-branch develop \
  --title "[TICKET-ID] - [Module] Description" \
  --description "$(cat <<'EOF'
## Summary
- <bullet points of what changed>

## Changes
- <file: what changed>
EOF
)" \
  --assignee <username> \
  --reviewer <username>
```

Return the MR URL to the user.

## Args

Arguments can be passed inline: `/glab-mr assignee=<username> target=main`

| Arg | Default | Notes |
|---|---|---|
| `assignee` | ask user | GitLab username |
| `reviewer` | same as assignee | GitLab username |
| `target` | `develop` | target branch |

## Notes

- This project uses **GitLab**, not GitHub — always use `glab`, never `gh`
- Commit message format is **mandatory** — match existing `git log` style
- If pre-commit hook fails: fix issue, re-stage, create **new** commit (never `--amend` on published commits)
