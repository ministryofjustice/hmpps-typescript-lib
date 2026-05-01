# Changesets

This directory stores changeset files for package releases.

When a change should affect one or more published packages, run:

```shell
npm run changeset
```

Commit the generated markdown file with the code change. The release workflow will use these files to create or update
the `Version Packages` pull request on `main`.
