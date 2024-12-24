import {
  setup,
  defaultClient,
  TelemetryClient,
  DistributedTracingModes,
  Contracts,
  getCorrelationContext,
} from 'applicationinsights'
import type FlushOptions from 'applicationinsights/out/Library/FlushOptions'
import type { RequestHandler } from 'express'
import { ApplicationInfo } from './types/ApplicationInfo'
import { UserDataPublisher } from './types/UserDataPublisher'

type TelemetryProcessor = Parameters<typeof TelemetryClient.prototype.addTelemetryProcessor>[0]

export function initialiseAzureMonitoring(
  applicationInfo: ApplicationInfo,
  userDataPublisher: UserDataPublisher = defaultUserDataPublisher,
): TelemetryClient | null {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
    defaultClient.context.tags['ai.cloud.role'] = applicationInfo.applicationName
    defaultClient.context.tags['ai.application.ver'] = applicationInfo.buildNumber
    defaultClient.addTelemetryProcessor(addUserDataToRequests(userDataPublisher))
    defaultClient.addTelemetryProcessor(overrideOperationName)
    return defaultClient
  }
  return null
}

export function flush(options: FlushOptions, exitMessage: string): void {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    defaultClient.flush(options)
  } else if (options.callback) {
    options.callback(exitMessage)
  }
}

export const overrideOperationName: TelemetryProcessor = ({ tags, data }, contextObjects) => {
  const operationNameOverride = contextObjects?.correlationContext?.customProperties?.getProperty('operationName')
  tags['ai.operation.name'] = operationNameOverride // eslint-disable-line no-param-reassign
  if (data?.baseData) {
    data.baseData.name = operationNameOverride // eslint-disable-line no-param-reassign
  }
  return true
}

const addUserDataToRequests =
  (userDataPublisher: UserDataPublisher): TelemetryProcessor =>
  ({ data }, contextObjects) => {
    const isRequest = data.baseType === Contracts.TelemetryTypeString.Request
    if (isRequest) {
      const user = contextObjects?.['http.ServerRequest']?.res?.locals?.user
      if (user && data.baseData) {
        const { properties } = data.baseData

        data.baseData.properties = { ...userDataPublisher(user), ...properties } // eslint-disable-line no-param-reassign
      }
    }
    return true
  }

/**
 * Actual: /path/to/prisoner/A0001AA
 * Expected: /path/to/prisoner/:id
 */
export function azureMonitoringMiddleware(): RequestHandler {
  return (req, res, next) => {
    res.prependOnceListener('finish', () => {
      const context = getCorrelationContext()
      if (context && req.route) {
        context.customProperties.setProperty('operationName', `${req.method} ${req.route?.path}`)
      }
    })
    next()
  }
}

const defaultUserDataPublisher: UserDataPublisher = (user): Record<string, unknown> => {
  const {
    displayName,
    // will only be present for prison users
    activeCaseLoadId,
  } = user

  return { displayName, activeCaseLoadId }
}
