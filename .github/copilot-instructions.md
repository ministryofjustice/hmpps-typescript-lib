# hmpps-typescript-lib

An npm workspaces monorepo of independently-published `@ministryofjustice/*` packages providing shared
TypeScript utilities for HMPPS Node.js services. The root package itself (`private: true`) is never
installed — each sub-package under `packages/*` is published and versioned separately.

## Packages

- `rest-client` – standardized REST client for HMPPS services
- `auth-clients` – clients for authenticating/verifying tokens against HMPPS Auth
- `azure-telemetry` – Azure Application Insights telemetry via OpenTelemetry
- `monitoring` – health/status/ping endpoint components and middleware
- `frontend-types` – shared `.d.ts` ambient type declarations
- `eslint-config-hmpps` – shared ESLint flat config
- `precommit-hooks` – installs/configures `prek` git hooks (gitleaks secret scanning)
- `npm-script-allowlist` – restricts which npm scripts can run (allowlist enforcement)
- `audit-client` – client for sending audit events to the HMPPS Audit API

Each package has its own README.md with usage docs for consumers — check it before changing behaviour.

## Build, test, lint

All root scripts delegate to every workspace via `npm run <script> --workspaces --if-present`:

```shell
npm run build       # build all packages
npm run clean       # remove build artefacts (dist/, .eslintcache)
npm test            # run all package tests
npm run lint         # lint all packages
npm run lint-fix     # lint all packages, autofixing
```

Full verification (mirrors CI's `lint` job): `npm run clean && npm run build && npm run lint && npm test`

Run against a single package instead of the whole workspace:

```shell
npm test --workspace packages/monitoring
cd packages/monitoring && npm test
```

Run a single test file/case with jest directly from within a package directory:

```shell
cd packages/monitoring && npx jest HealthCheck.test.ts
cd packages/monitoring && npx jest -t 'name of test'
```

Most packages build with `rollup -c rollup.config.ts --bundleConfigAsCjs` (CJS + ESM + rolled-up `.d.ts`
via `rollup-plugin-dts`); `frontend-types` just concatenates `.d.ts` files and `eslint-config-hmpps` has
no build step. CI (`.github/workflows/pipeline.yml`) runs `lint` first, then `test` across Node 22/24/26,
then on GitHub release publishes any package whose `package.json` version isn't already on npm.

## Conventions

- **Source layout**: package code lives in `src/main/`, with tests colocated next to the file they cover
  as `*.test.ts` (not in a separate `__tests__` dir); shared test helpers go in `src/test/`.
- **Public API**: each package's `src/main/index.ts` is the single entry point/barrel export; only export
  what's intended for consumers.
- **Config inheritance**: sub-package `tsconfig.json` extends the root `tsconfig.json`; sub-package
  `jest.config.mjs` re-exports the root `jest.config.mjs`; sub-package `eslint.config.mjs` just imports
  and calls `@ministryofjustice/eslint-config-hmpps`'s default export. Prefer changing shared root/config
  package files over duplicating config per package.
- **Coverage**: jest enforces a 90% global threshold (branches/functions/lines/statements).
- **Versioning**: bump the version in the affected sub-package's `package.json` (never the root, which
  stays `0.0.0`), and keep its `README.md`/`CHANGELOG.md` up to date as part of the same PR.
- **Releases**: after merge to `main`, a git tag like `[package]-[version]` (e.g. `clients-0.0.1-alpha.6`)
  is pushed and a GitHub release created from it, which triggers the publish job.
- **Secrets**: gitleaks runs pre-commit (`.gitleaks/config.toml`) — don't commit real credentials/tokens,
  even in test fixtures.
