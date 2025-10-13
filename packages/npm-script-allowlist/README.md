# @ministryofjustice/hmpps-npm-allow-scripts

This package aims to restrict npm scripts from running unless as part of a predefined allowlist

## Status

**This library is currently: Alpha.**
Teams are welcome to trial this library. Please provide feedback via slack to the `#typescript` channel.

## Migrating existing projects

#### Automatically installing the library

The package will self install and initialised by running via npx:
`npx @ministryofjustice/hmpps-npm-allow-scripts`

Note: The project needs to be initialised before use - solely adding the library will make no difference.
Once the project has been initialised, other developers should be able to develop against it without further configuration.

### How this works

...

### Testing

Export a local package:
`npm run lint && npm run build && npm run test && npm pack --pack-destination ~`

cd to the project you want to test it on, and install:
`npm install --ignore-scripts -D ~/ministryofjustice-hmpps-npm-script-allowlist-xxx.tgz`

To test the init script:
`npx -p ~/ministryofjustice-hmpps-npm-script-allowlist-0.0.1-alpha.2.tgz hmpps-npm-script-allowlist`

To test the command directly:
`./node_modules/.bin/hmpps-npm-script-run-allowlist`
