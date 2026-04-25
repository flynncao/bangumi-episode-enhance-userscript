import { NAMESPACE } from '../constants/index'
import { hasChiiLib, isCloudStorageEnvironment } from '../utils/environment'
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
  static isCloudAvailable(): boolean {
    try {
      return this.useCloudStorage && typeof chiiApp !== 'undefined' && chiiApp.cloud_settings !== undefined
    }
    catch {
      return false
    }
  }

  private static getDefaultValue(key: string): any {
    const defaults: Record<string, any> = {
      hidePlainComments: true,
      minimumFeaturedCommentLength: 15,
      maxFeaturedComments: 99,
      sortMode: 'reactionCount',
      stickyMentioned: false,
      hidePremature: false,
    }
    return defaults[key]
  }

  /**
   * Get a value from storage (CloudStorage or localStorage)
   */
  static get(key: string): any {
    const realKey = `${NAMESPACE}_${key}`
    // Fallback to localStorage
    let currentValue = this.getDefaultValue(key)

    try {
      if (this.isCloudAvailable()) {
        const cloudValue = $.cookie(realKey) || this.getDefaultValue(key)
        console.log('cloudValue', cloudValue)
        currentValue = cloudValue
      }

      return currentValue
    }
    catch (e) {
      console.warn(`[BCE] Failed to get cloud config '${key}', falling back to localStorage:`, e)
    }
  }

  /**
   * Set a value in storage (CloudStorage or localStorage)
   */
  static set(key: string, value: any): void {
    try {
      console.log('local value being set to', value)
      //  localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value))
      $.cookie(`${NAMESPACE}_${key}`, value, { expires: 365 }) // Sync to cookie for CloudStorage retrieval
      // if (this.isCloudAvailable()) {
      //   chiiApp!.cloud_settings.update({ [`${NAMESPACE}_${key}`]: value })
      // }
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
