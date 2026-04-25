interface JQueryCookieOptions {
  expires?: number | Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

interface JQueryStatic {
  cookie: ((key: string) => string | undefined) & ((key: string, value: string, options?: JQueryCookieOptions) => void)
}
