# HMPPS typescript library

A set of shared utilities for use with typescript projects.
The `@ministryofjustice/hmpps-typescript-lib` package itself should not be installed.

## Using packages in your applications

See individual packages’ README.md

- @ministryofjustice/eslint-config-hmpps – ESLint rules for HMPPS typescript projects
- @ministryofjustice/hmpps-monitoring – Retrieve and display health and status information from external services and internal components

Some of these will be included in the [template project](https://github.com/ministryofjustice/hmpps-template-typescript)
and would be adopted automatically by new projects.

## Development

Sub-packages in this projects are built on node 24 and tested on node 20, 22 and 24.

npm scripts from the root all delegate to sub-packages:

```shell
npm run clean     # remove built artefacts
npm run build     # build artefacts
npm test          # run unit tests
npm run lint      # run lint checks
npm run lint-fix  # fix lint errors automatically where possible
npm run check-for-updates # run npm-check-updates across all packages
```

… and can be called within packages themselves:

```shell
npm test --workspace packages/monitoring
cd packages/monitoring && npm test
```

To verify the build run:
```
npm run clean && npm run build && npm run lint && npm test
```

TODO: document adding a new sub-package

### Publishing process

There is a Github actions pipeline to publish new releases of sub-packages.
When a new version needs to be released, these steps should be followed as part of the usual pull request process…

1. Make necessary changes to package(s).
2. Ensure the README.md and CHANGELOG.md files are correct.
3. Update version in package.json for the updated packages, _not_ the root project.
4. Create pull request, get it reviewed and merge into `main`.
5. Create a tag on the `main` branch for the pull request’s squashed merge commit.
   The tag name can be in the form `[package]-[version]`, but automation does not rely on this.
   So run `git fetch --tags` to get all the existing tags, `git tag` to list the tags and, for example, run

```shell
git tag clients-0.0.1-alpha.6
git push origin tag clients-0.0.1-alpha.6
```

6. On [Github](https://github.com/ministryofjustice/hmpps-typescript-lib/releases), create a new release from this tag.
   This kicks off the Github actions pipeline to publish changed packages to npmjs.com and as tarball attachments to the
   release itself.

TODO: ideally, we would use something like this automatically, however squashing commits leaves the tag dangling

```shell
npm version --workspace [package] [major | minor | prerelease --preid=pre]
```
