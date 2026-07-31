# CloudStorage Integration Guide

This document explains how the Bangumi Comment Enhance (BCE) integrates with bgm.tv's CloudStorage system while maintaining full standalone functionality.

## Architecture Overview

The implementation uses a **hybrid approach** that works in both environments:

1. **CloudStorage Environment** (bgm.tv): Uses `chiiApp.cloud_settings` and `chiiLib.ukagaka`
2. **Standalone Environment**: Uses localStorage and custom settings UI

## Key Components

### 1. Type Definitions ([src/types/chii.d.ts](src/types/chii.d.ts))

Defines TypeScript interfaces for the bgm.tv CloudStorage API:

- `ChiiApp`: Main CloudStorage interface with `cloud_settings`
- `ChiiLib`: Ukagaka settings panel integration
- `CloudSettings`: Settings storage with `get()`, `getAll()`, `update()`
- `Ukagaka`: Settings panel with `addGeneralConfig()`, `onOpen()`, `onClose()`

### 2. Environment Detection ([src/utils/environment.ts](src/utils/environment.ts))

Utilities to detect the current runtime environment:

```typescript
// Check if running in CloudStorage environment
isCloudStorageEnvironment(): boolean

// Check if chiiLib is available
hasChiiLib(): boolean

// Get current environment
getEnvironment(): Environment
```

### 3. Hybrid Storage Adapter ([src/storage/index.ts](src/storage/index.ts))

The `Storage` class automatically switches between CloudStorage and localStorage:

- **In CloudStorage**: Uses `chiiApp.cloud_settings`
- **Fallback**: Uses localStorage with namespace `BangumiCommentEnhance_`
- **Sync**: Maintains both storage systems for reliability

```typescript
// Automatically selects the right storage
Storage.set('key', value)
Storage.get('key')

// Check current environment
Storage.isCloudEnvironment()
Storage.hasChiiLib()
```

### 4. CloudSettings Integration ([src/storage/cloudSettings.ts](src/storage/cloudSettings.ts))

Handles integration with `chiiLib.ukagaka` settings panel:

- **`initCloudSettings()`**: Registers settings with the bgm.tv settings panel
- **`syncFromCloud()`**: Pulls settings from CloudStorage on startup
- **Auto-sync**: Automatically syncs when settings panel closes

## Usage

### Local Development

```bash
# Install dependencies
pnpm install

# Development build with watch mode
pnpm dev

# Production build
pnpm build
```

The built script works in both environments automatically.

### Deployment to bgm.tv

1. Build the production version:

   ```bash
   pnpm build
   ```

2. Copy `dist/index.user.js` to the bgm.tv component system

3. The script will:
   - Detect CloudStorage availability
   - Register settings with `chiiLib.ukagaka`
   - Sync settings across devices
   - Fall back to localStorage if CloudStorage is unavailable

### Standalone Usage

As a userscript, the script will:

- Use localStorage for settings
- Show custom settings dialog (gear icon)
- Work without any CloudStorage dependencies

## Settings Configuration

Settings are automatically registered with both systems:

| Setting                        | Type     | Default         | Description                |
| ------------------------------ | -------- | --------------- | -------------------------- |
| `sortMode`                     | radio    | `reactionCount` | Comment sorting method     |
| `hidePlainComments`            | checkbox | `true`          | Hide non-featured comments |
| `stickyMentioned`              | checkbox | `false`         | Pin user's comments        |
| `hidePremature`                | checkbox | `false`         | Hide pre-airing comments   |
| `minimumFeaturedCommentLength` | number   | `15`            | Minimum comment length     |
| `maxFeaturedComments`          | number   | `99`            | Maximum featured comments  |

## API Reference

### Storage Class

```typescript
// Set a value (auto-detects storage type)
Storage.set(key: string, value: any): void

// Get a value (tries CloudStorage, falls back to localStorage)
Storage.get(key: string): any

// Initialize with defaults
Storage.init(settings: Record<string, any>): Promise<void>

// Check environment
Storage.isCloudEnvironment(): boolean
Storage.hasChiiLib(): boolean
```

### CloudSettings Functions

```typescript
// Initialize CloudStorage settings (returns true if successful)
initCloudSettings(userSettings: UserSettings, episodeMode: boolean): boolean

// Sync settings from CloudStorage to local
syncFromCloud(userSettings: UserSettings): void
```

## Environment Variables

The build system respects:

- `BUILD=production`: Strips `console.log` statements
- `BUILD=development`: Keeps all debug output

## Troubleshooting

### TypeScript/Compiler Errors

If you see errors about `chiiApp` or `chiiLib` not being defined:

1. Ensure [src/types/chii.d.ts](src/types/chii.d.ts) is in your project
2. The types use `declare global` to make globals available
3. Build with `pnpm build` or `pnpm dev`

### CloudStorage Not Working

Check browser console for warnings:

```
[BCE] chiiLib.ukagaka not available - using standalone settings panel
```

This is expected in standalone mode.

### Settings Not Syncing

1. Check if `chiiApp.cloud_settings` is available
2. Verify settings are being saved: Look for `[BCE] Settings changed, syncing to cloud`
3. Check network requests in browser DevTools

## File Structure

```
src/
├── types/
│   ├── chii.d.ts              # CloudStorage API definitions
│   └── index.ts               # Project types
├── utils/
│   └── environment.ts         # Environment detection
├── storage/
│   ├── index.ts               # Hybrid storage adapter
│   └── cloudSettings.ts       # CloudStorage integration
└── main.ts                    # Entry point with integration
```

## Benefits of This Approach

1. **Maximum Compatibility**: Works in both CloudStorage and standalone
2. **Automatic Fallback**: Gracefully degrades if CloudStorage unavailable
3. **Type Safety**: Full TypeScript support for CloudStorage APIs
4. **Zero Configuration**: Automatically detects environment
5. **Settings Sync**: CloudStorage users get cross-device sync
6. **Development Friendly**: Test locally without CloudStorage

## Example: Adding a New Setting

```typescript
// 1. Add to UserSettings type
export interface UserSettings {
  // ... existing settings
  myNewSetting: boolean
}

// 2. Initialize in main.ts
Storage.init({
  // ... existing defaults
  myNewSetting: false,
})

// 3. Get value
const mySetting = Storage.get('myNewSetting')

// 4. CloudSettings will auto-register (no changes needed!)
// The cloudSettings.ts module handles it automatically
```

## License

ISC
