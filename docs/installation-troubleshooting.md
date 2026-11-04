# Troubleshoot skill installation

If `npx skills add` reports `EACCES`, `permission denied`, or access denied, read the path in the error first. The installer may be unable to replace a previously installed file. Multiple agent failures can refer to the same shared file.

Check ownership and permissions on the **containing directory** as well as the file. Run the checks on the machine and account where installation failed. The examples below use `design-system-ai-agent`; replace it with the skill in the error. The actual install path may differ, so use the path reported by the installer. Treat files or links outside your personal directory and organization-managed paths as administrator-managed.

## macOS and Linux

In Terminal, inspect the account and the skill directory:

```sh
whoami
ls -ld "$HOME/.agents" "$HOME/.agents/skills" "$HOME/.agents/skills/design-system-ai-agent"
ls -l "$HOME/.agents/skills/design-system-ai-agent/SKILL.md"
```

On macOS, add `ls -ldeO` for those paths to inspect ACLs and flags. On Linux, use `getfacl <path>` if available. Inspect symbolic links before changing permissions; they may point outside the skill directory.

If the affected directory is owned by `root` because a personal install previously ran with `sudo`, restore ownership **only after verifying the path and its contents**:

```sh
sudo chown -R "$(id -un)":"$(id -gn)" "$HOME/.agents/skills/design-system-ai-agent"
```

If a parent directory has the wrong ownership, or ACLs, flags, a read-only filesystem, or an organization policy block access, resolve that specific cause with the machine administrator. Do not recursively change the entire home directory or `.agents` tree. Do not run the installer with `sudo` as a workaround.

## Windows

In PowerShell, inspect the current account and the affected path:

```powershell
whoami
$skillDir = Join-Path $HOME '.agents\skills\design-system-ai-agent'
Get-Item -Force $skillDir, (Join-Path $skillDir 'SKILL.md') | Format-List FullName, Attributes, LinkType, Target
Get-Acl $skillDir | Format-List Owner, Access
icacls $skillDir
```

Also inspect the parent directories with `Get-Acl`. If the path is managed by your organization or points elsewhere through a link, ask the administrator to review access. For a personal folder, use **Properties → Security → Advanced** to inspect ownership and permissions before changing only the affected folder. Do not reset permissions recursively on the whole profile or run the installer as Administrator as a routine workaround.

## Retry

After correcting the verified cause, rerun the original install command as the same regular user:

```sh
npx skills add https://github.com/Sh0ckWaveZero/ai-agent-skills.git
```

If it still fails, capture the exact error, affected path, ownership and permissions, and OS. Paths and logs can contain user names or other sensitive information; remove them before sharing. Restart the agent session after installation succeeds.
