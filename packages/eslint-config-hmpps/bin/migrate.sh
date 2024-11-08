#!/usr/bin/env bash

set -euo pipefail

if ! [ -f ./package.json ]; then
  printf "\x1b[1;31mNot in a node project! exiting...\x1b[0m\n"
  exit 1
fi

printStage() {
  printf "\x1b[1;97m$1\x1b[0m\n"
}

printStage "Migrating project:"

printStage "* Deleting old eslint config"
rm -f .eslintignore .eslintrc.json

printStage "* Create new config"
[ -e eslint.config.mjs ] || cat > eslint.config.mjs <<EOL
import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

export default hmppsConfig()
EOL

printStage "* Uninstalling old eslint dependencies"
npm uninstall @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-airbnb-base eslint-config-prettier eslint-import-resolver-typescript eslint-plugin-cypress eslint-plugin-import eslint-plugin-no-only-tests eslint-plugin-prettier

printStage "* Installing shared library"
npm install --save-dev @ministryofjustice/eslint-config-hmpps

printStage "* Checking new linting config"
npm run lint -- --fix
