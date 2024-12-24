# @ministryofjustice/hmpps-azure-monitoring

This package aims to standardise the configuration of a services integration with azure monitor.

## Status

This library is now in alpha. Teams should not use this library.

## Usage

Usage is best demonstrated by the [HMPPS typescript template](https://github.com/ministryofjustice/hmpps-template-typescript)
as it is already included.
New projects based on this template will automatically adopt this package.

### Migrating existing projects

#### Automatically installing the library

The package will self install by running via npx:
`npx @ministryofjustice/hmpps-azure-monitoring`

How successful this will be is dependent on how similar the codebase is to the current HEAD of the template project.

The generated changes will need to be reviewed carefully!

#### Manually installing the library

...

## Developing this package

This module uses rollup, to build:

`npm run lint-fix && npm run build && npm run test`
