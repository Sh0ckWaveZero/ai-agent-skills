---
name: jira-story-point
description: Estimate Jira Story Points from a ticket's requirements, acceptance criteria, dependencies, and comparable completed Jira work. Use when the user asks to estimate, size, or suggest Story Points for a Jira Story, Task, Feature, or Bug, including requests such as `/jira-story-point PROJ-123`, "ประเมิน story point จาก Jira", or "ช่วย size ticket นี้".
---

# Jira Story Point Estimator

Estimate the total effort for a PBI to reach the team's Definition of Done (DoD), using Jira evidence and the team's Fibonacci scale. The estimate includes implementation, testing, review, documentation/configuration, and the work needed to push or release the PBI when those activities are part of the DoD. Do not update the Jira issue unless the user explicitly asks for that after reviewing the estimate.

## Workflow

### 1. Fetch the ticket

1. Identify the Jira cloud/site resource with the configured Jira MCP resource-discovery tool, usually `mcp_atlassian-mcp-server_getAccessibleAtlassianResources`.
2. Fetch the issue with the configured Jira issue tool, usually `mcp_atlassian-mcp-server_getJiraIssue`.
3. Extract the issue key, type, summary, description, acceptance criteria, priority, labels, components, parent/linked issues, dependencies, and any existing Story Point field.
4. Extract the DoD if it is present in the Jira ticket, project documentation, or team context. If it is unavailable, use the DoD coverage checklist below and mark the affected items as assumptions.
5. If the ticket is missing a description or acceptance criteria, state that the estimate is provisional and list the missing information. Do not fill gaps with invented requirements.

### 2. Gather calibration evidence

Search for 3–8 recently completed issues from the same project with available Story Points. Prefer matches in this order:

1. Same issue type and similar feature/component.
2. Same implementation surface (frontend, backend, data migration, integration, or cross-system).
3. Same level of ambiguity and testing/deployment impact.

Use the configured Jira search tool, usually `mcp_atlassian-mcp-server_searchJiraIssuesUsingJql`, with a narrow JQL query. If search or Story Point history is unavailable, continue with the rubric below and label the confidence as Low rather than failing.

Never use the current ticket's existing Story Point as independent evidence. Treat it only as a value to compare against and explicitly call out if it conflicts with the estimate.

### 3. Decompose and score the work

Break the ticket into deliverable slices, such as API/domain logic, database/schema, UI, external integration, permissions, tests, migration, and release/configuration work. For each slice, record:

- Scope: amount of behavior and acceptance criteria.
- Complexity: technical difficulty, branching, and edge cases.
- Integration/dependency: number of systems, contracts, teams, or sequencing constraints.
- Uncertainty: unknown requirements, unfamiliar code, or risk of rework.
- DoD completion: tests, code review, documentation/configuration, acceptance evidence, deployment/push, and post-release checks required by the team.

Estimate the whole PBI through DoD, not just coding effort. Use the team's Fibonacci scale: `1, 2, 3, 5, 8, 13, 21`. Use the duration bands below as the team's planning calibration, not as an exact hour calculation or a delivery promise.

Use this team anchor rubric:

| Points | DoD-inclusive planning duration |
|---:|---|
| 1 | 2 hours or less |
| 2 | About half a day |
| 3 | 1 day |
| 5 | 2–3 days |
| 8 | 1 week |
| 13 | 1–2 weeks |
| 21 | More than 2 weeks, possibly a month; split before planning when practical |

Select the smallest point value whose duration band and complexity cover the complete DoD effort. Move up one Fibonacci bucket when uncertainty, integration, regression validation, or release work is material—not merely because the description is long. If the PBI exceeds the 21-point band, recommend splitting it rather than inventing a larger value.

### 4. Produce the estimate

Return the following structure:

```markdown
## Story Point Estimate: [KEY] — [SUMMARY]

**Recommended:** [N] points
**Range:** [N1–N2] points
**Confidence:** High / Medium / Low

### Evidence
- [Ticket facts used]
- [Comparable completed issues and their points, or why calibration was unavailable]

### Breakdown
| Slice | Scope / complexity | Risk or dependency | Relative weight |
|---|---|---|---|
| ... | ... | ... | ... |

### DoD coverage
| DoD activity | Included effort | Evidence / assumption |
|---|---|---|
| Implementation | Included / N/A / Unknown | ... |
| Automated and manual testing | Included / N/A / Unknown | ... |
| Code review and rework | Included / N/A / Unknown | ... |
| Documentation/configuration | Included / N/A / Unknown | ... |
| Push, deployment, or release verification | Included / N/A / Unknown | ... |
| Product acceptance and handoff | Included / N/A / Unknown | ... |

### Rationale
[Explain why the recommendation fits the anchors and comparable work. Mention the main driver of the estimate.]

### Assumptions and unknowns
- [Assumption]
- [Unknown that could change the estimate]

### Planning note
[Say whether the ticket is small enough to keep as one item. For 13 or 21, recommend concrete split boundaries.]

### Questions before final sizing
- [Only questions that could materially change the point value]
```

Keep the recommendation to one primary value. Use a range only to expose uncertainty, not to avoid making a decision. If the ticket is a Bug, estimate the fix plus regression validation and any data/configuration work, not the historical time already spent diagnosing it.

## Guardrails

- Story Points remain the primary estimate. The duration bands are this team's calibration guide; do not treat them as exact hours, individual task quotas, or a delivery-date promise.
- Include all DoD work in the point selection. Do not label a PBI as 1 point merely because the code change is small if testing, review, release, or acceptance makes the complete work larger.
- Do not infer points from priority, assignee, labels, or ticket age alone.
- Do not count unrelated linked issues as part of the estimate; list them as dependencies unless the ticket explicitly includes their work.
- Distinguish missing acceptance criteria from technical uncertainty.
- If comparable issues disagree widely, report the spread and lower confidence; do not average blindly.
- Flag requirements that are too broad, cross-team, or uncertain for reliable sizing and propose a split.
- Keep any write operation (editing Story Points, adding a Jira comment, or transitioning status) opt-in and ask for confirmation immediately before it.
