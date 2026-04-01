# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a userscript for Bangumi (bgm.tv) that enhances episode and group topic pages with comment management features like auto-collapsing sub-replies, sorting comments by reactions/replies/time, and hiding comments posted before broadcast date.

## Project Structure

```
src/
├── main.ts                    # Entry point: initializes script, processes comments, sets up UI
├── metadata.json              # Userscript metadata (version, match patterns, updateURL)
├── constants/                 # URL regex patterns and constants
│   └── index.ts               # BGM_EP_REGEX, BGM_GROUP_REGEX
├── modules/                   # Core feature modules
│   └── comments.ts            # Parses DOM, categorizes comments, calculates scores
├── storage/                   # Data persistence layer
│   ├── index.ts               # Hybrid Storage (CloudStorage → localStorage fallback)
│   └── cloudSettings.ts       # chiiLib.ukagaka integration (radio-only configs)
├── components/layouts/settings/  # Settings UI
│   ├── index.ts               # Settings dialog creation and event handling
│   ├── header.ts              # Noname header component for settings dialog
│   └── styles.css             # Dialog-specific styles
├── classes/                   # Reusable UI components
│   └── checkbox.ts            # CustomCheckboxContainer for settings checkboxes
├── utils/                     # Utility functions
│   ├── index.ts               # quickSort, defaultSort, purifiedDatetimeInMillionSeconds
│   └── environment.ts         # Environment detection (CloudStorage vs standalone)
├── types/                     # TypeScript definitions
│   ├── index.ts               # UserSettings, CommentElement, BCE interfaces
│   ├── chii.d.ts              # bgm.tv CloudStorage/chiiLib type declarations
│   └── typing.d.ts            # Additional type declarations
└── static/                    # Static assets
    ├── css/
    │   ├── styles.css         # Main stylesheet injected into page
    │   └── butterup.css       # Toast notification styles
    ├── js/
    │   └── butterup.ts        # Toast notification library (vanilla JS)
    └── svg/
        └── index.ts           # SVG icons for UI elements
```

## Build Commands

```bash
# Development (watch mode, keeps console.log)
pnpm dev

# Production build (strips console.log, outputs to dist/index.user.js)
pnpm build

# Lint with auto-fix
pnpm lint

# Format with Prettier
pnpm format

# Version bump: increments patch version, commits, tags, and pushes
pnpm cm
```

## Architecture

### Entry Point

- `src/main.ts` - Initializes the userscript, injects styles, processes comments, and sets up the settings UI

### Core Modules

**Comment Processing (`src/modules/comments.ts`)**

- Parses all comments from the page DOM
- Categorizes comments as "featured" (high engagement) or "plain" (low engagement)
- Calculates comment scores based on reaction counts and mentions
- Identifies comments posted before broadcast date (episode pages only)
- Collapses sub-replies and adds expand buttons

**Storage (`src/storage/`)**

- `index.ts` - Hybrid storage class that uses CloudStorage (`chiiApp.cloud_settings`) when available on bgm.tv, otherwise falls back to localStorage
- `cloudSettings.ts` - Integrates with bgm.tv's chiiLib.ukagaka settings panel; only radio-type configs are supported by chiiLib

**Settings UI (`src/components/layouts/settings/index.ts`)**

- Creates a standalone settings dialog using vanilla DOM APIs
- Automatically syncs with Storage class values when opened
- Dispatches `settingsSaved` event on save (triggers page reload)

**Environment Detection (`src/utils/environment.ts`)**

- Detects if running in bgm.tv CloudStorage environment vs standalone
- Provides access to jQuery (available globally on Bangumi pages)

### Key Types (`src/types/index.ts`)

- `UserSettings` - Configuration options (sortMode, hidePlainComments, etc.)
- `CommentElement` - Processed comment with metadata (score, replyCount, timestamp)
- `BCE` - Global window object exposing settingsDialog API

### Build System

- Rollup bundles TypeScript, CSS imports, and userscript metadata
- `src/metadata.json` - Userscript metadata (name, version, match patterns, updateURL)
- CSS files are imported as strings and injected into the page at runtime
- Production builds strip `console.log` calls via `@rollup/plugin-strip`

## Environment Integration

The script runs in two modes:

1. **Standalone** - Uses localStorage, shows custom settings dialog via gear icon
2. **bgm.tv CloudStorage** - Integrates with `chiiLib.ukagaka` settings panel, syncs to `chiiApp.cloud_settings`

When adding new settings:

- CloudStorage only supports `radio` type configs (no checkboxes, no number inputs)
- Boolean settings must be converted to `on`/`off` radio options for CloudStorage
- Numeric settings (min length, max comments) are only available in standalone mode

## Deployment

- GitHub Actions builds and deploys to GitHub Pages on every push to `main`
- Output URL: `https://flynncao.github.io/bangumi-episode-enhance-userscript/index.user.js`
- Creating a git tag triggers a GitHub Release with the built file as artifact

## Module Dependencies

Data flow through the application:

1. **main.ts** reads `location.href` → applies regex from **constants/** → initializes **Storage** with defaults
2. **Storage** detects environment via **utils/environment.ts** → syncs from CloudStorage if available
3. **processComments** (from **modules/comments.ts**) parses DOM → returns categorized comments with scores
4. **quickSort** (from **utils/index.ts**) sorts featured comments by selected criteria
5. Settings changes → **storage/cloudSettings.ts** updates CloudStorage OR **components/layouts/settings/** updates localStorage
6. `settingsSaved` event triggers page reload to re-process comments with new settings

Key constraint: **chiiLib.ukagaka only supports `radio` type configs**. Boolean/numeric settings must either:

- Be converted to radio options (on/off) for CloudStorage compatibility
- Remain standalone-only (accessible only via the custom settings dialog)

## Code Style

- ESLint with @antfu/eslint-config
- Pre-commit hooks run linting and formatting
- TypeScript strict mode enabled
