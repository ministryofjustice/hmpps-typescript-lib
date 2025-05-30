# @ministryofjustice/precommit-hooks

This package aims to automatically install and configure husky with gitleaks to help catch potential secrets before committing them to github.

## Status

This library is in alpha. Teams are free to use this library but further breaking changes may occur.

## Migrating existing projects

#### Automatically installing the library

The package will self install and initialised by running via npx:
`npx @ministryofjustice/precommit-hooks`

Note: The project needs to be initialised before use - solely adding the library will make no difference.
Once the project has been initialised, other developers should be able to develop against it without further configuration.

### How this works

Initialising will add new precommit scripts and a new prepare script in `package.json`:

```json
"scripts": {
     //...
    "prepare": "hmpps-precommit-hooks",
    "precommit:secrets": "gitleaks git --pre-commit --redact --staged --verbose",
    "precommit:lint": "node_modules/.bin/lint-staged",
    "precommit:verify": "npm run typecheck && npm test"
}
```

It will also configure a husky precommit hook using these scripts:

```sh
#!/bin/bash
NODE_ENV=dev \
npm run precommit:secrets \
&& npm run precommit:lint \
&& npm run precommit:verify
```

The prepare script will trigger on any install and ensure that `gitleaks` is installed and `husky` is initiated.

Note: `gitleaks` is installed by `brew`, if `brew` is not available then `prepare` will currently fail loudly and display a message.

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

### Testing that hooks are configured correctly

Secret protection can be tested using the following command:

```bash
npx -p @ministryofjustice/precommit-hooks -c test-secret-protection
```

This should fail similarly to:

```bash
> npx -p @ministryofjustice/precommit-hooks -c test-secret-protection
Creating test file containing dummy AWS_KEY=AKIA<SOME-VALUE>ASD
Attempting to commit file containing secret

> some-project@0.0.1 precommit:secrets
> gitleaks git --pre-commit --redact --staged --verbose


    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

Finding:     fake_aws_key=REDACTED
Secret:      REDACTED
RuleID:      aws-access-token
Entropy:     3.546439
File:        demo-password.txt
Line:        1
Fingerprint: demo-password.txt:aws-access-token:1

12:49PM INF 1 commits scanned.
12:49PM INF scanned ~34 bytes (34 bytes) in 20.7ms
12:49PM WRN leaks found: 1
```

(This will create a `./demo-password.txt` file that will need to be deleted separately)
