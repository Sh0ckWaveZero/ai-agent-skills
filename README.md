# AI Agent Skills

A collection of reusable AI agent skill templates for automating developer workflows.

## Structure

```
skills/
├── jira-bug/    # Bug fix Code Review summary
└── jira-cr/     # Change Request (CR) summary
```

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
---
# Skill Title

## Trigger

## Workflow Instructions
```
