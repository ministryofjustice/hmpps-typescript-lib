import { AsyncLocalStorage } from 'node:async_hooks'

export default class LocalisationContext {
  private asyncLocalStorage = new AsyncLocalStorage<string>()

  /**
   * Sets the current locale using AsyncLocalStorage.
   */
  public setLocale(locale: string): void {
    this.asyncLocalStorage.enterWith(locale)
  }

  /**
   * Runs a callback within a locale context.
   * This helps isolate asynchronous flows.
   */
  public runWithLocale<T>(locale: string, callback: () => T): T {
    return this.asyncLocalStorage.run(locale, callback)
  }

  /**
   * Retrieves the current locale from AsyncLocalStorage.
   */
  public getCurrentLocale(): string {
    const locale = this.asyncLocalStorage.getStore()
    if (!locale) {
      throw new Error('No locale set in the AsyncLocalStorage context.')
    }

    return locale
  }
}
