# @ministryofjustice/hmpps-monitoring

This package aims to standardise the set of endpoints a frontend application must implement to allow us to monitor it.

It includes:

- `/ping` - a lightweight endpoint that can be called to determine if the application is responsive. Required by kubernetes liveness and readiness probes.
- `/info` - an endpoint that returns information about the application including it's name, version, productId, and other metadata about the service
- `/health` - an endpoint that will return the current state of the application. This will include information about whether it's downstream services are responsive or not.

## Usage

Usage is best demonstrated by the [HMPPS typescript template](https://github.com/ministryofjustice/hmpps-template-typescript)
as it is already included.
New projects based on this template will automatically adopt this package.

### Migrating existing projects

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

It also requires an array of `EndpointComponent`s which represent each API that this service calls.
By including these then things like pingdom and the health monitor will correctly record when your application is healthy.

These require:

- An instance of the logger that your application uses
- The name of your API that you rely on
- [EndpointComponentOptions](https://github.com/ministryofjustice/hmpps-typescript-lib/blob/dd4da10195ec6701fa3120a8935ffac679701cbd/packages/monitoring/src/main/types/EndpointComponentOptions.ts#L3)

Dependending on how your Api Configuration is organised in `config.ts`it might be possible to automatically map this to the correct form required by the `endpointComponent` as demonstrated below:

```ts
const apis: Array<[name: string, config: EndpointComponentOptions]> =  ...

const middleware = monitoringMiddleware({
  applicationInfo,
  healthComponents: apis.map(([name, config]) => endpointComponent(logger, name, config)),
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
