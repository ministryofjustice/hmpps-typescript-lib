#!/bin/bash
#
# This runs as part of any `npm install` via `prepare`
# 

set -eo pipefail

startStage() {
  printf "%s" "$1"
}

endStage() {
  printf "%s\n" "$1"
}

printError() {
  printf "\x1b[1;31m%s\x1b[0m\n" "$1"
}

if [ "$CI" = "true" ]; then
  endStage "Not initialising precommit hooks in CI..."
  exit 0
fi 

# Initialise husky
node_modules/.bin/husky

# Check brew exists
if ! command -v brew &> /dev/null; then
  printError "Brew is not installed. You will need to install gitleaks separately and ensure it's on your PATH. exiting..."
  exit 0
fi

# Initialise gitleaks
if ! command -v gitleaks &> /dev/null; then
  startStage "Installing gitleaks"
  brew install gitleaks
  endStage " ✅ "
fi

