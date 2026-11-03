---
name: capture-screen
description: Capture sharp, captioned screenshots of a feature running in the browser, one per acceptance criterion, and deliver them as files. Use when the user asks to capture screen, take screenshots for a Jira story/AC/CR, "ไล่ capture screen", or needs evidence images for a feature.
---

# Capture Screen

Produce one sharp, captioned image (PNG, WebP or JPEG) per acceptance criterion (AC) of a feature, ready to attach to Jira.

## Why not the browser pane for the final image

The built-in browser pane returns every screenshot and `zoom` at its 800px-wide frame ("not magnified"), even when the page runs at devicePixelRatio 2. A 800x260 raw looks soft. Use the pane to **drive and read** the app; take the **final images with headless Chrome** (`scripts/shoot.mjs`, scale 2 = 2880px wide for a 1440 viewport).

## Directory

The scripts choose the directory. Pass the issue key. Do not invent a path, and do not use `/tmp`, `%TEMP%`, `Library/Application Support`, or an agent store.

```text
path.join(os.homedir(), '.agents', 'capture-screen', issueKey)
```

- macOS and Linux: `$HOME/.agents/capture-screen/<ISSUE-KEY>/`
- Windows: `%USERPROFILE%\.agents\capture-screen\<ISSUE-KEY>\`

`node scripts/screen-dir.mjs <ISSUE-KEY>` creates that directory (owner-only, mode 0700, because it holds the login URL and the Chrome profile) and prints the absolute path. `shoot.mjs` and `launch-redirect.py` resolve the same path from the issue key. Quote the printed path in every shell command and in the reply. A home directory can contain spaces.

Inside it: `shots.json`, `s.json`, `raw/`, `out/`.

## Workflow

1. **Get the shot list.** Read the Jira story: AC and the screenshot list in the latest CR comment. If the issue is a subtask, the AC lives on the parent. One AC may need several shots (before/after, open/closed, empty state).
2. **Create the directory** with `node scripts/screen-dir.mjs <ISSUE-KEY>`. Write `shots.json` there.
3. **Sign in locally.** `shoot.mjs` runs its own Chrome profile and signs in only through `<dir>/s.json`. A session in the pane is not shared with it, so an authenticated app needs `s.json` for the capture run even when the pane is already signed in; without it every shot is the sign-in page. Skip `s.json` only for a public page. Generate it with the repo's own session helper: a script that prints `{"launchUrls":{"local":"<url>"}}` (write it to `<dir>/s.json`).
   - It signs other sessions out: tell the user, and never rerun it needlessly.
   - If `launch-redirect.py` or an earlier `shoot.mjs` run already consumed `s.json`, run the helper again right before step 5. This signs the pane out, so finish the pane work in step 4 first. Check the first `out/` image for a sign-in page.
   - Apps that keep the login in `sessionStorage` lose it when Chrome closes. `.chrome-profile` does not keep that login. `shoot.mjs` must be the Chrome that reads `s.json`. Do not launch a second Chrome to measure a clip. A second run of the session helper signs the user out again: say so before running it.
   - Treat the token and launch URL as credentials: never print them or read them back. `shoot.mjs` deletes `s.json` only after the login page loaded, so a failed start (no Chrome, bad `shots.json`) keeps the session and you can rerun.
   - To drive the pane yourself with the same session: run `scripts/launch-redirect.py <ISSUE-KEY>` in the background and open `http://127.0.0.1:9777/` with `preview_start` (`navigate` can be refused for 127.0.0.1). The redirect is one-shot; a failed navigation consumes it (a busy port 9777 does not: it exits before reading `s.json`). Do not run both `shoot.mjs` and the redirect from the same `s.json`: the first one deletes it.
4. **Find the state of each AC.** Use the pane when it is available. If the pane or Computer Use is unavailable, take ids from the database and deep-link them. Read numbers from the page text, not the image. The pane's date inputs are fiddly: click the day segment and type, or use ArrowUp/Down on a segment. Screenshots from the pane can lag one action behind: wait, then shoot again.
5. **Run** `node scripts/shoot.mjs <ISSUE-KEY>`. Spec fields are documented at the top of the script. Deep-link each shot by route, set `waitText` to strings that appear when the data has loaded, and clip to just the evidence (banner, table, dialog). The check is `includes`, so each string must be unique to that shot: a short number such as `11` matches other numbers. The script warns when a `waitText` value is shorter than 4 characters. Check the clip does not slice through the next element: lower `clip.height` in `shots.json` and run `--caption-only`, which crops the existing raw to the clip and captions it without logging in again (no image tool needed).
   - Sizes: `viewport` 1920x1080 with `scale: 1` gives true 1080p (the caption bar adds height below it); `scale: 2` gives sharper crops of small regions. `"format": "webp"` (or `"jpeg"`) plus `"quality"` sets the file type; `--caption-only` can re-caption existing PNG raws as WebP without logging in again. List CSS selectors of dev-only overlays (framework indicators, devtools buttons) in `"hideSelectors"` to hide them before shooting. Every image gets an address-bar strip on top showing the page URL (`baseUrl` + `url`, query and hash removed because they can carry tokens); set `"showUrl": false` to drop it.
6. **Caption** is done by `shoot.mjs` in the app's own page so it can use the app's web fonts. The default is the system UI font; set `captionFont` (for example `var(--font-body), sans-serif`) to use the app's font. The script prints `loaded fonts:`; confirm the expected family is in it, and check that Thai text renders, not boxes. Caption = AC number + what the image proves, in the story's language, with the visible numbers. If no Chrome, Chromium or Edge is installed, stop and tell the user; do not fall back to the pane's 800px images.
7. **Check before delivering.** Open a few `out/` images. With `scale: 2` the width is 2 times `clip.width`. Sums must add up (statuses = total, per-type = box total). Note any state you could not reach.
8. **Clean up.** `shoot.mjs` deletes the Chrome profile (cookies) when a run succeeds; `--keep-profile` keeps it. After a crash run `node scripts/shoot.mjs <ISSUE-KEY> --clean`.
9. **Deliver.** `SendUserFile` each file in `out/` with its caption, in AC order. If that tool is missing, run `node scripts/shoot.mjs <ISSUE-KEY> --reveal` (`open` on macOS, `explorer` on Windows, `xdg-open` on Linux) and quote the `out` path in the reply.

## Platforms

- `shoot.mjs` and `screen-dir.mjs` run on macOS, Windows and Linux with Node 22+. Chrome, Chromium or Edge is found automatically; set `CHROME=<path>` if yours is elsewhere. No other tool is needed (no `sips`, no `swiftc`).
- `launch-redirect.py` needs Python 3: use `py -3 -I` or `python -I` on Windows where `python3` is missing.
- Shell redirects (`> s.json`) work in PowerShell, cmd and bash. Quote the path.

## Rules

- Do not attach to Jira unless the user says so. Atlassian MCP usually has no attach tool: say so and offer the file list.
- Name files `NN-slug.<ext>` (`ext` follows `format`: png, webp or jpg) and reuse those names in CR cells (`รอแนบภาพ: NN-slug.webp`).
- Mismatch with the AC (colour, copy, order) goes in the report, not hidden by cropping.
- Report what was not captured or not tried (Inactive values, Setting changes, other roles).
- Use only test or seed data; blur or skip real patient data, or say that the data looks like test data and was not verified.
- Do not download fonts without asking; the app's own fonts or the system fonts are enough.

## Output

List of files with the AC each one covers, mismatches found, shots not taken, and any session that was invalidated. Quote the `out` directory.
