# hmpps-auth-clients

This package provides reusable clients for interacting with [HMPPS Auth](https://github.com/ministryofjustice/hmpps-auth) and the HMPPS Token Verification API. It abstracts the logic for:
- Acquiring tokens for system or user-based authentication
- Verifying the validity of tokens
- Storing and retrieving tokens from various backends (e.g., Redis, in-memory)

## Features

- **AuthenticationClient**: Manages retrieval of tokens from HMPPS Auth (supports both system and impersonation tokens).
- **VerificationClient**: Validates tokens against the HMPPS Token Verification API.
- **RedisTokenStore**: Persists tokens in Redis for distributed deployments.
- **InMemoryTokenStore**: Keeps tokens in memory for local development or testing purposes.

## Status

**This library is currently in alpha.**
Teams are welcome to use this library, but please note that breaking changes may occur as we refine and improve the package.

## Installation

```bash
npm install hmpps-auth-clients
```

## Usage
### AuthenticationClient

An example of using AuthenticationClient to retrieve a system token or a user token from HMPPS Auth:

```
import AuthenticationClient from 'hmpps-auth-clients/dist/AuthenticationClient'
import ConsoleLogger from 'bunyan' // Example logger; you can use your own

const authClient = new AuthenticationClient(
  {
    systemClientId: 'your-system-client-id',
    systemClientSecret: 'your-system-client-secret',
    ...ApiConfig
  },
  logger,
)

// Get a system (anonymous) token
const systemToken = await authClient.getToken()

// Optionally, perform a system action on behalf of a user
const userToken = await authClient.getToken('some-user')
```

### VerificationClient

Use VerificationClient to verify tokens against the HMPPS Token Verification API:

```
import VerificationClient from 'hmpps-auth-clients/dist/VerificationClient'
import ConsoleLogger from 'bunyan'

const verificationClient = new VerificationClient(
  {
    enabled: true,
    ...ApiConfig
  },
  logger,
)

// If your request object has a user and token, you can verify it:
const isTokenValid = await verificationClient.verifyToken({
  user: { username: 'some-user', token: 'jwt-token-here' },
})
```

### RedisTokenStore

Using RedisTokenStore to persist tokens in Redis (useful for distributed or scalable environments):

```
import { createClient } from 'redis'
import RedisTokenStore from 'hmpps-auth-clients/dist/tokenStores/RedisTokenStore'

// Create and connect a Redis client
const redisClient = createClient()
await redisClient.connect()

// Create the token store instance
const redisTokenStore = new RedisTokenStore(redisClient)

// Store and retrieve a token
await redisTokenStore.setToken('some-key', 'my-token', 3600) // 1 hour expiry
const token = await redisTokenStore.getToken('some-key') // 'my-token'
```

### InMemoryTokenStore

Using InMemoryTokenStore to store tokens in memory (suitable for local development):

```
import InMemoryTokenStore from 'hmpps-auth-clients/dist/tokenStores/InMemoryTokenStore'

const inMemoryStore = new InMemoryTokenStore()

await inMemoryStore.setToken('some-key', 'my-token', 3600)
const token = await inMemoryStore.getToken('some-key') // 'my-token'
```

## Developing this package

This module uses rollup, to build:

`npm run lint-fix && npm run build && npm run test`

## Testing changes to this library

* `cd` to this directory and then link this library: `npm link`
* Utilise the in-development library within a project by using: `npm link @ministryofjustice/hmpps-auth-clients`
