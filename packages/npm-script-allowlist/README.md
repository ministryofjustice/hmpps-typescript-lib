# @ministryofjustice/hmpps-npm-allow-scripts

This package aims to restrict npm scripts from running unless as part of a predefined allowlist

## Status

**This library is currently: ready to trial.**
Teams are welcome to trial this library. Please provide feedback via slack to the `#typescript` channel.

## Migrating existing projects

#### Automatically installing the library

The package will self install and initialised by running via npx:
`npx @ministryofjustice/hmpps-npm-allow-scripts`

Note: The project needs to be initialised before use - solely adding the library will make no difference.
Once the project has been initialised, other developers should be able to develop against it without further configuration.

### How this works


A developer would configure a frontend service by running `npx @ministryofjustice/hmpps-npm-script-allowlist`

This:
* Sets some sensible defaults in .npmrc to prevent execution of scripts 
* Installs the package 
* Adds a default configuration file
* Adds a new script called `setup`
* Runs the tool, which will likely fail allowing the developer to complete configuration

Developers would then: 
`npm install` to install packages but does not execute any scripts
`npm run setup` runs `npm ci` (without scripts) and then executes scripts in this package to execute only those allowlisted scripts 

A manual step is required to move CI over to use `npm run setup` instead of `npm ci`

## Configuration

Configuring the tool consist of altering `./allowed-scripts.mjs` and setting `ALLOW `or `FORBID` entries in the `allowed-scripts.mjs`:
```
import configureAllowedScripts from '@ministryofjustice/hmpps-npm-script-allowlist/index.mjs'

export default configureAllowedScripts({
   allowlist: {
      "node_modules/@parcel/watcher@2.5.1": "ALLOW",
      "node_modules/cypress@14.5.4": "FORBID",
      "node_modules/dtrace-provider@0.8.8": "ALLOW",
      "node_modules/fsevents@2.3.3": "FORBID",
      "node_modules/unrs-resolver@1.11.1": "ALLOW"
   },
})
```

(The tool will play back the configuration and highlight versions which need to be added.) 

## Doesn't lavamoat do the same thing?

This is heavily inspired by [lavamoat's allowscripts](https://github.com/LavaMoat/LavaMoat/tree/main/packages/allow-scripts).

This works slightly differently: 
* Scripts need to be explicitly configured either to be included or not or the script will fail
* This uses the explicit version in the package-lock.json to key whether a script should run or not, rather than just the name of the package

Example output:
```
Reading configuration from some-project/.allowed-scripts.mjs

Current configuration: {
  "node_modules/@parcel/watcher@2.5.1": "RUN",
  "node_modules/cypress@14.5.3": "<REMOVED>",
  "node_modules/cypress@14.5.4": "<MISSING>",
  "node_modules/dtrace-provider@0.8.8": "RUN",
  "node_modules/fsevents@2.3.3": "<MISSING>",
  "node_modules/unrs-resolver@1.11.1": "RUN"
}

ACTION REQUIRED:
Explicitly ALLOW/FORBID the following:

 * node_modules/cypress@14.5.4 (package published: 2025-08-07 18:35)
        scripts:
          postinstall: node dist/index.js --exec install

 * node_modules/fsevents@2.3.3 (package published: 2023-08-21 17:24)
        scripts:
          install: node-gyp rebuild

ACTION REQUIRED:
Remove configuration for the following packages as they are no longer present:

 * node_modules/cypress@14.5.3

Copy the "Current Configuration" from above and use it to update: some-project/.allowed-scripts.mjs.
 * Remove any entries that are <REMOVED>
 * Evaluate any entries marked <MISSING>. ALLOW or FORBID depending on whether these entries have scripts that are safe and required to run.
 ```

### Testing

Export a local package:
`npm run lint && npm run build && npm run test && npm pack --pack-destination ~`

cd to the project you want to test it on, and install:
`npm install --ignore-scripts -D ~/ministryofjustice-hmpps-npm-script-allowlist-xxx.tgz`

To test the init script:
`npx -p ~/ministryofjustice-hmpps-npm-script-allowlist-0.0.1-alpha.2.tgz hmpps-npm-script-allowlist`

To test the command directly:
`./node_modules/.bin/hmpps-npm-script-run-allowlist`
