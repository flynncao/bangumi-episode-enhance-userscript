# AGENTS.md

**Updated:** 2026-04-25  
**Project:** bangumi-episode-enhance-userscript  
**Applies to:** Codex, Claude Code, `cc`, and other agent tools working in this repository

## Canonical Instruction File

This is the canonical repo-level instruction file for agent tools.

- `AGENTS.md` is the shared source of truth for repo guidance
- `CLAUDE.md` should only act as a Claude Code entrypoint that points back here
- More specific nested instruction files take precedence when working in their subtree:
  - `src/components/layouts/settings/AGENTS.md`
  - `src/types/AGENTS.md`

## Overview

A userscript for Bangumi (`bgm.tv`) that enhances episode and group topic pages with comment management features:

- auto-collapsing sub-replies
- sorting by reactions, replies, or time
- hiding comments posted before broadcast date

**Stack:** TypeScript, Rollup, jQuery, ESLint (`@antfu`), Prettier, `simple-git-hooks`, `lint-staged`

## Project Structure

```text
.
├── src/
│   ├── main.ts                    # Entry point: init, styles, comment processing, UI setup
│   ├── metadata.json              # Userscript metadata
│   ├── modules/
│   │   └── comments.ts            # Comment parsing, scoring, categorization
│   ├── components/layouts/settings/
│   │   ├── index.ts               # Settings dialog creation and save flow
│   │   ├── header.ts              # Dialog header
│   │   └── styles.css             # Scoped dialog styles
│   ├── storage/
│   │   ├── index.ts               # Hybrid Storage manager
│   │   └── cloudSettings.ts       # chiiLib.ukagaka integration
│   ├── utils/
│   │   ├── index.ts               # quickSort and utility helpers
│   │   └── environment.ts         # Environment detection helpers
│   ├── types/
│   │   ├── index.ts               # Main shared types
│   │   ├── chii.d.ts              # Bangumi global declarations
│   │   └── typing.d.ts            # CSS/JSON module declarations
│   ├── constants/                 # URL regex patterns and constants
│   ├── classes/                   # Reusable UI classes
│   └── static/                    # CSS, JS, SVG assets
├── scripts/
│   └── bump-version.js            # Version bump workflow
├── .claude/
│   ├── RULES/
│   │   └── SECURITY.md            # Present but currently empty
│   └── skills/                    # Claude-local skills
└── .github/workflows/             # Build and deploy
```

## Where To Look

| Task                    | Location                                            | Notes                                               |
| ----------------------- | --------------------------------------------------- | --------------------------------------------------- |
| Add comment feature     | `src/modules/comments.ts`                           | Featured/plain categorization lives here            |
| Add setting             | `src/components/layouts/settings/` + `src/storage/` | Must work in both CloudStorage and standalone modes |
| Storage change          | `src/storage/index.ts`                              | Always go through `Storage`                         |
| Cloud settings behavior | `src/storage/cloudSettings.ts`                      | `chiiLib.ukagaka` integration details               |
| Environment check       | `src/utils/environment.ts`                          | `isCloudStorageEnvironment()` and `hasChiiLib()`    |
| Add shared type         | `src/types/index.ts`                                | Export new types from here                          |
| Main integration flow   | `src/main.ts`                                       | Script bootstrap and page wiring                    |

## Architecture

### Entry Point

- `src/main.ts` initializes the userscript
- injects CSS imported as strings
- reads settings from `Storage`
- processes page comments
- wires settings UI and notifications

### Core Flow

1. `main.ts` reads `location.href`
2. regexes from `src/constants/` determine supported Bangumi page type
3. `Storage` loads config from CloudStorage or local fallback
4. `processComments()` parses DOM comments and computes metadata
5. `quickSort()` orders featured comments using the selected mode
6. settings changes persist through `Storage` and trigger reprocessing on reload

### Important Symbols

| Symbol                    | Type      | Location                           | Role                                |
| ------------------------- | --------- | ---------------------------------- | ----------------------------------- |
| `processComments`         | function  | `src/modules/comments.ts`          | Parses DOM and categorizes comments |
| `Storage`                 | class     | `src/storage/index.ts`             | Hybrid storage manager              |
| `createSettingMenu`       | function  | `src/components/layouts/settings/` | Settings dialog UI                  |
| `quickSort`               | function  | `src/utils/index.ts`               | Comment sorting                     |
| `CustomCheckboxContainer` | class     | `src/classes/checkbox.ts`          | Checkbox UI wrapper                 |
| `UserSettings`            | interface | `src/types/index.ts`               | Config schema                       |
| `CommentElement`          | interface | `src/types/index.ts`               | Comment metadata                    |
| `BCE`                     | interface | `src/types/index.ts`               | Global `window.BCE` surface         |

## Environment Modes

The script runs in two modes:

1. **Standalone mode**
   - Uses local storage through the `Storage` abstraction
   - Shows the custom settings dialog
2. **Bangumi CloudStorage mode**
   - Integrates with `chiiLib.ukagaka`
   - Syncs settings to `chiiApp.cloud_settings`

### CloudStorage Constraints

- `chiiLib.ukagaka` only supports `radio` type configs
- boolean settings must be represented as `on` / `off`
- numeric inputs are standalone-only
- always check environment helpers before using CloudStorage APIs

## Conventions

### TypeScript

- Target ES2022 with strict mode
- Use `import type { Foo }` for type-only imports
- Use explicit parameter and return types
- Avoid implicit `any`

### Naming

- `camelCase` for variables and functions
- `PascalCase` for classes, interfaces, and types
- `UPPER_SNAKE_CASE` for constants
- Do not use underscore-prefixed private members; use `private`

### Formatting

- Single quotes
- No semicolons
- 2-space indentation
- Unix line endings
- Trailing commas in multiline literals

### Imports

Group imports in this order:

1. type imports
2. third-party imports
3. local imports

Prefer index exports such as `from './types/index'`.

## Repo-Specific Rules

- Never access `localStorage` directly; always use `Storage`
- Never assume `chiiLib` exists; check `hasChiiLib()` first
- Never import jQuery; it is available globally on Bangumi pages
- Never use checkbox-only config shapes for CloudStorage-backed settings
- Never put runtime code in `src/types/*`
- Never skip syncing settings UI from stored values before showing the dialog

## DOM And UI Notes

- jQuery is globally available on Bangumi pages
- Type jQuery handles as `JQuery<HTMLElement>`
- Dialog internals in `src/components/layouts/settings/` use vanilla DOM APIs
- CSS is imported as strings and injected at runtime
- Use non-null assertions sparingly

## Error Handling

- Wrap CloudStorage operations in `try/catch`
- Log warnings with a `[BCE]` prefix when needed
- Keep local fallback behavior intact if CloudStorage is unavailable

Example pattern:

```ts
try {
  // CloudStorage operation
} catch (error) {
  console.warn('[BCE] Failed:', error)
}
```

## Commands

```bash
pnpm dev                 # Rollup watch build, keeps console.log
pnpm build               # Production build, strips logs, outputs dist bundle
pnpm lint                # ESLint --fix
pnpm format              # Prettier --write
pnpm bump-version        # Dry-run version bump
pnpm bump-version:commit # Version bump with file changes
pnpm cm                  # Alias to dry-run bump command
pnpm cmc                 # Alias to commit bump command
pnpm lint-staged         # Run staged-file checks
```

There is currently **no dedicated test suite**.

## Hooks And Validation

This repo has real git-hook automation in `package.json`:

- `simple-git-hooks`
  - `pre-commit`: `npm run lint-staged`
- `lint-staged`
  - `*.{js,ts}` -> `npm run lint`
  - `*.{json,css,md}` -> `npm run format`

When an agent edits files, it should preserve this workflow and prefer running the relevant validation for touched files before wrapping up.

## Agent Tool Compatibility

For compatibility across Codex, Claude Code, `cc`, and similar tools:

- treat this `AGENTS.md` as the primary shared instruction file
- respect nested `AGENTS.md` files in narrower directories
- preserve existing repo automation, including `package.json` scripts and git hooks
- avoid destructive file or git operations unless explicitly requested
- prefer repo-native commands and existing abstractions over inventing new ones

### Claude Code Parity Notes

- `CLAUDE.md` should reference this file instead of duplicating repo policy
- `.claude/RULES/SECURITY.md` exists, but it is currently empty
- no `.claude/settings.local.json` or `.claude/hooks/*` files are present in this checkout, so there are no repo-local Claude permission or hook definitions to preserve verbatim

## Deployment

- GitHub Actions builds on push to `main`
- output userscript URL: `https://flynncao.github.io/bangumi-episode-enhance-userscript/index.user.js`
- git tags trigger GitHub Releases

## Quick Examples

### Storage

```ts
Storage.set('key', value)
const value = Storage.get('key')
```

Do not do this:

```ts
localStorage.setItem('key', value)
```

### Global Surface

```ts
window.BCE!.settingsDialog = {
  show: () => showDialog(elements.container, elements),
  hide: () => hideDialog(elements.container),
  save: () => saveSettings(elements),
}
```
