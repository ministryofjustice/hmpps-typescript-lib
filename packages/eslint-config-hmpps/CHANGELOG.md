# History of changes

## 0.0.1-alpha.8

Pre-release for testing with HMPPS projects.
Fixed js doc annotation to help with auto-complete 

## 0.0.1-alpha.7

Pre-release for testing with HMPPS projects.
Updated eslint rules to:

- separate globals into non-frontend, frontend, unit test and integration test groups.
- downgrade `prettier` eslint rules to warning because they make _typing_ code rather painful.
  NB: warnings will still fail lint checks so this is just a quality-of-life change.
- re-add `eslint-plugin-cypress` plugin

## 0.0.1-alpha.6

Pre-release for testing with HMPPS projects.
eslint rules are now exported as a function which make some common customisations simpler.
Migration has been made simpler for existing projects using:

```shell
npx @ministryofjustice/eslint-config-hmpps
```

## 0.0.1-alpha.5

Initial pre-release for testing with HMPPS projects.

## 0.0.1-alpha.1 to 0.0.1-alpha.4

Pre-releases which should not be used in projects.
