# HMPPS typescript library

A set of shared utilities for use with typescript projects.
The `@ministryofjustice/hmpps-typescript-lib` package itself should not be installed.

## Using packages in your applications

See individual packages’ README.md

- @ministryofjustice/eslint-config-hmpps – ESLint rules for HMPPS typescript projects
- @ministryofjustice/hmpps-monitoring – Retrieve and display health and status information from external services and internal components

Some of these will be included in the [template project](https://github.com/ministryofjustice/hmpps-template-typescript)
and would be adopted automatically by new projects.

## Development

Sub-packages in this projects are built on node 24 and tested on node 20, 22 and 24.

npm scripts from the root all delegate to sub-packages:

```shell
npm run clean     # remove built artefacts
npm run build     # build artefacts
npm test          # run unit tests
npm run lint      # run lint checks
npm run lint-fix  # fix lint errors automatically where possible
npm run check-for-updates # run npm-check-updates across all packages
```

… and can be called within packages themselves:

```shell
npm test --workspace packages/monitoring
cd packages/monitoring && npm test
```

To verify the build run:
```
npm run clean && npm run build && npm run lint && npm test
```

TODO: document adding a new sub-package

### Publishing process

This repository uses Changesets to manage package versions, changelogs and publish ordering for sub-packages.
When a new version needs to be released, these steps should be followed as part of the usual pull request process…

1. Make necessary changes to package(s).
2. Run `npm run changeset` and describe the package changes that should be released.
3. Commit the generated `.changeset/*.md` file alongside the code changes.
4. Create pull request, get it reviewed and merge into `main`.
5. When changesets land on `main`, the publish workflow creates or updates a `Version Packages` pull request containing
   the generated version bumps and changelog updates.
6. Review and merge the `Version Packages` pull request.
7. When that pull request lands on `main`, the publish workflow builds the packages, publishes new versions to npmjs.com
   and creates GitHub releases for the published packages.

Package versions and changelog entries should not normally be edited by hand. Changesets generates those updates in the
`Version Packages` pull request.

If you need to inspect the generated release changes locally, run:

```shell
npm run version-packages
```
