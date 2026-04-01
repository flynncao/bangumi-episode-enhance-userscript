# AGENTS.md

**Scope:** TypeScript type definitions

## OVERVIEW

Central type registry for the Bangumi Comment Enhance userscript. All interfaces, types, and global declarations live here.

## STRUCTURE

```
types/
├── index.ts          # Main exports: UserSettings, CommentElement, etc.
├── chii.d.ts         # Bangumi.tv global types (chiiApp, chiiLib)
└── typing.d.ts       # Module declarations for CSS/JSON imports
```

## KEY TYPES

| Type                         | Purpose                                                            | Used In              |
| ---------------------------- | ------------------------------------------------------------------ | -------------------- |
| `UserSettings`               | Configuration schema                                               | Storage, Settings UI |
| `CommentElement`             | Processed comment metadata                                         | comments.ts          |
| `CommentElement['sortMode']` | Union: 'reactionCount' \| 'replyCount' \| 'oldFirst' \| 'newFirst' | Sorting logic        |
| `BCE`                        | Global window.BCE interface                                        | main.ts, settings    |
| `StorageManager`             | Storage interface                                                  | storage/index.ts     |
| `SettingsElements`           | UI element refs                                                    | settings dialog      |

## CONVENTIONS

### Interface Naming

- Data structures → `CommentElement`, `UserSettings`
- Manager classes → `StorageManager`
- UI refs → `SettingsElements`

### Global Declarations

```typescript
// Extend Window interface
declare global {
  interface Window {
    BCE: BCE
  }
}
```

### Exports

```typescript
// Type-only export
export type { BCE, CommentElement, UserSettings }

// Interface export
export interface SettingsElements { ... }
```

## ANTI-PATTERNS

- **Never** import from './types' → Use './types/index'
- **Never** put runtime code here → Types only
- **Never** duplicate type definitions → Centralize here

## WHERE TO ADD

| Need              | Add To                               |
| ----------------- | ------------------------------------ |
| New setting field | `UserSettings` interface             |
| New comment prop  | `CommentElement` interface           |
| New global        | `BCE` interface + `Window` extension |
| Bangumi API types | `chii.d.ts`                          |
