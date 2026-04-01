# AGENTS.md

**Generated:** 2025-04-01
**Project:** bangumi-episode-enhance-userscript

## OVERVIEW

A userscript for Bangumi (bgm.tv) that enhances episode and group topic pages with comment management features: auto-collapsing sub-replies, sorting by reactions/replies/time, and hiding pre-broadcast comments.

**Stack:** TypeScript, Rollup, jQuery, ESLint (@antfu), Pre-commit hooks

## STRUCTURE

```
.
├── src/
│   ├── main.ts              # Entry: init, styles, comment processing
│   ├── modules/
│   │   └── comments.ts      # Comment parsing & categorization
│   ├── components/layouts/settings/  # Settings dialog UI
│   ├── storage/             # Hybrid storage (Cloud + local)
│   ├── utils/               # Environment detection
│   ├── types/               # TypeScript definitions
│   ├── constants/           # Regex patterns
│   ├── classes/             # CustomCheckboxContainer
│   └── static/              # CSS, SVG, JS assets
├── scripts/                 # bump-version.js
└── .github/workflows/       # Build & deploy
```

## WHERE TO LOOK

| Task                | Location                                            | Notes                          |
| ------------------- | --------------------------------------------------- | ------------------------------ |
| Add comment feature | `src/modules/comments.ts`                           | Featured/plain categorization  |
| Add setting         | `src/components/layouts/settings/` + `src/storage/` | Handle both Cloud & standalone |
| New type            | `src/types/index.ts`                                | Export from index              |
| Storage change      | `src/storage/index.ts`                              | Always use Storage class       |
| Environment check   | `src/utils/environment.ts`                          | isCloudStorageEnvironment()    |

## CODE MAP

| Symbol                    | Type      | Location                     | Role                    |
| ------------------------- | --------- | ---------------------------- | ----------------------- |
| `processComments`         | Function  | modules/comments.ts          | Parses DOM, categorizes |
| `Storage`                 | Class     | storage/index.ts             | Hybrid storage manager  |
| `createSettingMenu`       | Function  | components/layouts/settings/ | Settings dialog         |
| `quickSort`               | Function  | utils/index.ts               | Comment sorting         |
| `CustomCheckboxContainer` | Class     | classes/checkbox.ts          | UI checkbox component   |
| `UserSettings`            | Interface | types/index.ts               | Config schema           |
| `CommentElement`          | Interface | types/index.ts               | Comment metadata        |

## CONVENTIONS

### TypeScript

- **Target:** ES2022, strict mode
- **Type-only imports:** `import type { Foo }`
- **Explicit types:** Required on params/returns

### Naming

- `camelCase` for vars/functions
- `PascalCase` for classes/types
- `UPPER_SNAKE_CASE` for constants
- No underscore prefix; use `private` keyword

### Formatting

- Single quotes, no semicolons
- 2 spaces, Unix endings
- Trailing commas in multiline

### Imports

Group order: 1) type imports, 2) third-party, 3) local modules
Import from index files: `from './types/index'`

## ANTI-PATTERNS (THIS PROJECT)

- **Never** access `localStorage` directly → Use `Storage` class
- **Never** use checkboxes in CloudStorage → Convert to `on`/`off` radio
- **Never** assume chiiLib exists → Check `hasChiiLib()` first
- **Never** import jQuery → It's global on Bangumi pages
- **Never** leave `console.log` in production → Stripped by Rollup

## COMMANDS

```bash
pnpm dev        # Development (watch, keeps console.log)
pnpm build      # Production (strips logs, outputs dist/)
pnpm lint       # ESLint --fix
pnpm format     # Prettier --write
pnpm cm         # Version bump, commit, tag, push
pnpm lint-staged # Pre-commit hooks
```

**No test suite available.**

## UNIQUE STYLES

### DOM Manipulation

- jQuery available globally (no import needed)
- Type jQuery elements: `JQuery<HTMLElement>`
- CSS imported as strings, injected at runtime

### Storage Pattern

```typescript
// Always use Storage class
Storage.set('key', value)
const val = Storage.get('key')

// Never do this:
localStorage.setItem('key', value) // ❌
```

### CloudStorage Constraints

```typescript
// Only radio type configs work in chiiLib.ukagaka
// Convert booleans: { on: 'true', off: 'false' }
// Numeric inputs only in standalone mode
```

### Error Handling

```typescript
try {
  // CloudStorage operation
} catch (e) {
  console.warn(`[BCE] Failed:`, e)
  // localStorage fallback automatic
}
```

## DEPLOYMENT

- GitHub Actions builds on push to `main`
- Output: `https://flynncao.github.io/.../index.user.js`
- Git tags trigger GitHub Releases

## Code Style Guidelines

### TypeScript

- **Target:** ES2022 with strict mode enabled
- **Types:** Always use explicit types on function parameters and returns
- **Type-only imports:** Use `import type { Foo }` for type imports
- **No implicit any:** All variables must have explicit types

### Imports

- Group imports: 1) type imports, 2) third-party, 3) local modules
- Use single quotes for imports
- Import from index files: `from './types/index'` not `from './types'`

### Naming Conventions

- **Variables/functions:** camelCase (`featuredCommentsCount`, `quickSort`)
- **Classes:** PascalCase (`CustomCheckboxContainer`, `Storage`)
- **Types/Interfaces:** PascalCase (`UserSettings`, `CommentElement`)
- **Constants:** UPPER_SNAKE_CASE for true constants (`BGM_EP_REGEX`)
- **Private members:** No underscore prefix, use TypeScript `private` keyword
- **Global objects:** Use window prefix (`window.BCE`)

### Formatting

- **Quotes:** Single quotes for strings
- **Semicolons:** No semicolons (enforced by ESLint)
- **Indent:** 2 spaces
- **Line endings:** Unix style
- **Trailing commas:** Use trailing commas in multiline objects/arrays

### ESLint Rules (@antfu/eslint-config)

Key disabled rules:

- `no-console` - Console statements allowed (stripped in production)
- `no-unused-vars` - Unused variables allowed (use caution)
- `ts/ban-ts-comment` - @ts-ignore comments allowed
- `ts/no-use-before-define` - Warn only

### Error Handling

- Use try-catch for CloudStorage operations (may be unavailable)
- Log warnings with `[BCE]` prefix for debugging
- Always provide localStorage fallback for cloud operations

### DOM Manipulation

- Use jQuery (available globally on Bangumi pages)
- Type jQuery elements: `JQuery<HTMLElement>`
- Create elements via jQuery or vanilla DOM APIs
- Use non-null assertions (`!`) sparingly and only when certain

### CloudStorage Constraints

- Only `radio` type configs supported by chiiLib.ukagaka
- Convert booleans to `on`/`off` radio options
- Numeric inputs only available in standalone mode

### Environment Detection

- Use `utils/environment.ts` helpers: `isCloudStorageEnvironment()`, `hasChiiLib()`
- Check both environment type AND availability before using CloudStorage

## File Organization

```
src/
  main.ts                    # Entry point
  modules/                   # Core logic
  components/layouts/        # UI components
  storage/                   # Storage abstraction
  utils/                     # Utilities
  types/                     # TypeScript definitions
  constants/                 # Constants
  classes/                   # Class definitions
  static/                    # CSS, JS, SVG assets
```

## Deployment

- GitHub Actions builds on every push to `main`
- Output: `https://flynncao.github.io/bangumi-episode-enhance-userscript/index.user.js`
- Git tags trigger GitHub Releases

## Key Conventions

1. **Storage:** Always use `Storage` class, never access localStorage directly
2. **Settings:** New settings must handle both CloudStorage (radio only) and standalone modes
3. **jQuery:** Available globally - no import needed
4. **CSS:** Import as strings and inject into page at runtime
5. **Logging:** Use console.log for debugging (stripped in production)
