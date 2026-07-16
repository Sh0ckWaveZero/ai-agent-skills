---
name: glab-mr-review
description: Review a GitLab merge request via glab CLI — post a summary note plus inline diff comments on specific code lines.
disable-model-invocation: true
---

# glab-mr-review

Review GitLab merge requests with `glab` and post feedback as MR notes and inline diff comments.

**Use `glab` for GitLab — not `gh` (GitHub).**

## Trigger

User-invoked: `/glab-mr-review` — or when the user asks to review an MR, comment on a merge request, post inline review notes, or shares a GitLab MR URL/IID.

## Workflow

### 1. Gather MR context

```bash
glab mr view <iid> --comments
glab mr diff <iid>
```

If branch names are needed:

```bash
glab api "projects/<url-encoded-project-path>/merge_requests/<iid>"
```

Compare locally after fetch:

```bash
git fetch origin <source-branch>
git diff origin/<target>...origin/<source> --stat
git diff origin/<target>...origin/<source> -- path/to/file
```

Read full file context from the source branch when helpful:

```bash
git show 'origin/<source-branch>:path/to/file'
```

### 2. Review the changes

Cover all commits in the MR, not only the latest one. Check correctness, edge cases, security, consistency with project conventions, tests, and UX where relevant.

Group findings by severity:

| Level | Meaning |
|-------|---------|
| Critical | Must fix before merge |
| Medium | Should fix |
| Low | Optional / nit |

### 3. Find valid line numbers for inline comments

**Inline comments only work on lines that appear in the MR diff.**

If glab returns `Line N not found in diff`, that line was not changed in this MR.

```bash
git diff origin/<target>...origin/<source> -- path/to/file
```

| Case | Flag |
|------|------|
| New file | `--line N` (any line in the file) |
| Changed/added line | `--line N` or `--line N:M` |
| Removed line | `--old-line N` |
| File only, no line | `--file path` (omit `--line`) |

If a finding targets unchanged code, comment on the nearest changed line in that file, or put it in the summary note.

### 4. Post comments

**Summary (whole MR):**

```bash
glab mr note create <iid> -m "$(cat <<'EOF'
## Code Review Summary

**Verdict:** <approve / request changes / comment>

- Finding 1
- Finding 2
EOF
)"
```

**Inline (single line):**

```bash
glab mr note create <iid> \
  --file path/to/file.ext \
  --line 42 \
  -m "$(cat <<'EOF'
**Medium — Short title**

Explanation and suggested fix.
EOF
)"
```

**Other options:**

```bash
glab mr note create <iid> --file path/to/file --line 10:15 -m "message"   # range
glab mr note create <iid> --file path/to/file --old-line 7 -m "message"   # removed line
glab mr note create <iid> --reply <discussion-id> -m "message"          # thread reply
glab mr note create <iid> -m "message" --unique                           # skip duplicate
glab mr note create <iid> -m "message" --resolvable=false                 # non-blocking note
```

Flag rules:

- `--line` and `--old-line` require `--file`; cannot be used together
- `--file`, `--reply`, and `--unique` are mutually exclusive
- `--resolvable=false` cannot combine with `--file` / `--line` / `--old-line`

Inline diff comments are **experimental** in glab.

### 5. Posting order

1. Post summary note
2. Post inline comments one at a time; confirm each succeeds
3. On line-not-found errors, re-check the diff and retry on a valid line or move to summary

### 6. Delete a mistaken note

```bash
glab api --method DELETE \
  "projects/<url-encoded-project-path>/merge_requests/<iid>/notes/<note_id>"
```

URL-encode project paths: `/` → `%2F`.

## Report back to the user

```markdown
## Code Review: MR !<iid>

**MR:** <url>
**Source → Target:** `<source>` → `<target>`
**Verdict:** ...

### Summary
...

### Findings
...

### Suggested test plan
- [ ] ...

### Posted to GitLab
- Summary: <url or "not posted">
- Inline: <count> comments
```

Ask before posting to GitLab unless the user already approved.

## Quick reference

| Goal | Command |
|------|---------|
| View MR | `glab mr view <iid>` |
| Diff | `glab mr diff <iid>` |
| General comment | `glab mr note create <iid> -m "..."` |
| Inline comment | `glab mr note create <iid> --file <path> --line <n> -m "..."` |

Use HEREDOC for multi-line `-m` bodies.
