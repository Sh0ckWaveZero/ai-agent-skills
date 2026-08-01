---
name: jira-mcp
description: Create new Jira tickets through the configured Atlassian MCP tools. Use when the user asks to create, open, or draft a new Jira issue, story, task, bug, or sub-task from requirements, code context, meeting notes, or a project key. Do not use for reading or updating existing issues, implementation planning, bug CR summaries, change-request summaries, or story-point estimation when the dedicated Jira skills apply.
---

# Create Jira Ticket

Create one new Jira issue through the live `mcp__atlassian__*` tools. Keep the ticket faithful to the user's source material, validate Jira metadata before writing, preview the payload, obtain confirmation, and verify the created issue.

## Scope

This skill covers:

- New Story, Task, Bug, Sub-task, or another Jira issue type.
- Project and issue-type discovery.
- Required-field discovery.
- Assignee lookup by Jira account ID.
- Drafting and confirming summary, description, acceptance criteria, labels, components, priority, parent, fix versions, and custom fields.
- Creating and verifying the new issue.

Do not edit, transition, comment on, assign, link, or log work on an existing issue in this skill. Route those requests to the appropriate Jira operation skill or handle them directly only when another skill explicitly covers them.

## Required Inputs

Collect these before creation:

- Project key, unless it can be resolved unambiguously from the user's context.
- Issue type, such as `Story`, `Task`, `Bug`, or `Sub-task`.
- Summary or enough context to draft one.
- Description or enough context to draft one.

Also collect when relevant:

- Acceptance criteria, steps to reproduce, expected versus actual behavior, environment, links, parent issue, assignee, priority, labels, components, fix versions, due date, and custom fields.

Do not invent missing business requirements. Ask only for information that is required to create the issue or materially changes its meaning. Clearly mark any wording inferred from the user's context in the preview.

## Tool Sequence

Use the exact tools available in the current runtime:

1. `mcp__atlassian__getAccessibleAtlassianResources` — resolve `cloudId` when a usable Atlassian hostname is not already known.
2. `mcp__atlassian__getVisibleJiraProjects` — validate or find the project. Use `action: "create"` when checking create access.
3. `mcp__atlassian__getJiraProjectIssueTypesMetadata` — list issue types available in the project.
4. `mcp__atlassian__getJiraIssueTypeMetaWithFields` — inspect required fields for the selected project and issue type. Use `requiredFieldsOnly: true` first.
5. `mcp__atlassian__lookupJiraAccountId` — resolve an assignee's account ID when assignment is requested.
6. `mcp__atlassian__searchJiraIssuesUsingJql` — optionally check for likely duplicates when the project and summary make duplication plausible.
7. `mcp__atlassian__createJiraIssue` — create the ticket after confirmation.
8. `mcp__atlassian__getJiraIssue` — verify the created issue using the returned key or ID.

Do not use hardcoded aliases such as `mcp__atlassian-mcp-server_*`, and do not guess IDs returned by metadata tools.

## Cloud ID Resolution

1. If the user provides an Atlassian URL, try its hostname (for example, `site.atlassian.net`) as `cloudId`.
2. If no cloud ID is known or the hostname fails, call `mcp__atlassian__getAccessibleAtlassianResources`.
3. Reuse the resolved cloud ID for every subsequent tool call.
4. Surface authentication, site-selection, and permission errors without exposing credentials or tokens.

## Project and Issue-Type Validation

1. Resolve the project key. If multiple projects match, ask the user to choose; never silently choose by name.
2. Fetch the project's issue types. Match the user's requested type to an exact available type.
3. If the user says only “ticket” or “Jira issue”, ask for the type unless the surrounding context makes it unambiguous.
4. Fetch required fields for the selected type. Use the returned metadata to identify required custom fields, parent requirements, and valid field values.
5. Do not send optional fields merely because they exist in metadata.

## Drafting Rules

Create a compact, actionable ticket:

- Summary: state the outcome or defect clearly; avoid adding facts not present in the source.
- Story/Task description: include context, goal, scope, constraints, and acceptance criteria when provided.
- Bug description: include actual behavior, expected behavior, reproduction steps, environment, impact, and evidence when provided.
- Acceptance criteria: preserve the user's criteria; do not convert assumptions into acceptance criteria.
- Preserve URLs and issue keys exactly.
- Keep user-provided terminology and identifiers unchanged unless normalization is necessary for Jira fields.

Use Markdown content unless the user explicitly needs Atlassian Document Format. Pass `contentFormat: "markdown"` to the create tool for ordinary descriptions.

## Build the Create Payload

Prepare these fields for `mcp__atlassian__createJiraIssue`:

- `cloudId`
- `projectKey`
- `issueTypeName`
- `summary`
- `description`
- `contentFormat: "markdown"` unless ADF is required
- `parent` only for a valid sub-task or explicitly requested parent relationship
- `assignee_account_id` only after account lookup
- `additional_fields` for priority, labels, components, fix versions, due date, and custom fields

Use exact metadata IDs and valid values for custom fields. Do not pass an assignee display name. Do not apply a transition during creation unless the user explicitly requests it and the API supports the requested workflow.

## Duplicate Check

Run a duplicate search when the user asks for it, the request is generated from a repeated source, or the summary strongly resembles an existing ticket:

1. Build a narrow JQL query scoped to the project and a distinctive summary phrase.
2. Search with `searchResultMode: "issues"`, a minimal field list, and `responseContentFormat: "markdown"`.
3. Show likely matches and ask whether to continue, update an existing issue, or cancel.

Do not treat a duplicate search as proof that no duplicate exists; Jira search can be incomplete or phrase-sensitive.

## Preview and Approval

Before calling `mcp__atlassian__createJiraIssue`, show a concise preview containing:

- Project and issue type.
- Summary.
- Description and acceptance criteria.
- Assignee, parent, priority, labels, components, fix versions, and custom fields.
- Any inferred values, unresolved assumptions, or likely duplicates.

Obtain confirmation before creation. If required information is missing, ask for it instead of creating a partial ticket. For a bulk request, list every intended ticket and obtain explicit approval for the full scope.

## Create and Verify

1. Call `mcp__atlassian__createJiraIssue` once after approval.
2. If the call returns a clear issue key or ID, call `mcp__atlassian__getJiraIssue` to verify the summary, type, description, status, assignee, and important fields.
3. If creation fails ambiguously, do not retry immediately. Search for the exact project and summary first to avoid creating a duplicate.
4. Report the created issue key, URL when available, final status, and any fields Jira rejected or defaulted.

## Safety Rules

- Treat ticket creation as an external mutation that can notify watchers, automation, and integrations.
- Never create a ticket in an uncertain project or with an unverified issue type.
- Never guess cloud IDs, account IDs, custom-field IDs, or required-field values.
- Never convert assumptions into requirements or acceptance criteria without labeling them.
- Never expose credentials, tokens, or secrets copied from tool errors or source text.
- If the requested operation is not ticket creation, stop and route it to the correct Jira skill.
