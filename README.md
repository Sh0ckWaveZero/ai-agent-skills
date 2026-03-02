# AI Agent Skills

A collection of reusable AI agent skill templates for automating developer workflows.

## Structure

```
skills/
├── jira-bug/    # Bug fix Code Review summary
└── jira-cr/     # Change Request (CR) summary
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
