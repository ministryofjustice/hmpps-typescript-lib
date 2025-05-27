#!/bin/bash
#
# Used to install husky with gitleaks
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

endStage "Setting up precommit hooks" 
endStage "Checking prerequisites..." 

cd ../../..

if ! [ -f ./package.json ]; then
  printError "Not in a node project! exiting!"
  exit 1
fi

if ! command -v brew &> /dev/null; then
  printError "Brew is not installed, WARNING: no precommit hook protection. exiting..."
  exit 0
fi
  
endStage "  * brew installed ✅"

if ! command -v gitleaks &> /dev/null; then
  startStage "Installing gitleaks"
  brew install gitleaks
  endStage " ✅ "
else
  endStage "  * gitleaks already installed ✅ "
fi


if ! npm list husky > /dev/null 2>&1; then
  startStage "  * Installing husky"
  npm install --save-dev husky
  endStage " ✅"
else
  endStage "  * husky already installed ✅"
fi

startStage "  * Running husky"
node_modules/.bin/husky
endStage " ✅"

endStage "Installing precommit hooks..."

if [ "$(npm pkg get scripts.precommit:secrets)" != "undefined" ]; then
  startStage "  * Adding npm scripts"
  npm pkg set scripts.precommit:secrets="gitleaks git --pre-commit --redact --staged --verbose" 
  npm pkg set scripts.precommit:lint="node_modules/.bin/lint-staged"
  npm pkg set scripts.precommit:verify="npm run typecheck && npm test"
  endStage " ✅"
else 
  endStage "  * Precommit scripts already installed ✅"
fi

startStage "  * Setting precommit hook"
mkdir -p .husky
printf "%s\n" \
     "#!/bin/bash" \
     "NODE_ENV=dev \\" \
     "npm run precommit:secrets \\" \
     "&& npm run precommit:lint \\" \
     "&& npm run precommit:verify" \
       > .husky/pre-commit
endStage " ✅"

startStage "  * Setting prepare script"
npm pkg set scripts.prepare="hmpps-precommit-hooks" 
endStage "  ✅"

endStage "FIN!"
