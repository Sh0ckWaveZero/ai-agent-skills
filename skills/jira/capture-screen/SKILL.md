---
name: capture-screen
description: Capture sharp, captioned screenshots of a feature running in the browser, one per acceptance criterion, and deliver them as files. Use when the user asks to capture screen, take screenshots for a Jira story/AC/CR, "ไล่ capture screen", or needs evidence images for a feature.
---

# Capture Screen

Create clear, captioned screenshot files for a Jira story's acceptance criteria (AC). Use `agent-browser` to control the page and capture every raw image. Use `shoot.mjs` to add captions; it reads the raw images and never takes a screenshot itself.

Script paths below are relative to this skill's directory, the one that holds this `SKILL.md`. Run them from there or prefix that directory.

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
6. While the state is still open, record the rectangle of every element a step will point at. See [Annotate only when useful](#annotate-only-when-useful).

Capture the intended region at the top left of the viewport. The caption script trims only from the bottom of a raw image, and does not use `clip.x` or `clip.y`. Do not hide an AC mismatch by cropping.

## Annotate only when useful

When an image describes steps, add a `steps` array to its shot in `shots.json`. The script draws the markers on the output and lists each step's `text` beneath the caption, numbered in array order. The raw image stays unchanged. Red identifies the marker, not necessarily an error. Describe any error in `text`.

Use no more than three steps per image. Split longer sequences across images. Capture separate images when a step changes the page state so each image shows the relevant result. Images without steps need no markers.

### Frame the element

A step that points at an element takes a `frame`. The script outlines the element and points a numbered pin at the outline.

```json
"steps": [
  { "frame": { "x": 386, "y": 438.5, "width": 667.5, "height": 68.5, "radius": 4 }, "text": "ไฟล์ที่ 1 พร้อมอัปโหลด" },
  { "frame": { "x": 941, "y": 621, "width": 115, "height": 40, "radius": 4 }, "pin": "left", "text": "กด UPLOAD (2)" }
]
```

`frame` is the border box of the element the user clicks or the step describes, in CSS pixels from the top-left of the captured crop. It is not the box of the label text, and not a parent that includes empty space. Frame the whole control:

| Target | Frame |
| --- | --- |
| Button | The button, including its icon and padding |
| List or table row | The whole row element, not only its name |
| Chip or tag | The whole pill, including its badge and trailing icon |
| Icon button inside another control | Only the icon button |
| Card or summary tile | The whole card, including its title and values |

Read the rectangle from the page while the state is open. Do not estimate it from the image:

```bash
agent-browser --session <SESSION> eval "(() => { const el = document.querySelector('<selector>'); const r = el.getBoundingClientRect(); return JSON.stringify({ x: r.x, y: r.y, width: r.width, height: r.height, radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) }); })()"
```

Set `radius` to the element's own corner radius so the outline follows its shape. Use half the height for a pill or a circle. The default is 4. The script draws the outline 2 CSS pixels outside the element, in red with a white edge for contrast. Where the element touches the edge of the crop, the outline moves inward so all four sides stay visible.

If the page is no longer open and only the image remains, measure the element's own border or background fill in the image and divide by the capture scale. Do not measure the color of its text; that finds the glyphs, not the element.

### Place the pin

The pin is a numbered disc with one sharp corner. It sits outside the frame with that corner on the frame edge. `pin` chooses the side: `top`, `right`, `left`, or `bottom`. When omitted, the script uses the first of those sides that has room inside the crop. It cannot see the page content, so set `pin` yourself when the default side would cover text, a value, an icon, or a neighboring row. Inspect every pin in the output.

### Other marks

A step with `x` and `y` instead of `frame` draws a numbered circle centered on that point. Use it only for a spot that has no element to outline.

The script does not draw arrows or unnumbered shapes. If one is needed, save the original to `<dir>/source/`, edit a copy with an available image tool, and use the copy as the raw file for the caption run. Do not cover text, values, or controls, and inspect the result against the original. If a suitable tool is unavailable, deliver the unmarked image and explain the location in the caption.

## 4. Add captions

Document each shot in `shots.json` using the fields described at the top of `scripts/shoot.mjs`. Use the same file stem as its raw image. Set `clip.width` to the raw image width in CSS pixels, and `clip.height` to the desired height. Set `viewport` wide enough for every clip. Set `baseUrl` and `captionPath` to a page accessible to the separate caption browser.

Write each caption in the story's language, in this order:

1. The image's position in the set, in bold, for example `ลำดับที่ 3`.
2. The AC numbers and the state shown, in bold, for example `AC7 เลือกหลายไฟล์พร้อมกัน`.
3. What the image proves, with the relevant visible text and numbers.

Put step descriptions in `steps`, not in the caption. The script appends them as a numbered list, so a caption that also contains `1.` and `2.` lines shows the steps twice. Describe only what the image shows or the action to take; do not claim an unshown result. Use the system font or set `captionFont` to an app font. Do not download fonts without asking.

Use a plain string for an unstyled caption. For selective formatting, use an array of text parts. Supported styles are `bold`, `italic`, `underline`, `strikethrough`, `code`, `subscript`, and `superscript`; omit `style` for normal text. Use `\n` in a JSON string for a new line. Apply emphasis sparingly and avoid long italic Thai passages. Use strikethrough for superseded text, not to conceal data.

Alternatively, set `caption` to an Atlassian Document Format (ADF) version 1 `doc`. Supported nodes are `paragraph`, `heading`, `bulletList`, `orderedList`, `listItem`, `text`, and `hardBreak`. Supported text marks are `strong`, `em`, `underline`, `strike`, `code`, and `subsup` (`attrs.type` is `sub` or `sup`). Other ADF nodes and marks cause an error; adapt the caption explicitly rather than silently dropping content. This is a caption subset, not full ADF support. See [Atlassian's ADF structure](https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/).

```json
"caption": [
  { "text": "ลำดับที่ 2", "style": "bold" },
  { "text": "\n" },
  { "text": "AC2, AC3 Expand แถวที่ยังไม่มีไฟล์", "style": "bold" },
  { "text": "\nแสดง " },
  { "text": "No file attached.", "style": "bold" },
  { "text": " และปุ่ม Upload document" }
]
```

Run `node scripts/shoot.mjs <ISSUE-KEY>`. This reads all matching raw images and writes captioned images to `<dir>/out/`. It leaves `<dir>/raw/` unchanged and does not open the captured state. Verify the page and raw images before running it. Choose `format` as `png`, `webp`, or `jpeg`; `quality` applies to WebP and JPEG.

The script adds an address strip from `baseUrl` and the shot's `url`, excluding query and hash. Set `showUrl` to false to omit it. To trim the bottom, lower `clip.height` and rerun the script. Never use a caption or URL that misrepresents the captured state.

## 5. Verify and deliver

- Open the output images. Check the crop, resolution, caption, Thai text, and displayed numbers. Check that each frame follows its element's edge and that no pin covers evidence. Check that relevant subtotals add up. The output width is `scale` times `clip.width`; the raw image must have enough detail.
- Check the script's `loaded fonts:` output when using an app font. Thai text must not render as boxes.
- Report AC mismatches, states not captured or not tried, and any session invalidated. Use only test or seed data. Blur or skip real patient data, or disclose that apparent test data was not verified.
- Close the browser with `agent-browser --session <SESSION> close` only if you created that session for this task. After a caption-script crash, run `node scripts/shoot.mjs <ISSUE-KEY> --clean` to remove its profile. `--keep-profile` retains it.
- Deliver the files in AC order with their captions. Use `SendUserFile` if available. Otherwise run `node scripts/shoot.mjs <ISSUE-KEY> --reveal` and provide the absolute `out` directory path.
- Name outputs `NN-slug.<ext>` and use the same names in CR cells, for example `รอแนบภาพ: 01-stock.webp`. Do not attach files to Jira unless the user asks.
