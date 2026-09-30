# Comments and summary

Use the user's requested language, otherwise the established review language. Keep conventional type/status tokens consistent. Write about the code and its effects, not the author's ability. One finding covers one root cause; group duplicate manifestations unless separate remediation is needed.

Use familiar words in explanations and section labels. Avoid jargon when a plain description conveys the same meaning; keep exact code identifiers when needed to locate the problem. For Thai reviews, use `ปัญหาที่พบ`, `ความรุนแรง`, `หลักฐานที่พบ`, `แนวทางแก้`, `ทดสอบแล้ว`, and `ควรทดสอบเพิ่ม` instead of English section labels. Conventional type/status tokens and stable finding IDs remain unchanged. Describe what happens and how it affects the user before implementation details.

## Emoji vocabulary

Use at most one emoji at the start of a finding heading or summary status, always followed by explicit text. Omit emoji if the user or repository prefers plain text. Emoji indicates purpose/status, not severity; do not decorate every paragraph or rely on color alone.

| Emoji | Meaning |
|---|---|
| 🚫 | Blocking issue or `Changes required` |
| 💡 | Non-blocking suggestion or nitpick |
| ❓ | Question requiring context |
| 🔎 | `Review incomplete` or re-review `needs evidence` |
| ✅ | Verified result or re-review `fixed`, with the specific evidence stated |

Use plain `issue (non-blocking)` for a deferred/non-blocking defect. Use plain `No blocking findings` rather than a green check: not finding a blocker is not proof that tests passed or the code is bug-free. For `still present`, retain the finding's blocking label; do not imply every unresolved item blocks merge.

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

Inline issues must use rendered Markdown sections with real blank lines between the title, severity, impact, evidence, suggested change, and verification. A single newline can render as a space in GitLab; do not rely on it to separate sections or concatenate labeled fields into one paragraph. Publish the Markdown body itself, without an enclosing code fence or literal `\\n` sequences.

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

```text
Review: <MR link>
Snapshot: <source> → <target>, head <SHA>
Verdict: <Changes required | Review incomplete | No blocking findings>

Findings: <blocking issues first, then non-blocking suggestions and questions>
Coverage: <areas assessed; N/A reasons; unavailable or excluded areas>
Checks run: <commands/results and SHA; identify CI vs reviewer-run checks>
Checks not run / suggested: <remaining verification and material limits>
Publication: <draft or verified links; posted/skipped/failed counts>
```

Do not turn `No blocking findings` into unconditional approval language. Use ✅ only on individually supported results such as a passing named test, not the entire review. A review recommendation and an actual GitLab approval are separate actions.

The type/decorator syntax is adapted from [Conventional Comments](https://conventionalcomments.org/); the emoji mapping is a local convention.
