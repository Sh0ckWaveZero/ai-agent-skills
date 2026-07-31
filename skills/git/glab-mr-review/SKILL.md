---
name: glab-mr-review
description: Review a GitLab merge request, produce an evidence-based draft, and optionally post summary and inline diff comments.
disable-model-invocation: true
---

# glab-mr-review

Review a GitLab merge request with `glab`. Separate analysis from publishing: produce a review draft first, then post it only after the user explicitly approves.

**Use `glab` for GitLab — not `gh` (GitHub).**

## Trigger

User-invoked: `/glab-mr-review` — or when the user asks to review an MR, comment on a merge request, post inline review notes, or shares a GitLab MR URL/IID.

## Safety and operating modes

- Default to **draft mode**. Do not create, edit, or delete GitLab notes until the user approves publishing.
- Treat `Ready`, `Comment`, and `Request changes` as review verdicts. Do not approve the MR itself unless the user explicitly asks for that separate action.
- Review all commits in the MR, not only the latest commit.
- Do not report a finding without evidence from the diff, full-file context, tests, or project conventions.

The workflow has three modes:

| Mode | Behavior |
|------|----------|
| `draft` | Analyze the MR and return the review without posting anything |
| `post` | Publish the approved summary and inline comments |
| `follow-up` | Read existing discussions and reply to or update specific findings |

## Workflow

### 1. Define scope

Resolve the project and MR IID from the URL or current repository. Confirm the intended mode and any review focus such as security, performance, business logic, or tests.

If the user did not grant posting permission, use `draft` mode.

### 2. Gather MR context

Start with the MR metadata, discussions, and complete diff:

```bash
glab mr view <iid> --comments
glab mr diff <iid>
```

When branch names, commit SHAs, or the project path are needed:

```bash
glab api "projects/<url-encoded-project-path>/merge_requests/<iid>"
```

Inspect pipeline status and relevant test results when available. If local comparison is useful, fetch the source branch and compare the actual target and source refs:

```bash
git fetch origin <source-branch>
git diff origin/<target>...origin/<source> --stat
git diff origin/<target>...origin/<source> -- path/to/file
```

Read the full source-branch file when the changed lines need surrounding context:

```bash
git show 'origin/<source-branch>:path/to/file'
```

### 3. Understand the change

Before looking for defects, summarize:

- What problem the MR is solving
- What behavior or contract is changing
- Which modules, APIs, data, or user flows are affected
- Which assumptions the implementation relies on

Use this summary to distinguish intended behavior from regressions.

### 4. Review the implementation

Check the complete change across these dimensions:

1. Correctness and business logic
2. Error handling and edge cases
3. Security, authorization, validation, and sensitive data
4. Performance and resource usage
5. Compatibility with existing callers and data
6. Maintainability and project conventions
7. Tests, test coverage, and CI expectations
8. UX or API behavior when relevant

Run the smallest relevant checks when the repository provides them. Report checks that were not run instead of implying that they passed.

### 5. Create and validate findings

Group findings by severity:

| Level | Meaning |
|-------|---------|
| Critical | Security issue, data loss, broken production behavior, or a blocker that must be fixed before merge |
| Medium | A likely bug, missing edge case, compatibility problem, or important missing test |
| Low | Optional improvement, maintainability concern, or non-blocking nit |

Each finding must contain:

- A short, specific title
- The severity
- The triggering condition or evidence
- The impact
- A practical suggested fix or next step

Before publishing, remove false positives, merge duplicate findings, and check existing discussions so the same issue is not reported twice.

### 6. Map findings to valid diff lines

Inline comments must point to a line present in the MR diff. Verify with:

```bash
git diff origin/<target>...origin/<source> -- path/to/file
```

| Finding location | Flag |
|------------------|------|
| Added or changed line | `--line N` or `--line N:M` |
| Removed line | `--old-line N` |
| File-level concern | `--file path` without a line |

If the problem is in unchanged code, comment on the nearest changed line only when it provides useful context; otherwise put the finding in the summary. If GitLab rejects a line, re-check the diff and relocate the finding or move it to the summary.

### 7. Produce the review draft

Return the draft in this format before publishing:

```markdown
## Code Review: MR !<iid>

**MR:** <url>
**Source → Target:** `<source>` → `<target>`
**Verdict:** Ready / Comment / Request changes

### Summary
<intent, overall assessment, and main risks>

### Findings

#### Critical
- ...

#### Medium
- ...

#### Low
- ...

### Suggested Test Plan
- [ ] ...

### Checks
- Passed: ...
- Not run: ...
```

Ask for explicit approval before switching from `draft` to `post`.

### 8. Publish the approved review

Post the whole-MR summary first:

```bash
glab mr note create <iid> -m "$(cat <<'EOF'
## Code Review Summary

**Verdict:** <ready / request changes / comment>

- Finding 1
- Finding 2
EOF
)"
```

Then post inline comments one at a time and confirm each succeeds:

```bash
glab mr note create <iid> \
  --file path/to/file.ext \
  --line 42 \
  -m "$(cat <<'EOF'
**Medium — Short title**

Evidence, impact, and suggested fix.
EOF
)"
```

Useful options:

```bash
glab mr note create <iid> --file path/to/file --line 10:15 -m "message"
glab mr note create <iid> --file path/to/file --old-line 7 -m "message"
glab mr note create <iid> --reply <discussion-id> -m "message"
glab mr note create <iid> -m "message" --unique
```

Inline diff comments are experimental in `glab`. On a line-not-found error, do not keep retrying the same line: re-check the diff and use a valid changed line or the summary note.

### 9. Correct publishing mistakes

Record note IDs and URLs as each post succeeds. To delete a mistaken note:

```bash
glab api --method DELETE \
  "projects/<url-encoded-project-path>/merge_requests/<iid>/notes/<note_id>"
```

URL-encode project paths (`/` becomes `%2F`).

### 10. Report the result

After draft or publishing, report:

- MR URL and source → target branches
- Verdict and findings by severity
- Checks run and checks not run
- Summary note URL, or `not posted`
- Number of successful inline comments
- Any comments that could not be anchored or published

## Quick reference

| Goal | Command |
|------|---------|
| View MR and discussions | `glab mr view <iid> --comments` |
| View diff | `glab mr diff <iid>` |
| General comment | `glab mr note create <iid> -m "..."` |
| Inline comment | `glab mr note create <iid> --file <path> --line <n> -m "..."` |
| Reply to discussion | `glab mr note create <iid> --reply <discussion-id> -m "..."` |

