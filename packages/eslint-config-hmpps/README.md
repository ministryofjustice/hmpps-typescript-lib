# @ministryofjustice/eslint-config-hmpps

This package aims so simplify code style enforcement in HMPPS typescript projects using `eslint`.

It should include all:

- the necessary npm packages to simplify dependency management within repositories
- rules as defined by classic Airbnb best-practice with HMPPS overrides and typescript parsing

## Usage

Usage is best demonstrated by the [HMPPS typescript template](https://github.com/ministryofjustice/hmpps-template-typescript)
as it already includes npm scripts and continuous integration tooling.
New projects based on this template will automatically adopt this package.

### Migrating existing projects

#### Automatically installing the library

The package will self install by running via npx:
`npx @ministryofjustice/eslint-config-hmpps`

The final step of the installation script is to run the linting tool, with `--fix`.
This may expose some issues that need to manually fixed and some minor config overrides may need to be applied.

#### Manually installing the library

The template project was migrated as part of [pull request 470](https://github.com/ministryofjustice/hmpps-template-typescript/pull/470),
so you can either manually adopt changes from it or cherry-pick the squashed commit.

Essentially, the move from eslint v8 to v9 requires changes to eslint configuration:

- `npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-airbnb-base eslint-config-prettier eslint-import-resolver-typescript eslint-plugin-cypress eslint-plugin-import eslint-plugin-no-only-tests eslint-plugin-prettier`
- `npm install --save-dev @ministryofjustice/eslint-config-hmpps`
- `.eslintignore` and `.eslintrc.json` are not supported so can be deleted
- add `eslint.config.mjs`
  - import the default shared HMPPS rules from `@ministryofjustice/eslint-config-hmpps`
  - add a default export with these rules
  - if you had custom overrides in `.eslintrc.json` compared with the template project,
    include them after the shared defaults
- run `npm run lint` and address changes as necessary
  - adjust rules in `eslint.config.mjs` to suit your project’s needs

## Customising config

The point of having shared styling rules is that it reduces [bike-shedding](https://en.wiktionary.org/wiki/bikeshedding#:~:text=(file)-,Noun,Procrastination.) and adds some consistency across projects.
If some overriding is required to make your project successfully build configuration can be overriden via `eslint.config.mjs`,
e.g: [here](https://github.com/ministryofjustice/hmpps-assess-for-early-release-ui/pull/46)
and [here](https://github.com/ministryofjustice/hmpps-incident-reporting/pull/255).

## Developing this package

It is deliberately not using typescript or rollup so that building is not required.
CommonJS enables the parent and sibling packages to use the rules directly for lint checks.

### TODO

- use modern eslint typescript plugins desgined for eslint v9
