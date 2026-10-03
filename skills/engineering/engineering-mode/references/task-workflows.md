# Task workflows

Use the selected workflow to decide the evidence needed, rather than mechanically expanding every task into the same checklist.

## Bug diagnosis

Capture the trigger, expected result, and observed result. Reproduce in the closest available environment, or label the reproduction gap. Trace the affected input through the actual execution path and distinguish a suspected cause from a demonstrated one. For a cheap automated path, add a regression test and observe it fail for the reported reason before fixing. Otherwise use a recorded manual reproduction. After the fix, repeat the trigger and check adjacent failure paths. A defensive guard is appropriate only if its behavior matches the domain contract.

## Feature implementation

Map relevant requirements to observable behavior. Inspect the consumers and source of truth before changing shared structures. Implement one coherent slice at a time, including the necessary loading, empty, error, and permission states for an affected user flow. Verify the success path and the failure paths that matter to the requirement. Report any acceptance criterion that remains untested instead of marking the entire feature verified.

## Refactoring or migration

Name the behavior that must remain stable and inventory affected callers. Use existing tests or a representative before/after comparison. Migrate each coherent unit and check it before moving on. Remove the old path when all required callers are migrated; retain compatibility only when rollout or external consumers require it. For persisted data, establish ownership, backfill requirements, retry behavior, and recovery limits before executing a migration. Local code work alone does not authorize a production data change.

## Performance investigation

Record the workload, environment, and baseline. Measure the relevant path with profiling, timing, or query evidence and identify the bottleneck before optimizing. Compare using the same workload and inspect correctness under the changed implementation. Report observed measurements and their scope; do not invent improvement percentages from code shape alone.

## UI verification

Reproduce the visible state using the relevant viewport, data, and interactions. Use supplied visual references to identify concrete differences. Verify the edited flow in an available browser or native client, including the state that triggered the mismatch. Capture evidence when useful and avoid exposing sensitive data. If only source or build checks are possible, explicitly leave visual and interaction behavior unverified.

## Review

Resolve the exact diff and relevant requirements, separate defects from questions, and attach findings to evidence. Review authorization permits analysis; publication follows the user's request. Re-read the current head and anchors before posting authorized comments. For a GitLab MR, `glab-mr-review` is explicit-invocation only: suggest it to the user, and otherwise review directly.

## Delivery and resume

For delivery, inspect the final change and requested target, run applicable checks, and prepare descriptions from the complete diff. Reuse a matching PR/MR when appropriate. Report local edits, commits, pushed changes, open requests, CI, merge, and deployment as separate states.

For resuming work, inspect current artifacts and branch state rather than trusting an old completion summary. For a requested pause, save a concise handoff identifying completed work, remaining checks, and the next action, without secrets. Do not create background automations unless requested.
