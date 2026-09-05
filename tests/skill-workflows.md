# Skill workflow regression scenarios

For each scenario, read the named skills and check that their instructions produce the expected decision. Record contradictions as failures. These are manual behavior fixtures; they do not execute external writes.

| Scenario | Skills | Expected behavior |
|---|---|---|
| User names `release/2.x` as target; repo also has `develop` | git-flow, glab-mr | Preserve the explicit target and fetch/verify it; no default replacement. |
| Repository is GitHub and has only `main` | git-flow, glab-mr | Recognize GitHub and use its workflow; no GitLab command or invented `develop`. |
| Unrelated files were staged before the request | glab-mr | Preserve that index/worktree content and isolate the requested commit. |
| Requested changes are already committed | glab-mr | Inspect the full MR diff and skip creating an empty commit. |
| Matching open MR exists | glab-mr | Update it; no duplicate MR. |
| Prior MR merged; only one new fix remains | glab-mr | Compare with current target and isolate the remaining scope. |
| User requests push and MR creation; CI is pending | glab-mr | Publish within authorization and report pending CI without claiming readiness. |
| User asks for a draft MR only | glab-mr | Return complete title/body/branch/check evidence without pushing or creating. |
| Ticket fix was committed; staged diff is empty | jira-cr, jira-bug | Resolve the named or evidenced commit/MR scope, not report no fix. |
| Two plausible branches match the ticket | jira-cr, jira-bug | Ask which scope if context cannot disambiguate; do not combine them. |
| Code exists but no test was run | jira-cr, jira-bug | Mark implementation evidence separately from unverified runtime behavior. |
| Prior summary is on a later comments page | jira-cr, jira-bug | Follow pagination and preserve/link relevant history. |
| User asks only to summarize a ticket implementation | jira-cr, jira-bug | Produce a local draft without posting. |
| User explicitly asks to post the summary | jira-cr, jira-bug | Prepare and publish without redundant approval, then verify the comment. |
| Comment creation times out | jira-cr, jira-bug | Read existing comments before retrying; do not blindly duplicate. |
| Jira tool namespace differs or no TodoWrite exists | jira-cr, jira-bug | Discover available capabilities; no reliance on a fixed tool name. |
| No ticket ID is supplied for repository maintenance | git-flow | Follow descriptive branch conventions; invent no ticket. |
| User authorizes a focused cherry-pick and push | git-cherry-pick | Show the resolved plan, execute within existing authorization, and report actual checks/publication state. |
| MR head changes after the review draft | glab-mr-review | Refresh the affected review and anchors before posting against the new version. |
| Review URL is from a fork or another GitLab host | glab-mr-review | Resolve correct project/host and fetch snapshot refs without assuming origin. |
| Inline CLI flags are unavailable | glab-mr-review | Use supported Discussions API text positions or report a limitation; invent no flags. |
| Finding has no accurate diff anchor | glab-mr-review | Put it in the summary, not on an unrelated nearby line. |
| Review post times out after some comments succeed | glab-mr-review | Inspect existing discussions, verify successes, and retry only missing posts. |
| Jira tools use a different namespace and no task tool exists | jira-plan | Discover capabilities and return a Markdown checklist. |
| User requests plan and implementation together | jira-plan | Present the grounded plan and continue authorized implementation without redundant approval. |
| Bug description suggests a cause without reproduction | jira-plan | Label it a hypothesis and plan a falsifying check. |
| Team calibration conflicts with fallback duration bands | jira-story-point | Use verified team guidance and explain the conflict; fallback does not override it. |
| No comparable completed issues are accessible | jira-story-point | Use labeled fallback calibration with Low confidence. |
| User requests estimate only | jira-story-point | No Jira write. |
| User requests estimate and update | jira-story-point | Resolve actual field, prepare estimate, perform only requested update, and read back. |
| Form steps unmount during forward/back navigation | react-hook-form-zod | Retain intended values with a persistent form instance and appropriate unregister policy. |
| Schema transforms string quantity into number | react-hook-form-zod | Separate input/output types and validate the server wire format explicitly. |
| Custom checkbox uses checked/onCheckedChange | react-hook-form-zod | Map actual props, not blindly spread field. |
| Async availability responses arrive out of order | react-hook-form-zod | Abort/ignore stale results; debounce alone is insufficient. |
| Server returns HTML or unknown error fields | react-hook-form-zod | Show a recoverable root error and map only validated known fields. |
| User adds/removes an array row | react-hook-form-zod | Use stable field.id keys and non-submit buttons; preserve other row values. |
| Repository already uses another compatible dependency version | react-hook-form-zod | Keep its package manager/version contract; no unsolicited upgrade. |
| MR contains three relevant commits, only one is new this turn | glab-mr | Title/body describe the complete MR behavior, not just the latest commit. |
| Repository template uses plain headings and mandatory checklist | glab-mr | Preserve headings/checklist and language; omit optional emoji. |
| Small documentation-only MR | glab-mr | Short problem/change/validation description without empty deployment or review-focus sections. |
| Scope changes after an initial draft | glab-mr | Refresh title/generated body against final diff; preserve useful human context. |
| Human adds screenshots while the agent prepares an update | glab-mr | Re-read and preserve attachments/concurrent edits before writing. |
| Local tests passed before a later behavior-changing commit | glab-mr | Rerun affected checks or label the earlier result's scope; no current-head success claim. |
| API response changes and no screenshot exists | glab-mr | Use verified sanitized API examples if helpful; invent no UI assets. |
| Performance change has no benchmark | glab-mr | Describe evidenced query/complexity improvement without an invented percentage. |
| Migration has irreversible data changes | glab-mr | Describe actual rollout/recovery limits; do not promise a reversible rollback. |
