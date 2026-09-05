---
name: jira-plan
description: Read a Jira ticket (Feature/Story or Bug) and produce a structured implementation plan with a todo list for the agent to follow.
disable-model-invocation: true
---
# Jira Implementation Planner Skill

This skill guides the agent in reading a Jira ticket and producing a detailed, actionable implementation plan. It works for both **Feature/Story tickets** and **Bug tickets**, automatically adapting the plan based on the ticket type.

## Trigger

User-invoked: `/jira-plan` — or when asked to plan or prepare an implementation strategy for a Jira ticket. Examples:
- "Plan the implementation for PROJ-001"
- "Read ticket PROJ-123 and create a plan"
- "jira-plan for [Ticket ID]"
- "วางแผนงานจาก ticket [Ticket ID]"
- "อ่าน Jira แล้วช่วยวางแผน implement ให้หน่อย"

## Workflow Instructions

### Step 1: Fetch Jira Ticket Information

- Discover the available Jira site/issue tools by capability and resolve the intended site and issue. Reuse verified context; ask only if multiple plausible sites remain.
- Retrieve the issue using the configured connector. If unavailable, work from user-provided ticket contents and label missing evidence; never invent requirements.
- Extract the following fields:
  - **Issue Type** (Story, Task, Bug, Sub-task, etc.)
  - **Summary** (title)
  - **Description** (full details, requirements, context)
  - **Acceptance Criteria (AC)** — for Feature/Story tickets
  - **Steps to Reproduce / Expected vs Actual** — for Bug tickets
  - **Priority** and **Labels** (if any)
  - **Linked issues** or **parent epic** (if relevant)

### Step 2: Analyze the Ticket

Inspect repository instructions and relevant implementations, callers, schemas, and tests before finalizing the plan. Record concrete paths and evidence. If repository access is unavailable, label proposed files and technical choices as provisional.

Based on the **Issue Type**, switch to the appropriate analysis mode:

#### For Feature / Story / Task tickets:
- Identify all functional requirements from the Description and AC.
- Break down the feature into logical implementation steps (e.g., API, data model, UI, tests).
- List any dependencies, unknowns, or risks.
- Estimate the complexity of each step (Low / Medium / High).

#### For Bug tickets:
- Separate confirmed observations from hypotheses. Plan a reproduction and a check that can falsify the suspected cause before choosing a fix.
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
- [ ] Relevant tests and repository-required checks pass, with evidence recorded
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
[Confirmed evidence, hypotheses, and the next check that distinguishes them]

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

Use the available task/planning tool if present; otherwise return a Markdown checklist. Sequence work by dependencies and risk, including verification as part of the relevant implementation step. Keep items pending until execution actually begins.

### Step 5: Complete the planning handoff

For a planning-only request, return the plan without starting implementation. If the user already requested planning and implementation, continue within that authorization after presenting the plan; do not ask for the same permission again. Ask only about unresolved decisions that materially change scope or behavior, while continuing independent investigation where possible.

Completion: every known AC has an implementation and verification step; dependencies, confirmed paths, assumptions, and blocking questions are identified. Separate future Definition of Done items from work already completed.

## Notes

- Missing AC or description makes the plan provisional; ask only for information necessary to resolve material ambiguity.
- For sub-tasks, preserve their dependencies and boundaries rather than automatically including unrelated linked work.
- This skill does not post to Jira. After implementation, explicitly invoke `jira-cr` or `jira-bug` if available; when installed alone, provide an evidence-based local summary and use available Jira tools only when publication is requested.
