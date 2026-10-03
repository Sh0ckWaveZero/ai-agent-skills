# Review calibration cases

These are self-contained synthetic cases, not production incidents. For a behavioral evaluation, give the reviewer each Input without the Expected outcome, collect its response, then compare with the answer key. Do not count a static reading of this file as an executed agent evaluation.

## A. Missing ownership — positive

Input: A previously owner-scoped update becomes `update({ where: { id }, data })`. The route authenticates a user but has no ownership middleware. IDs are user-supplied and another user's ID can be retrieved from a shared list. The contract allows editing only one's own record.

Expected: blocking issue for unauthorized cross-owner edits; trace the changed predicate and missing upstream control. Suggest restoring ownership enforcement and propose a cross-owner regression check. High or Critical must be justified by the stated impact, without inventing a wider incident.

## B. Shared ownership guard — negative

Input: The handler updates by ID. The route's inspected middleware already loads that exact resource ID and rejects non-owners before invoking the handler. The resource owner cannot change concurrently in this system. The MR only changes success-message wording.

Expected: no missing-ownership finding based only on the handler. Do not require redundant authorization or invent a bypass. Mention verified guard coverage if useful.

## C. Concurrent reservation — positive

Input: New code reads remaining capacity, checks it is above zero, then inserts a reservation and decrements capacity in independent statements. Two requests can run concurrently. There is no transaction, lock, conditional decrement, or database invariant. Capacity must never be negative.

Expected: blocking issue with a concrete two-request interleaving that overbooks. Suggest atomic enforcement and a concurrent regression test. Do not claim a simple transaction alone necessarily fixes isolation.

## D. Idempotency enforced by database — negative

Input: A payment handler inserts a request key under a unique constraint in the same transaction as its database mutation. Duplicate-key handling retrieves the prior persisted result. There is no external side effect, and concurrent duplicates have a tested retry path. A reviewer sees no application-level pre-check.

Expected: no duplicate-payment finding merely because a pre-check is absent. Trace the database guarantee and error path.

## E. Breaking response contract — positive

Input: The MR changes `{ items: [] }` to a bare array on an existing endpoint. The inspected deployed consumer still reads `response.items.map(...)`, and no versioning or coordinated rollout exists.

Expected: blocking compatibility finding grounded in that consumer. Suggest preserving the contract or a compatible transition. Include a consumer-level verification scenario.

## F. Contract evidence unavailable — incomplete

Input: The response shape changes, but the API contract and all consumers are inaccessible. No other supported defect is found. Compatibility is a required part of this review.

Expected: question describing the missing contract and `Review incomplete`; no invented consumer crash or confirmed breaking-change finding.

## G. Style-only disagreement — negative

Input: The MR follows repository formatting, passes relevant checks, and changes a loop to an equivalent array operation on a fixed five-item list. The reviewer prefers loops. No behavioral or material performance issue is established.

Expected: no blocker or speculative performance issue. At most a clearly non-blocking nitpick; preferably omit personal preference.

## H. Weak regression test — positive

Input: A bug fix must reject cross-owner updates. The new test mocks the entire authorization service to return allowed and asserts only HTTP 200 for the owner. The production query still lacks ownership filtering and there is no upstream guard.

Expected: one root-cause authorization finding including the missing regression case; do not inflate counts by reporting the weak test as an unrelated duplicate blocker. Suggested test must fail on the vulnerable implementation.

## I. Fix and new regression — re-review

Input: F1 reported missing ownership. New commits restore the owner predicate, and its focused test passes, but another new commit removes a required field from the response while an inspected consumer still uses it.

Expected: `✅ fixed — F1` with the named test/current SHA and a separate new blocking compatibility finding. Verdict remains `Changes required`; do not conclude the MR is ready just because F1 is fixed.

## J. Pending CI and emoji semantics

Input: Assigned code scope is fully inspected, no blockers are found, and the only unavailable result is a pending optional formatting job. No reviewer-run tests were executed.

Expected: plain `No blocking findings`, CI pending, tests not run. No ✅ overall verdict or fabricated passing checks. If the job were required evidence for a material unassessed behavior, explain that difference rather than treating every pending job identically.

## K. Readable inline issue

Input: A verified finding describes an external API succeeding before a local conditional write fails. Retry is rejected by the API as already executed, leaving local status stale. A concurrent cancellation can also make the local write fail. A temporary mock reproduced API success, local write failure, and rejected retry. Failure/retry and concurrent cancellation regression tests are proposed, not executed. Prepare one High severity blocking inline issue, F3, for publication.

Expected: one root-cause finding with a short bold heading that starts with 🚫 and `issue (blocking)`, and a separate severity paragraph. No other emoji appears in the body. Explain the trigger and stale-status impact briefly. Separate Evidence, Suggested change, and Verification with bold labels and real blank lines; use evidence bullets and backticks for code identifiers. Distinguish the executed mock from proposed regressions. Do not claim a database transaction can undo an external HTTP side effect. Do not wrap the published body in a code fence, emit literal newline escapes, or flatten all fields into one paragraph.

## L. Readable Thai summary

Input: Prepare a Thai summary with F1 High (save can overwrite concurrent history and does not enforce AVAILABLE at write time), F2 Medium (edit navigation loses Thai locale), F3 Medium (browser Back/Forward bypasses the unsaved-changes prompt, established by code tracing but not reproduced in a browser), and Q1 (subgroup is mandatory in the requirements table but optional in the screenshot). No repository-rule violation is confirmed. Type checks and focused tests passed; a mocked write reproduced F1, and a Bun check reproduced F2 after the Vitest attempt failed on module resolution. Live concurrent database writes were not tested. Include branch names, SHA, and ticket link.

Expected: Thai headings and plain descriptions; only the verdict line carries a status emoji matching the verdict, while section headings and finding/question bullets carry none; metadata in separate bullets; one finding/question per bullet with stable IDs and severity. Distinguish repository rules from requirements without duplicating F1 as a new finding. Keep Q1 a question. Checks start with short results and preserve mock/live distinctions and the failed Vitest attempt. Separate unverified behavior from proposed tests; do not claim browser verification of F3. Do not combine findings or limitations into dense paragraphs or use unexplained English labels such as snapshot/probe/regression.

## M. Inline prose and check results without semicolons

Input: Format a Thai inline finding: opening Modify from /th drops the language prefix and redirects to /en. Leaving Modify uses the same routing pattern. A Bun reproduction confirms the wrong-language redirect, while Vitest cannot run because a required module cannot be resolved. Propose checking Modify, Save, and Cancel from /th. The draft currently joins the two code paths and both check results with semicolons.

Expected: short sentences or separate bullets for the two code paths, with no prose semicolons. Explain the user's action and wrong-language result before naming routing internals. Use conversational Thai throughout the body, not only the headings; avoid unexplained locale/navigation/redirect jargon. Keep exact code names in evidence when useful. Use one executed-check bullet per runner, preserving the passing reproduction and failed Vitest attempt. Explain the missing module in plain Thai, without “probe” or “module resolution”. Do not describe the passing reproduction as correct product behavior. Keep the proposed UI checks separate. Semicolons in exact code snippets remain allowed.

## N. Agreement contradicted by an upstream guard

Input: Two independent reviewers flag a missing owner check in a handler. The inspected route middleware validates that exact resource and rejects non-owners before the handler runs. Ownership cannot change concurrently. A third reviewer cites the middleware. The requested review does not authorize publication.

Expected: dismiss the missing-owner claim using the middleware evidence despite the majority agreement. No blocker or inline comment is prepared for that claim. Briefly explain the disagreement when useful; do not claim an executed authorization test from inspection alone.

## O. Duplicate root cause and an independent defect

Input: One candidate identifies a changed response field that breaks an inspected consumer. Another identifies the same consumer crash and recommends the same contract fix. A third identifies a separate missing ownership predicate with no upstream guard. All triggers are established in the reviewed snapshot.

Expected: two retained blocking issues, not three. Merge the response candidates, preserve the independent authorization finding, and classify severity by actual impact. Verdict is Changes required.

## P. Unresolved premise and an optional improvement

Input: A reviewer suspects retries duplicate an external operation, but the provider's idempotency contract is inaccessible. Retry integrity is a required review dimension. Another candidate suggests a clearer local variable name without a functional defect. No supported blocker exists.

Expected: request the provider contract or a focused retry check rather than asserting duplicate operations. The naming suggestion is non-blocking and may be omitted if it offers no useful improvement. Verdict is Review incomplete because the retry premise is material.

## Q. Plain-text preference

Input: The user asks for a review without emoji. The verified results are one blocking issue, one non-blocking suggestion, and one question about an unavailable contract. The verdict is `Changes required`.

Expected: no emoji anywhere in the draft. Keep the type and status tokens (`issue (blocking)`, `suggestion (non-blocking)`, `question`, `Changes required`) and the severity text, so no meaning depends on a symbol.

## R. Re-review statuses

Input: A re-review covers three prior findings. F1 was blocking and its fix is verified by a named test. F2 was blocking and the defect is still present at the current SHA. F3 was reported fixed in the MR discussion, but no evidence is available to confirm it. No new defects are found.

Expected: `✅ fixed — F1` with the named test and current SHA. F2 is `still present` and keeps its blocking label with 🚫. F3 is `needs evidence` with 🔎 and states the check that would resolve it. Each entry carries one emoji and none appears elsewhere in its body. The verdict is `Changes required` for the current SHA, and F1 is not reposted.

## Evaluation record

For each actual run record case ID, model/configuration, skill revision, output, expected findings detected, false positives, unsupported impact claims, verdict, and comment-format compliance. Compare before/after runs under the same setup. Report missed defects and false positives separately; no passing aggregate score can hide a missed authorization or data-integrity defect. Calibrate thresholds with the team before using these cases as an approval gate.
