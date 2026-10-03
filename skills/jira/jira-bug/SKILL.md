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

   - Scan the existing comments for a previously posted Bug CR summary — detect it by its banner line ("AI-generated Bug CR summary" for a first summary, "Updated Bug CR summary" for an update) or by a `Bug` heading at any level. Comment bodies may come back in a different markup, so do not rely on a literal `#` prefix. A comment that only starts with the word "Bug" is not enough. If several match, use the most recent one.
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
   - Identify the affected areas in the codebase (Configurations, Modules, Features / Issues, Components) and describe them in product terms, as the team template examples do: Modules are module names (for example `Order`), Features / Issues are on-screen feature names or the issue seen, Components are a screen or widget path (for example `Worklist > Inpatients widget`), and Configurations are config toggle names with the site they apply to. Leave file and class names out of the template.
   - Report checks actually run, their results, and checks not run. Code inspection alone does not establish runtime correctness or full acceptance.
   - For API work, describe the endpoint/method, relevant request fields, authorization, processing and source-data resolution, duplicate behavior, response statuses, and scope when supported by the code. Mark unknown contracts explicitly.
5. **Summarize using Template**:

   - Keep the headings and tables of the bug template below and add no other sections. Put each row's status, result, and a short scope in the table. Report the commands and logs behind them to the user in your reply, not in the comment:

   ```markdown
   # Bug

   **Summary** - [Provide a brief one-line summary of the change or issue fixed.]

   **Affected Areas** - [List the specific configurations, modules, features, or components that are impacted by this change or issue.]

   | Summary                                                             | Screenshots |
   | :------------------------------------------------------------------ | :---------- |
   | 1. [Provide a brief one-line summary of the change or issue fixed.] | [Image or evidence status] |

   | Affected Areas    | Descriptions                                                 |
   | :---------------- | :----------------------------------------------------------- |
   | Configurations    | [Details or N/A]                                             |
   | Modules           | [Details or N/A]                                             |
   | Features / Issues | [Details or N/A]                                             |
   | Components        | [Details or N/A]                                             |
   | Version           | The list of versions must be hotfix after this card is done. |
   ```

   - The `Version` row text in the template is an instruction to the developer, not content. Replace it with the list of versions to hotfix when the ticket, the user, or the previous summary provides it. If the list is unknown, keep the instruction text, tell the user in your reply that no list was provided, and do not infer versions.
   - **Heading color**: the team template draws the heading as a level-1, bold heading with a `textColor` mark of `#ff5630` (red) on `Bug`. Markdown cannot carry text color, so publish the comment as ADF (`contentFormat: adf`) when the comment tool supports it. If ADF is unavailable, post the markdown without color and tell the user.
   - **Markdown fallback**: a markdown table cell is one line. Keep one row per bug, join the parts of a cell with ` / `, and do not use nested lists or line breaks inside a cell.
   - **Bug rows**: write each Summary row as one numbered item with four short bullets: `เกิดอะไรขึ้น`, `สาเหตุ`, `แก้อะไร`, and `หลังแก้เป็นอย่างไร`. In ADF use a nested bullet list in the cell. In the markdown fallback put the four parts on one line, for example `เกิดอะไรขึ้น: ... / สาเหตุ: ... / แก้อะไร: ... / หลังแก้เป็นอย่างไร: ...`. State the confirmed cause. When the cause is not confirmed, label it `สันนิษฐาน` and say what is still unchecked. Do not present a guard that only hides the error as the fix unless it matches the domain contract.
   - **Write for the whole team** (developers, BA, QA). A reader should understand each row without reading the code:
     - Describe each row from the user's side: what the user does and what they see, using screen names. Explain any technical term you cannot avoid.
     - Write each status in plain language, in the summary's language. In Thai use `ทดสอบผ่าน`, `ทดสอบไม่ผ่าน`, `ยังไม่ได้ทดสอบ`, or `ยังยืนยันไม่ได้`. Use a tested status only when a check was actually run or reported, such as a reproduction rerun, a UAT result, or a test run, and always state the result. Add the scope in a few words, and the source when someone else ran it, for example `ทดสอบผ่านบน UAT โดย QA (comment 170406)`. Never write a bare `ทดสอบแล้ว`. Reading the code is not a test.
     - Put a before and after screenshot pair in the Screenshots cell when both exist.
     - In the Features / Issues cell, add a `ควรทดสอบซ้ำ:` line naming the nearby screens or features the fix can affect, found by checking the callers. Leave the line out when no callers were checked.
     - Mark behavior the bug did not call for with `(เพิ่มนอกบั๊กนี้)` in the Features / Issues cell so BA and QA can confirm it.
     - Before posting, reread the comment and cut filler, repeated points, and wording that sounds machine-written.
6. **Draft and Publish**:

   - **First Bug summary on the ticket**: add a brief line at the top stating that this is an AI-generated Bug CR summary based on the inspected change scope.
   - **A previous Bug summary already exists**: the new comment must reference the old one so readers can follow the update history:
     - Open with an update banner instead of the first-time line, e.g. `> 🔄 Updated Bug CR summary — supersedes the previous summary posted on 2026-08-19 (comment 400128).` Link to the previous comment when possible: `https://<site>.atlassian.net/browse/<TICKET>?focusedCommentId=<commentId>#comment-<commentId>`.
     - Do not add a changes section. Update the tables in place. If the previous summary says something the current code contradicts, correct it in the table and name the correction in the banner line.
     - Carry forward still-valid information from the previous summary that the diff cannot regenerate (e.g., screenshots, hotfix Version list) — if they still apply, state so explicitly instead of silently dropping them.
     - Keep the same language as the previous summary unless the user asks for a different language.
   - **Language and screenshots**: for a first summary, use the language of the team template examples (Thai, with English product and UI names) unless the user or repository instructions say otherwise. Add an image when there is one: a screenshot, or for a fix with no screen, test output before and after, an API response, or a database record. An image is not required on every row, but do not leave the cell empty. When an image is expected but not attached yet, write `รอแนบภาพ` and name what to attach, such as `รอแนบภาพ: ผลรัน test`. When no image is needed, write `ไม่มีภาพ`. Write `ภาพเดิมใน comment <id>` when the image is carried forward. Keep the pass or fail result in the Summary cell, and do not color this text.

   - Prepare the complete comment first. A request to summarize or review ends with a local draft unless publication was explicitly requested. If the user already asked to post it, continue without asking again. If publication is needed but not yet authorized, request approval only for the completed, reviewable draft.
   - Before publishing, confirm the issue and re-read relevant prior summaries to avoid duplicates or superseding a newer update. If the selected changes moved since analysis, refresh the evidence and draft first.
   - Preserve existing comments; this workflow creates a linked follow-up comment rather than deleting or overwriting history.
   - Use the available Jira comment-creation tool and its supported body format to publish to the verified issue.

7. **Verify the Result**:

   - After publication, retrieve the created comment and verify its issue, body, and link. If the write result is uncertain, inspect existing comments before retrying to avoid duplicate posts.
   - Return the comment link and publication status, or label the result as a draft. Report inspection/test limitations explicitly; do not claim publication succeeded without evidence.
