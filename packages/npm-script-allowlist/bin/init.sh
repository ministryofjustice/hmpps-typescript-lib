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
     "import configureAllowedScripts from '@ministryofjustice/hmpps-npm-script-allowlist'" \
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

startStage "  * Installing shared library"
npm install --silent --save-dev @ministryofjustice/hmpps-npm-script-allowlist
endStage "  ✅"

startStage "  * Running allow scripts"
npm run setup
endStage "  ✅"

# Could also add...
# * add preinstall script which always fails if scripts are called as part of the npm lifecycle 
#     - pkg set --silent  scripts.preinstall:"echo \"Run npm run setup to install run allowed lifecycle scripts\" && exit 1", 

endStage "FIN!"
