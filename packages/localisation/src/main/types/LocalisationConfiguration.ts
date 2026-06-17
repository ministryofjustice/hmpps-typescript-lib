import type Logger from 'bunyan'

export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

export interface LocalisationConfiguration {
  defaultLocale: string
  supportedLocales?: string[]
  filePattern?: string
  normalizeLocale: boolean
  logger: Logger | Console
  logLevel: LogLevel
}
