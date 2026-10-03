# Comments and summary

Use the user's requested language, otherwise the established review language. Keep conventional type/status tokens consistent. Write about the code and its effects, not the author's ability. One finding covers one root cause; group duplicate manifestations unless separate remediation is needed.

Use familiar words in explanations and section labels. Avoid jargon when a plain description conveys the same meaning; keep exact code identifiers when needed to locate the problem. For Thai reviews, use `ปัญหาที่พบ`, `ความรุนแรง`, `หลักฐานที่พบ`, `แนวทางแก้`, `ทดสอบแล้ว`, and `ควรทดสอบเพิ่ม` instead of English section labels. Conventional type/status tokens and stable finding IDs remain unchanged. Describe what happens and how it affects the user before implementation details.

In both inline comments and summaries, do not use semicolons to join prose clauses, evidence, or test results. Split them into short sentences, separate paragraphs, or one bullet per point. Preserve semicolons only inside exact code, commands, or verbatim quotations when necessary. Each executed check gets its own bullet, including failed or blocked attempts. Explain technical failures in plain language instead of unexplained terms such as “probe” or “module resolution”.

For example, write a Thai test result as:

```markdown
**ทดสอบแล้ว**

- ทดสอบการเปลี่ยนหน้าด้วย Bun: ผ่าน แต่ระบบเปลี่ยนจากภาษาไทยเป็นภาษาอังกฤษ
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
| ✅ | Verified result or re-review `fixed`, with the specific evidence stated |

A new candidate with an unresolved premise is a ❓ question. 🔎 marks the state of the review or of a prior finding, not a new candidate.

Use plain `issue (non-blocking)` for a deferred/non-blocking defect. Use plain `No blocking findings` rather than a green check: not finding a blocker is not proof that tests passed or the code is bug-free. For `still present`, retain the finding's original classification: use 🚫 while it is blocking and plain `issue (non-blocking)` otherwise, so an unresolved item does not read as a merge blocker unless it is one.

## Finding structure

```markdown
🚫 **issue (blocking) — F1: <short, specific defect>**

**Severity:** <Critical | High | Medium | Low>

<One short paragraph describing the trigger, code path, and observable impact.>

**Evidence**

- <File/line or verified contract, using inline code for identifiers.>
- <Test or reproduction supporting the finding; distinguish inference.>

**Suggested change**

<Smallest necessary correction, allowing valid alternatives.>

**Verification**

- Executed: <actual check and result, or explicitly not run.>
- Proposed: <regression scenario that would demonstrate the correction.>
```

Inline issues must use rendered Markdown sections with real blank lines between the title, severity, impact, evidence, suggested change, and verification. A single newline can render as a space in GitLab; do not rely on it to separate sections or concatenate labeled fields into one paragraph. Publish the Markdown body itself, without an enclosing code fence or literal `\n` sequences.

Keep the title short and severity on its own paragraph. Use short paragraphs (usually one to three sentences) and bullets for multiple evidence points or scenarios. Format code identifiers, statuses, and paths with backticks; link precise evidence when available. Keep executed and proposed checks separate, and do not invent checks to fill the template. Omit an empty optional bullet. Long logs and broader review coverage belong in the summary or a linked artifact, while the inline comment retains enough evidence to stand alone.

A brief suggestion, question, or fixed-status reply can use a heading and a short paragraph without every section. Do not collapse a multi-part defect into a single paragraph. Assign stable local IDs such as F1/F2 and retain them during re-review. Link existing discussion IDs after publication. Choose severity from impact, not alarming wording. Do not quote secrets or private data in examples.

```text
💡 suggestion (non-blocking): Consolidate the repeated status mapping
The same mapping appears in both submit paths. A shared helper could prevent drift;
keep it local to this module unless another consumer actually needs it.

❓ question: Is this endpoint protected by the shared ownership middleware?
The changed handler does not check ownership, but the route registration is unavailable.
Please identify the middleware so this path can be assessed before concluding it is a defect.

✅ fixed — F1: The ownership predicate now rejects another owner's ID.
Verified by the focused cross-owner regression test at <current SHA>.
```

## Summary structure

```markdown
<Optional status emoji> **<Verdict in the review language>**

- MR: <link>
- Branches: `<source>` → `<target>`
- Reviewed commit: `<SHA>`
- Requirements: <ticket link, or unavailable>

### Code and repository rules

- <One finding per bullet: ID, severity, short impact, discussion/file link.>
- <If no repository-rule violation was found, state that separately.>

### Requirements

- <One finding per bullet; reference its existing ID if already listed above.>
- <Put each unresolved question in its own bullet and mark it as a question.>

### Behavior confirmed

- <One supported behavior per bullet, with evidence; omit if none.>

### Coverage

- <Areas inspected; explain exclusions or unavailable areas.>

### Checks run

- <Command or check: result; identify reviewer-run vs CI and mocks vs live checks.>

### Not verified

- <One untested behavior, unavailable result, or failed check per bullet.>

### Suggested checks

- <One proposed scenario per bullet; do not describe it as executed.>

### Publication

- <Draft or verified links; posted/skipped/failed counts.>
```

The summary must follow the same Markdown spacing rules as inline comments. Keep branch names, commit SHA, and ticket links in separate bullets so metadata does not become one long line. Use one finding or question per bullet; never join F1/F2/F3/Q1 in a paragraph with semicolons. If one finding concerns both code and requirements, list its impact once and reference the same ID in the other section. Preserve the distinction between repository rules and ticket requirements.

Use everyday language for the verdict, headings, and explanations. For Thai summaries use `ต้องแก้ไขก่อน`, `ยังตรวจไม่ครบ`, or `ไม่พบปัญหาที่ต้องแก้ก่อน` for the corresponding verdict, and headings such as `โค้ดและกติกาของโครงการ`, `ข้อกำหนดในงาน`, `ส่วนที่ตรวจแล้วทำงานตามข้อกำหนด`, `ขอบเขตที่ตรวจ`, `ทดสอบแล้ว`, `ยังไม่ได้ตรวจยืนยัน`, `ควรทดสอบเพิ่ม`, and `สถานะคอมเมนต์`. Avoid unexplained terms such as snapshot, blocker, probe, persistence, navigation, and regression. Say what was tested and what happened, for example: “กดกลับแล้วออกจากฟอร์มได้โดยไม่เตือนว่ามีข้อมูลยังไม่บันทึก”. Keep exact UI labels and code names when needed, explaining their role in plain language.

Keep each check to a short result first; move long commands, logs, and test setup to linked evidence or a separate details section when needed. Retain material limits: a mocked database write is not a live database test, a code trace is not a browser reproduction, and a failed attempt followed by a passing alternative must identify both. Keep unverified behavior and proposed tests in separate sections. Omit empty optional sections, but explicitly state when no tests ran or required evidence is unavailable.

Do not turn `No blocking findings` into unconditional approval language. Use ✅ only on individually supported results such as a passing named test, not the entire review. A review recommendation and an actual GitLab approval are separate actions.

The type/decorator syntax is adapted from [Conventional Comments](https://conventionalcomments.org/); the emoji mapping is a local convention.
