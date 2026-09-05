# AI Agent Skills

<p align="center">
  <img src="assets/ai-agent-skills-banner.png" alt="AI Agent Skills — Practical workflows for better engineering" width="100%" />
</p>

A collection of reusable AI agent skills for automating developer workflows — Git workflow, GitLab MR automation, Jira CR/planning, and React form validation.

## Quickstart

```bash
# 1. Install the collection
npx skills add https://github.com/Sh0ckWaveZero/ai-agent-skills.git

# 2. Restart your agent session (so it picks up new skills)

# 3. Use a skill — two ways:
#    - Type a slash command:  /glab-mr
#    - Or just ask in natural language (model-invoked skills fire on their own)
```

Each skill ships with its own workflow. GitLab and Jira operations require the corresponding CLI or connector, authentication, and project access.

## Skills

| Skill | Invocation | Description |
|-------|-----------|-------------|
| [`git-flow`](skills/git/git-flow/) | model | Git workflow reference — branch naming, commit format, MR targets, tags |
| [`git-cherry-pick`](skills/git/git-cherry-pick/) | model | Safely apply focused commits from one branch or ref onto another |
| [`glab-mr`](skills/git/glab-mr/) | user | Prepare or publish a scoped GitLab MR; reuse an existing matching MR |
| [`glab-mr-review`](skills/git/glab-mr-review/) | user | Review against a team standard; evidence-based findings, verdicts, and optional publication |
| [`jira-bug`](skills/jira/jira-bug/) | user | Generate an evidence-based Bug CR draft; publish when requested |
| [`jira-cr`](skills/jira/jira-cr/) | user | Generate an evidence-based Change Request draft; publish when requested |
| [`jira-plan`](skills/jira/jira-plan/) | user | Read a Jira ticket and produce an implementation plan + todo list |
| [`jira-story-point`](skills/jira/jira-story-point/) | model | Estimate Jira Story Points from ticket evidence and comparable work |
| [`jira-mcp`](skills/jira/jira-mcp/) | model | Draft, create, and verify new Jira tickets through Atlassian MCP |
| [`react-hook-form-zod`](skills/frontend/react-hook-form-zod/) | model | Type-safe React forms with React Hook Form + Zod validation |

### Invocation types

- **model** — the agent fires the skill autonomously when the trigger matches; no need to type anything.
- **user** — invoke explicitly with `/<skill-name>`; the agent will not fire it on its own. This keeps context lean for specialised workflows.

## Usage

### User-invoked skills

Explicitly invoke `/<skill-name>` (or name the skill in a supported client). Natural-language examples below describe intent; automatic discovery depends on the agent and invocation settings:

| What you type | What happens |
|---|---|
| `/glab-mr` or "สร้าง MR" | Verifies scope and repository conventions, then commits/pushes and creates or updates an MR when requested |
| `/glab-mr-review` or paste an MR URL/IID | Reviews the MR diff; publishes summary and inline comments only with authorization |
| `/jira-bug PROJ-123` or "Create a bug CR for PROJ-123" | Compares the selected Git scope with the bug, drafts a summary, and posts when requested |
| `/jira-cr PROJ-123` or "Create a CR for PROJ-123" | Maps ticket AC to the selected Git scope and verification evidence; posts when requested |
| `/jira-plan PROJ-123` or "Plan the implementation for PROJ-123" | Reads the ticket, generates a grounded plan + checklist; continues implementation only when requested |

### Model-invoked skills

These fire automatically when the agent detects the trigger — just work normally and it'll apply them:

| Skill | Fires when you… |
|---|---|
| `git-flow` | Create a branch, write a commit, tag a release, or ask where to merge |
| `git-cherry-pick` | Ask to cherry-pick, backport, or move selected ticket commits between branches |
| `react-hook-form-zod` | Build a form, add validation, or hit a resolver/uncontrolled-field error |
| `jira-story-point` | Ask to estimate, size, or suggest Story Points for a Jira ticket |
| `jira-mcp` | Ask to create, open, or draft a new Jira ticket from requirements or notes |

Example — just ask naturally:

```
"ช่วย branch ใหม่สำหรับ PROJ-456 เรื่อง login throttling หน่อย"
→ git-flow checks repository conventions and verified refs before selecting the branch and base
```

```
"Add a reset-password form with Zod validation"
→ react-hook-form-zod kicks in: inspects the form contract and implements matching client/server validation
```

## Structure

```
skills/
├── git/                     # Git & GitLab workflow
│   ├── git-flow/            # branch naming, commit format, MR targets, tags
│   ├── git-cherry-pick/      # focused commit transfer between branches
│   ├── glab-mr/             # create GitLab MR via glab CLI
│   └── glab-mr-review/      # review GitLab MR + inline comments
├── jira/                    # Jira automation
│   ├── jira-bug/            # Bug fix Code Review summary
│   ├── jira-cr/             # Change Request (CR) summary
│   ├── jira-plan/           # implementation planner
│   ├── jira-story-point/    # Jira story point estimator
│   └── jira-mcp/            # create and verify Jira tickets through MCP
└── frontend/                # Frontend patterns
    └── react-hook-form-zod/ # React Hook Form + Zod validation
```

Each skill lives in its own directory with a `SKILL.md` file. Branch-specific guidance belongs in linked `references/` files; executable starting points belong in `templates/`. Keep required resources inside the skill so individual installation works.

## Installation

Install this skill collection using the `npx skills` command:

```bash
npx skills add https://github.com/Sh0ckWaveZero/ai-agent-skills.git
```

## Merge request descriptions

`glab-mr` follows the repository template and the [MR description guide](skills/git/glab-mr/references/mr-description.md): explain the problem, final behavior, approach, and actual verification; add review focus, visuals/API examples, or deployment details when useful. Keep small MRs concise and preserve human context when updating.

## Code review standard

`glab-mr-review` includes a [review standard](skills/git/glab-mr-review/references/review-standard.md), [comment format and labeled emoji](skills/git/glab-mr-review/references/comment-format.md), and [calibration cases](skills/git/glab-mr-review/references/review-cases.md). Severity, blocking status, evidence, and verdict are separate. Re-reviews track existing findings and inspect new changes. Emoji can be omitted for repositories that prefer plain text.

## Validation

Run `python3 tests/validate_skills.py` for structural checks and use the [workflow scenarios](tests/skill-workflows.md) to review behavior after changes. Run `git diff --check` as well. These scenarios are review fixtures, not proof of a live GitLab/Jira run. See the [validation record](tests/validation-results.md) for executed checks and limits.

## Creating a New Skill

Add a directory under `skills/` with a `SKILL.md` file:

```markdown
---
name: my-skill
description: Brief description of what this skill does and when to trigger it.
disable-model-invocation: true   # set true for user-invoked skills
---

# Skill Title

## Trigger

User-invoked: `/my-skill` — or describe when the user would invoke it.

## Workflow

1. Step one
2. Step two
```

### Frontmatter fields

| Field | Purpose |
|-------|---------|
| `name` | Skill identifier (matches the directory name) |
| `description` | Front-load the leading word; for model-invoked skills, include trigger phrasing ("Use when…") |
| `disable-model-invocation` | Omit for model-invoked; set `true` for user-invoked-only skills |
