---
name: jira-bug
description: Generate a Bug fix Code Review summary — compare Jira bug ticket details with a verified Git change scope, draft the summary, and publish when requested.
disable-model-invocation: true
---
# Jira Bug Code Review Skill

This skill guides the agent in generating a Bug Code Review summary for a provided Jira ticket and publishing it as a comment when requested. Resolve the repository and Jira site from the current task; this skill can be installed and used independently.

## Trigger

User-invoked: `/jira-bug` — use this skill explicitly when asked to generate a Bug CR summary for a Jira ticket (e.g., "Create a bug CR for PROJ-001", "run jira-bug for [Ticket ID]").

## Workflow Instructions

1. **Fetch Jira Ticket Information**:

   - Discover the available Jira tools by capability: site discovery, issue retrieval, comment listing, and comment creation. Tool names vary by agent; use the configured equivalents rather than assuming a fixed MCP namespace or shell-tool name.
   - Resolve the intended site and issue key from the user and project context. If multiple sites remain plausible, ask before selecting one.
   - Fetch the issue and existing comments. Follow comment pagination until the relevant prior summaries are found or all available comments have been checked. If access is incomplete, state that limitation and do not claim no prior summary exists.
   - Extract the **Summary**, **Description**, and any bug reproduction steps or expected results from the issue.
2. **Detect Previous Bug Summary**:

   - Scan the existing comments for a previously posted Bug CR summary — detect it by the `# Bug` heading or the "AI-generated Bug CR summary" banner line.
   - Note the previous summary's comment ID, posted date, language, and any details it carries that cannot be regenerated from the diff (e.g., screenshots, hotfix Version list).
3. **Resolve and Read the Change Scope**:

   - Inspect repository instructions, Git status, branch, and remotes. Follow the user's explicit staged/commit/branch/MR/PR scope first.
   - For staged work, read `git diff --cached`; for a specific commit, inspect its patch and parents; for a commit range, inspect all requested commits and the resulting diff; for a branch, verify its base and compare the complete branch diff; for an MR/PR, read its verified source/target refs and full diff after fetching relevant refs.
   - If no scope was named, infer it from the current task, matching ticket branch, and existing MR/PR. An empty staged diff is not evidence that the implementation is missing. If multiple plausible scopes would produce different summaries, ask one focused question.
   - Record repository, scope mode, base/head SHAs where applicable, and changed-file count. Staged work has no new commit SHA; identify the staged snapshot and current HEAD without implying it is committed.
   - Read relevant surrounding code, callers, and tests to understand behavior. Do not stage or commit files merely to generate this summary. Exclude unrelated changes and sensitive values.

4. **Analyze and Compare**:

   - Compare the selected code changes against the Bug details and expectations defined in the Jira ticket.
   - Explain the trigger, expected/actual behavior, confirmed cause or remaining hypothesis, and how the change addresses it. Separate code inspection from reproduction and regression-test evidence.
   - Identify the affected areas in the codebase (Configurations, Modules, Features / Issues, Components).
   - Report checks actually run, their results, and checks not run. Code inspection alone does not establish runtime correctness or full acceptance.
   - For API work, describe the endpoint/method, relevant request fields, authorization, processing and source-data resolution, duplicate behavior, response statuses, and scope when supported by the code. Mark unknown contracts explicitly.
5. **Summarize using Template**:

   - Keep the headings and tables of the bug template below and append an **Evidence and verification** section identifying the inspected scope, code references, actual checks, and remaining uncertainty:

   ```markdown
   # Bug

   **Summary** - [Provide a brief one-line summary of the change or issue fixed.]

   **Affected Areas** - [List the specific configurations, modules, features, or components that are impacted by this change or issue.]

   | Summary                                                             | Screenshots |
   | :------------------------------------------------------------------ | :---------- |
   | 1. [Provide a brief one-line summary of the change or issue fixed.] | N/A         |

   | Affected Areas    | Descriptions                                                 |
   | :---------------- | :----------------------------------------------------------- |
   | Configurations    | [Details or N/A]                                             |
   | Modules           | [Details or N/A]                                             |
   | Features / Issues | [Details or N/A]                                             |
   | Components        | [Details or N/A]                                             |
   | Version           | The list of versions must be hotfix after this card is done. |
   ```
6. **Draft and Publish**:

   - **First Bug summary on the ticket**: add a brief line at the top stating that this is an AI-generated Bug CR summary based on the inspected change scope.
   - **A previous Bug summary already exists**: the new comment must reference the old one so readers can follow the update history:
     - Open with an update banner instead of the first-time line, e.g. `> 🔄 Updated Bug CR summary — supersedes the previous summary posted on 2026-08-19 (comment 400128).` Link to the previous comment when possible: `https://<site>.atlassian.net/browse/<TICKET>?focusedCommentId=<commentId>#comment-<commentId>`.
     - Add a `**Changes since last summary**` section right after the banner listing only what is new or changed (fixes added, verification results, newly affected areas, hotfix Version list changes).
     - Carry forward still-valid information from the previous summary that the diff cannot regenerate (e.g., screenshots, hotfix Version list) — if they still apply, state so explicitly instead of silently dropping them.
     - Keep the same language as the previous summary unless the user asks for a different language.

   - Prepare the complete comment first. A request to summarize or review ends with a local draft unless publication was explicitly requested. If the user already asked to post it, continue without asking again. If publication is needed but not yet authorized, request approval only for the completed, reviewable draft.
   - Before publishing, confirm the issue and re-read relevant prior summaries to avoid duplicates or superseding a newer update. If the selected changes moved since analysis, refresh the evidence and draft first.
   - Preserve existing comments; this workflow creates a linked follow-up comment rather than deleting or overwriting history.
   - Use the available Jira comment-creation tool and its supported body format to publish to the verified issue.

7. **Verify the Result**:

   - After publication, retrieve the created comment and verify its issue, body, and link. If the write result is uncertain, inspect existing comments before retrying to avoid duplicate posts.
   - Return the comment link and publication status, or label the result as a draft. Report inspection/test limitations explicitly; do not claim publication succeeded without evidence.
