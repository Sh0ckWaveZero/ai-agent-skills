---
name: glab-mr-review
description: Review a GitLab merge request, produce an evidence-based draft, and publish summary and inline comments when requested.
disable-model-invocation: true
---

# GitLab MR Review

Invoke explicitly with an MR URL or project and IID. Reviewing or sharing an MR URL authorizes inspection and a draft, not publication. An explicit request to post feedback authorizes publication without another confirmation. Review verdicts are recommendations; approving, merging, resolving discussions, or deleting comments requires the corresponding user instruction.

Operating modes: `draft` returns a local review; `post` publishes prepared feedback within explicit authorization; `follow-up` inspects existing discussions and replies to the requested findings. Resolve the intended mode and any requested focus from the user's instructions; default to draft when publishing was not requested.

## 1. Capture the review snapshot

Verify GitLab host, project, source/target branches, and MR identity from the URL and repository context. Use `glab` with the verified host/project rather than assuming the current checkout or `origin` owns the MR. Inspect installed command help before relying on version-specific flags.

Read MR metadata, the full diff, all commits, existing notes/discussions with pagination, and CI status. Record the current diff version's base/start/head SHAs. Fetch both relevant refs, including fork source refs when needed; compare immutable SHAs matching that diff version. If a diff is truncated or a file cannot be retrieved, obtain it separately or report incomplete coverage.

Completion: scope, snapshot, existing feedback, and unavailable evidence are recorded.

## 2. Investigate findings

Before finding defects, summarize the problem, intended behavior/contract change, affected modules or user flows, and assumptions. Use this understanding to distinguish intentional behavior from regressions.

Review the complete resulting change, reading surrounding code, callers, contracts, and relevant tests. Check correctness, authorization, edge cases, regressions, and applicable UI behavior. Run focused checks when possible without disturbing the user's worktree.

For each actionable finding, establish the trigger, code path, observable impact, evidence, and smallest useful location. Distinguish defects introduced or exposed by this change from unrelated pre-existing issues. Challenge assumptions against upstream contracts before declaring a blocker. Exclude speculative problems and duplicate feedback; report an existing unresolved finding by its discussion link when useful.

Read and apply the [review standard](references/review-standard.md) on every review. Record coverage for the core dimensions and select additional API/data/UI checks based on the actual change. Apply repository requirements first; explain any conflict instead of substituting personal preferences.

Completion: every reported finding has supporting evidence; coverage and actual test results are explicit. No findings does not prove absence of bugs.

## 3. Prepare the review draft

Use the [comment and summary format](references/comment-format.md), including its labeled emoji conventions. Return the MR link, source/target, reviewed head SHA, verdict, coverage, findings with file/line evidence, tests run, and limitations. Put suggested tests separately from executed tests. If publication was not requested, stop with this complete draft.

For authorized publication, prepare all bodies and anchors first. Use a general summary for findings that cannot be accurately anchored; do not attach them to an unrelated nearby changed line.

## 4. Publish against the current diff

Re-read the MR diff version and discussions immediately before writing. If base/start/head SHAs changed, refresh the affected review and anchors before publication. Skip equivalent existing feedback. Reuse authorization for the same requested review scope; ask only if the scope materially changes.

Prefer supported installed `glab` commands. If inline options are unavailable, use the [GitLab Discussions API](https://docs.gitlab.com/api/discussions/#create-new-merge-request-thread):

- POST to `projects/:id/merge_requests/:merge_request_iid/discussions` with the prepared body and a text position.
- Set `position[base_sha]`, `position[start_sha]`, and `position[head_sha]` from the verified diff version, with both old/new paths.
- For an added line use `new_line`; for a removed line use `old_line`; for a context line provide both line numbers as required by the diff. Use the API's line-range schema only when needed.

Pass multiline text through structured tool/API arguments or a literal temporary body file using supported file-input options. Keep arbitrary comment text out of shell interpolation.

Post the summary, then inline findings sequentially, recording returned IDs. Verify each result's body and position. On invalid-position errors, recheck diff version, paths, and line mapping; the error alone does not establish that a line is unchanged. On a timeout or uncertain write, read discussions before retrying to avoid duplicates.

Completion: every intended post is verified or individually reported as failed/pending. Preserve existing human comments; do not delete a mistaken note without authorization.

## 5. Report publication status

Return verified summary/discussion links, reviewed SHA, posted/skipped/failed counts, and remaining limitations. Distinguish a draft, a posted recommendation, an actual GitLab approval, pending CI, and a merged MR.

## 6. Re-review requested changes

Compare the previously reviewed snapshot with the current snapshot and inspect all new commits, not only the lines mentioned in earlier findings. Revisit affected callers/contracts and relevant regression checks. If history was rewritten or the target changed, rebuild the comparison rather than assuming the previous diff still applies.

Track each prior finding by its existing ID/link as `fixed`, `still present`, or `needs evidence`, with the current evidence and SHA. Confirm the cause was addressed and check for new regressions; a changed line alone does not prove a fix. Reassess the verdict using the same review standard. Report newly introduced findings separately and avoid reposting the original finding. Publish replies only within the requested scope; resolving discussions requires explicit authorization.

Completion: prior findings are accounted for, new changes are covered or limitations named, and the updated verdict refers to the current snapshot.

## Maintaining this skill

Use the [review calibration cases](references/review-cases.md) after changing the standard or comment rules. They include expected defects and valid implementations that should not produce findings. Static document checks do not measure reviewer accuracy; evaluate actual review outputs against these cases when testing agent behavior.
