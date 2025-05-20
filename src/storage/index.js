import { STORAGE_NAMESPACE } from '../constants/index'

// eslint-disable-next-line unicorn/no-static-only-class
export default class Storage {
  static set(key, value) {
    localStorage.setItem(`${STORAGE_NAMESPACE}_${key}`, JSON.stringify(value))
  }

  static get(key) {
    const value = localStorage.getItem(`${STORAGE_NAMESPACE}_${key}`)
    return value ? JSON.parse(value) : undefined
  }

  static async init(settings) {
    const keys = Object.keys(settings)
    for (const key of keys) {
      const value = Storage.get(key)
      if (value === undefined) {
        Storage.set(key, settings[key])
      }
    }
  }
}
