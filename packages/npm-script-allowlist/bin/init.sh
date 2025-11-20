#!/bin/bash
#
# Executed via npx to add and configure the library 
# 

set -euo pipefail

startStage() {
  printf "%s" "$1"
}

endStage() {
  printf "%s\n" "$1"
}

endStage "Setting up hmpps npm script locker" 

startStage "  * Adding/overwriting .npmrc script"
printf "%s\n" \
     "# This provides sensible defaults, this can be customised if necessary and changes will not be overwritten" \
     "" \
     "# Prevent preinstall, install, postinstall scripts from running by default" \
     "ignore-scripts = true" \
     "" \
     "# Use exact versions in package.json when using npm install <pkg>" \
     "save-exact = true" \
     "" \
     "# Fail if trying to use incorrect version of npm" \
     "engine-strict = true" \
     "" \
     "# Show any output of scripts in the console " \
     "foreground-scripts = true" \
       > .npmrc
endStage "  ✅"

startStage "  * Adding default configuration file: .allowed-scripts.mjs"
printf "%s\n" \
     "import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'" \
     "" \
     "export default configureAllowedScripts({" \
     "   allowlist: {" \
     "   }," \
     "})" \
     > .allowed-scripts.mjs
endStage "  ✅"

startStage "  * Adding set up script"
npm pkg set --silent scripts.setup="npm ci && hmpps-npm-script-run-allowlist" 
endStage "  ✅"

VERSION=$(npm show --json  @ministryofjustice/hmpps-npm-script-allowlist | jq -r '.version')

startStage "  * Installing @ministryofjustice/hmpps-npm-script-allowlist@$VERSION"
npm install --save-dev "@ministryofjustice/hmpps-npm-script-allowlist@$VERSION"
endStage " ✅"

startStage "  * Performing initial run of hmpps-npm-script-run-allowlist"
./node_modules/.bin/hmpps-npm-script-run-allowlist
endStage "  ✅"

endStage "NOTE: You will need to manually update your Dockerfile and CI to run \"npm run setup\" rather than \"npm ci\" 🚧"

endStage "FIN!"
