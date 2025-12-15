#!/bin/bash
#
# Used to install prek with gitleaks
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

endStage "Setting up precommit hooks" 

if ! [ -f ./package.json ]; then
  printError "Not a node project: $(pwd)! exiting!"
  exit 1
fi

startStage "  * Setting prepare script"
npm pkg set --silent scripts.prepare="hmpps-precommit-hooks-prepare" 
endStage "  ✅"

if npm list husky > /dev/null 2>&1; then
  startStage "  * Uninstalling husky"
  npm uninstall --silent husky
  endStage " ✅"
fi

if ! npm list @ministryofjustice/hmpps-precommit-hooks > /dev/null 2>&1; then
  startStage "  * Installing @ministryofjustice/hmpps-precommit-hooks"
  npm install --silent --save-dev @ministryofjustice/hmpps-precommit-hooks
  endStage " ✅"
else
  endStage "  * @ministryofjustice/hmpps-precommit-hooks already installed ✅"
  # Run npm install to trigger prepare script
  npm --silent  install
fi

# Copy default-hooks.yaml to target location
SOURCE_HOOKS="./node_modules/@ministryofjustice/hmpps-precommit-hooks/default-hooks.yaml"
TARGET_HOOKS=".pre-commit-config.yaml"

startStage "Creating .pre-commit-config.yaml"
cp "$SOURCE_HOOKS" "$TARGET_HOOKS"
endStage " ✅ "

startStage "  * Creating .gitleaksignore "
mkdir -p .gitleaks
echo "# The Fingerprint of false positive alerts can be added here to be excluded from future scans." >  .gitleaks/.gitleaksignore
endStage " ✅"

startStage "  * Creating project gitleaks config"
printf "%s\n" \
     "title = \"HMPPS Gitleaks configuration\"" \
     "[extend]" \
     "path = \"./node_modules/@ministryofjustice/hmpps-precommit-hooks/config.toml\"" \
       > .gitleaks/config.toml
endStage " ✅"

endStage "FIN!"
