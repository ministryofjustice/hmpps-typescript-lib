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
if [ -f "node_modules/.bin/husky" ]; then
  startStage "Removing husky"
  npm uninstall husky
  endStage " ✅ "

  if [ -f ".husky/pre-commit" ]; then
    startStage "Deleting existing husky pre-commit hook"
    rm .husky/pre-commit
    endStage " ✅ "
  fi
fi

# Check brew exists
if ! command -v brew > /dev/null 2> /dev/null; then
  printError "Brew is not installed. You will need to install prek separately and ensure it's on your PATH. exiting..."
  exit 0
fi

# Install gitleaks if not present - this will be used by prek for secret scanning until we move over to devsecops hooks
if ! command -v gitleaks > /dev/null 2> /dev/null; then
  startStage "Installing gitleaks"
  brew install gitleaks
  endStage " ✅ "
fi

# Install prek
if ! command -v prek > /dev/null 2> /dev/null; then
  startStage "Installing prek"
  brew install prek
  endStage " ✅ "
fi

# Copy default-hooks.yaml to target location
SOURCE_HOOKS="./node_modules/@ministryofjustice/hmpps-precommit-hooks/default-hooks.yaml"
TARGET_HOOKS=".pre-commit-config.yaml"


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
