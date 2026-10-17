---
name: glab-mr-review
description: >-
  Use when asked to review a GitLab merge request: gathers the MR with glab,
  reads linked Jira tickets, maps impact with Code-review-graph when available,
  and produces an evidence-based draft (posting comments only when asked).
---

# GitLab MR Review

Invoke explicitly with an MR URL or project and IID. Reviewing or sharing an MR URL authorizes inspection and a draft, not publication. An explicit request to post feedback authorizes publication without another confirmation. Review verdicts are recommendations; approving, merging, resolving discussions, or deleting comments requires the corresponding user instruction.

Operating modes: `draft` returns a local review; `post` publishes prepared feedback within explicit authorization; `follow-up` inspects existing discussions and replies to the requested findings. Resolve the intended mode and any requested focus from the user's instructions; default to draft when publishing was not requested.

## 1. Capture the review snapshot

Verify GitLab host, project, source/target branches, and MR identity from the URL and repository context. Use `glab` with the verified host/project rather than assuming the current checkout or `origin` owns the MR. Inspect installed command help before relying on version-specific flags.

Read MR metadata, the full diff, all commits, existing notes/discussions with pagination, and CI status. Record the current diff version's base/start/head SHAs. Fetch both relevant refs, including fork source refs when needed; compare immutable SHAs matching that diff version. If a diff is truncated or a file cannot be retrieved, obtain it separately or report incomplete coverage.

Completion: scope, snapshot, existing feedback, and unavailable evidence are recorded.

## 1a. Read the linked Jira ticket(s)

Find ticket keys (e.g. `ABC-123`) in the source branch name, MR title, description, and commit messages. For each, use the available Atlassian issue-read operation for the summary, description, acceptance criteria, and linked issues. Use the issue-comments operation separately to read recent comments. Summarize the intended behavior and use it as the contract when judging the diff: flag requirements the MR misses, behavior it adds beyond the ticket, and acceptance criteria with no test. If no ticket is found, a connector is unavailable, or access fails, record the limitation in coverage notes rather than guessing.

## 1b. Map impact with Code-review-graph

With the repo checked out at the reviewed head SHA (a temporary clone, not the user's worktree), use the Code-review-graph connector if it is available and inspect its supported operations before using it. Use its change, impact, flow, caller, and test context to choose what surrounding code to read in step 2. If the connector is unavailable, inspect changed symbols, callers, flows, and relevant tests with repository search and code navigation, then record that graph coverage was unavailable. Treat graph output as leads. Confirm each finding against the actual code.

## 2. Investigate findings

Before finding defects, summarize the problem, intended behavior/contract change, affected modules or user flows, and assumptions. Use this understanding to distinguish intentional behavior from regressions.

Review the complete resulting change, reading surrounding code, callers, contracts, and relevant tests. Check correctness, authorization, edge cases, regressions, and applicable UI behavior. Run focused checks when possible without disturbing the user's worktree.

For each actionable finding, establish the trigger, code path, observable impact, evidence, and smallest useful location. Distinguish defects introduced or exposed by this change from unrelated pre-existing issues. Challenge assumptions against upstream contracts before declaring a blocker. Exclude speculative problems and duplicate feedback; report an existing unresolved finding by its discussion link when useful.

Read and apply the [review standard](references/review-standard.md) on every review. Record coverage for the core dimensions and select additional API/data/UI checks based on the actual change. Apply repository requirements first; explain any conflict instead of substituting personal preferences.

Completion: every reported finding has supporting evidence; coverage and actual test results are explicit. No findings does not prove absence of bugs.

## 3. Prepare the review draft

Before formatting, perform the lead-review judgment pass in the [review standard](references/review-standard.md#lead-review-judgment). Validate every candidate against the current snapshot, deduplicate by root cause, and decide whether to require a fix, suggest an improvement, request evidence, or dismiss it. This pass applies to a single reviewer as well as any authorized independent reviews; reviewer agreement is not proof. Do not publish rejected candidates or create a second severity/verdict scale.

Use the [comment and summary format](references/comment-format.md), including its emoji conventions. Use plain text when the user or repository prefers it. Keep summary metadata in separate bullets. Give each finding or question its own bullet. Use familiar words in the user's language. The chat report includes the MR link, source and target branches, reviewed head SHA, verdict, findings with file and line evidence, material coverage gaps, failed checks, and limitations. Do not list routine passes or requirements that were met. Keep the published summary short. State the verdict, link each finding to its inline discussion, and include failed-check or not-verified sections when needed. Keep suggested tests separate from defect reproductions and unverified behavior. If the user did not request publication, return the complete draft without posting it.

For authorized publication, prepare all bodies and anchors first. Format inline issues as short Markdown sections with blank lines and evidence bullets according to the comment format; never flatten the finding into a single paragraph. Use a general summary for findings that cannot be accurately anchored; do not attach them to an unrelated nearby changed line.

## 4. Publish against the current diff

Re-read the MR diff version and discussions immediately before writing. If base/start/head SHAs changed, refresh the affected review and anchors before publication. Skip equivalent existing feedback. Reuse authorization for the same requested review scope; ask only if the scope materially changes.

Prefer supported installed `glab` commands. If inline options are unavailable, use the [GitLab Discussions API](https://docs.gitlab.com/api/discussions/#create-new-merge-request-thread):

- POST to `projects/:id/merge_requests/:merge_request_iid/discussions` with the prepared body and a text position.
- Set `position[base_sha]`, `position[start_sha]`, and `position[head_sha]` from the verified diff version, with both old/new paths.
- For an added line use `new_line`; for a removed line use `old_line`; for a context line provide both line numbers as required by the diff. Use the API's line-range schema only when needed.

Pass multiline text through structured tool/API arguments or a literal temporary body file using supported file-input options. Create that file in the session's temporary directory, not in the user's worktree, and remove it after use. Keep arbitrary comment text out of shell interpolation.

Post inline findings first, one at a time, and record their IDs. Then post or update the summary. Link each anchored finding to its inline discussion. Include full detail only for findings without a suitable line anchor. Verify the body and position of every post. If GitLab rejects a position, recheck the diff version, paths, and line mapping. A rejection does not prove that the line is unchanged. If a write times out or its result is unclear, read the discussions before retrying to avoid duplicates.

Completion: every intended post is verified or individually reported as failed/pending. Preserve existing human comments; do not delete a mistaken note without authorization.

## 5. Report publication status

Return verified summary/discussion links, reviewed SHA, posted/skipped/failed counts, and remaining limitations. Distinguish a draft, a posted recommendation, an actual GitLab approval, pending CI, and a merged MR.

## 6. Re-review requested changes

Compare the previously reviewed snapshot with the current snapshot and inspect all new commits, not only the lines mentioned in earlier findings. Revisit affected callers/contracts and relevant regression checks. If history was rewritten or the target changed, rebuild the comparison rather than assuming the previous diff still applies.

Track each prior finding by its existing ID/link as `fixed`, `still present`, or `needs evidence`, with the current evidence and SHA. Confirm the cause was addressed and check for new regressions; a changed line alone does not prove a fix. Run the [lead-review judgment](references/review-standard.md#lead-review-judgment) on each prior-finding status and each new candidate, then reassess the verdict using the same review standard. Report newly introduced findings separately and avoid reposting the original finding. Publish replies only within the requested scope; resolving discussions requires explicit authorization.

Completion: prior findings are accounted for, new changes are covered or limitations named, and the updated verdict refers to the current snapshot.

## Maintaining this skill

Use the [review calibration cases](references/review-cases.md) after changing the standard or comment rules. They include expected defects and valid implementations that should not produce findings. Static document checks do not measure reviewer accuracy; evaluate actual review outputs against these cases when testing agent behavior.

## Mandatory style checks (every review)
- **Added em/en dashes:** scan lines added by the MR for `—` and `–` when repository or user requirements prohibit them. Report violations in one inline comment per file labeled "ต้องแก้", with line numbers. On re-review, reply under the existing discussion instead of opening a new one.
- **Review comments:** use `-` in place of `—` or `–` unless repository or user requirements call for another style.

## Keep review output focused on problems and gaps
- In the summary comment, inline comments, and chat report, include actionable defects, unresolved requirement questions, useful non-blocking suggestions, failed checks, and material verification gaps.
- Do not list routine passes or requirements already met, such as passing checks, test counts, satisfied coverage gates, absence of hard-coded values, or acceptance criteria that were met. Keep the full coverage record in working notes.
- The `ทดสอบแล้ว` section lists only failed or blocked checks and is omitted when there are none. A reproduction that demonstrates a defect may be included as finding evidence, not described as a passing check.
- Keep the verdict, linked findings/questions/suggestions, one-line statuses for prior findings in a re-review, and material items under `ยังไม่ได้ตรวจยืนยัน`.
