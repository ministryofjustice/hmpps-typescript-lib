# Change log

## 0.0.3

Patching:
 @typescript-eslint/eslint-plugin   ^8.38.0  →  ^8.39.0
 @typescript-eslint/parser          ^8.38.0  →  ^8.39.0
 eslint-plugin-prettier              ^5.5.3  →   ^5.5.4

## 0.0.2

Patching:
 @eslint/js                         ^9.29.0  →  ^9.32.0
 @types/eslint__js                  ^9.14.0  →  removed
 @typescript-eslint/eslint-plugin   ^8.34.1  →  ^8.38.0
 @typescript-eslint/parser          ^8.34.1  →  ^8.38.0
 eslint                             ^9.29.0  →  ^9.32.0
 eslint-config-prettier             ^10.1.5  →  ^10.1.8
 eslint-import-resolver-typescript   ^4.4.3  →   ^4.4.4
 eslint-plugin-import               ^2.31.0  →  ^2.32.0
 eslint-plugin-prettier              ^5.5.0  →   ^5.5.3
 globals                             16.2.0  →   16.3.0

## 0.0.1

Initial release

 @eslint/eslintrc                     3.2.0  →    3.3.1
 @eslint/js                         ^9.18.0  →  ^9.29.0
 @types/eslint__eslintrc             ^2.1.2  →   ^3.3.0
 @types/eslint__js                  ^8.42.3  →  ^9.14.0
 @types/semver                       ^7.5.8  →   ^7.7.0
 @typescript-eslint/eslint-plugin   ^8.20.0  →  ^8.34.1
 @typescript-eslint/parser          ^8.20.0  →  ^8.34.1
 eslint                             ^9.18.0  →  ^9.29.0
 eslint-config-prettier             ^10.0.1  →  ^10.1.5
 eslint-import-resolver-typescript   ^3.7.0  →   ^4.4.3
 eslint-plugin-cypress               ^4.1.0  →   ^5.1.0
 eslint-plugin-prettier              ^5.2.2  →   ^5.5.0
 globals                            15.14.0  →   16.2.0
 semver                              ^7.6.3  →   ^7.7.2

## 0.0.1-beta.2

Patching:
  @eslint/js                         ^9.15.0  →  ^9.18.0
  @typescript-eslint/eslint-plugin   ^8.15.0  →  ^8.20.0
  @typescript-eslint/parser          ^8.15.0  →  ^8.20.0
  eslint                             ^9.15.0  →  ^9.17.0
  eslint-import-resolver-typescript   ^3.6.3  →   ^3.7.0
  eslint-plugin-cypress               ^4.0.0  →   ^4.1.0
  eslint-config-prettier              ^9.1.0  →  ^10.0.1


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
