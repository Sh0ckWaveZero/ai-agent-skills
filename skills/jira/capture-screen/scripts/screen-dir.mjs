#!/usr/bin/env node
// Creates the capture directory and prints its absolute path.
// Usage: node screen-dir.mjs <ISSUE-KEY>
//
// The directory is always:
//   path.join(os.homedir(), '.agents', 'capture-screen', issueKey)
// macOS and Linux: $HOME/.agents/capture-screen/<ISSUE-KEY>/
// Windows:         %USERPROFILE%\.agents\capture-screen\<ISSUE-KEY>\
// Do not pass a path. Home directories can contain spaces, so quote this path.

import { chmodSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ISSUE_KEY = /^[A-Za-z][A-Za-z0-9]+-\d+$/;

export const screenDir = (issueKey) => {
  if (!ISSUE_KEY.test(issueKey ?? '')) {
    throw new Error(
      'Pass the issue key, for example PROJ-123. This script chooses the directory.',
    );
  }
  return join(homedir(), '.agents', 'capture-screen', issueKey);
};

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  const dir = screenDir(process.argv[2]);
  // Owner-only: the directory holds s.json (a login URL) and the Chrome profile.
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  chmodSync(dir, 0o700);
  process.stdout.write(`${dir}\n`);
}
