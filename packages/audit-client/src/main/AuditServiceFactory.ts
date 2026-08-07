import type Logger from 'bunyan'

import type { SQSClientConfig } from '@aws-sdk/client-sqs'
import type { AuditClientConfig } from './types/AuditClientConfig'

import AuditClient from './AuditClient'
import AuditService from './AuditService'
import { SubjectType } from './types/SubjectType'

const REQUIRED_IN_PRODUCTION = true
const production: boolean = process.env.NODE_ENV === 'production'

function get(name: string, fallback: string, requiredInProd: boolean = false): string {
  const envVarValue: string | undefined = process.env[name]
  if (envVarValue !== undefined) {
    return envVarValue
  }
  if (!production || !requiredInProd) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

/**
 * Factory for creating and configuring AuditService instances.
 *
 * Provides two methods for instantiation:
 * - `configureFromEnv`: Creates an AuditService by reading configuration from environment variables
 * - `createInstance`: Creates an AuditService with an explicit configuration object
 *
 * @example
 * // Configure from environment variables
 * const auditService = AuditServiceFactory.configureFromEnv(logger, sqsClientConfig);
 * const auditService = AuditServiceFactory.configureFromEnv(logger);
 *
 * @example
 * // Configure with explicit config
 * const auditService = AuditServiceFactory.createInstance(config, logger);
 */
const AuditServiceFactory = {
  configureFromEnv: <PAGE_NAME extends string = string, SUBJECT_TYPE extends string = SubjectType>(
    logger: Logger | Console,
    clientConfig: SQSClientConfig = {},
  ): AuditService<PAGE_NAME, SUBJECT_TYPE> => {
    const enabled = get('AUDIT_ENABLED', 'true') === 'true'
    const region = get('AUDIT_SQS_REGION', 'eu-west-2', REQUIRED_IN_PRODUCTION)
    const queueUrl = get('AUDIT_SQS_QUEUE_URL', 'http://localhost:4566/000000000000/mainQueue', REQUIRED_IN_PRODUCTION)
    const serviceName = get('AUDIT_SERVICE_NAME', 'unknown-service', REQUIRED_IN_PRODUCTION)

    if (!enabled) {
      logger.warn(`Auditing is disabled (AUDIT_ENABLED=${process.env.AUDIT_ENABLED}), no messages will be sent.`)
    }
    const auditClient = new AuditClient({ enabled, region, queueUrl, serviceName, clientConfig }, logger)
    return new AuditService<PAGE_NAME, SUBJECT_TYPE>(auditClient)
  },

  createInstance: <PAGE_NAME extends string = string, SUBJECT_TYPE extends string = SubjectType>(
    config: AuditClientConfig,
    logger: Logger | Console,
  ): AuditService<PAGE_NAME, SUBJECT_TYPE> => {
    if (!config.enabled) {
      logger.warn(`Auditing is disabled, no messages will be sent.`)
    }
    const auditClient = new AuditClient(config, logger)
    return new AuditService<PAGE_NAME, SUBJECT_TYPE>(auditClient)
  },
}

export default AuditServiceFactory
