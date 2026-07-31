@AGENTS.md

This repository uses [AGENTS.md](./AGENTS.md) as the canonical instruction file for Claude Code, Codex, `cc`, and other agent tools.

## Read First

Claude Code should read and follow:

1. [AGENTS.md](./AGENTS.md)
2. any narrower `AGENTS.md` in the subtree being edited
3. `.claude/RULES/SECURITY.md` if it later gains content

## Claude Code Notes

- Do not maintain a separate copy of repo policy here unless it is truly Claude-specific
- Preserve repo commands, git-hook behavior, and operational constraints documented in `AGENTS.md`
- In this checkout, `.claude/RULES/SECURITY.md` exists but is empty
- In this checkout, there is no `.claude/settings.local.json`
- In this checkout, there are no `.claude/hooks/*` files

If Claude-specific hooks, permissions, or local settings are added later, keep them Claude-specific here or under `.claude/`, and mirror the tool-agnostic constraint in `AGENTS.md`.
