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

printStage "* NOT IMPLEMENTED YET"
