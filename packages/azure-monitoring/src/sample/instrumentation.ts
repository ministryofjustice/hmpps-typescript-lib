import { initAzureMonitoring } from '@ministryofjustice/hmpps-azure-monitoring'

initAzureMonitoring({
  applicationInfo: {
    applicationName: 'azure-monitoring-sample-service',
    buildNumber: '1.0.0',
  },
  instrumentationOptions: {
    '@opentelemetry/instrumentation-express': { ignoreLayers: [/.*\/ping/] },
  },
  userDataPublisher: user => ({
    username: user.username,
    caseLoadId: user.caseLoadId,
  }),
})
