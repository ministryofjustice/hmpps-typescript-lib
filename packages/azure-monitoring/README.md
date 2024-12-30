# @ministryofjustice/hmpps-azure-monitoring

This package aims to standardise the configuration of a services integration with azure monitor.

This provides a function that can be [preloaded](https://nodejs.org/api/cli.html#-r---require-module) before starting a service.

Completed features:

- instrumentation of standard libraries
- exporting traces, requests to azure
- role name setting
- version setting
- exceptions
  - bunyan exceptions should be propagates as exception
  - this doesn't work with current errorHandler in the template project which uses `log.error(message, error)` rather than `log.error(error, message)`

To do:

- Adding user data to requests
  - support customization for custom attibutes
- test / demonstrate distributed tracing
- exceptions
  - bunyan exceptions should be propagates as exception
  - this didn't work previously due to using `log.error(message, error)` rather than `log.error(error, message)`
- sampling
  - basic sampling of ping/health/info/assets
  - more complex dynamic sampling
- setting operation name to pattern

- manual flush operations on shutdown (required as the last action implemented as jobs)

- trim standard span attributes provided by express

  - by default the standard express integration adds lots of low value standard attributes which increases the size of the payload (cost of ingress)

- examples of how to raise custom events / create spans etc..

- test with redis
  - danger of instrumentation working out of the box.. this doesn't happen with existing apps?

## Status

This library is pre-alpha. Teams should not use this library.

### Migrating existing projects

#### Automatically installing the library

Not yet implemented

#### Manually installing the library

Install library: `npm install @ministryofjustice/hmpps-azure-monitoring`
Create an instrumentation file: `instrumentation.ts` with the following contents:

```ts
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

```

Change the `watch-node` command to run your service in dev to preload the instrumentation file, e.g:
`DEBUG=gov-starter-server* nodemon -r dotenv/config -r dist/instrumentation.js --watch dist/ dist/server.js | bunyan -o short`

Update `npm start` command:
`node $NODE_OPTIONS -r dist/instrumentation.js dist/server.js | bunyan -o short`

## Developing this package

This module uses rollup, to build:

`npm run lint-fix && npm run build`

# Testing with sample app

- cd to sample dir: `cd packages/azure-monitoring/src/sample/`
- create a .env file by `cp .env.example .env`
- add dev connectivity string to `.env`
- start sample application: `npm start`
- hit endpoints and view in app insights/log analytics via `azure-monitoring-sample-service`
