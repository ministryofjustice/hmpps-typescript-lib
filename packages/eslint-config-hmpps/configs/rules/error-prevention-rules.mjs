/**
 * Error-prevention and runtime-safety universal rules.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
const errorPreventionRules = {
  // Enforce `return` statements in callbacks of array methods.
  // https://eslint.org/docs/latest/rules/array-callback-return
  'array-callback-return': [
    'error',
    {
      allowImplicit: true,
    },
  ],

  // Enforce the use of variables within the scope they are defined.
  // https://eslint.org/docs/latest/rules/block-scoped-var
  'block-scoped-var': 'error',

  // Require `return` statements to either always or never specify values.
  // https://eslint.org/docs/latest/rules/consistent-return
  'consistent-return': 'error',

  // Require the use of `===` and `!==`.
  // https://eslint.org/docs/latest/rules/eqeqeq
  eqeqeq: [
    'error',
    'always',
    {
      null: 'ignore',
    },
  ],

  // Require `for-in` loops to include an `if` statement.
  // https://eslint.org/docs/latest/rules/guard-for-in
  'guard-for-in': 'error',

  // Disallow deprecated Node.js APIs, including the legacy `Buffer()` constructor.
  // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-deprecated-api.md
  'n/no-deprecated-api': 'error',

  // Disallow returning value from constructor.
  // https://eslint.org/docs/latest/rules/no-constructor-return
  'no-constructor-return': 'error',

  // Disallow unnecessary calls to `.bind()`.
  // https://eslint.org/docs/latest/rules/no-extra-bind
  'no-extra-bind': 'error',

  // Disallow unnecessary labels.
  // https://eslint.org/docs/latest/rules/no-extra-label
  'no-extra-label': 'error',

  // Disallow variable or `function` declarations in nested blocks.
  // https://eslint.org/docs/latest/rules/no-inner-declarations
  'no-inner-declarations': 'error',

  // Disallow use of `this` in contexts where the value of `this` is `undefined`.
  // https://eslint.org/docs/latest/rules/no-invalid-this
  'no-invalid-this': 'off',

  // Disallow `new` operators with calls to `require`.
  // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-new-require.md
  'n/no-new-require': 'error',

  // Disallow string concatenation with `__dirname` and `__filename`.
  // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-path-concat.md
  'n/no-path-concat': 'error',

  // Disallow returning values from Promise executor functions.
  // https://eslint.org/docs/latest/rules/no-promise-executor-return
  'no-promise-executor-return': 'error',

  // Disallow throwing literals as exceptions.
  // https://eslint.org/docs/latest/rules/no-throw-literal
  'no-throw-literal': 'error',

  // Disallow unmodified loop conditions.
  // https://eslint.org/docs/latest/rules/no-unmodified-loop-condition
  'no-unmodified-loop-condition': 'off',

  // Disallow loops with a body that allows only one iteration.
  // https://eslint.org/docs/latest/rules/no-unreachable-loop
  'no-unreachable-loop': [
    'error',
    {
      ignore: [],
    },
  ],

  // Disallow assignments that can lead to race conditions due to usage of `await` or `yield`.
  // https://eslint.org/docs/latest/rules/require-atomic-updates
  'require-atomic-updates': 'off',

  // Disallow unused variables.
  // https://eslint.org/docs/latest/rules/no-unused-vars
  'no-unused-vars': [
    1,
    {
      argsIgnorePattern: 'res|next|^err|_',
      ignoreRestSiblings: true,
    },
  ],

  // Disallow `await` inside of loops.
  // https://eslint.org/docs/latest/rules/no-await-in-loop
  'no-await-in-loop': 'error',

  // Disallow the use of `eval()`-like methods.
  // https://eslint.org/docs/latest/rules/no-implied-eval
  'no-implied-eval': 'error',

  // Disallow function declarations that contain unsafe references inside loop statements.
  // https://eslint.org/docs/latest/rules/no-loop-func
  'no-loop-func': 'error',

  // Disallow assignment operators in `return` statements.
  // https://eslint.org/docs/latest/rules/no-return-assign
  'no-return-assign': ['error', 'always'],

  // Disallow comparisons where both sides are exactly the same.
  // https://eslint.org/docs/latest/rules/no-self-compare
  'no-self-compare': 'error',

  // Disallow template literal placeholder syntax in regular strings.
  // https://eslint.org/docs/latest/rules/no-template-curly-in-string
  'no-template-curly-in-string': 'error',

  // Require using Error objects as Promise rejection reasons.
  // https://eslint.org/docs/latest/rules/prefer-promise-reject-errors
  'prefer-promise-reject-errors': [
    'error',
    {
      allowEmptyReject: true,
    },
  ],

  // Enforce the use of the radix argument when using `parseInt()`.
  // https://eslint.org/docs/latest/rules/radix
  radix: 'error',
}

export default errorPreventionRules
