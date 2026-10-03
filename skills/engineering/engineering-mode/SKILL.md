---
name: engineering-mode
description: Execute scoped engineering work with task-specific checks and reviewable evidence. Use when implementing a feature, diagnosing a bug, refactoring, or verifying a change across multiple steps; also supports explicit /engineering-mode invocation.
---

# Engineering Mode

Turn the requested outcome into a small, reviewable change and evidence that supports it. Apply to the current task and its follow-ups; do not make this a permanent mode for unrelated requests. A plan-only or explanation-only request remains that kind of request.

## Establish the contract

Read applicable repository instructions and inspect the working tree before editing. Resolve the requested behavior, affected surfaces, existing work, and relevant acceptance criteria. Verify changing remote facts when they affect the task. Preserve unrelated edits and staged content.

State the intended result and choose a check that could expose an incorrect implementation. For multi-step work, keep a short checklist with observable completion conditions. Ask only for information that materially changes correctness or scope and cannot be resolved from available evidence; continue independent work while waiting.

## Choose the workflow

Read only the relevant section in [task workflows](references/task-workflows.md):

| Request | Workflow |
|---|---|
| Incorrect behavior, crash, or regression | Bug diagnosis |
| New behavior or an acceptance criterion | Feature implementation |
| Structural change with preserved behavior | Refactoring or migration |
| Slow response or excessive resources | Performance investigation |
| Visible layout or interaction mismatch | UI verification |
| Review, delivery, or continuing prior work | Review and handoff |

For mixed work, use the primary outcome to choose the workflow and add checks for the other affected surfaces. Do not run every workflow by default.

## Work within the project

Find the affected callers, data ownership, external contracts, and existing patterns before choosing the implementation. Put validation at the boundary that receives untrusted data. Update related types and API contracts together when behavior requires it.

Prefer a focused change that fits the existing design. Introduce a helper, script, or codemod when it removes repeated work or makes verification reproducible; a single simple edit does not need new infrastructure. Remove obsolete code only inside the requested scope and after checking its callers.

Use available tools by capability. If a relevant specialized skill is installed, read it for that operation: `git-flow` for branch conventions, `jira-plan` for ticket requirements, `react-hook-form-zod` for form contracts, `glab-mr-review` for GitLab review, or `glab-mr` for requested publication. These are optional integrations, not dependencies: when unavailable, perform the operation directly using repository instructions and supported tools. Verify the remote host before selecting GitHub or GitLab tooling.

Use the current model unless the user specifies another. Delegate only when the user or applicable instructions authorize delegation; assign distinct ownership and preserve other workers' changes. Do not require Cursor commands, named models, review panels, or a second agent to complete ordinary work.

## Verify and deliver

Run checks that cover the changed behavior and relevant failure paths. A build or type check supports compatibility, but does not establish runtime correctness. For remote writes, inspect the resulting object; if a request times out, read the current state before retrying.

When a check fails, use its evidence to revise the diagnosis. If the same failure persists after repeated fixes, revisit the shared assumption before adding another patch. If credentials, tools, or environment prevent a required check, complete what can be done and identify the exact unverified outcome.

Review the final diff for scope and accidental data exposure. Report the result, evidence, remaining limitations, and delivery state concisely in the user's language. Distinguish passed, failed, skipped, and blocked checks when present. Do not claim live UI, database, concurrency, deployment, or CI success from source inspection.

Complete authorized work without repeated approval. Skill invocation does not itself authorize posting comments, pushing, creating PRs/MRs, merging, deploying, scheduling work, or editing persistent memory. Resolve those actions from the user's actual request. Preparation and local verification should produce a concrete result before any necessary approval question.

## Inspiration

Inspired by the task routing and evidence-oriented approach described in [pstack's README at c47b128](https://github.com/cursor/plugins/blob/c47b12849e43f18d5c374c7069c744cc55b0ea00/pstack/README.md). This is an independently written adaptation for this collection; it does not install or depend on pstack.
