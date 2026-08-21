---
name: jira-cr
description: Generate a Change Request (CR) summary — compare Jira ticket acceptance criteria with Git staged changes, format via template, post as a Jira comment.
disable-model-invocation: true
---
# Jira Change Request (CR) Skill

This skill guides the agent in generating a Change Request (CR) summary for a provided Jira ticket and automatically posting it as a comment. Be sure that this skill can be used in any module or workspace dynamically.

## Trigger

User-invoked: `/jira-cr` — or when asked to create a CR summary for a Jira ticket (e.g., "Create a CR for PROJ-001", "run jira-cr for [Ticket ID]").

## Workflow Instructions

1. **Fetch Jira Ticket Information**:

   - Identify the user's Jira Cloud ID using the `mcp_atlassian-mcp-server_getAccessibleAtlassianResources` tool (cache this if already known).
   - Fetch the Jira issue details using `mcp_atlassian-mcp-server_getJiraIssue` with the given Ticket ID. Include the `comment` field so existing comments are available for the next step.
   - Extract the **Summary**, **Description**, and **Acceptance Criteria (AC)** from the issue.
2. **Detect Previous CR Summary**:

   - Scan the existing comments for a previously posted CR summary — detect it by the `# Story & CR` heading or the "AI-generated CR summary" banner line.
   - Note the previous summary's comment ID, posted date, language, and any details it carries that cannot be regenerated from the diff (e.g., screenshots, Branch, Commits).
3. **Retrieve Git Staged Changes**:

   - Use the `run_command` tool to execute `git diff --staged` (or `git diff --cached`) in the current project directory.
   - Analyze the output to understand what code changes are currently staged for commit.
4. **Analyze and Compare**:

   - Compare the staged code changes against the Acceptance Criteria defined in the Jira ticket.
   - Determine if the implementation is complete or if any ACs are missing.
   - Identify the affected areas in the codebase (Configurations, Modules, Features, Components).
5. **Summarize using Template**:

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
6. **Post Jira Comment**:

   - Use the `mcp_atlassian-mcp-server_addCommentToJiraIssue` tool to post the formatted markdown as a comment directly on the Jira ticket.
   - **First CR summary on the ticket**: add a brief line at the top stating that this is an AI-generated CR summary based on current staged changes.
   - **A previous CR summary already exists**: the new comment must reference the old one so readers can follow the update history:
     - Open with an update banner instead of the first-time line, e.g. `> 🔄 Updated CR summary — supersedes the previous summary posted on 2026-08-19 (comment 400128).` Link to the previous comment when possible: `https://<site>.atlassian.net/browse/<TICKET>?focusedCommentId=<commentId>#comment-<commentId>`.
     - Add a `**Changes since last summary**` section right after the banner listing only what is new or changed (new ACs, changed AC statuses, newly affected areas, scope added beyond the ACs).
     - Carry forward still-valid information from the previous summary that the diff cannot regenerate (e.g., screenshots, Branch, Commits) — if they still apply, state so explicitly instead of silently dropping them.
     - Keep the same language as the previous summary unless the user asks for a different language.
