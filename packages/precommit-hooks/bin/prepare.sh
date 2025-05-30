#!/bin/bash
#
# This runs as part of any `npm install` via `prepare`
# 

set -euo pipefail

startStage() {
  printf "\x1b[1;97m%s\x1b[0m" "$1"
}

endStage() {
  printf "\x1b[1;97m%s\x1b[0m\n" "$1"
}

printError() {
  printf "\x1b[1;31m%s\x1b[0m\n" "$1"
}

# Initialise husky
node_modules/.bin/husky

# Check brew exists
if ! command -v brew &> /dev/null; then
  printError "Brew is not installed, WARNING: no precommit hook protection. exiting..."
  exit 0
fi

# Initialise gitleaks
if ! command -v gitleaks &> /dev/null; then
  startStage "Installing gitleaks"
  brew install gitleaks
  endStage " ✅ "
fi

