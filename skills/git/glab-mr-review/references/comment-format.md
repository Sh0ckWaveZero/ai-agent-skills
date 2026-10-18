# Comments and summary

Use the user's requested language, otherwise the established review language. Keep conventional type/status tokens consistent. Write about the code and its effects, not the author's ability. One finding covers one root cause; group duplicate manifestations unless separate remediation is needed.

Use familiar words in explanations and section labels. Avoid jargon when a plain description conveys the same meaning. Keep exact code identifiers when readers need them to locate a problem.

For Thai reviews, use `ปัญหาที่พบ` for defects and `ประเด็นที่พบ` when a section also includes observations or recommendations. Use `คำถาม` for questions. Use `ความรุนแรง`, `หลักฐานที่พบ`, `แนวทางแก้`, `ทดสอบแล้ว`, and `ควรทดสอบเพิ่ม` for the corresponding sections. Keep conventional type/status tokens and stable finding IDs unchanged.

Keep the same IDs in comments and summaries. Introduce each ID with its role in Thai, such as `ปัญหาที่ 1 (F1)` and `คำถามที่ 1 (Q1)`. Expand unfamiliar abbreviations at first use or replace them with plain terms, especially for readers outside the core engineering team. Describe what happens and how it affects the user before implementation details.

In both inline comments and summaries, do not use semicolons to join prose clauses, evidence, or test results. Split them into short sentences, separate paragraphs, or one bullet per point. Preserve semicolons only inside exact code, commands, or verbatim quotations when necessary. In review output, mention failed or blocked checks and material verification gaps. Do not list routine passing checks or counts. Explain technical failures in plain language instead of unexplained terms such as “probe” or “module resolution”.

For example, write a Thai test result as:

```markdown
**ทดสอบแล้ว**

- ลองทดสอบด้วย Vitest: รันไม่ได้ เพราะหาโมดูลที่ต้องใช้ไม่พบ
```

Keep the distinction between a reproduction that confirms a defect and a regression check that confirms the fix. A passing reproduction does not mean the affected behavior is correct.

For Thai reviews, write as if explaining the problem to a teammate in conversation. Lead with the user's action and visible result, then explain the cause briefly. Use one main idea per sentence. Do not merely translate headings while leaving the body full of English technical terms. Prefer “กดเข้า/ออกจากหน้า” over “navigation”, “ภาษาที่ใช้อยู่” over “locale”, “ส่งไปอีกหน้า” over “redirect”, and “ทดสอบจำลอง” over “probe/mock reproduction”. Explain unavoidable technical terms on first use. Preserve exact UI button labels and code identifiers in evidence when useful, rather than replacing them with inaccurate translations. Keep the cause, evidence, uncertainty, and verification limits intact when simplifying.

For example, the impact paragraph can say:

```markdown
เมื่อผู้ใช้เปิดหน้าในภาษาไทยแล้วกด Modify หน้าแก้ไขกลับแสดงเป็นภาษาอังกฤษ

ตอนออกจากหน้าแก้ไขก็พบปัญหาเดียวกัน เพราะลิงก์ที่ใช้เปลี่ยนหน้าไม่ได้ระบุภาษาไทยไว้ ระบบจึงใช้ภาษาอังกฤษแทน
```

The evidence can then name the exact router, path, and language settings. The suggested change should describe the intended result first, for example: “ให้เข้าและออกจากหน้าแก้ไขโดยยังใช้ภาษาเดิม โดยใช้ตัวเปลี่ยนหน้าจาก `@/i18n/navigation`”.

## Emoji vocabulary

Use at most one emoji at the start of a finding heading or summary status, always followed by explicit text. Omit emoji if the user or repository prefers plain text. Emoji indicates purpose/status, not severity; do not decorate every paragraph or rely on color alone. In a summary, the verdict line carries the status emoji. Finding and question bullets and section headings carry none, except that a re-review status bullet may start with its status emoji.

| Emoji | Meaning |
|---|---|
| 🚫 | Blocking issue or `Changes required` |
| 💡 | Non-blocking suggestion or nitpick |
| ❓ | Question to the author or team that needs context to resolve |
| 🔎 | Review-level or prior-finding status: `Review incomplete` or re-review `needs evidence`. Never a question to the author |
| ✅ | Re-review status `fixed`, supported by specific current evidence. Do not use it to report a passing check. |

A new candidate with an unresolved premise is a ❓ question. 🔎 marks the state of the review or of a prior finding, not a new candidate.

Use plain `issue (non-blocking)` for a deferred/non-blocking defect. Use plain `No blocking findings` rather than a green check: not finding a blocker is not proof that tests passed or the code is bug-free. For `still present`, retain the finding's original classification: use 🚫 while it is blocking and plain `issue (non-blocking)` otherwise, so an unresolved item does not read as a merge blocker unless it is one.

## Finding structure

Every comment that asks for a change must state what happens now, why it matters, and what result the change should produce. Name the trigger and impact so the author does not have to infer the reason. Avoid vague requests such as "handle this" or "improve validation". Name the input or path that needs attention. State the intended result before suggesting an implementation. Leave the implementation open when more than one fix would achieve that result.

```markdown
🚫 **issue (blocking): F1: <short, specific defect>**

**Severity:** <Critical | High | Medium | Low>

<One short paragraph describing the trigger, code path, and observable impact.>

**Evidence**

- <File/line or verified contract, using inline code for identifiers.>
- <Test or reproduction supporting the finding; distinguish inference.>

**Suggested change**

<Smallest necessary correction, allowing valid alternatives.>

**Verification**

- Reproduced: <check that demonstrates the defect, if useful.>
- Not verified: <material limit, if any.>
```

Inline issues must use rendered Markdown sections with real blank lines between the title, severity, impact, evidence, suggested change, and verification. A single newline can render as a space in GitLab; do not rely on it to separate sections or concatenate labeled fields into one paragraph. Publish the Markdown body itself, without an enclosing code fence or literal `\n` sequences.

Keep the title short and severity on its own paragraph. Use short paragraphs (usually one to three sentences) and bullets for multiple evidence points or scenarios. Format code identifiers, statuses, and paths with backticks; link precise evidence when available. Keep defect reproductions, proposed checks, and unverified behavior separate. Do not list passing checks in review comments. Do not invent checks to fill the template. Omit an empty optional bullet. Long logs and broader review coverage belong in working notes or a linked artifact, while the inline comment retains enough evidence to stand alone.

A brief suggestion, question, or fixed-status reply can use a heading and a short paragraph without every section. Do not collapse a multi-part defect into a single paragraph. Assign stable local IDs such as F1/F2 and retain them during re-review. Link existing discussion IDs after publication. Choose severity from impact, not alarming wording. Do not quote secrets or private data in examples.

```text
💡 suggestion (non-blocking): Share the status mapping
Both submit paths show the same statuses. If one changes alone, users can see different labels for the same status.
Make both paths use one status mapping, such as a shared function or object. That keeps labels consistent and lets you add a status in one place.

❓ question: Is this endpoint protected by the shared ownership middleware?
The changed handler does not check ownership, but the route registration is unavailable.
Please identify the middleware so this path can be assessed before concluding it is a defect.

✅ fixed F1: The owner predicate rejects requests for another owner's ID.
The handler applies the check before returning the record, which prevents access to another owner's data.
```

## Summary structure

Post inline discussions first, then the summary, so the summary can link each anchored finding instead of repeating it. Keep the summary short: the inline discussion carries the detail.

```markdown
<Status emoji> **<Verdict in the review language> (commit <short SHA>)**

<One-line verdict: why it can or cannot be approved.>

### <Must fix>

#### <Repository rules>

- F1: <short title and discussion link when anchored, or impact, location, and fix when unanchored>

#### <Ticket requirements>

- F2: <short title and discussion link when anchored, or impact, location, and fix when unanchored>

### <Questions>

- Q1: <one line> (add the discussion link when anchored)
- Q2: <unanchored question: the full question in one line>

### <Previously reported findings>

- <F#: fixed | still present | needs evidence: one-line current status and evidence reference. Use only during re-review.>

### <Suggestions (non-blocking)>

- <One line each, with discussion link when anchored.>

### <Suggested checks>

- <One proposed scenario per line. Do not describe it as executed.>

### <Tested: failing or blocked checks only>

- <1-2 lines: failed or blocked checks only. Omit this section when none failed or were blocked.>

### <Not verified>

- <1-2 lines: main limits such as no browser or live-data check.>
```

Rules:

- One line per finding, question, and suggestion. Anchored items get a short title plus a link to their inline discussion. Do not repeat severity, evidence, or fix there.
- Give full detail (impact, location, fix) only for findings that could not be anchored inline, still kept to one or two sentences.
- Keep the tested and not-verified sections to one or two lines each. Group failed checks that share a result. Omit `Tested` when all checks passed.
- Omit empty sections. Put metadata (branches, ticket) in the verdict line or leave it out when the MR page already shows it.
- When editing an existing summary, update it in place rather than deleting and recreating it.
- Keep findings based on repository rules separate from findings based on ticket requirements. Do not merge them because they share a symptom.
- During a re-review, list each prior finding's status on one line with the current evidence. Omit this section for a first review.

The summary must follow the same Markdown spacing rules as inline comments. Use one finding or question per bullet; never join F1/F2/F3/Q1 in a paragraph with semicolons. If one finding concerns both code and requirements, list its impact once and reference the same ID in the other section. Preserve the distinction between repository rules and ticket requirements.

Use everyday language for the verdict, headings, and explanations. For Thai summaries use `ต้องแก้ไขก่อน`, `ยังตรวจไม่ครบ`, or `ไม่พบปัญหาที่ต้องแก้ก่อน` for the corresponding verdict, and the headings `ต้องแก้`, `คำถาม`, `ข้อเสนอแนะ`, `ทดสอบแล้ว`, and `ยังไม่ได้ตรวจยืนยัน` from the summary template. Avoid unexplained terms such as snapshot, blocker, probe, persistence, navigation, and regression. Say what was tested and what happened, for example: “กดกลับแล้วออกจากฟอร์มได้โดยไม่เตือนว่ามีข้อมูลยังไม่บันทึก”. Keep exact UI labels and code names when needed, explaining their role in plain language.

Keep each reported failed check to a short result first; move long commands, logs, and test setup to working notes or a linked artifact when needed. Retain material limits: a mocked database write is not a live database test, and a code trace is not a browser reproduction. Keep unverified behavior and proposed tests in separate sections. Omit empty optional sections. State that no tests ran or evidence was unavailable only when that gap materially limits the review.

Do not turn `No blocking findings` into unconditional approval language. Use ✅ only to mark a prior finding fixed when current evidence supports that status. Do not use it for passing checks or the overall review verdict. A review recommendation and an actual GitLab approval are separate actions.

The type/decorator syntax is adapted from [Conventional Comments](https://conventionalcomments.org/); the emoji mapping is a local convention.
