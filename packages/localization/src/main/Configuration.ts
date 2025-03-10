import type Logger from 'bunyan'
import { LocalisationConfiguration, LogLevel } from './types/LocalisationConfiguration'
import defaultFiltersEn from './filters/en'

export default class Configuration implements LocalisationConfiguration {
  public defaultLocale: string = 'en'

  public normalizeLocale: boolean = true

  public logLevel: LogLevel = LogLevel.WARN

  private baseLogger: Logger | Console = console

  public get logger(): Logger | Console {
    return new Proxy(this.baseLogger, {
      get: (target, property: string, receiver) => {
        const methodLevels: { [key: string]: LogLevel } = {
          debug: LogLevel.DEBUG,
          info: LogLevel.INFO,
          warn: LogLevel.WARN,
          error: LogLevel.ERROR,
        }

        if (property in methodLevels) {
          if (methodLevels[property] < this.logLevel) {
            return () => {}
          }
          const originalMethod = (target as any)[property]
          return (...args: any[]) => originalMethod.apply(target, args)
        }

        return Reflect.get(target, property, receiver)
      },
    })
  }

  public filePattern = undefined

  public supportedLocales = [this.defaultLocale]

  private defaultFilters = {
    en: defaultFiltersEn,
    cy: defaultFiltersEn, // Does Welsh do anything differently?
  }

  constructor() {
    return new Proxy(this, {
      set: (target, property, value, receiver) => {
        if (value === undefined) {
          return false
        }
        if (property === 'logger') {
          return Reflect.set(target, 'baseLogger', value, receiver)
        }

        return Reflect.set(target, property, value, receiver)
      },
      get: (target, property, receiver) => {
        return Reflect.get(target, property, receiver)
      },
    })
  }

  public updateConfig(newConfig: Partial<LocalisationConfiguration>): void {
    Object.entries(newConfig).forEach(([key, value]) => {
      ;(this as any)[key] = value
    })
  }

  public getDefaultFilters() {
    return this.defaultFilters
  }
}
