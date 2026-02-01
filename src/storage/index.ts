import { hasChiiLib, isCloudStorageEnvironment } from '../utils/environment'

const NAMESPACE = 'BangumiCommentEnhance'

/**
 * Hybrid Storage class that supports both localStorage and CloudStorage
 * - In CloudStorage environment: uses chiiApp.cloud_settings
 * - In standalone/local environment: falls back to localStorage
 */
export default class Storage {
  private static useCloudStorage = isCloudStorageEnvironment()

  /**
   * Check if CloudStorage is available
   */
  private static isCloudAvailable(): boolean {
    try {
      return this.useCloudStorage && typeof chiiApp !== 'undefined' && chiiApp.cloud_settings !== undefined
    }
    catch {
      return false
    }
  }

  /**
   * Get a value from storage (CloudStorage or localStorage)
   */
  static get(key: string): any {
    console.log('[BCE] Storage.get called for key:', key)
    console.log(this.useCloudStorage, this.isCloudAvailable())
    try {
      if (this.isCloudAvailable()) {
        const value = chiiApp!.cloud_settings.get(key)
        return value !== undefined ? value : undefined
      }
    }
    catch (e) {
      console.warn(`[BCE] Failed to get cloud config '${key}', falling back to localStorage:`, e)
    }

    // Fallback to localStorage
    const value = localStorage.getItem(`${NAMESPACE}_${key}`)
    return value ? JSON.parse(value) : undefined
  }

  /**
   * Set a value in storage (CloudStorage or localStorage)
   */
  static set(key: string, value: any): void {
    console.log('[BCE] Storage.set called for key:', key)
    console.log(this.useCloudStorage, this.isCloudAvailable())
    try {
      localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value))
      if (this.isCloudAvailable()) {
        chiiApp!.cloud_settings.update({ [key]: value })
      }
    }
    catch (e) {
      console.warn(`[BCE] Failed to update cloud config '${key}'`, e)
    }
  }

  /**
   * Initialize storage with default values
   * Syncs with CloudStorage if available
   */
  static async init(settings: Record<string, any>): Promise<void> {
    const keys = Object.keys(settings)
    for (const key of keys) {
      const value = Storage.get(key)
      if (value === undefined) {
        Storage.set(key, settings[key])
      }
    }

    // If in CloudStorage environment, sync any missing keys from cloud
    if (this.isCloudAvailable()) {
      try {
        const allCloudSettings = chiiApp!.cloud_settings.getAll()
        for (const [key, value] of Object.entries(allCloudSettings)) {
          if (key in settings && !localStorage.getItem(`${NAMESPACE}_${key}`)) {
            localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value))
          }
        }
      }
      catch (e) {
        console.warn('[BCE] Failed to sync cloud settings:', e)
      }
    }
  }

  /**
   * Check if chiiLib is available for settings panel integration
   */
  static hasChiiLib(): boolean {
    return hasChiiLib()
  }

  /**
   * Get the current environment
   */
  static isCloudEnvironment(): boolean {
    return this.useCloudStorage
  }
}
