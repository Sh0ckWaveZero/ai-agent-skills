---
name: jira-cr
description: Automates Change Request (CR) summary generation by comparing Jira ticket acceptance criteria with Git staged changes, formatting it via a template, and posting it as a Jira comment.
---
# Jira Change Request (CR) Skill

This skill guides the agent in generating a Change Request (CR) summary for a provided Jira ticket and automatically posting it as a comment. Be sure that this skill can be used in any module or workspace dynamically.

## Trigger

Use this skill when asked to create a change request or generate a CR summary for a Jira ticket (e.g., "Create a CR for MPD-822" or "run jira-cr for [Ticket ID]").

## Workflow Instructions

1. **Fetch Jira Ticket Information**:

   - Identify the user's Jira Cloud ID using the `mcp_atlassian-mcp-server_getAccessibleAtlassianResources` tool (cache this if already known).
   - Fetch the Jira issue details using `mcp_atlassian-mcp-server_getJiraIssue` with the given Ticket ID.
   - Extract the **Summary**, **Description**, and **Acceptance Criteria (AC)** from the issue.
2. **Retrieve Git Staged Changes**:

   - Use the `run_command` tool to execute `git diff --staged` (or `git diff --cached`) in the current project directory.
   - Analyze the output to understand what code changes are currently staged for commit.
3. **Analyze and Compare**:

   - Compare the staged code changes against the Acceptance Criteria defined in the Jira ticket.
   - Determine if the implementation is complete or if any ACs are missing.
   - Identify the affected areas in the codebase (Configurations, Modules, Features, Components).
4. **Summarize using Template**:

   - Format your findings strictly following the CR template below (this template is embedded globally inside the skill):

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
5. **Post Jira Comment**:

   - Use the `mcp_atlassian-mcp-server_addCommentToJiraIssue` tool to post the formatted markdown as a comment directly on the Jira ticket.
   - Add a brief line at the top stating that this is an AI-generated CR summary based on current staged changes.
