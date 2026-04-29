# @ministryofjustice/hmpps-rest-client

This package aims to standardize the way HMPPS TypeScript applications interact with external services by providing a reusable REST client.

## Features

- Standardized HTTP request handling for HMPPS services
- Automatic request retries
- Authentication token management (supports system and user tokens)
- Streamed responses for large payloads
- Request logging and error handling
- Configurable timeouts and request headers
- Node 24 env-proxy support without forcing a custom agent

## Status

**This library is currently: ready to adopt.**

 Teams are encouraged to use this library. Please provide feedback via slack to the #typescript channel.

## Runtime support

Version 2.x requires Node 24 or later.

When `NODE_USE_ENV_PROXY=1` or `--use-env-proxy` is enabled, this package now defers to the Node runtime for proxy-aware
transport by default. In that mode it does not create its own `agentkeepalive` agent unless you explicitly opt in via
`transport`.

## Usage

Usage is best demonstrated by the [HMPPS typescript template](https://github.com/ministryofjustice/hmpps-template-typescript) as it is already included.
New projects based on this template will automatically adopt this package.

### RestClient

The package provides an abstract RestClient class that you can extend to create API clients tailored to your service needs.

```ts
import { ApiConfig, RestClient } from '@ministryofjustice/hmpps-rest-client'

class ExampleApiClient extends RestClient {
  constructor() {
    super(
      'example-api',
      {
        url: 'https://example.com/api',
        timeout: {
          response: 5000,
          deadline: 10000,
        },
        agent: { maxSockets: 100 },
      } as ApiConfig,
      console, // Replace with a proper logger in production
      {
        getToken: async () => 'your-system-token', // Replace with a token management strategy
      },
    )
  }

  async getExampleData(username: string) {
    return this.get({ path: '/example-data' }, asSystem(username))
  }

  async postJsonData(username: string, jsonRequestBody: object) {
    return this.post({ path: '/example-data', data: jsonRequestBody }, asSystem(username))
  }

  async postMultipartData(username: string, file: { buffer: Buffer; originalname: string }, multipartRequestBody: object) {
    return this.post({ path: '/example-data', files: { upload: file }, multipartData: multipartRequestBody }, asSystem(username))
  }
}

export default new ExampleApiClient()
```

### Proxying and custom transport

If your application enables Node env proxy mode, for example with `NODE_USE_ENV_PROXY=1`, the rest client will use the
runtime's default proxy-aware transport and will ignore the default `agent` configuration.

For most applications that is the desired behaviour and no application change is required.

If your application previously depended on a bespoke keepalive agent with custom pooling behaviour, you must now opt in
explicitly using `transport`. This is intended for advanced cases only. Any custom agent supplied here must already be
compatible with your proxying requirements.

```ts
import { AgentConfig, RestClient, type TransportConfig } from '@ministryofjustice/hmpps-rest-client'

const transport: TransportConfig = {
  createAgent: () => buildProxyAwareAgentSomehow(),
}

class ExampleApiClient extends RestClient {
  constructor() {
    super(
      'example-api',
      {
        url: 'https://example.com/api',
        timeout: {
          response: 5000,
          deadline: 10000,
        },
        agent: new AgentConfig(8000),
        transport,
      },
      console,
    )
  }
}
```

Applications only need to make this change if they want to preserve custom
transport behaviour while also using Node env proxy mode. If they only want correct proxying, no app-level transport
override is needed.

When using `hmpps-auth-clients` and dependency injection this might look like:

```ts
import { ApiConfig, AuthenticationClient, RestClient } from '@ministryofjustice/hmpps-rest-client'
import config from '../config'
import logger from '../../logger'

export default class ExampleApiClient extends RestClient {
  constructor(authenticationClient: AuthenticationClient) {
    super('Example API Client', config.apis.exampleApi as ApiConfig, logger, authenticationClient)
  }
  ...
}
```

```ts
// data/index.ts
const tokenStore = config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore()
const authClient = new AuthenticationClient(config.apis.hmppsAuth, logger, tokenStore)
const client = new ExampleApiClient(authClient)
```

### Authentication

This library accepts an optional `AuthenticationClient` provider which implements
a `getToken` endpoint, used for return system tokens.

Additionally, the library provides

- `asSystem` - for generating authentication options for making a request with a system token.
- `asUser` - for generating authentication options for making a request with a user token.
- You may also use the raw JWT string by passing it in place of authOptions.

### Error handling

When an API call fails, the superagent `ResponseError` contains information about the request and response including errors that we would not want to be exposed to logs. The client library copies a subset of the available response properties onto a new error object and makes this available to an `ErrorHandler` (or `ErrorLogger` when processing streams) strategy.

The default `ErrorHandler` strategy is to simply log the error at warning level and then rethrow but this can be overriden on a per call or per client basis.

The status code of the response is mapped to an `responseStatus` which can be used to conditionally alter the handling of errors.

There are examples in `RestClient.test.ts` on how to coerce 404 response into null return values and also how to propagate the api response status in a format that express and the default error handler understands.

## Developing this package

This module uses rollup, to build:

`npm run lint-fix && npm run build && npm run test`

## Testing changes to this library

- `cd` to this directory and then link this library: `npm link`
- Utilise the in-development library within a project by using: `npm link @ministryofjustice/hmpps-rest-client`
