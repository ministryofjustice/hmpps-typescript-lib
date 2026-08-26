import getNestedValue from './helpers/getNestedValue'
import Configuration from './Configuration'

type Filters = {
  [key: string]: {
    [key: string]: (value: unknown, ...args: any[]) => unknown
  }
}

type Variables = {
  [key: string]: string | number | boolean | object | string[] | object[]
}

export default class TemplateEngine {
  private readonly filters: Filters

  constructor(private readonly configuration: Configuration) {
    this.filters = {
      ...this.configuration.getDefaultFilters(),
    }
  }

  public registerFilter(locale: string, name: string, fn: (value: unknown) => unknown) {
    this.filters[locale][name] = fn
  }

  /**
   * Processes strings, arrays, and objects recursively.
   */
  public processTranslation(translation: unknown, variables: Variables, locale = 'en'): unknown {
    if (typeof translation === 'string') {
      return this.render(translation, variables, locale)
    }

    if (Array.isArray(translation)) {
      return translation.map(item => this.processTranslation(item, variables))
    }

    if (typeof translation === 'object' && translation !== null) {
      return Object.fromEntries(
        Object.entries(translation).map(([key, value]) => [key, this.processTranslation(value, variables, locale)]),
      )
    }

    return translation
  }

  /**
   * Renders a string that may contain templated expressions.
   * Supports filters with arguments
   */
  private render(template: string, variables: Variables, locale: string): string {
    return template.replace(
      /\{\{\s*([\w.[\]]+)((?:\s*\|\s*\w+(?:\([^)]*\))?)*)\s*}}/g,
      (_, expression: string, filterChain: string) => {
        let value = getNestedValue(variables, expression)
        if (value === undefined || value === null) {
          return `MISSING_VARIABLE`
        }

        if (!filterChain.trim()) {
          return String(value)
        }

        const filterMatches = filterChain.match(/\|\s*(\w+)(?:\(([^)]*)\))?/g)

        if (filterMatches) {
          for (const match of filterMatches) {
            const [, filterName, filterArgs] = match.match(/\|\s*(\w+)(?:\(([^)]*)\))?/)!

            if (!this.filters[filterName]) {
              throw new Error(`Unknown localisation filter: ${filterName}`)
            }

            let parsedArg: any
            if (filterArgs) {
              try {
                const jsonString = filterArgs.replace(/'/g, '"')
                parsedArg = JSON.parse(jsonString)
              } catch (err) {
                throw new Error(`Invalid argument for filter "${filterName}": ${filterArgs}`)
              }
            }

            value =
              parsedArg !== undefined
                ? this.filters[locale][filterName](value, parsedArg)
                : this.filters[locale][filterName](value)
          }
        }

        return String(value)
      },
    )
  }
}
