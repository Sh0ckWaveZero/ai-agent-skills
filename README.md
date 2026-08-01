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

That's it — no configuration needed. Each skill ships with its own trigger rules.

## Skills

| Skill | Invocation | Description |
|-------|-----------|-------------|
| [`git-flow`](skills/git/git-flow/) | model | Git workflow reference — branch naming, commit format, MR targets, tags |
| [`git-cherry-pick`](skills/git/git-cherry-pick/) | model | Safely apply focused commits from one branch or ref onto another |
| [`glab-mr`](skills/git/glab-mr/) | user | Create a GitLab MR via `glab` — stage, commit, push, open MR |
| [`glab-mr-review`](skills/git/glab-mr-review/) | user | Review a GitLab MR in draft mode, then optionally post summary and inline diff comments via `glab` |
| [`jira-bug`](skills/jira/jira-bug/) | user | Generate a Bug CR summary from staged changes, post to Jira |
| [`jira-cr`](skills/jira/jira-cr/) | user | Generate a Change Request summary from staged changes, post to Jira |
| [`jira-plan`](skills/jira/jira-plan/) | user | Read a Jira ticket and produce an implementation plan + todo list |
| [`jira-story-point`](skills/jira/jira-story-point/) | model | Estimate Jira Story Points from ticket evidence and comparable work |
| [`jira-mcp`](skills/jira/jira-mcp/) | model | Draft, create, and verify new Jira tickets through Atlassian MCP |
| [`react-hook-form-zod`](skills/frontend/react-hook-form-zod/) | model | Type-safe React forms with React Hook Form + Zod validation |

### Invocation types

- **model** — the agent fires the skill autonomously when the trigger matches; no need to type anything.
- **user** — invoke explicitly with `/<skill-name>`; the agent will not fire it on its own. This keeps context lean for specialised workflows.

## Usage

### User-invoked skills

Type `/<skill-name>` or say the trigger phrase:

| What you type | What happens |
|---|---|
| `/glab-mr` or "สร้าง MR" | Stages relevant files, commits, pushes, opens a GitLab MR with assignee/reviewer |
| `/glab-mr-review` or paste an MR URL/IID | Reviews the MR, returns a draft first, and posts summary + inline comments only after approval |
| `/jira-bug PROJ-123` or "Create a bug CR for PROJ-123" | Compares staged changes vs. the Jira bug, posts a CR summary comment |
| `/jira-cr PROJ-123` or "Create a CR for PROJ-123" | Compares staged changes vs. the ticket AC, posts a CR summary comment |
| `/jira-plan PROJ-123` or "Plan the implementation for PROJ-123" | Reads the ticket, generates a plan + todo list, waits for your go-ahead |

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
→ git-flow kicks in: bugfix/PROJ-456-login-throttling, based off main
```

```
"Add a reset-password form with Zod validation"
→ react-hook-form-zod kicks in: schema with email + password fields, client+server validation
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
│   └── jira-mcp/             # create and verify new Jira tickets via Atlassian MCP
└── frontend/                # Frontend patterns
    └── react-hook-form-zod/ # React Hook Form + Zod validation
```

Each skill lives in its own directory with a `SKILL.md` file.

## Installation

Install this skill collection using the `npx skills` command:

```bash
npx skills add https://github.com/Sh0ckWaveZero/ai-agent-skills.git
```

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
