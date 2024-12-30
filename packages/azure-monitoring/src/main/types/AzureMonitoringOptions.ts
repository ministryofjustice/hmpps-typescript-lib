import type { InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node'

/**
 * Contains information about the application's build and version.
 */
export type ApplicationInfo = {
  /** The build number of the application. */
  buildNumber: string
  /** The name of the application. */
  applicationName: string
}

/**
 * Used to add user info to requests.
 * This is called on req.locals and any details that are added to the returned object will be added as customDimensions on request items.
 *
 * For prisons this must include at a minimum the user's username and active case load ID.
 */
export type UserDataPublisher = (user: Record<string, unknown>) => Record<string, unknown>

export type AzureMonitoringOptions = {
  // information about the application being monitored
  applicationInfo: ApplicationInfo
  // overrides for the default instrumentation options
  instrumentationOptions?: InstrumentationConfigMap
  // override default behaviour of sending user data
  userDataPublisher?: UserDataPublisher
}
