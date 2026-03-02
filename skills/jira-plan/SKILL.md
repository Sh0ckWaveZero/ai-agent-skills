---
name: jira-plan
description: Reads a Jira ticket (Feature/Story or Bug) and generates a structured implementation plan with a todo list for the agent to follow when implementing a feature or fixing a bug.
---
# Jira Implementation Planner Skill

This skill guides the agent in reading a Jira ticket and producing a detailed, actionable implementation plan. It works for both **Feature/Story tickets** and **Bug tickets**, automatically adapting the plan based on the ticket type.

## Trigger

Use this skill when asked to plan, analyze, or prepare an implementation strategy for a Jira ticket. Examples:
- "Plan the implementation for MSL-001"
- "Read ticket HUMC-123 and create a plan"
- "jira-plan for [Ticket ID]"
- "วางแผนงานจาก ticket [Ticket ID]"
- "อ่าน Jira แล้วช่วยวางแผน implement ให้หน่อย"

## Workflow Instructions

### Step 1: Fetch Jira Ticket Information

- Identify the user's Jira Cloud ID using the `mcp_jira_getAccessibleAtlassianResources` tool (cache if already known).
- Fetch the Jira issue details using `mcp_jira_getJiraIssue` with the given Ticket ID.
- Extract the following fields:
  - **Issue Type** (Story, Task, Bug, Sub-task, etc.)
  - **Summary** (title)
  - **Description** (full details, requirements, context)
  - **Acceptance Criteria (AC)** — for Feature/Story tickets
  - **Steps to Reproduce / Expected vs Actual** — for Bug tickets
  - **Priority** and **Labels** (if any)
  - **Linked issues** or **parent epic** (if relevant)

### Step 2: Analyze the Ticket

Based on the **Issue Type**, switch to the appropriate analysis mode:

#### For Feature / Story / Task tickets:
- Identify all functional requirements from the Description and AC.
- Break down the feature into logical implementation steps (e.g., API, data model, UI, tests).
- List any dependencies, unknowns, or risks.
- Estimate the complexity of each step (Low / Medium / High).

#### For Bug tickets:
- Understand the root cause or likely cause from the description.
- Identify what code area(s) are likely affected.
- Define the fix strategy (e.g., patch logic, update validation, fix query).
- List any regression risks or related areas to verify after the fix.

### Step 3: Generate Implementation Plan

Format the plan using the appropriate template below.

#### Feature / Story Plan Template:

```markdown
## Implementation Plan: [Ticket ID] — [Summary]

**Type:** Feature / Story
**Priority:** [Priority]

### Overview
[Brief description of what needs to be built and why]

### Acceptance Criteria Breakdown
| # | AC | Implementation Notes |
|:--|:---|:--------------------|
| 1 | [AC1] | [How to implement] |
| 2 | [AC2] | [How to implement] |

### Implementation Steps
1. [ ] **[Step title]** — [Description] _(Complexity: Low/Medium/High)_
2. [ ] **[Step title]** — [Description] _(Complexity: Low/Medium/High)_
3. [ ] **[Step title]** — [Description] _(Complexity: Low/Medium/High)_

### Files / Modules Likely Affected
- `[file or module path]` — [Reason]

### Dependencies & Risks
- **Dependencies:** [Any APIs, services, or tickets this depends on]
- **Risks:** [Potential issues or unknowns]

### Definition of Done
- [ ] All ACs are implemented and verified
- [ ] Unit/integration tests are written
- [ ] Code reviewed and approved
- [ ] No regression in related features
```

#### Bug Fix Plan Template:

```markdown
## Bug Fix Plan: [Ticket ID] — [Summary]

**Type:** Bug
**Priority:** [Priority]

### Problem Summary
[Concise description of the bug and its impact]

### Root Cause Analysis
[Likely cause of the bug based on the ticket details]

### Fix Strategy
[Describe the approach to fix — what to change and why]

### Implementation Steps
1. [ ] **[Step title]** — [Description]
2. [ ] **[Step title]** — [Description]
3. [ ] **[Step title]** — [Description]

### Files / Modules to Investigate
- `[file or module path]` — [Reason]

### Regression Check
- [ ] [Area to verify after fix]
- [ ] [Related functionality to test]

### Definition of Done
- [ ] Bug is reproduced and root cause confirmed
- [ ] Fix is implemented and tested
- [ ] No new issues introduced
- [ ] Bug verified as resolved in dev/staging
```

### Step 4: Create Todo List

After presenting the plan, use the `TodoWrite` tool to create a structured todo list in the agent session. Each implementation step from the plan should become a separate todo item with appropriate priority:

- Steps marked **High complexity** or steps that **unblock others** → `priority: high`
- Standard implementation steps → `priority: medium`
- Testing, cleanup, and verification steps → `priority: low`

Mark the first actionable step as `in_progress` to signal readiness to begin.

### Step 5: Ask for Confirmation

Before starting any implementation, ask the user:
> "The plan is ready. Should I start implementing, or would you like to adjust anything first?"

Only begin coding or making changes when the user explicitly confirms.

## Notes

- Always adapt the plan based on existing codebase patterns. If you have access to the project, scan relevant files before finalizing the plan.
- If the ticket is missing information (no AC, no description), ask the user to clarify before proceeding.
- For tickets with sub-tasks, plan each sub-task individually and link them in the main plan.
- This skill does **not** post to Jira automatically — it is a planning tool only. Use `jira-cr` or `jira-bug` skills after implementation for CR summary posting.
