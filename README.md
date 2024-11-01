# HMPPS typescript library

A set of shared utilities for use with typescript projects.
The `@ministryofjustice/hmpps-typescript-lib` package itself should not be installed.

## Using packages in your applications

See individual packages’ README.md

TODO: list what is available

## Development

TODO: list useful npm scripts, best practice, how to add new sub-packages

### Publishing process

TODO: document this better once we have trialled it

When a new version needs to be released, these steps should be followed as part of the usual pull request process…

1) Make necessary changes to package(s), making sure the README.md and CHANGELOG.md files are correct.
2) Update version in package.json for the updated packages, _not_ the root project.
3) Create pull request and review as usual.
4) Create a tag on the `main` branch for the pull request’s squashed merge commit.
   This is important! The publish process relies one the last commit to determine which packages have changed.
   The tag name can be in the form `[package]-[version]`, but automation does not rely on this.
5) On Github, create a new release from this tag. This kicks off the Github actions pipeline to publish changed packages
   to npmjs.com and as tarball attachments to the release.

TODO: ideally, we would use something like this automatically, however squashing commits leaves the tag dangling
```shell
npm version --workspace [package] [major | minor | prerelease --preid=pre]
```
