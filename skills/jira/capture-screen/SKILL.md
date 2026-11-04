---
name: capture-screen
description: Capture sharp, captioned screenshots of a feature running in the browser, one per acceptance criterion, and deliver them as files. Use when the user asks to capture screen, take screenshots for a Jira story/AC/CR, "ไล่ capture screen", or needs evidence images for a feature.
---

# Capture Screen

Create clear, captioned screenshot files for a Jira story's acceptance criteria (AC). Use `agent-browser` to control the page and capture every raw image. Use `shoot.mjs --caption-only` to add captions.

## Requirements

- Node 22+, `agent-browser`, and Chrome, Chromium, or Edge for captioning. Set `CHROME=<path>` if the caption script cannot find the browser.
- If the CLI is missing, install it with `npm install -g agent-browser`, or substitute `npx --yes agent-browser` for `agent-browser` below. If its browser is missing, run `agent-browser install` (or `npx --yes agent-browser install`).
- Run `agent-browser skills get core` for the installed version's instructions. See the [quick start](https://agent-browser.dev/quick-start).
- Python 3 is needed only for the optional login redirect. On Windows, use `py -3 -I` or `python -I` if `python3` is unavailable.

Report installation or browser access failures. Do not claim the page was verified if it could not be opened.

## 1. Plan the screenshots

Read the Jira story's AC and the screenshot list in the latest CR comment. For a subtask, read the parent story's AC. Plan enough images to show each requested state, such as before and after, open and closed, or an empty state.

Run `node scripts/screen-dir.mjs <ISSUE-KEY>`. It creates an owner-only directory and prints its absolute path. Call that path `<dir>` below and quote it in shell commands. Create `<dir>/raw` and write `<dir>/shots.json`. The directory is:

- macOS and Linux: `$HOME/.agents/capture-screen/<ISSUE-KEY>/`
- Windows: `%USERPROFILE%\.agents\capture-screen\<ISSUE-KEY>\`

Do not choose another output directory. The directory can contain login credentials and browser profiles.

## 2. Open the app

Use an existing authorized `agent-browser` session if available. Otherwise, create a named session. Replace `<SESSION>` with that name in every command and keep the session open until all screenshots are captured. This preserves sessionStorage during the run.

For a public page, open its URL directly. If the project requires a session helper:

1. Tell the user if the helper signs other sessions out. Do not rerun it needlessly.
2. Write the helper's JSON output to `<dir>/s.json`. Never print the login URL or token.
3. Run `scripts/launch-redirect.py <ISSUE-KEY>` in the background, then open `http://127.0.0.1:9777/` with `agent-browser --session <SESSION> open`.

The redirect consumes `s.json` once, including on failed navigation. A busy port does not consume it. The separate caption browser does not share the interactive session, so its caption page must be independently accessible.

## 3. Capture each state

1. Set the viewport with `agent-browser --session <SESSION> set viewport <width> <height> <scale>`. Use scale 2 when the raw image needs more detail.
2. Open the page and run `agent-browser --session <SESSION> snapshot -i`. Use the returned refs with commands such as `click`, `fill`, and `select`.
3. After navigation or a page change, take another snapshot. Refs can change. Wait for the expected state with `wait --text "expected text"` or an appropriate selector. If the wait fails, do not report the shot as verified.
4. Read visible numbers using `get text`. Hide development overlays before capture. Save each image with `agent-browser --session <SESSION> screenshot "<dir>/raw/NN-slug.png"`.
5. Inspect each raw image. Record its actual route without credentials. Never put tokens in `shots.json`.

Capture the intended region at the top left of the viewport. The caption script trims only from the bottom of a raw image, and does not use `clip.x` or `clip.y` in caption-only mode. Do not hide an AC mismatch by cropping.

## Annotate only when useful

When an image describes steps, add a `steps` array to its shot in `shots.json`. Each item has `x`, `y`, and `text`. Coordinates are the marker center in CSS pixels relative to the top-left of the captured crop. For example: `"steps": [{"x": 100, "y": 80, "text": "Open the summary"}]`. The script adds numbered red markers to the image and matching descriptions beneath the caption, in array order. Red identifies the marker, not necessarily an error. Describe any error in `text`. Place markers outside text, values, controls, and other evidence. Inspect their positions in the output.

Use no more than three steps per image. Split longer sequences across images. Capture separate images when a step changes the page state so each image shows the relevant result. Images without steps need no markers.

Add a red rectangle to identify an area such as a table, field, or error message. Add a red arrow to point to a small target or show where to look. Use a thin white outline if needed for contrast. Add shapes only when they clarify the evidence, and do not cover text, values, or controls. The script does not draw rectangles or arrows; use an image tool as described below.

If annotation is needed, edit a copy of the raw image with an available image tool before captioning. Keep the original raw image unchanged and use the annotated copy as the matching raw file for the caption run. Inspect the final image against the original. If a suitable tool is unavailable, deliver the unmarked image and explain the relevant location in the caption.

## 4. Add captions

Document each shot in `shots.json` using the fields described at the top of `scripts/shoot.mjs`. Use the same file stem as its raw image. Set `clip.width` to the raw image width in CSS pixels, and `clip.height` to the desired height. Set `viewport` wide enough for every clip. Set `baseUrl` and `captionPath` to a page accessible to the separate caption browser.

Write each caption in the story's language. Include the AC number, what the image proves, and relevant visible numbers. Put step descriptions in `steps` so the script numbers them consistently. Describe only what the image shows or the action to take; do not claim an unshown result. Use the system font or set `captionFont` to an app font. Do not download fonts without asking.

Use a plain string for an unstyled caption. For selective formatting, use an array of text parts. Supported styles are `bold`, `italic`, `underline`, `strikethrough`, `code`, `subscript`, and `superscript`; omit `style` for normal text. Use `\n` in a JSON string for a new line. Apply emphasis sparingly and avoid long italic Thai passages. Use strikethrough for superseded text, not to conceal data.

Alternatively, set `caption` to an Atlassian Document Format (ADF) version 1 `doc`. Supported nodes are `paragraph`, `heading`, `bulletList`, `orderedList`, `listItem`, `text`, and `hardBreak`. Supported text marks are `strong`, `em`, `underline`, `strike`, `code`, and `subsup` (`attrs.type` is `sub` or `sup`). Other ADF nodes and marks cause an error; adapt the caption explicitly rather than silently dropping content. This is a caption subset, not full ADF support. See [Atlassian's ADF structure](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/).

```json
"caption": [
  { "text": "AC1 การเลือกคลังเลือด", "style": "bold" },
  { "text": "\n1. กดปุ่ม " },
  { "text": "Open summary", "style": "bold" },
  { "text": "\n2. เลือกคลังเลือด" }
]
```

Run `node scripts/shoot.mjs <ISSUE-KEY> --caption-only`. This reads all matching raw images and writes captioned images to `<dir>/out/`. It does not open the captured state or check `waitText`. Verify the page and raw images before running it. Choose `format` as `png`, `webp`, or `jpeg`; `quality` applies to WebP and JPEG.

The script adds an address strip from `baseUrl` and the shot's `url`, excluding query and hash. Set `showUrl` to false to omit it. To trim the bottom, lower `clip.height` and rerun `--caption-only`. Never use a caption or URL that misrepresents the captured state.

## 5. Verify and deliver

- Open the output images. Check the crop, resolution, caption, Thai text, and displayed numbers. Check that relevant subtotals add up. The output width is `scale` times `clip.width`; the raw image must have enough detail.
- Check the script's `loaded fonts:` output when using an app font. Thai text must not render as boxes.
- Report AC mismatches, states not captured or not tried, and any session invalidated. Use only test or seed data. Blur or skip real patient data, or disclose that apparent test data was not verified.
- Close the browser with `agent-browser --session <SESSION> close` only if you created that session for this task. After a caption-script crash, run `node scripts/shoot.mjs <ISSUE-KEY> --clean` to remove its profile. `--keep-profile` retains it.
- Deliver the files in AC order with their captions. Use `SendUserFile` if available. Otherwise run `node scripts/shoot.mjs <ISSUE-KEY> --reveal` and provide the absolute `out` directory path.
- Name outputs `NN-slug.<ext>` and use the same names in CR cells, for example `รอแนบภาพ: 01-stock.webp`. Do not attach files to Jira unless the user asks.
