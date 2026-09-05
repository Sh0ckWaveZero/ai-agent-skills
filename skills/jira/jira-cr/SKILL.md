---
name: jira-cr
description: Generate a Change Request (CR) summary — compare Jira ticket acceptance criteria with a verified Git change scope, draft the summary, and publish when requested.
disable-model-invocation: true
---
# Jira Change Request (CR) Skill

This skill guides the agent in generating a Change Request (CR) summary for a provided Jira ticket and publishing it as a comment when requested. Resolve the repository and Jira site from the current task; this skill can be installed and used independently.

## Trigger

User-invoked: `/jira-cr` — use this skill explicitly when asked to create a CR summary for a Jira ticket (e.g., "Create a CR for PROJ-001", "run jira-cr for [Ticket ID]").

## Workflow Instructions

1. **Fetch Jira Ticket Information**:

   - Discover the available Jira tools by capability: site discovery, issue retrieval, comment listing, and comment creation. Tool names vary by agent; use the configured equivalents rather than assuming a fixed MCP namespace or shell-tool name.
   - Resolve the intended site and issue key from the user and project context. If multiple sites remain plausible, ask before selecting one.
   - Fetch the issue and existing comments. Follow comment pagination until the relevant prior summaries are found or all available comments have been checked. If access is incomplete, state that limitation and do not claim no prior summary exists.
   - Extract the **Summary**, **Description**, and **Acceptance Criteria (AC)** from the issue.
2. **Detect Previous CR Summary**:

   - Scan the existing comments for a previously posted CR summary — detect it by the `# Story & CR` heading or the "AI-generated CR summary" banner line.
   - Note the previous summary's comment ID, posted date, language, and any details it carries that cannot be regenerated from the diff (e.g., screenshots, Branch, Commits).
3. **Resolve and Read the Change Scope**:

   - Inspect repository instructions, Git status, branch, and remotes. Follow the user's explicit staged/commit/branch/MR/PR scope first.
   - For staged work, read `git diff --cached`; for a specific commit, inspect its patch and parents; for a commit range, inspect all requested commits and the resulting diff; for a branch, verify its base and compare the complete branch diff; for an MR/PR, read its verified source/target refs and full diff after fetching relevant refs.
   - If no scope was named, infer it from the current task, matching ticket branch, and existing MR/PR. An empty staged diff is not evidence that the implementation is missing. If multiple plausible scopes would produce different summaries, ask one focused question.
   - Record repository, scope mode, base/head SHAs where applicable, and changed-file count. Staged work has no new commit SHA; identify the staged snapshot and current HEAD without implying it is committed.
   - Read relevant surrounding code, callers, and tests to understand behavior. Do not stage or commit files merely to generate this summary. Exclude unrelated changes and sensitive values.

4. **Analyze and Compare**:

   - Compare the selected code changes against the Acceptance Criteria defined in the Jira ticket.
   - Map every AC to evidence and a status: implemented and verified, implemented but unverified, partially implemented, not implemented in the inspected scope, or unknown. Distinguish an absent change from functionality already present in surrounding code.
   - Preserve prior AC status/history as historical evidence; explain changes in status rather than silently replacing them.
   - Identify the affected areas in the codebase (Configurations, Modules, Features, Components).
   - Report checks actually run, their results, and checks not run. Code inspection alone does not establish runtime correctness or full acceptance.
   - For API work, describe the endpoint/method, relevant request fields, authorization, processing and source-data resolution, duplicate behavior, response statuses, and scope when supported by the code. Mark unknown contracts explicitly.
5. **Summarize using Template**:

   - Keep the headings and tables of the CR template below and append an **Evidence and verification** section identifying the inspected scope, code references, actual checks, and remaining uncertainty:

   ```markdown
   # Story & CR

   **Summary** - [Brief one-line summary of what was implemented, noting if it fully meets AC.]

   **Affected Areas** - [Comma-separated list of major areas impacted]

   | Summary                   | Screenshots |
   | :------------------------ | :---------- |
   | 1. AC1 - [Status/Summary] | N/A         |
   | 2. AC2 - [Status/Summary] | N/A         |

   | Affected Areas | Descriptions     |
   | :------------- | :--------------- |
   | Configurations | [Details or N/A] |
   | Modules        | [Details or N/A] |
   | Features       | [Details or N/A] |
   | Components     | [Details or N/A] |
   ```
6. **Draft and Publish**:

   - **First CR summary on the ticket**: add a brief line at the top stating that this is an AI-generated CR summary based on the inspected change scope.
   - **A previous CR summary already exists**: the new comment must reference the old one so readers can follow the update history:
     - Open with an update banner instead of the first-time line, e.g. `> 🔄 Updated CR summary — supersedes the previous summary posted on 2026-08-19 (comment 400128).` Link to the previous comment when possible: `https://<site>.atlassian.net/browse/<TICKET>?focusedCommentId=<commentId>#comment-<commentId>`.
     - Add a `**Changes since last summary**` section right after the banner listing only what is new or changed (new ACs, changed AC statuses, newly affected areas, scope added beyond the ACs).
     - Carry forward still-valid information from the previous summary that the diff cannot regenerate (e.g., screenshots, Branch, Commits) — if they still apply, state so explicitly instead of silently dropping them.
     - Keep the same language as the previous summary unless the user asks for a different language.

   - Prepare the complete comment first. A request to summarize or review ends with a local draft unless publication was explicitly requested. If the user already asked to post it, continue without asking again. If publication is needed but not yet authorized, request approval only for the completed, reviewable draft.
   - Before publishing, confirm the issue and re-read relevant prior summaries to avoid duplicates or superseding a newer update. If the selected changes moved since analysis, refresh the evidence and draft first.
   - Preserve existing comments; this workflow creates a linked follow-up comment rather than deleting or overwriting history.
   - Use the available Jira comment-creation tool and its supported body format to publish to the verified issue.

7. **Verify the Result**:

   - After publication, retrieve the created comment and verify its issue, body, and link. If the write result is uncertain, inspect existing comments before retrying to avoid duplicate posts.
   - Return the comment link and publication status, or label the result as a draft. Report inspection/test limitations explicitly; do not claim publication succeeded without evidence.
