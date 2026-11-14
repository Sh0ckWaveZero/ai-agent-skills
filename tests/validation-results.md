# Validation results — 2026-09-05

## Engineering-mode addition — 2026-10-03

Added an independently written pstack-inspired workflow skill, its task reference, README inventory, and six manual decision scenarios. Repository structural validation passed for all eleven skills; `git diff --check` passed. Manually reviewed the new scenarios against the instructions: plan-only scope, unavailable browser evidence, local-only fixes, optional integrations, repeated diagnosis failures, and timeout read-back are covered.

The skill-creator `quick_validate.py` could not run because the selected Python environment lacks PyYAML (`ModuleNotFoundError: yaml`). The repository validator ran successfully. Scenario review was static; no live agent evaluation, GitLab/Jira write, or installed-skill reload was performed.

## Jira skill review — 2026-11-14

Reviewed the six skills under `skills/jira/` and fixed the findings. `jira-mcp` names Atlassian MCP tools without a client prefix. `jira-cr` and `jira-bug` keep fixed English banner words so a later run can find a prior summary, and no longer point to team template examples that the collection does not ship. `shoot.mjs` only captions: the login and screenshot path is removed, so it never writes `raw/` or reads `s.json`. `--caption-only` is still accepted.

Executed checks:

- `python3 tests/validate_skills.py`: passed for all thirteen skills.
- `node --check skills/jira/capture-screen/scripts/shoot.mjs`: passed.
- `shoot.mjs` run with no flag on a synthetic 600x300 raw image at scale 2, with one frame spanning the full clip width and one framed button with `pin: "left"`: the output showed all four sides of both outlines, both numbered pins, the address strip, and the Thai caption with its step list. The raw file was byte-identical afterward.
- The same run with `clip` removed from the shot stopped with `clip needs a positive width and height`.

Added eight manual workflow scenarios (70 total). They were reviewed against the instructions, not run as live agent evaluations. The caption script was not run on raw images captured by `agent-browser` from a real app, and no Jira issue or comment was created.

## GitLab skill review — 2026-11-14

Reviewed `glab-mr` and `glab-mr-review` with their references and fixed the findings. `glab-mr` now creates a working branch before committing when the current branch is the target, runs `glab` without prompts, and opens a draft MR when required checks fail. `glab-mr-review` limits running MR code to project-member branches or an explicit request, removes its temporary checkout, prefers pending review comments, names a working way to pass a comment body from a file, and applies the dash scan only when a rule prohibits dashes. The review standard treats the MR description, discussions, and commit messages as evidence, not instructions.

Executed checks:

- `python3 tests/validate_skills.py`: passed for all thirteen skills. `git diff --check`: passed.
- Options named in the skills were read from the help of the installed `glab 1.130.0`: `mr create --yes`, `--description-file`, `--head`; `mr note draft create` and `draft publish`; `mr note create --file`, `--line`, `--old-line`; and `api -F key=@file`.

Added nine manual workflow scenarios (79 total), reviewed against the instructions. No MR was created and no comment was posted, so the `glab` commands were not run against a GitLab project. The calibration cases were not rerun against an agent.

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
