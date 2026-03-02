---
name: jira-bug
description: Automates Bug fix Code Review summary generation by comparing Jira bug ticket details with Git staged changes, formatting it via a template, and posting it as a Jira comment.
---
# Jira Bug Code Review Skill

This skill guides the agent in generating a Bug Code Review summary for a provided Jira ticket and automatically posting it as a comment. Be sure that this skill can be used in any module or workspace dynamically.

## Trigger

Use this skill when asked to perform a bug review or generate a CR summary for a Jira Bug ticket (e.g., "Create a bug CR for MPD-822" or "run jira-bug for [Ticket ID]").

## Workflow Instructions

1. **Fetch Jira Ticket Information**:

   - Identify the user's Jira Cloud ID using the `mcp_atlassian-mcp-server_getAccessibleAtlassianResources` tool (cache this if already known).
   - Fetch the Jira issue details using `mcp_atlassian-mcp-server_getJiraIssue` with the given Ticket ID.
   - Extract the **Summary**, **Description**, and any bug reproduction steps or expected results from the issue.
2. **Retrieve Git Staged Changes**:

   - Use the `run_command` tool to execute `git diff --staged` (or `git diff --cached`) in the current project directory.
   - Analyze the output to understand what code changes are currently staged for commit to fix the bug.
3. **Analyze and Compare**:

   - Compare the staged code changes against the Bug details and expectations defined in the Jira ticket.
   - Determine if the fix addresses the issue described.
   - Identify the affected areas in the codebase (Configurations, Modules, Features / Issues, Components).
4. **Summarize using Template**:

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
5. **Post Jira Comment**:

   - Use the `mcp_atlassian-mcp-server_addCommentToJiraIssue` tool to post the formatted markdown as a comment directly on the Jira ticket.
   - Add a brief line at the top stating that this is an AI-generated Bug CR summary based on current staged changes.
