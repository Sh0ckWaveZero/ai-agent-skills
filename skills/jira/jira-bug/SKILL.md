---
name: jira-bug
description: Generate a Bug fix Code Review summary — compare Jira bug ticket details with Git staged changes, format via template, post as a Jira comment.
disable-model-invocation: true
---
# Jira Bug Code Review Skill

This skill guides the agent in generating a Bug Code Review summary for a provided Jira ticket and automatically posting it as a comment. Be sure that this skill can be used in any module or workspace dynamically.

## Trigger

User-invoked: `/jira-bug` — or when asked to generate a Bug CR summary for a Jira ticket (e.g., "Create a bug CR for PROJ-001", "run jira-bug for [Ticket ID]").

## Workflow Instructions

1. **Fetch Jira Ticket Information**:

   - Identify the user's Jira Cloud ID using the `mcp_atlassian-mcp-server_getAccessibleAtlassianResources` tool (cache this if already known).
   - Fetch the Jira issue details using `mcp_atlassian-mcp-server_getJiraIssue` with the given Ticket ID. Include the `comment` field so existing comments are available for the next step.
   - Extract the **Summary**, **Description**, and any bug reproduction steps or expected results from the issue.
2. **Detect Previous Bug Summary**:

   - Scan the existing comments for a previously posted Bug CR summary — detect it by the `# Bug` heading or the "AI-generated Bug CR summary" banner line.
   - Note the previous summary's comment ID, posted date, language, and any details it carries that cannot be regenerated from the diff (e.g., screenshots, hotfix Version list).
3. **Retrieve Git Staged Changes**:

   - Use the `run_command` tool to execute `git diff --staged` (or `git diff --cached`) in the current project directory.
   - Analyze the output to understand what code changes are currently staged for commit to fix the bug.
4. **Analyze and Compare**:

   - Compare the staged code changes against the Bug details and expectations defined in the Jira ticket.
   - Determine if the fix addresses the issue described.
   - Identify the affected areas in the codebase (Configurations, Modules, Features / Issues, Components).
5. **Summarize using Template**:

   - Format your findings strictly following the bug template below (this template is embedded globally inside the skill):

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
6. **Post Jira Comment**:

   - Use the `mcp_atlassian-mcp-server_addCommentToJiraIssue` tool to post the formatted markdown as a comment directly on the Jira ticket.
   - **First Bug summary on the ticket**: add a brief line at the top stating that this is an AI-generated Bug CR summary based on current staged changes.
   - **A previous Bug summary already exists**: the new comment must reference the old one so readers can follow the update history:
     - Open with an update banner instead of the first-time line, e.g. `> 🔄 Updated Bug CR summary — supersedes the previous summary posted on 2026-08-19 (comment 400128).` Link to the previous comment when possible: `https://<site>.atlassian.net/browse/<TICKET>?focusedCommentId=<commentId>#comment-<commentId>`.
     - Add a `**Changes since last summary**` section right after the banner listing only what is new or changed (fixes added, verification results, newly affected areas, hotfix Version list changes).
     - Carry forward still-valid information from the previous summary that the diff cannot regenerate (e.g., screenshots, hotfix Version list) — if they still apply, state so explicitly instead of silently dropping them.
     - Keep the same language as the previous summary unless the user asks for a different language.
