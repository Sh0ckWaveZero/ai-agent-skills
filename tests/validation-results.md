# Validation results — 2026-09-05

## Scope

Reviewed all nine skill entrypoints and README for consistent authorization boundaries, repository context, evidence requirements, tool discovery, and local resource links. The workflow scenarios are manual instruction reviews, not live agent or integration runs.

## Executed checks

- `python3 tests/validate_skills.py`: passed for all nine skills, including metadata, balanced fences, local resource portability, and README inventory.
- `git diff --check`: passed.
- React templates: strict TypeScript check passed in an isolated temporary workspace using React 19.1.0, React Hook Form 7.71.2, Zod 4.3.6, resolvers 5.2.2, TypeScript 5.9.3, and React types 19.1.0. These are tested versions, not a latest-version claim or an install requirement.
- Server template runtime assertions passed: malformed JSON returns 400; invalid email returns field errors with 422 and does not save; valid input saves trimmed email and returns 204; persistence failures propagate to the application error boundary.
- Quantity-transform assertions passed: numeric string produces a number; empty input, trailing text, zero, and values above 1000 are rejected.

## Manual review

Reviewed all 37 workflow scenarios against their named skills. The instructions cover explicit targets, pre-existing staged work, existing/merged MRs, publication authorization, stale review snapshots, alternate tool capabilities, team calibration, and form lifecycle/contract handling.

## Limits

No live GitLab/Jira writes, CI pipeline runs, browser UI tests, or installed-skill reload tests were performed. Static scenario review does not demonstrate that every agent will follow the workflow. The template type check covers the listed versions only; host applications must run their own compatibility and behavior checks.

## Review-standard extension

Added the review coverage rubric, independent severity/blocking/evidence classification, deterministic verdict criteria, comment/emoji conventions, and re-review workflow. Added ten synthetic calibration cases with expected outcomes covering real defects, valid guards, insufficient evidence, and re-review regressions.

The extension was manually checked for policy consistency, and structural/link and whitespace checks passed again. Calibration cases were not executed against an agent; they are evaluation inputs and answer keys, not measured reviewer accuracy.

## MR-description extension

Added a portable description guide with small/expanded examples, repository template/language precedence, labeled heading emoji, final-diff scope, evidence-specific examples, and preservation of concurrent human edits. Added nine manual workflow scenarios (46 total). Structural/link and whitespace checks passed. These scenarios have not been executed as live agent evaluations or GitLab writes.

## Current-main integration

Reapplied the scoped changes onto current `origin/main` after PR #7 had merged. Preserved the upstream `jira-mcp` skill and README entries, plus review draft/post/follow-up modes and intent analysis. Structural validation now passes for all ten installed skill entrypoints; nine skills are modified by this PR. `git diff --check origin/main...HEAD` passed.
