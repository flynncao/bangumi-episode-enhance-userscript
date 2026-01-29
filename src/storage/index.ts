const NAMESPACE = 'BangumiCommentEnhance'

export default class Storage {
  static set(key: string, value: any): void {
    localStorage.setItem(`${NAMESPACE}_${key}`, JSON.stringify(value))
  }

  static get(key: string): any {
    const value = localStorage.getItem(`${NAMESPACE}_${key}`)
    return value ? JSON.parse(value) : undefined
  }

  static async init(settings: Record<string, any>): Promise<void> {
    const keys = Object.keys(settings)
    for (const key of keys) {
      const value = Storage.get(key)
      if (value === undefined) {
        Storage.set(key, settings[key])
      }
    }
  }
}
