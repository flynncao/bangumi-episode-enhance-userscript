/**
 * Type definitions for bgm.tv CloudStorage and chiiLib APIs
 * NOTE: chiiLib.ukagaka ONLY supports type: 'radio' configurations!
 * These are only available when running in the bgm.tv environment
 */

export interface RadioOption {
  value: string
  label: string
}

export interface RadioConfig {
  title: string
  name: string
  type: 'radio' // Only radio is supported by chiiLib.ukagaka
  defaultValue: string
  getCurrentValue: () => string
  onChange: (value: string) => void
  options: RadioOption[]
}

export interface CloudSettings {
  get: (configName: string) => any
  getAll: () => Record<string, any>
  update: (config: Record<string, any>) => void
}

export interface Ukagaka {
  addGeneralConfig: (config: RadioConfig) => void
  onOpen: (callback: () => void) => void
  onClose: (callback: () => void) => void
}

export interface ChiiApp {
  cloud_settings: CloudSettings
}

export interface ChiiLib {
  ukagaka: Ukagaka
}

declare global {
  const chiiApp: ChiiApp | undefined
  const chiiLib: ChiiLib | undefined
}

export {}
