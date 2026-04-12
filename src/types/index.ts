// Custom type definitions for Bangumi Comment Enhance project
import type { CustomCheckboxContainer } from '../classes/checkbox'

// Comment element structure
interface CommentElement {
  element: HTMLElement
  score: number
  replyCount?: number
  timestampNumber: number
  important?: boolean
  timestamp?: string
}

// User settings structure
interface UserSettings {
  hidePlainComments: boolean
  minimumFeaturedCommentLength: number
  maxFeaturedComments: number
  sortMode: 'reactionCount' | 'replyCount' | 'oldFirst' | 'newFirst'
  stickyMentioned: boolean
  hidePremature: boolean
}

// Storage interface
interface StorageManager {
  init: (defaults: Partial<UserSettings>) => void
  get: (key: keyof UserSettings) => any
  set: (key: keyof UserSettings, value: any) => void
}

// Global BCE object
interface BCE {
  settingsDialog?: {
    show: () => void
    hide: () => void
    save: () => void
    getElements: () => SettingsElements
  }
}

export interface SettingsElements {
  container: HTMLDivElement
  dropdown: HTMLSelectElement
  pinMyCommentsCheckboxContainer: CustomCheckboxContainer
  hidePlainCommentsCheckboxContainer: CustomCheckboxContainer
  hidePrematureCommentsCheckboxContainer: CustomCheckboxContainer
  minEffInput: HTMLInputElement
  maxPostsInput: HTMLInputElement
  cancelBtn: HTMLButtonElement
  saveBtn: HTMLButtonElement
}

// Extend window interface
declare global {
  interface Window {
    BCE: BCE
  }
}

interface GeneralConfigRadioParams {
  title: string
  name: string
  type: 'radio'
  defaultValue: string
  getCurrentValue: () => void
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

type GeneralConfigParams = GeneralConfigRadioParams

interface PanelTabOptionsParams {
  type: 'options'
  tab: string
  label: string
  config: GeneralConfigParams[]
}

interface PanelTabCustomParams {
  type: 'custom'
  tab: string
  label: string
  customContent: () => string
}

type PanelTabParams = PanelTabOptionsParams | PanelTabCustomParams

// Export interfaces for use in other files
export type {
  BCE,
  CommentElement,
  PanelTabCustomParams,
  PanelTabOptionsParams,
  PanelTabParams,
  StorageManager,
  UserSettings,
}
