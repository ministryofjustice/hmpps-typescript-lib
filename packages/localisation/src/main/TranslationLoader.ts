import TranslationsStore from './TranslationsStore'
import LocaleFileLoader from './LocaleFileLoader'
import { Translations } from './types/TranslationsType'
import Configuration from './Configuration'

export default class TranslationLoader {
  constructor(
    private readonly configuration: Configuration,
    private readonly localeFileLoader: LocaleFileLoader = new LocaleFileLoader(),
    private translationsStore: TranslationsStore = new TranslationsStore(),
  ) {}

  public clearTranslations() {
    this.translationsStore = new TranslationsStore()
  }

  /**
   * Builds a capturing regular expression from the user’s pattern to
   * extract `[lng]` and `[name]`.
   */
  private patternToRegex(userPattern: string): RegExp {
    let escaped = userPattern
      .replace(/\\/g, '/')
      .replace(/\*\*/g, '__GLOBSTAR__')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/__GLOBSTAR__/g, '.*?')

    const replacements = [
      { pattern: /\\\[lng\\]/g, replacement: '(?<lng>[^/]+)' },
      { pattern: /\\\[name\\]/g, replacement: '(?<name>[^/]+)' },
    ]

    for (const { pattern, replacement } of replacements) {
      escaped = escaped.replace(pattern, replacement)
    }

    return new RegExp(`^${escaped}$`)
  }

  public loadTranslations(filePattern: string): void {
    const fileDataArray = this.localeFileLoader.loadFiles(filePattern)
    const capturingRegex = this.patternToRegex(filePattern)

    const translations = fileDataArray.reduce((acc: Translations, { filePath, jsonData }) => {
      const match = capturingRegex.exec(filePath)
      if (match?.groups) {
        const { lng, name } = match.groups
        acc[lng] = acc[lng] || {}
        acc[lng][name] = jsonData
      }

      return acc
    }, {} as Translations)

    if (!Object.entries(translations).length) {
      this.configuration.logger.warn(`No translations were loaded for pattern: ${filePattern}`)
    }

    this.translationsStore.mergeTranslations(translations)

    this.configuration.logger.info(`${this.translationsStore.getTranslationsCount()} total translations loaded`)
  }

  /**
   * Adds a translation by locale and name.
   * @param args
   */
  public addTranslation = (...args: Parameters<typeof this.translationsStore.addTranslation>) =>
    this.translationsStore.addTranslation(...args)

  /**
   * Get a translation by locale and name
   * @param args
   */
  public getTranslation = (...args: Parameters<typeof this.translationsStore.getTranslation>) =>
    this.translationsStore.getTranslation(...args)

  /**
   * Returns all stored translations.
   * @param args
   */
  public getAllTranslations = (...args: Parameters<typeof this.translationsStore.getAllTranslationsByLocale>) =>
    this.translationsStore.getAllTranslationsByLocale(...args)
}
