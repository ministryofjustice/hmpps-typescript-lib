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

printError() {
  printf "\x1b[1;31m%s\x1b[0m\n" "$1"
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

if ! npm list "@ministryofjustice/hmpps-npm-script-allowlist@$VERSION" > /dev/null 2>&1; then
  startStage "  * Installing @ministryofjustice/hmpps-npm-script-allowlist@$VERSION"
  npm install --save-dev "@ministryofjustice/hmpps-npm-script-allowlist@$VERSION"
  endStage " ✅"
else
  endStage "  * @ministryofjustice/hmpps-npm-script-allowlist already installed ✅"
fi

startStage "  * Running allow scripts"
npm run setup
endStage "  ✅"

endStage "FIN!"
