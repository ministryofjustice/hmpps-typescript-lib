import LocalisationContext from './LocalisationContext'
import { LocalisationConfiguration } from './types/LocalisationConfiguration'
import LocalisationMiddleware from './LocalisationMiddleware'
import { MiddlewareOptions } from './types/MiddlewareOptions'
import TemplateEngine from './TemplateEngine'
import TranslationLoader from './TranslationLoader'
import Configuration from './Configuration'

export default class Localisation {
  constructor(
    private readonly translationLoader: TranslationLoader,
    private readonly localisationContext: LocalisationContext,
    private readonly templateEngine: TemplateEngine,
    private readonly configuration: Configuration,
  ) {}

  public initialize(configuration: Partial<LocalisationConfiguration>): void {
    this.configuration.updateConfig(configuration)
    this.translationLoader.clearTranslations()

    if (this.configuration.filePattern) {
      this.loadTranslations(this.configuration.filePattern)
    }
  }

  /**
   * Normalizes locale codes (e.g., converts 'en-GB' to 'en' unless `normalizeLocale` is enabled).
   */
  private normalizeLocale(locale: string): string {
    return this.configuration.normalizeLocale ? locale.split('-')[0] : locale
  }

  public getActiveLocale() {
    try {
      return this.localisationContext.getCurrentLocale()
    } catch {
      return this.configuration.defaultLocale
    }
  }

  /**
   * Retrieves a translation, merging base and page-specific translations.
   */
  public getTranslation(name: string, variables: Record<string, any> = {}, locale = this.getActiveLocale()): any {
    const effectiveLocale = this.normalizeLocale(locale)
    const translation = this.translationLoader.getTranslation(effectiveLocale, name)

    return this.templateEngine.processTranslation(translation, variables, effectiveLocale)
  }

  public getAllTranslation(variables: Record<string, any> = {}, locale = this.getActiveLocale()): any {
    const effectiveLocale = this.normalizeLocale(locale)
    const translation = this.translationLoader.getAllTranslations(effectiveLocale)

    return this.templateEngine.processTranslation(translation, variables, effectiveLocale)
  }

  public addTranslation = (...args: Parameters<typeof this.translationLoader.addTranslation>) =>
    this.translationLoader.addTranslation(...args)

  public loadTranslations = (...args: Parameters<typeof this.translationLoader.loadTranslations>) => {
    this.translationLoader.loadTranslations(...args)
  }

  /**
   * Express middleware that sets up the locale.
   * It checks for a locale in cookies first, then in the Accept-Language header,
   * falling back to the default locale.
   * If enabled in settings (setLocaleCookie is true), it sets a cookie with the detected locale.
   */
  public middleware(middlewareOptions: MiddlewareOptions) {
    return new LocalisationMiddleware(
      this.localisationContext,
      this.configuration.defaultLocale,
      middlewareOptions,
    ).middleware()
  }
}
