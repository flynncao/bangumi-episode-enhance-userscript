/**
 * CloudStorage settings integration
 * Handles integration with bgm.tv's chiiLib.ukagaka settings panel
 * NOTE: chiiLib.ukagaka ONLY supports 'radio' type configs!
 */

// @ts-nocheck - This file needs to match bgm.tv's exact JavaScript structure
import type { UserSettings } from '../types/index'
import { NAMESPACE } from '../constants/index'
import Storage from './index'

/**
 * Initialize CloudStorage settings integration
 * This function is safe to call in any environment - it will only register with chiiLib if available
 *
 * ONLY registers radio-compatible settings:
 * - sortMode (already radio)
 * - stickyMentioned (converted to on/off radio)
 * - hidePremature (converted to on/off radio, episode mode only)
 */
export function initCloudSettings(userSettings: UserSettings, episodeMode = false) {
  try {
    // Check if chiiLib is available
    if (typeof chiiLib === 'undefined' || !chiiLib.ukagaka) {
      console.log('[BCE] chiiLib.ukagaka not available - using standalone settings panel')
      return false
    }

    console.log('[BCE] Initializing CloudStorage settings integration (radio-only)')
    // Add Tab
    const tabApp = {
      tab: 'bangumi_comment_enhance',
      label: '评论区增强',
      type: 'options',
      config: [],
    }

    // Build configs array - ONLY radio-compatible settings
    const configs = []
    // 1. sortMode - already radio, no conversion needed
    configs.push({
      title: '排序方式',
      name: 'sortMode',
      type: 'radio',
      defaultValue: 'reactionCount',
      getCurrentValue() {
        return Storage.get('sortMode') || 'reactionCount'
      },
      onChange(value) {
        Storage.set('sortMode', value)
        userSettings.sortMode = value
      },
      options: [
        { value: 'reactionCount', label: '按热度(贴贴数)排序' },
        { value: 'newFirst', label: '按时间排序(最新在前)' },
        { value: 'oldFirst', label: '按时间排序(最旧在前)' },
        { value: 'replyCount', label: '按评论数排序' },
      ],
    })

    // 2. stickyMentioned - convert checkbox to on/off radio
    configs.push({
      title: '置顶我发表/回复我的帖子',
      name: 'stickyMentioned',
      type: 'radio',
      defaultValue: 'off',
      getCurrentValue() {
        return Storage.get('stickyMentioned')
      },
      onChange(value) {
        Storage.set('stickyMentioned', value)
      },
      options: [
        { value: 'on', label: '开启' },
        { value: 'off', label: '关闭' },
      ],
    })

    // 3. hidePremature - convert checkbox to on/off radio (only in episode mode)
    if (episodeMode) {
      configs.push({
        title: '隐藏开播前发表的评论',
        name: 'hidePremature',
        type: 'radio',
        defaultValue: 'off',
        getCurrentValue() {
          return Storage.get('hidePremature')
        },
        onChange(value) {
          Storage.set('hidePremature', value)
        },
        options: [
          { value: 'on', label: '开启' },
          { value: 'off', label: '关闭' },
        ],
      })
    }

    // 4. hidePlainComments
    configs.push({
      title: '隐藏普通评论',
      name: 'hidePlainComments',
      type: 'radio',
      defaultValue: 'off',
      getCurrentValue() {
        return Storage.get('hidePlainComments')
      },
      onChange(value) {
        Storage.set('hidePlainComments', value)
      },
      options: [
        { value: 'on', label: '开启' },
        { value: 'off', label: '关闭' },
      ],
    })

    // // Register all configs with chiiLib
    // configs.forEach((config) => {
    //   console.log(`[BCE] Registering ${config.type} config "${config.name}"`)
    //   chiiLib.ukagaka.addGeneralConfig(config)
    // })

    tabApp.config = configs

    console.log('[BCE] Registering settings tab with chiiLib.ukagaka')

    chiiLib.ukagaka.addPanelTab(tabApp)

    // Set up auto-sync on panel open/close
    setUpCloudLifeCycleHooks()
  }
  catch (error) {
    console.warn('[BCE] Failed to initialize CloudStorage settings:', error)
    return false
  }
}

function cookieKey(key: string): string {
  return `${NAMESPACE}_${key}`
}

/**
 * Set up auto-sync for settings when the customize panel is opened/closed
 */
function setUpCloudLifeCycleHooks(): void {
  try {
    if (typeof chiiLib === 'undefined' || !chiiLib.ukagaka) {
      return
    }

    chiiLib.ukagaka.onOpen(() => {
      console.log('[BCE] Customize panel opened')
    })

    chiiLib.ukagaka.onClose(() => {
      console.log('[BCE] Customize panel closed')
      // Check if settings changed and sync to cloud (convert back to booleans)
      const currentSettings = {
        sortMode: Storage.get('sortMode') || 'reactionCount',
        stickyMentioned: Storage.get('stickyMentioned'),
        hidePremature: Storage.get('hidePremature'),
        hidePlainComments: Storage.get('hidePlainComments'),
      }
      if (typeof chiiApp !== 'undefined' && chiiApp.cloud_settings) {
        chiiApp.cloud_settings.update(currentSettings)
      }
    })
  }
  catch (error) {
    console.warn('[BCE] Failed to setup auto-sync:', error)
  }
}

/**
 * Check if two config dictionaries are different
 */
function isDictDifferent(dict1: Record<string, any>, dict2: Record<string, any>): boolean {
  const keys1 = Object.keys(dict1)
  const keys2 = Object.keys(dict2)
  if (keys1.length !== keys2.length)
    return true
  for (const key of keys1) {
    if (dict1[key] !== dict2[key])
      return true
  }
  for (const key of keys2) {
    if (!(key in dict1))
      return true
  }
  return false
}

// /**
//  * Sync settings from CloudStorage to local storage
//  * Call this on script initialization to pull cloud settings
//  * Converts 'on'/'off' strings back to booleans
//  */
// export function syncFromCloud(userSettings: UserSettings): void {
//   try {
//     if (typeof chiiApp === 'undefined' || !chiiApp.cloud_settings) {
//       return
//     }

//     console.log('[BCE] Syncing settings from cloud')
//     const cloudSettings = chiiApp.cloud_settings.getAll()

//     console.log('cloudSettings', cloudSettings)

//     // Sync sortMode (string value, no conversion needed)
//     if (cloudSettings.sortMode !== undefined && cloudSettings.sortMode !== userSettings.sortMode) {
//       console.log('[BCE] Syncing sortMode:', cloudSettings.sortMode)
//       userSettings.sortMode = cloudSettings.sortMode
//       Storage.set('sortMode', cloudSettings.sortMode)
//     }

//     // Sync stickyMentioned (convert 'on'/'off' string to boolean)
//     if (cloudSettings.stickyMentioned !== undefined) {
//       const boolValue = cloudSettings.stickyMentioned === 'on'
//       if (boolValue !== userSettings.stickyMentioned) {
//         console.log('[BCE] Syncing stickyMentioned:', boolValue)
//         userSettings.stickyMentioned = boolValue
//         Storage.set('stickyMentioned', boolValue)
//       }
//     }

//     // Sync hidePremature (convert 'on'/'off' string to boolean)
//     if (cloudSettings.hidePremature !== undefined) {
//       const boolValue = cloudSettings.hidePremature === 'on'
//       if (boolValue !== userSettings.hidePremature) {
//         console.log('[BCE] Syncing hidePremature:', boolValue)
//         userSettings.hidePremature = boolValue
//         Storage.set('hidePremature', boolValue)
//       }
//     }

//     // Note: hidePlainComments, minimumFeaturedCommentLength, maxFeaturedComments
//     // are NOT synced from CloudStorage as they're not compatible with radio-only interface
//   }
//   catch (error) {
//     console.warn('[BCE] Failed to sync from cloud:', error)
//   }
// }
