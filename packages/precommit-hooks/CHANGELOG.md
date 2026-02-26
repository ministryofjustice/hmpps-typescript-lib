# Change log

## 2.0.2

Change default precommit config to run linting, typechecks and tests if the package-lock.json file changes 

## 2.0.1

Fixing config.toml location 

## 2.0.0

### Breaking Changes

- **Migrated from Husky to prek (pre-commit)** for managing git hooks
  - Husky is automatically uninstalled during `npm install` if present
  - Existing husky hooks are automatically removed
  - prek is installed via Homebrew
  - installs and configures [devsecops-hooks](https://github.com/ministryofjustice/devsecops-hooks) by default 
  
### New Features

- Added `.pre-commit-config.yaml` configuration file with default hooks
- Configuration file is only created if it doesn't exist, preserving custom configurations
- Added automatic cleanup of legacy precommit scripts (`precommit:secrets`, `precommit:lint`, `precommit:verify`) from package.json

### Changes

- `prepare` script now installs prek instead of configuring husky
- Hooks are now managed through `.pre-commit-config.yaml` instead of husky scripts

## 1.0.2

Fix versions, accidentally mixed 1.0.0 and 0.1.0

## 0.1.0

Move to node 24

## 0.0.4

Reading `.gitleaksignore` from the correct location.
Previously it was assuming `.gitleaksignore` would be in the project root directory rather than in the `.gitleaks` directory.

## 0.0.3

Remove pipefail from prepare script

## 0.0.2

Fix issue with alpine not having bash installed.
Also providing ability to disable running script inside docker

## 0.0.1

Initial release

## 0.0.1-alpha.1

Pre-releases which should not be used in projects.
