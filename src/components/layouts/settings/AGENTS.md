# AGENTS.md

**Scope:** Settings dialog UI component

## OVERVIEW

Standalone settings dialog for userscript configuration. Handles both CloudStorage (bgm.tv) and standalone (localStorage) modes.

## STRUCTURE

```
settings/
├── index.ts          # Main dialog: createSettingMenu()
├── header.ts         # Dialog header component
└── styles.css        # Scoped dialog styles (imported as string)
```

## KEY FUNCTIONS

| Function                        | Purpose                        | Line     |
| ------------------------------- | ------------------------------ | -------- |
| `createSettingMenu()`           | Main entry, initializes dialog | 21       |
| `createSettingsDialog()`        | Builds DOM, returns elements   | 28       |
| `initSettings()`                | Refreshes UI from Storage      | 181      |
| `saveSettings()`                | Validates & saves to Storage   | 225      |
| `showDialog()` / `hideDialog()` | Visibility control             | 269, 276 |

## UI ELEMENTS

Created via vanilla DOM APIs (not jQuery for dialog internals):

- `dropdown` - Sort method selector (4 options)
- `minEffInput` - Minimum featured comment length
- `maxPostsInput` - Maximum featured comments
- `CustomCheckboxContainer` instances:
  - `hidePlainCommentsCheckboxContainer`
  - `pinMyCommentsCheckboxContainer`
  - `hidePrematureCommentsCheckboxContainer` (episode only)

## CLOUDSTORAGE MODE

When running on bgm.tv:

- Settings also sync to `chiiLib.ukagaka` panel
- Only radio-type configs supported in chiiLib
- Numeric inputs disabled/readonly

```typescript
// Check mode
if (isCloudStorageEnvironment()) {
  // Disable numeric inputs
}
```

## EVENTS

Dispatches on save:

```typescript
const event = new CustomEvent('settingsSaved')
document.dispatchEvent(event)
// Triggers page reload in main.ts
```

## ANTI-PATTERNS

- **Never** skip `initSettings()` on dialog open → Must sync from Storage
- **Never** use jQuery for dialog DOM → Use vanilla APIs
- **Never** access localStorage directly → Always use `Storage` class

## INTEGRATION

Exposed via global:

```typescript
window.BCE!.settingsDialog = {
  show: () => showDialog(elements.container, elements),
  hide: () => hideDialog(elements.container),
  save: () => saveSettings(elements),
  getElements: () => elements,
}
```

Called from `main.ts`:

```typescript
settingBtn.on('click', () => window.BCE!.settingsDialog!.show())
```
