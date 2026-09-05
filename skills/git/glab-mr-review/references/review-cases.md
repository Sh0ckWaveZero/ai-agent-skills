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

## Evaluation record

For each actual run record case ID, model/configuration, skill revision, output, expected findings detected, false positives, unsupported impact claims, verdict, and comment-format compliance. Compare before/after runs under the same setup. Report missed defects and false positives separately; no passing aggregate score can hide a missed authorization or data-integrity defect. Calibrate thresholds with the team before using these cases as an approval gate.
