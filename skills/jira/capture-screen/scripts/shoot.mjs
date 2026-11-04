#!/usr/bin/env node
// Sharp, captioned screenshots through headless Chrome (device scale factor 2).
// Usage: node shoot.mjs <ISSUE-KEY> [--caption-only|--clean|--reveal]
//
// The directory comes from screen-dir.mjs. Do not pass a path.
//   path.join(os.homedir(), '.agents', 'capture-screen', issueKey)
//
// <dir>/s.json    JSON printed by the project's session helper ({"launchUrls":{"local":"<url>"}}).
//                 Read once and deleted; the URL is never printed.
// <dir>/shots.json
//   {
//     "baseUrl": "http://localhost:4200",          // app under test (also hosts the caption font)
//     "captionPath": "/en",                         // any public-ish app route, loads the app fonts
//     "viewport": { "width": 1440, "height": 900 },
//     "scale": 2,                                   // 1 with a 1920x1080 viewport = true 1080p
//     "format": "png",                              // "png" | "webp" | "jpeg" (extension follows)
//     "quality": 95,                                // webp/jpeg only
//     "captionFont": "var(--font-body), system-ui, sans-serif",  // optional; default is the system UI font
//     "hideSelectors": ["nextjs-portal"],           // optional CSS selectors hidden before shooting (dev overlays)
//     "shots": [{
//       "file": "01-slug.png",
//       "url": "/en/some/route",                    // path on baseUrl
//       "waitText": ["Visit Details", "Lab Number"],// all must appear in document.body.innerText
//       "clip": { "x": 0, "y": 0, "width": 1440, "height": 470 },
//       "steps": [{"x": 100, "y": 80, "text": "Open the summary"}], // marker center in crop CSS pixels
//       "caption": "AC1 ..."
//       // Or use an array: [{"text":"AC1", "style":"bold"}, {"text":" details"}]
//       // Styles: bold, italic, underline, strikethrough, code, subscript, superscript.
//       // Newlines in text start new lines.
//     }]
//   }
// Output: <dir>/raw/<file> (uncaptioned, 2x) and <dir>/out/<file> (captioned, 2x).
//
// Flags:
//   --caption-only   skip login and shooting; caption the files already in <dir>/raw
//   --keep-profile   keep <dir>/.chrome-profile after a run (default: deleted on success)
//   --clean          delete <dir>/.chrome-profile and exit
//   --reveal         open <dir>/out (open on macOS, explorer on Windows, xdg-open on Linux)
// The Chrome profile lives in <dir>/.chrome-profile and holds cookies, so it is deleted
// when a run finishes. sessionStorage auth dies when this process exits anyway,
// so this process must be the one that reads s.json. Do not start a second Chrome.
// s.json is deleted only after the login page loaded, so a failed start keeps the session.

import { spawn } from 'node:child_process';
import { chmodSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { screenDir } from './screen-dir.mjs';

const issueKey = process.argv[2];
const flags = process.argv.slice(3);
const knownFlags = new Set(['--caption-only', '--keep-profile', '--clean', '--reveal']);
if (!issueKey || issueKey.startsWith('-') || flags.some((flag) => !knownFlags.has(flag))) {
  throw new Error('usage: shoot.mjs <ISSUE-KEY> [--caption-only|--keep-profile|--clean|--reveal]');
}
const dir = screenDir(issueKey);
const captionOnly = flags.includes('--caption-only');
const revealFlag = flags.includes('--reveal');
const clean = flags.includes('--clean');
const revealOnly = revealFlag && !captionOnly && !clean;
const shouldShoot = captionOnly || (!clean && !revealOnly);
const reveal = (folder) => {
  if (!existsSync(folder)) throw new Error(`nothing to open: ${folder}`);
  const command =
    process.platform === 'win32' ? 'explorer' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  spawn(command, [folder], { stdio: 'ignore', detached: true }).unref();
};
if (clean) rmSync(join(dir, '.chrome-profile'), { recursive: true, force: true });
if (!shouldShoot) {
  if (revealFlag) reveal(join(dir, 'out'));
  process.stdout.write(`${dir}\n`);
  process.exit(0);
}
// Chrome/Chromium/Edge on macOS, Windows and Linux. Override with CHROME=<path>.
const findChrome = () => {
  if (process.env.CHROME) return process.env.CHROME;
  const env = process.env;
  const byPlatform = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ],
    win32: ['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].flatMap((k) =>
      env[k]
        ? [
            join(env[k], 'Google', 'Chrome', 'Application', 'chrome.exe'),
            join(env[k], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
          ]
        : [],
    ),
    linux: ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge'].flatMap(
      (name) => (env.PATH || '').split(':').map((p) => join(p, name)),
    ),
  };
  const found = (byPlatform[process.platform] || []).find((p) => existsSync(p));
  if (!found) throw new Error('Chrome/Edge not found. Set CHROME=<path to chrome executable>.');
  return found;
};
const CHROME = findChrome();
const spec = JSON.parse(readFileSync(join(dir, 'shots.json'), 'utf8'));
const adfNodes = new Set(['doc', 'paragraph', 'heading', 'bulletList', 'orderedList', 'listItem', 'text', 'hardBreak']);
const adfMarks = new Set(['strong', 'em', 'underline', 'strike', 'code', 'subsup']);
function validateAdf(node) {
  if (!node || !adfNodes.has(node.type)) throw new Error(`Unsupported ADF node: ${node?.type}`);
  if (node.type === 'text' && typeof node.text !== 'string') throw new Error('ADF text must be a string');
  for (const mark of node.marks || []) {
    if (!adfMarks.has(mark.type) || (mark.type === 'subsup' && !['sub', 'sup'].includes(mark.attrs?.type))) {
      throw new Error(`Unsupported ADF mark: ${mark.type}`);
    }
  }
  for (const child of node.content || []) validateAdf(child);
}
for (const shot of spec.shots || []) {
  if (shot.steps !== undefined) {
    if (!Array.isArray(shot.steps) || shot.steps.length > 3) throw new Error('steps must be an array of at most 3 items');
    for (const step of shot.steps) {
      if (typeof step.text !== 'string' || !step.text.trim() || !Number.isFinite(step.x) || !Number.isFinite(step.y) ||
          step.x < 14 || step.y < 14 || step.x > shot.clip?.width - 14 || step.y > shot.clip?.height - 14) {
        throw new Error('Each step needs text and coordinates at least 14 CSS pixels inside the clip');
      }
    }
  }
  if (shot.caption && !Array.isArray(shot.caption) && typeof shot.caption === 'object') {
    if (shot.caption.type !== 'doc' || shot.caption.version !== 1) throw new Error('ADF caption must be a version 1 doc');
    validateAdf(shot.caption);
  }
}
const vp = spec.viewport || { width: 1440, height: 900 };
const scale = spec.scale || 2;
const font = spec.captionFont || 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const hideCss = (spec.hideSelectors || []).length ? `${spec.hideSelectors.join(', ')} { display: none !important; }` : '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Owner-only: the directory holds s.json (a login URL) and the Chrome profile.
mkdirSync(dir, { recursive: true, mode: 0o700 });
chmodSync(dir, 0o700);
mkdirSync(join(dir, 'raw'), { recursive: true });
mkdirSync(join(dir, 'out'), { recursive: true });

const sessionPath = join(dir, 's.json');
const launchUrl =
  !captionOnly && existsSync(sessionPath)
    ? JSON.parse(readFileSync(sessionPath, 'utf8').match(/\{[\s\S]*\}/)[0]).launchUrls.local
    : null;

const profile = join(dir, '.chrome-profile');
mkdirSync(profile, { recursive: true });
// Port 0 lets Chrome pick a free port; it reports the port in <profile>/DevToolsActivePort.
const portFile = join(profile, 'DevToolsActivePort');
rmSync(portFile, { force: true });
const chrome = spawn(
  CHROME,
  [
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' },
);
const cleanup = () => {
  chrome.kill();
};
process.on('exit', cleanup);

let exited = false;
const chromeExit = new Promise((resolve) => chrome.once('exit', () => ((exited = true), resolve())));
let port;
for (let i = 0; i < 100 && !port && !exited; i++) {
  if (existsSync(portFile)) port = Number(readFileSync(portFile, 'utf8').split('\n')[0]);
  if (!port) await sleep(200);
}
if (!port) throw new Error(`Chrome did not start (${CHROME}). Set CHROME=<path> or close other Chrome using the profile.`);
const getJson = async (path) => (await fetch(`http://127.0.0.1:${port}${path}`)).json();
const target = (await getJson('/json/list')).find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    const { resolve, reject } = pending.get(d.id);
    pending.delete(d.id);
    d.error ? reject(new Error(d.error.message)) : resolve(d.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const i = ++id;
    pending.set(i, { resolve, reject });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  return r.result.value;
};
const waitFor = async (expression, ms = 40000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await evaluate(expression).catch(() => false)) return true;
    await sleep(400);
  }
  return false;
};
const goto = async (url) => {
  await send('Page.navigate', { url });
  await sleep(800);
};

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: vp.width,
  height: vp.height,
  deviceScaleFactor: scale,
  mobile: false,
});

if (launchUrl && !captionOnly) {
  await goto(launchUrl);
  await waitFor(`document.readyState === 'complete' && document.body.innerText.length > 20`);
  await sleep(2500);
  // The login page loaded; only now is it safe to drop the one-time launch URL.
  rmSync(sessionPath, { force: true });
}

// spec.format: "png" (default), "webp" or "jpeg"; spec.quality 1-100 for webp/jpeg.
const format = spec.format || 'png';
const ext = format === 'jpeg' ? 'jpg' : format;
const quality = spec.quality || 95;
const stem = (file) => file.replace(/\.[a-z0-9]+$/i, '');
const mimeOf = (name) => ({ png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg' })[name.split('.').pop().toLowerCase()];
const png = async (clip) => {
  const r = await send('Page.captureScreenshot', {
    format,
    ...(format === 'png' ? {} : { quality }),
    captureBeyondViewport: false,
    clip: { ...clip, scale: 1 },
  });
  return Buffer.from(r.data, 'base64');
};

const rawShots = [];
for (const s of spec.shots) {
  s.outName = `${stem(s.file)}.${ext}`;
  if (captionOnly) {
    // Reuse whatever raw exists (any format), e.g. PNG raws re-captioned as WebP.
    const rawName = [s.outName, `${stem(s.file)}.png`, `${stem(s.file)}.webp`, `${stem(s.file)}.jpg`].find((n) =>
      existsSync(join(dir, 'raw', n)),
    );
    if (!rawName) throw new Error(`no raw for ${s.file}`);
    rawShots.push({ ...s, buf: readFileSync(join(dir, 'raw', rawName)), mime: mimeOf(rawName) });
    continue;
  }
  await goto(spec.baseUrl + s.url);
  for (const text of s.waitText || []) {
    if (text.trim().length < 4) console.error(`WARN ${s.file}: waitText too short (${JSON.stringify(text)})`);
  }
  // Case and whitespace insensitive: innerText puts line breaks between block elements.
  const squash = (t) => t.toLowerCase().replace(/\s+/g, ' ').trim();
  const texts = JSON.stringify((s.waitText || []).map(squash));
  const ok = await waitFor(
    `${texts}.every(t => document.body.innerText.toLowerCase().replace(/\\s+/g, ' ').includes(t))`,
  );
  if (!ok) console.error(`WARN ${s.file}: waitText not found`);
  if (await evaluate(`document.body.innerText.includes('Please sign in')`)) {
    console.error(`WARN ${s.file}: page shows sign-in`);
  }
  await sleep(1500);
  // Hide dev-only overlays listed in spec.hideSelectors so they stay out of evidence.
  if (hideCss) {
    await evaluate(`(() => {
      if (document.getElementById('__cs_hide')) return;
      const st = document.createElement('style');
      st.id = '__cs_hide';
      st.textContent = ${JSON.stringify(hideCss)};
      document.head.append(st);
    })()`);
  }
  const buf = await png(s.clip);
  writeFileSync(join(dir, 'raw', s.outName), buf);
  rawShots.push({ ...s, buf, mime: mimeOf(s.outName) });
  console.log(`raw ${s.outName}`);
}

// Caption: overlay on an app page so the app's own web font applies.
await goto(spec.baseUrl + (spec.captionPath || '/'));
await waitFor(`document.readyState === 'complete'`);
for (const s of rawShots) {
  const dataUrl = `data:${s.mime};base64,${s.buf.toString('base64')}`;
  const width = s.clip.width;
  const height = await evaluate(`(async () => {
    document.getElementById('__cap')?.remove();
    const o = document.createElement('div');
    o.id = '__cap';
    o.style.cssText = 'position:fixed;left:0;top:0;width:${width}px;background:#fff;z-index:2147483647;';
    // Address bar strip: the page URL as evidence (query and hash are dropped; they can carry tokens).
    ${
      spec.showUrl === false
        ? ''
        : `const urlBar = document.createElement('div');
    urlBar.style.cssText = 'background:#f1f3f4;border-bottom:1px solid #dadce0;padding:10px 24px;';
    const pill = document.createElement('div');
    pill.style.cssText = 'background:#fff;border-radius:999px;padding:7px 18px;font:500 18px/1.3 -apple-system,"Segoe UI",Roboto,sans-serif;color:#3c4043;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;';
    pill.textContent = ${JSON.stringify((spec.baseUrl + s.url).replace(/[?#].*$/, ''))};
    urlBar.append(pill);
    o.append(urlBar);`
    }
    // The wrapper crops the raw to clip.height, so --caption-only can trim without an image tool.
    const crop = document.createElement('div');
    crop.style.cssText = 'position:relative;width:${width}px;height:${s.clip.height}px;overflow:hidden;';
    const img = document.createElement('img');
    img.src = ${JSON.stringify(dataUrl)};
    img.style.cssText = 'display:block;width:${width}px;';
    crop.append(img);
    const steps = ${JSON.stringify(s.steps || [])};
    steps.forEach((step, index) => {
      const marker = document.createElement('span');
      marker.style.cssText = 'position:absolute;display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:2px solid white;border-radius:50%;background:#b42318;color:white;font:600 14px/1 system-ui,sans-serif;box-sizing:border-box;';
      marker.style.left = (step.x - 12) + 'px';
      marker.style.top = (step.y - 12) + 'px';
      marker.textContent = String(index + 1);
      crop.append(marker);
    });
    const bar = document.createElement('div');
    bar.style.cssText = 'border-top:3px solid #0d7385;padding:18px 24px 20px;color:#1f1f1f;white-space:pre-wrap;overflow-wrap:anywhere;';
    bar.style.font = ${JSON.stringify(`400 18px/1.4 ${font}`)};
    const caption = ${JSON.stringify(s.caption)};
    if (Array.isArray(caption)) {
      for (const part of caption) {
        const styles = new Map([['bold', 'strong'], ['italic', 'em'], ['underline', 'u'], ['strikethrough', 's'], ['code', 'code'], ['subscript', 'sub'], ['superscript', 'sup']]);
        const tag = styles.get(part.style) || 'span';
        const el = document.createElement(tag);
        el.textContent = part.text;
        bar.append(el);
      }
    } else if (caption && typeof caption === 'object') {
      const render = (node) => {
        if (node.type === 'text') {
          let result = document.createTextNode(node.text);
          for (const mark of node.marks || []) {
            const tags = { strong: 'strong', em: 'em', underline: 'u', strike: 's', code: 'code' };
            const wrapper = document.createElement(mark.type === 'subsup' ? mark.attrs.type : tags[mark.type]);
            wrapper.append(result);
            result = wrapper;
          }
          return result;
        }
        const tags = { doc: 'div', paragraph: 'div', heading: 'div', bulletList: 'ul', orderedList: 'ol', listItem: 'li', hardBreak: 'br' };
        const el = document.createElement(tags[node.type]);
        if (node.type === 'heading') el.style.fontWeight = '600';
        if (node.type === 'orderedList' && node.attrs?.order != null) el.start = node.attrs.order;
        if (node.type === 'bulletList' || node.type === 'orderedList') el.style.cssText = 'margin:0;padding-left:1.5em;';
        for (const child of node.content || []) el.append(render(child));
        return el;
      };
      bar.append(render(caption));
    } else {
      bar.textContent = caption;
    }
    if (steps.length) {
      const list = document.createElement('ol');
      list.style.cssText = 'margin:4px 0 0;padding-left:1.5em;';
      for (const step of steps) {
        const item = document.createElement('li');
        item.textContent = step.text;
        list.append(item);
      }
      bar.append(list);
    }
    o.append(crop, bar);
    document.body.append(o);
    await img.decode();
    await document.fonts.ready;
    return Math.ceil(o.getBoundingClientRect().height);
  })()`);
  if (s === rawShots[0]) {
    const faces = await evaluate(`[...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight)`);
    console.log('loaded fonts:', JSON.stringify(faces));
  }
  if (height > vp.height) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: height + 20,
      deviceScaleFactor: scale,
      mobile: false,
    });
    await sleep(300);
  }
  const buf = await png({ x: 0, y: 0, width, height });
  writeFileSync(join(dir, 'out', s.outName), buf);
  console.log(`ok ${s.outName}`);
}
await send('Browser.close').catch(() => {});
cleanup();
if (!flags.includes('--keep-profile')) {
  // Wait for Chrome to release the profile (Windows keeps files locked), then drop the cookies.
  await Promise.race([chromeExit, sleep(5000)]);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}
if (revealFlag) reveal(join(dir, 'out'));
process.stdout.write(`${join(dir, 'out')}\n`);
process.exit(0);
