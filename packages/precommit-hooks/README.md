# @ministryofjustice/hmpps-precommit-hooks

This package aims to automatically install and configure pre-commit hooks using [prek](https://github.com/pre-commit/pre-commit) to help catch potential secrets and code quality issues before committing them to github.

This uses devsecops-hooks to run gitleaks - further information about it's use can be found [here](https://github.com/ministryofjustice/devsecops-hooks).

## Status

**This library is currently: ready to adopt.**
Teams are encouraged to use this library. Please provide feedback via slack to the `#typescript` channel.

## Migration from Husky

This package has migrated from using Husky to using [prek](https://github.com/pre-commit/pre-commit) (pre-commit) for managing git hooks. The migration will happen automatically during `npm install` via a prepare hook:

- Husky will be uninstalled if present
- Existing husky hooks will be removed
- prek will be installed via Homebrew (if not already installed)
- A `.pre-commit-config.yaml` file will be created with the default hooks configuration

## Migrating existing projects

#### Automatically installing the library

The package will self install and initialised by running via npx:
`npx @ministryofjustice/hmpps-precommit-hooks`

Note: The project needs to be initialised before use - solely adding the library will make no difference.
Once the project has been initialised, other developers should be able to develop against it without further configuration.

### How this works

Initialising will add a new prepare script in `package.json`:

```json
"scripts": {
     //...
    "prepare": "hmpps-precommit-hooks"
}
```

The package will create a `.pre-commit-config.yaml` file in your project root that configures the hooks to run:

```yaml
HMPPS_HOOKS_VERSION: 1

repos:
  - repo: https://github.com/ministryofjustice/devsecops-hooks
    rev: v1.4.1
    hooks:
      - id: baseline
    env:
      GITLEAKS_CONFIGURATION_FILE: ./.gitleaks/gitleaks.toml
      GITLEAKS_IGNORE_FILE: ./.gitleaks/.gitleaksignore

  - repo: local
    hooks:
      - id: lint
        name: linting code
        language: system
        entry: npm run lint
      - id: typecheck
        name: verify types
        language: system
        entry: npm run typecheck
      - id: test
        name: running tests
        language: system
        entry: npm run test
  - repo: builtin
    hooks:
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-json
      - id: check-yaml
      - id: check-merge-conflict
```

The prepare script will trigger on any install and ensure that `prek` (pre-commit) is installed via Homebrew.

Note: `prek` is installed by `brew`. If `brew` is not available, `prepare` will display a message indicating you need to install prek manually.

**Important:** The `.pre-commit-config.yaml` file will only be created if it doesn't exist. Once created, it will not be overwritten, allowing you to customize hooks for your project's needs. Legacy precommit scripts (`precommit:secrets`, `precommit:lint`, `precommit:verify`) will be automatically removed from `package.json` when the config file is created.

### Prevent precommit script initialising on prepare

To disable the tool running on `npm install` and initialising prek, you can pass the `SKIP_PRECOMMIT_INIT=true` env var.

### Customizing hooks

You can modify the `.pre-commit-config.yaml` file in your project to:

- Add additional hooks
- Remove hooks that don't apply to your project
- Modify hook configurations
- Add hooks from external repositories

See the [pre-commit documentation](https://pre-commit.com/) for more details on hook configuration.

Also see [here](https://github.com/ministryofjustice/devsecops-hooks) for more information about the devsecops-hooks.

### Dealing with false positives

When a secret is detected, gitleaks will create a fingerprint. If the secret is a false positive then this can be added to the `./gitleaks/.gitleaksignore` to exclude from future scans.

Alternatively you can add a gitleaks:allow comment to a line to ignore a secret on it. Eg:

```
my_secret = 'some-secret'  #gitleaks:allow
```

### Adding custom rules

HMPPS wide rules can be added to `.config.toml` in this project so that it can be picked up by teams when they upgrade to the next released version of this library.

Repo specific rules can be added by teams in `.gitleaks/config.toml` in their individual repos.

See the gitleaks documentation for how to create rules and [examples](https://github.com/gitleaks/gitleaks/blob/master/config/gitleaks.toml) or use the [online rule wizard](https://gitleaks.io/playground).

### Keeping up to date

`prek auto-update` can be used to pull in later versions of hooks.

Also, a manager can be added to your renovate.json config to allow renovate to raise PRs to keep hooks up to date:

```json
  {
    "matchManagers": ["pre-commit"],
    "groupName": "all pre-commit dependencies"
  }
```

### Running hooks manually

You can run all hooks manually using:

```bash
prek run --all-files
```

Or run specific hooks:

```bash
prek run baseline
prek run lint
```

### Testing that hooks are configured correctly

Secret protection can be tested using the following command:

```bash
npx -p @ministryofjustice/hmpps-precommit-hooks -c test-secret-protection
```

This should fail similarly to:

```bash
> npx -p @ministryofjustice/hmpps-precommit-hooks -c test-secret-protection
Creating test file containing dummy key: 'fake_key=sk-2949185920abcdef'
Attempting to commit file containing secret
🔐 Ministry of Justice - Scanner.........................................Failed
- hook id: baseline
- duration: 1.63s
- exit code: 1

  ⚡️ Ministry of Justice - Scanner 1.4.0 ⚡️


      ○
      │╲
      │ ○
      ○ ░
      ░    gitleaks

  Finding:     fake_key=REDACTED
  Secret:      REDACTED
  RuleID:      generic-api-key
  Entropy:     3.892407
  File:        demo-password.txt
  Line:        1
  Fingerprint: demo-password.txt:generic-api-key:1

  9:51AM INF 0 commits scanned.
  9:51AM INF scanned ~4868 bytes (4.87 KB) in 350ms
  9:51AM WRN leaks found: 1
linting code.........................................(no files to check)Skipped
verify types.........................................(no files to check)Skipped
running tests........................................(no files to check)Skipped
fix end of files.........................................................Passed
trim trailing whitespace.................................................Passed
check json...............................................................Passed
check yaml...............................................................Passed
check for merge conflicts................................................Passed
```

(This will create a `./demo-password.txt` file that will need to be deleted separately)
