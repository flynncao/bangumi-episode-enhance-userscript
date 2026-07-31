/**
 * Environment detection utilities
 * Detects if running in bgm.tv CloudStorage environment or standalone
 */

export enum Environment {
  STANDALONE = 'standalone',
  CLOUD_STORAGE = 'cloud_storage',
}

/**
 * Check if running in bgm.tv CloudStorage environment
 */
export function isCloudStorageEnvironment(): boolean {
  return typeof chiiApp !== 'undefined' && chiiApp.cloud_settings !== undefined
}

/**
 * Check if chiiLib is available (for settings panel integration)
 */
export function hasChiiLib(): boolean {
  return typeof chiiLib !== 'undefined' && chiiLib.ukagaka !== undefined
}

/**
 * Get current environment
 */
export function getEnvironment(): Environment {
  return isCloudStorageEnvironment() ? Environment.CLOUD_STORAGE : Environment.STANDALONE
}

/**
 * Get jQuery (available in both environments)
 */
export function getJQuery(): JQueryStatic | undefined {
  return typeof $ !== 'undefined' ? $ : (typeof jQuery !== 'undefined' ? jQuery : undefined)
}
