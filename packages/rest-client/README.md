# @ministryofjustice/hmpps-rest-client

This package aims to standardize the way HMPPS TypeScript applications interact with external services by providing a reusable REST client.

## Features

- Standardized HTTP request handling for HMPPS services
- Automatic request retries
- Authentication token management (supports system and user tokens)
- Streamed responses for large payloads
- Request logging and error handling
- Configurable timeouts and request headers

## Status

**This library is currently in alpha.**
Teams are free to use this library, but further breaking changes may occur as we refine and improve the package.

## Usage

Usage is best demonstrated by the [HMPPS typescript template](https://github.com/ministryofjustice/hmpps-template-typescript) as it is already included.
New projects based on this template will automatically adopt this package.

### RestClient
The package provides an abstract RestClient class that you can extend to create API clients tailored to your service needs.

```
import RestClient from '@ministryofjustice/hmpps-rest-client'
import { ApiConfig } from './types/ApiConfig'
import { AuthOptions } from './types/AuthOptions'

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
      },
      console, // Replace with a proper logger in production
      {
        getToken: async () => 'your-system-token', // Replace with a token management strategy
      },
    )
  }

  async getExampleData(authOptions: AuthOptions) {
    return this.get({ path: '/example-data' }, authOptions)
  }
}

export default new ExampleApiClient()
```

### Authentication
This library relies on a `AuthenticationClient` provider which implements
a `getToken` endpoint, which should return system tokens.

Additionally, the library provides
* `asSystem` - for generating authentication options for making a request with a system token.
* `asUser` - for generating authentication options for making a request with a user token.

## Developing this package

This module uses rollup, to build:

`npm run lint-fix && npm run build && npm run test`

## Testing changes to this library

* `cd` to this directory and then link this library: `npm link`
* Utilise the in-development library within a project by using: `npm link @ministryofjustice/hmpps-rest-client`
