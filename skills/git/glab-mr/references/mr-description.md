# Writing an MR people can review

## Start from evidence and repository conventions

Read the complete source-versus-target diff, relevant surrounding behavior, ticket/AC if available, actual check results, repository MR templates, and existing description. Use the requested template and language first, then repository conventions or the existing MR language. Use the structures below only where the repository leaves a choice. Preserve required template headings/checklists, even when an item must explicitly say not applicable with a reason.

Write for a reviewer who has not read the agent conversation. Explain the problem, resulting behavior, and evidence in that order. Do not summarize only the latest commit or use commit messages as a substitute for reading the diff. If ticket context is unavailable, use verified code behavior and disclose a material requirements gap; invent no ticket, business motivation, result, screenshot, or production incident.

## Title

Use the repository's naming convention and ticket prefix when applicable. Name the concrete behavior or fix, for example `fix(appointments): order the waiting list by submission time`. Avoid vague titles such as `update code`, file inventories, or a title describing an abandoned approach. Rewrite the title when the final scope changes.

## Choose the smallest useful description

For a small, focused change, use one or two paragraphs explaining the problem and final behavior, followed by actual validation and material limits. Add sections only when they help a reviewer assess the change. Larger changes may need the following:

| Section | Include when / content |
|---|---|
| 🎯 Problem / purpose | Explain the user or system problem and link the actual ticket when known. |
| 🔄 Behavior change | Describe before → after with a concrete trigger/result when useful. |
| 🛠️ Approach | Explain the key implementation decision and why it addresses the problem; avoid a file-by-file changelog. |
| Scope and impact | Identify affected APIs, permissions, data, consumers, or screens when material to review. Mention exclusions only when needed to avoid a likely scope misunderstanding. |
| 🧪 Verification | Separate executed checks/results from suggested checks, pending CI, and not-run verification. Include commands or test names when useful. |
| 👀 Review focus | Identify an actual decision, subtle invariant, or tradeoff requiring reviewer judgment. Omit generic requests to review everything. |
| Deployment / recovery | Describe evidence-backed migrations, configuration, rollout ordering, compatibility, and recovery constraints only when relevant. Do not promise rollback reverses destructive data changes. |

Use at most one emoji per optional heading, always with a readable text label. Follow plain-text repository preferences and preserve required template labels. Use ✅ only beside a specifically verified passing result, never as a blanket readiness badge. Do not pre-check a checklist for tests that were not run.

## Evidence for particular changes

- UI: attach available, relevant before/after images or a short recording when they clarify visible behavior. Clearly identify which state each shows. If images are unavailable, describe what was inspected and any remaining visual checks; invent no asset links.
- API: show minimal sanitized request/response examples when they clarify a changed contract, including important status or permission changes. Verify examples against code/schema/tests. Do not dump a whole API specification for a one-field change.
- Database/configuration: name required migration or configuration changes and the deployment dependency they create. Include recovery steps only when verified; identify unknown recovery behavior.
- Performance: state the demonstrated query/algorithm change and realistic conditions. Quantified improvements require measurements and their environment; an optimization alone does not establish a percentage gain.
- Bug fix: explain the trigger and cause, then the correction and a regression check that exercises it. Separate confirmed causes from unresolved hypotheses.

Tie verification to the relevant revision where practical. A local check on an earlier head does not prove the current MR passed; if changes invalidate it, rerun or label the result's limited scope. Separate failures caused by this change from verified baseline failures without hiding either.

## Small MR example

Illustrative only: replace all facts with evidence from the actual MR. The checks below are not claims about this repository.

```markdown
Waiting-list entries appeared newest first, requiring staff to scroll to the
oldest submission. This change sorts by submission time ascending before
pagination, so a 09:00 submission appears before a 09:05 submission.

Verification: ordering and pagination regression tests passed locally.
The updated screen has not yet been checked on staging.
```

## Expanded MR example

Illustrative only: omit optional sections that do not apply. Replace placeholders before publication.

```markdown
## 🎯 Problem
The waiting list shows newer submissions before older ones.
Ticket: <verified ticket link>

## 🔄 Behavior change
Entries now appear oldest first. A submitted at 09:00 appears before B at 09:05.

## 🛠️ Approach
Apply the ordering in the query before pagination. Use ID as a stable secondary
sort key when submission timestamps are equal.

## 🧪 Verification
- Passed locally: ordering, equal-timestamp ordering, and pagination tests.
- Not run: staging verification of the screen.
- CI: pending for <head SHA>.

## 👀 Review focus
Confirm the ID tie-breaker matches the expected queue behavior for equal timestamps.
```

## Updating an existing MR

Rewrite generated title/body sections around the final implementation when scope changes. Keep useful human context, ticket links, attachments, and mandatory checklists. Re-read immediately before writing so intervening edits are not lost. If a claim is outdated, reconcile it with current evidence; do not append a second conflicting summary. Omit conversation history and abandoned approaches unless they explain a relevant tradeoff.

## Completion criteria

A reader can identify why the change exists, what behavior changes, how the approach achieves it, what was actually verified, and any material review/deployment limits. Title and body agree with the complete current diff. Relevant ticket links and examples are verified, optional empty sections are removed, required template content is preserved, and no placeholder or unsupported success claim remains. Publication authorization is handled by the main workflow; preparing this description does not itself authorize posting.
