import { Translation, Translations } from './types/TranslationsType'
import getNestedValue from './helpers/getNestedValue'

export default class TranslationsStore {
  private translations: Translations = {}

  /**
   * Adds or updates a translation for a given locale and name.
   */
  public addTranslation(locale: string, name: string, data: Translation): void {
    if (!this.translations[locale]) {
      this.translations[locale] = {}
    }
    this.translations[locale][name] = data
  }

  /**
   * Retrieves a translation by locale and name.
   */
  public getTranslation(locale: string, path: string): Translation | undefined {
    return getNestedValue(this.translations[locale] || {}, path) as Translation | undefined
  }

  /**
   * Merges a set of translations into the current store.
   */
  public mergeTranslations(newTranslations: Translations): void {
    Object.keys(newTranslations).forEach(locale => {
      if (!this.translations[locale]) {
        this.translations[locale] = {}
      }
      Object.assign(this.translations[locale], newTranslations[locale])
    })
  }

  /**
   * Returns all translations.
   */
  public getAllTranslations(): Translations {
    return this.translations
  }

  public getAllTranslationsByLocale(locale: string) {
    return this.translations[locale]
  }

  public getTranslationsCount() {
    return Object.values(this.translations).reduce(
      (count, localeTranslations) => count + Object.keys(localeTranslations).length,
      0,
    )
  }
}
