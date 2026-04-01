# Change log

## 0.0.1-alpha.5

Move to node 24

 @npmcli/run-script  ^10.0.0 →  ^10.0.2

## 0.0.1-alpha.1

Pre-releases which should not be used in projects.

## 0.0.1

Initial release

## 0.0.2

Adding prepare script to default allowed scripts - this required locally for husky precommit hooks

## 0.0.3

Fixing issue where it errored when trying to retrieve info for nested packages

## 0.0.4

Add support for allowing/forbidding all versions, or a range of versions, for a package.

For example,
```js
export default configureAllowedScripts({
  allowlist: {
    'package-a': 'FORBID',       // forbid all versions of package-a
    'package-b@^1.0.0': 'ALLOW', // allow 1.x versions of package-b
    'package-c@1.2.3': 'ALLOW',  // allow specific version of package-c (same as before)
  }
})
```
