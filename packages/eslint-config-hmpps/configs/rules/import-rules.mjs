/**
 * Shared import rule overrides.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
const importRules = {
  // Ensure all imports appear before other statements.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/first.md
  'import/first': 'error',

  // Enforce a newline after import statements.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/newline-after-import.md
  'import/newline-after-import': 'error',

  // Forbid import of modules using absolute paths.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-absolute-path.md
  'import/no-absolute-path': 'error',

  // Forbid AMD `require` and `define` calls.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-amd.md
  'import/no-amd': 'error',

  // Forbid a module from importing a module with a dependency path back to itself.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-cycle.md
  'import/no-cycle': ['error', { maxDepth: '∞' }],

  // Forbid `require()` calls with expressions.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-dynamic-require.md
  'import/no-dynamic-require': 'error',

  // Forbid import statements with CommonJS module.exports.
  // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-import-module-exports.md
  'import/no-import-module-exports': ['error', { exceptions: [] }],

  // Forbid the use of mutable exports with `var` or `let`.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-mutable-exports.md
  'import/no-mutable-exports': 'error',

  // Forbid named default exports.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-named-default.md
  'import/no-named-default': 'error',

  // Forbid importing packages through relative paths.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-relative-packages.md
  'import/no-relative-packages': 'error',

  // Forbid a module from importing itself.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-self-import.md
  'import/no-self-import': 'error',

  // Forbid unnecessary path segments in import and require statements.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-useless-path-segments.md
  'import/no-useless-path-segments': ['error', { commonjs: true }],

  // Forbid webpack loader syntax in imports.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-webpack-loader-syntax.md
  'import/no-webpack-loader-syntax': 'error',

  // Enforce a convention in module import order.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/order.md
  'import/order': ['error', { groups: [['builtin', 'external', 'internal']] }],

  // Enforce a leading comment with the webpackChunkName for dynamic imports.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/dynamic-import-chunkname.md
  'import/dynamic-import-chunkname': ['off', { importFunctions: [], webpackChunknameFormat: '[0-9a-zA-Z-_/.]+' }],

  // Ensure all exports appear after other statements.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/exports-last.md
  'import/exports-last': 'off',

  // Prefer named exports to be grouped together in a single export declaration.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/group-exports.md
  'import/group-exports': 'off',

  // Enforce the maximum number of dependencies a module can have.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/max-dependencies.md
  'import/max-dependencies': ['off', { max: 10 }],

  // Forbid anonymous values as default exports.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-anonymous-default-export.md
  'import/no-anonymous-default-export': [
    'off',
    {
      allowArray: false,
      allowArrowFunction: false,
      allowAnonymousClass: false,
      allowAnonymousFunction: false,
      allowLiteral: false,
      allowObject: false,
    },
  ],

  // Forbid CommonJS `require` calls and `module.exports` or `exports.*`.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-commonjs.md
  'import/no-commonjs': 'off',

  // Forbid default exports.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-default-export.md
  'import/no-default-export': 'off',

  // Forbid imported names marked with `@deprecated` documentation tag.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-deprecated.md
  'import/no-deprecated': 'off',

  // Forbid importing the submodules of other modules.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-internal-modules.md
  'import/no-internal-modules': ['off', { allow: [] }],

  // Forbid named exports.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-named-export.md
  'import/no-named-export': 'off',

  // Forbid namespace (a.k.a. "wildcard" `*`) imports.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-namespace.md
  'import/no-namespace': 'off',

  // Forbid Node.js builtin modules.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-nodejs-modules.md
  'import/no-nodejs-modules': 'off',

  // Forbid importing modules from parent directories.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-relative-parent-imports.md
  'import/no-relative-parent-imports': 'off',

  // Enforce which files can be imported in a given folder.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-restricted-paths.md
  'import/no-restricted-paths': 'off',

  // Forbid unassigned imports.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-unassigned-import.md
  'import/no-unassigned-import': 'off',

  // Forbid modules without exports, or exports without matching import in another module.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-unused-modules.md
  'import/no-unused-modules': ['off', { ignoreExports: [], missingExports: true, unusedExports: true }],

  // Prefer a default export if module exports a single name or multiple names.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/prefer-default-export.md
  'import/prefer-default-export': 'error',

  // Forbid potentially ambiguous parse goal (`script` vs. `module`).
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/unambiguous.md
  'import/unambiguous': 'off',

  // Ensure named imports correspond to a named export in the remote file.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/named.md
  'import/named': 0,

  // Forbid use of exported name as property of default export.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-named-as-default-member.md
  'import/no-named-as-default-member': 0,

  // Ensure imports point to a file/module that can be resolved.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-unresolved.md
  'import/no-unresolved': 'error',

  // Ensure consistent use of file extension within the import path.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/extensions.md
  'import/extensions': [
    'error',
    'ignorePackages',
    {
      js: 'never',
      mjs: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never',
    },
  ],

  // Forbid the use of extraneous packages.
  // https://github.com/import-js/eslint-plugin-import/blob/v2.32.0/docs/rules/no-extraneous-dependencies.md
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: [
        // unit test mixed in with application code
        '**/*.test.js',
        '**/*.test.ts',
        '**/test/**',

        // integration tests
        'integration_tests/**',

        // test utilities
        '**/testutils/**',

        // tooling config
        'cypress.config.ts',
        'eslint.config.mjs',
        'playwright.config.ts',
        '.allowed-scripts.mjs',

        // build tools
        'esbuild/**',
      ],
    },
  ],
}

export default importRules
