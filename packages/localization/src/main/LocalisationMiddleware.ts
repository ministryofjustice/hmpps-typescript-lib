import type { NextFunction, Request, Response } from 'express'
import { MiddlewareOptions } from './types/MiddlewareOptions'
import LocalisationContext from './LocalisationContext'

const DEFAULT_COOKIE_OPTIONS = {
  enabled: false,
  name: 'hmpps-localisation',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  httpOnly: false,
}

export default class LocalisationMiddleware {
  private localisationContext: LocalisationContext

  private readonly fallbackLanguage: string

  private readonly cookieOptions: Required<MiddlewareOptions['cookie']>

  constructor(
    localisationContext: LocalisationContext,
    fallbackLanguage: string,
    middlewareOptions: MiddlewareOptions,
  ) {
    this.localisationContext = localisationContext
    this.fallbackLanguage = fallbackLanguage
    this.cookieOptions = {
      ...DEFAULT_COOKIE_OPTIONS,
      ...middlewareOptions.cookie,
    } as Required<MiddlewareOptions['cookie']>
  }

  private parseCookies(cookieHeader?: string): Record<string, string> {
    if (!cookieHeader) return {}

    return cookieHeader.split(';').reduce(
      (cookies, cookie) => {
        const [key, value] = cookie.split('=').map(part => part.trim())
        if (key && value) {
          cookies[key] = decodeURIComponent(value)
        }
        return cookies
      },
      {} as Record<string, string>,
    )
  }

  private detectLanguage(req: Request): string {
    const cookies = this.parseCookies(req.headers.cookie)

    if (this.cookieOptions.enabled && cookies[this.cookieOptions.name]) {
      return cookies[this.cookieOptions.name]
    }

    if (req.headers['accept-language']) {
      return req.headers['accept-language'].split(',')[0]
    }

    // TODO: Add a check for req.lng?

    return this.fallbackLanguage
  }

  private setLanguageCookie(res: Response, locale: string) {
    const { enabled, name, ...expressCookieOptions } = this.cookieOptions

    if (enabled) {
      res.cookie(name, locale, expressCookieOptions)
    }
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const detectedLanguage = this.detectLanguage(req)
      this.setLanguageCookie(res, detectedLanguage)
      return this.localisationContext.runWithLocale(detectedLanguage, next)
    }
  }
}
