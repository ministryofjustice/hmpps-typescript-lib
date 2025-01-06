# Change log

## 0.0.1-beta.2

Patching:
  @eslint/js                         ^9.15.0  →  ^9.17.0
  @typescript-eslint/eslint-plugin   ^8.15.0  →  ^8.18.2
  @typescript-eslint/parser          ^8.15.0  →  ^8.18.2
  eslint                             ^9.15.0  →  ^9.17.0
  eslint-import-resolver-typescript   ^3.6.3  →   ^3.7.0
  eslint-plugin-cypress               ^4.0.0  →   ^4.1.0

## 0.0.1-beta.1

Initial beta

## 0.0.1-alpha.9

Pre-release for testing with HMPPS projects.
Updated dependencies should once again allow typescript to use `no-unused-expressions` and other rules.

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
