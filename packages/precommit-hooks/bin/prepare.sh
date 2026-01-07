#!/bin/sh
#
# This runs as part of any `npm install` via `prepare`
# 

set -e

startStage() {
  printf "%s" "$1"
}

endStage() {
  printf "%s\n" "$1"
}

printError() {
  printf "\x1b[1;31m%s\x1b[0m\n" "$1"
}

if [ "$CI" = "true" ] || [ "$SKIP_PRECOMMIT_INIT" = "true" ]; then
  endStage "Not initialising precommit hooks..."
  exit 0
fi 


# Remove husky if installed
if [ -f ".husky/pre-commit" ]; then
  startStage "Removing husky"
  npm uninstall husky
  endStage " ✅ "

  startStage "Deleting existing husky pre-commit hooks"
  rm -Rf .husky
  endStage " ✅ "
fi

# Check brew exists
if ! command -v brew > /dev/null 2> /dev/null; then
  printError "Brew is not installed. You will need to install prek separately and ensure it's on your PATH. exiting..."
  exit 0
fi

# Install prek
if ! command -v prek > /dev/null 2> /dev/null; then
  startStage "Installing prek"
  brew install prek
  endStage " ✅ "
fi

SOURCE_HOOKS="./node_modules/@ministryofjustice/hmpps-precommit-hooks/default-hooks.yaml"
TARGET_HOOKS=".pre-commit-config.yaml"

# Copy default-hooks.yaml to target location for first time initialisation only
if [ ! -f "$TARGET_HOOKS" ]; then
  startStage "Creating .pre-commit-config.yaml"
  cp "$SOURCE_HOOKS" "$TARGET_HOOKS"
  endStage " ✅ "
  
  startStage "Deleting existing precommit scripts"
  npm pkg --silent delete scripts.precommit:secrets
  npm pkg --silent delete scripts.precommit:lint
  npm pkg --silent delete scripts.precommit:verify
  endStage " ✅ "
fi

startStage "Initialising prek hooks on this repo"
git config --unset-all --local core.hooksPath || true
prek install
endStage " ✅ "
