/**
 * Stylistic and formatting-focused universal rules.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
const stylisticRules = {
  // Enforce camelcase naming convention.
  // https://eslint.org/docs/latest/rules/camelcase
  camelcase: [
    'error',
    {
      properties: 'never',
      ignoreDestructuring: false,
    },
  ],

  // Enforce or disallow capitalization of the first letter of a comment.
  // https://eslint.org/docs/latest/rules/capitalized-comments
  'capitalized-comments': [
    'off',
    'never',
    {
      line: {
        ignorePattern: '.*',
        ignoreInlineComments: true,
        ignoreConsecutiveComments: true,
      },
      block: {
        ignorePattern: '.*',
        ignoreInlineComments: true,
        ignoreConsecutiveComments: true,
      },
    },
  ],

  // Enforce position of line comments.
  // https://eslint.org/docs/latest/rules/line-comment-position
  'line-comment-position': [
    'off',
    {
      position: 'above',
      ignorePattern: '',
      applyDefaultPatterns: true,
    },
  ],

  // Require or disallow newlines around directives.
  // https://eslint.org/docs/latest/rules/lines-around-directive
  'lines-around-directive': [
    'error',
    {
      before: 'always',
      after: 'always',
    },
  ],

  // Require or disallow an empty line between class members.
  // https://eslint.org/docs/latest/rules/lines-between-class-members
  'lines-between-class-members': [
    'error',
    'always',
    {
      exceptAfterSingleLine: false,
    },
  ],

  // Enforce a particular style for multiline comments.
  // https://eslint.org/docs/latest/rules/multiline-comment-style
  'multiline-comment-style': ['off', 'starred-block'],

  // Require or disallow an empty line after variable declarations.
  // https://eslint.org/docs/latest/rules/newline-after-var
  'newline-after-var': 'off',

  // Require an empty line before `return` statements.
  // https://eslint.org/docs/latest/rules/newline-before-return
  'newline-before-return': 'off',

  // Disallow `require` calls to be mixed with regular variable declarations.
  // https://eslint.org/docs/latest/rules/no-mixed-requires
  'no-mixed-requires': ['off', false],

  // Disallow multiline strings.
  // https://eslint.org/docs/latest/rules/no-multi-str
  'no-multi-str': 'error',

  // Disallow specified warning terms in comments.
  // https://eslint.org/docs/latest/rules/no-warning-comments
  'no-warning-comments': [
    'off',
    {
      terms: ['todo', 'fixme', 'xxx'],
      location: 'start',
    },
  ],

  // Require or disallow padding lines between statements.
  // https://eslint.org/docs/latest/rules/padding-line-between-statements
  'padding-line-between-statements': 'off',

  // Enforce sorted `import` declarations within modules.
  // https://eslint.org/docs/latest/rules/sort-imports
  'sort-imports': [
    'off',
    {
      ignoreCase: false,
      ignoreDeclarationSort: false,
      ignoreMemberSort: false,
      memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
    },
  ],

  // Require object keys to be sorted.
  // https://eslint.org/docs/latest/rules/sort-keys
  'sort-keys': [
    'off',
    'asc',
    {
      caseSensitive: false,
      natural: true,
    },
  ],

  // Require variables within the same declaration block to be sorted.
  // https://eslint.org/docs/latest/rules/sort-vars
  'sort-vars': 'off',

  // Enforce consistent spacing after the `//` or `/*` in a comment.
  // https://eslint.org/docs/latest/rules/spaced-comment
  'spaced-comment': [
    'error',
    'always',
    {
      line: {
        exceptions: ['-', '+'],
        markers: ['=', '!', '/'],
      },
      block: {
        exceptions: ['-', '+'],
        markers: ['=', '!', ':', '::'],
        balanced: true,
      },
    },
  ],

  // Require or disallow strict mode directives.
  // https://eslint.org/docs/latest/rules/strict
  strict: ['error', 'never'],

  // Require or disallow Unicode byte order mark (BOM).
  // https://eslint.org/docs/latest/rules/unicode-bom
  'unicode-bom': ['error', 'never'],

  // Require `var` declarations be placed at the top of their containing scope.
  // https://eslint.org/docs/latest/rules/vars-on-top
  'vars-on-top': 'error',

  // Require or disallow semicolons instead of ASI.
  // https://eslint.org/docs/latest/rules/semi
  semi: 0,

  // Require or disallow trailing commas.
  // https://eslint.org/docs/latest/rules/comma-dangle
  'comma-dangle': ['error', 'always-multiline'],

  // Run Prettier as an ESLint rule so formatting differences are reported by lint.
  // https://github.com/prettier/eslint-plugin-prettier#options
  'prettier/prettier': [
    'warn',
    {
      trailingComma: 'all',
      singleQuote: true,
      printWidth: 120,
      semi: false,
      arrowParens: 'avoid',
    },
  ],

  // Require or disallow method and property shorthand syntax for object literals.
  // https://eslint.org/docs/latest/rules/object-shorthand
  'object-shorthand': [
    'error',
    'always',
    {
      ignoreConstructors: false,
      avoidQuotes: true,
    },
  ],

  // Enforce variables to be declared either together or separately in functions.
  // https://eslint.org/docs/latest/rules/one-var
  'one-var': ['error', 'never'],

  // Require or disallow assignment operator shorthand where possible.
  // https://eslint.org/docs/latest/rules/operator-assignment
  'operator-assignment': ['error', 'always'],

  // Require or disallow "Yoda" conditions.
  // https://eslint.org/docs/latest/rules/yoda
  yoda: 'error',
}

export default stylisticRules
