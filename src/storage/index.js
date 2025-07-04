const NAMESPACE = 'BangumiCommentEnhance'

// eslint-disable-next-line unicorn/no-static-only-class
export default class Storage {
  static set(key, value) {
    localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value))
  }

  static get(key) {
    const value = localStorage.getItem(`${NAMESPACE}_${key}`)
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
