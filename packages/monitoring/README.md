# @ministryofjustice/hmpps-monitoring

This package aims to standardise the set of endpoints a frontend application must implement to allow us to monitor it.

It includes:

- `/ping` - a lightweight endpoint that can be called to determine if the application is responsive. Required by kubernetes liveness and readiness probes.
- `/info` - an endpoint that returns information about the application including it's name, version, productId, and other metadata about the service
- `/health` - an endpoint that will return the current state of the application. This will include information about whether it's downstream services are responsive or not.

## Status

**This library is currently: ready to adopt.**

Teams are encouraged to use this library. Please provide feedback via slack to the #typescript channel.

## Usage

Usage is best demonstrated by the [HMPPS typescript template](https://github.com/ministryofjustice/hmpps-template-typescript)
as it is already included.
New projects based on this template will automatically adopt this package.

### Migrating existing projects

#### Automatically installing the library

The package will self install by running via npx:
`npx @ministryofjustice/hmpps-monitoring`

How successful this will be is dependent on how similar the codebase is to the current HEAD of the template project.

The final step of the installation script prints instructions on how to manually apply a few changes:

- Decorating `config.ts` to add `healthPath` declarations to each api definition.
  - Spring boot applications usually expose their health endpoints on `/health/ping` but this may vary and you will need to check this for each api.
- Ensure that this has not removed any existing health checks
  - This migration only attempts to ensure you have coverage for configured APIs
- Ensure that you have integration test coverage for any newly added health checks
  - Stubs will need to be added for any previously missing endpoints

The generated changes will need to be reviewed carefully!

#### Manually installing the library

The template project was migrated as part of [pull request 479](https://github.com/ministryofjustice/hmpps-template-typescript/pull/479),
so you can either manually adopt changes from it or cherry-pick the squashed commit.

Essentially, the move to adopt this endpoint is to:

- `npm install --save-dev @ministryofjustice/hmpps-monitoring`
- add `healthPath` keys to each API config in `config.ts`
- Modify `setupHealthChecks.ts` to hook up new middleware (see below)
- Tweak how `app.ts` adds the healthChecks middleware
- Delete old health check related modules:
  - server/data/healthCheck.ts
  - server/data/healthCheck.test.ts
  - server/services/healthCheck.ts
  - server/services/healthCheck.test.ts

## Hooking up new middleware

To configure the middleware it needs to be initialised with [ApplicationInfo](https://github.com/ministryofjustice/hmpps-typescript-lib/blob/dd4da10195ec6701fa3120a8935ffac679701cbd/packages/monitoring/src/main/types/DeploymentInfoType.ts#L26):

- This should match the `ApplicationInfo` type that comes with recent versions of the template project.
- One recent change is that `productId` is now mandatory and should be configured - reach out to `#ask-hmpps-sre-team` about this on slack.

It also requires an array of `HealthComponent`s which represent dependencies that this service relies on.
Reflecting dependency health via the /health endpoint will ensure that pingdom and the health monitor correctly record when your application is unhealthy.

### EndpointHealthComponents

The library provides an implementation of `HealthComponent`, `EndpointHealthComponent`, which is used to track the health of APIs that this service relies on.

These require:

- An instance of the logger that your application uses
- The name of your API that you rely on
- `EndpointHealthComponentOptions`

Dependending on how your Api Configuration is organised in `config.ts`it might be possible to automatically map this to the correct form required by the `endpointHealthComponent` as demonstrated below:

```ts
const apis: Array<[name: string, config: EndpointHealthComponentOptions]> =  ...

const middleware = monitoringMiddleware({
  applicationInfo,
  healthComponents: apis.map(([name, config]) => endpointHealthComponent(logger, name, config)),
})
```

Once the middleware component is instantiated, then individual endpoints can be registered:

```ts
router.get('/health', middleware.health)
router.get('/info', middleware.info)
router.get('/ping', middleware.ping)
```

## Implementing custom health components

Custom health components can be implemented by implementing the `HealthComponent` interface and passing an instance of this when hooking up the middleware.

## Developing this package

This module uses rollup, to build:

`npm run lint-fix && npm run build && npm run test`

## Testing changes to this library

`cd` to this directory and then pack this library to home directory: `npm pack --pack-destination ~`
Inside the project of choice then:

- uninstall the existing library: `npm uninstall @ministryofjustice/hmpps-monitoring`
- install from the packed file: `npm install -D ~/ministryofjustice-hmpps-monitoring-<some-version>.tgz`
