/**
 * Project policy and banned-pattern universal rules.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
const bannedPatternsRules = {
  // Require `require()` calls to be placed at top-level module scope.
  // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/global-require.md
  'n/global-require': 'error',

  // Disallow the use of `process.env`.
  // https://eslint.org/docs/latest/rules/no-process-env
  'no-process-env': 'off',

  // Disallow the use of `process.exit()`.
  // https://eslint.org/docs/latest/rules/no-process-exit
  'no-process-exit': 'off',

  // Disallow specified names in exports.
  // https://eslint.org/docs/latest/rules/no-restricted-exports
  'no-restricted-exports': [
    'error',
    {
      restrictedNamedExports: ['default', 'then'],
    },
  ],

  // Disallow specified global variables.
  // https://eslint.org/docs/latest/rules/no-restricted-globals
  'no-restricted-globals': [
    'error',
    {
      name: 'isFinite',
      message:
        'Use Number.isFinite instead: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite',
    },
    {
      name: 'isNaN',
      message:
        'Use Number.isNaN instead: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN',
    },
    'addEventListener',
    'blur',
    'close',
    'closed',
    'confirm',
    'defaultStatus',
    'defaultstatus',
    'event',
    'external',
    'find',
    'focus',
    'frameElement',
    'frames',
    'history',
    'innerHeight',
    'innerWidth',
    'length',
    'location',
    'locationbar',
    'menubar',
    'moveBy',
    'moveTo',
    'name',
    'onblur',
    'onerror',
    'onfocus',
    'onload',
    'onresize',
    'onunload',
    'open',
    'opener',
    'opera',
    'outerHeight',
    'outerWidth',
    'pageXOffset',
    'pageYOffset',
    'parent',
    'print',
    'removeEventListener',
    'resizeBy',
    'resizeTo',
    'screen',
    'screenLeft',
    'screenTop',
    'screenX',
    'screenY',
    'scroll',
    'scrollbars',
    'scrollBy',
    'scrollTo',
    'scrollX',
    'scrollY',
    'self',
    'status',
    'statusbar',
    'stop',
    'toolbar',
    'top',
  ],

  // Disallow specified modules when loaded by `import`.
  // https://eslint.org/docs/latest/rules/no-restricted-imports
  'no-restricted-imports': [
    'off',
    {
      paths: [],
      patterns: [],
    },
  ],

  // Disallow specified modules when loaded by `require`.
  // https://eslint.org/docs/latest/rules/no-restricted-modules
  'no-restricted-modules': 'off',

  // Disallow certain properties on certain objects.
  // https://eslint.org/docs/latest/rules/no-restricted-properties
  'no-restricted-properties': [
    'error',
    {
      object: 'arguments',
      property: 'callee',
      message: 'arguments.callee is deprecated',
    },
    {
      object: 'global',
      property: 'isFinite',
      message: 'Please use Number.isFinite instead',
    },
    {
      object: 'self',
      property: 'isFinite',
      message: 'Please use Number.isFinite instead',
    },
    {
      object: 'window',
      property: 'isFinite',
      message: 'Please use Number.isFinite instead',
    },
    {
      object: 'global',
      property: 'isNaN',
      message: 'Please use Number.isNaN instead',
    },
    {
      object: 'self',
      property: 'isNaN',
      message: 'Please use Number.isNaN instead',
    },
    {
      object: 'window',
      property: 'isNaN',
      message: 'Please use Number.isNaN instead',
    },
    {
      property: '__defineGetter__',
      message: 'Please use Object.defineProperty instead.',
    },
    {
      property: '__defineSetter__',
      message: 'Please use Object.defineProperty instead.',
    },
    {
      object: 'Math',
      property: 'pow',
      message: 'Use the exponentiation operator (**) instead.',
    },
  ],

  // Disallow synchronous methods.
  // https://eslint.org/docs/latest/rules/no-sync
  'no-sync': 'off',

  // Disallow ternary operators.
  // https://eslint.org/docs/latest/rules/no-ternary
  'no-ternary': 'off',

  // Disallow the use of `undefined` as an identifier.
  // https://eslint.org/docs/latest/rules/no-undefined
  'no-undefined': 'off',

  // Disallow dangling underscores in identifiers.
  // https://eslint.org/docs/latest/rules/no-underscore-dangle
  'no-underscore-dangle': [
    'error',
    {
      allow: [],
      allowAfterThis: false,
      allowAfterSuper: false,
      enforceInMethodNames: true,
    },
  ],

  // Disallow .only blocks in tests.
  // https://github.com/levibuzolic/eslint-plugin-no-only-tests
  'no-only-tests/no-only-tests': 'error',

  // Disallow specified syntax.
  // https://eslint.org/docs/latest/rules/no-restricted-syntax
  'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],

  // Disallow the use of `alert`, `confirm`, and `prompt`.
  // https://eslint.org/docs/latest/rules/no-alert
  'no-alert': 'warn',

  // Disallow bitwise operators.
  // https://eslint.org/docs/latest/rules/no-bitwise
  'no-bitwise': 'error',

  // Disallow the use of `arguments.caller` or `arguments.callee`.
  // https://eslint.org/docs/latest/rules/no-caller
  'no-caller': 'error',

  // Disallow the use of `console`.
  // https://eslint.org/docs/latest/rules/no-console
  'no-console': 'warn',

  // Disallow `continue` statements.
  // https://eslint.org/docs/latest/rules/no-continue
  'no-continue': 'error',

  // Disallow the use of `eval()`.
  // https://eslint.org/docs/latest/rules/no-eval
  'no-eval': 'error',

  // Disallow extending native types.
  // https://eslint.org/docs/latest/rules/no-extend-native
  'no-extend-native': 'error',

  // Disallow the use of the `__iterator__` property.
  // https://eslint.org/docs/latest/rules/no-iterator
  'no-iterator': 'error',

  // Disallow labels that share a name with a variable.
  // https://eslint.org/docs/latest/rules/no-label-var
  'no-label-var': 'error',

  // Disallow labeled statements.
  // https://eslint.org/docs/latest/rules/no-labels
  'no-labels': [
    'error',
    {
      allowLoop: false,
      allowSwitch: false,
    },
  ],

  // Disallow nested ternary expressions.
  // https://eslint.org/docs/latest/rules/no-nested-ternary
  'no-nested-ternary': 'error',

  // Disallow `new` operators outside of assignments or comparisons.
  // https://eslint.org/docs/latest/rules/no-new
  'no-new': 'error',

  // Disallow `new` operators with the `Function` object.
  // https://eslint.org/docs/latest/rules/no-new-func
  'no-new-func': 'error',

  // Disallow `new` operators with the `String`, `Number`, and `Boolean` objects.
  // https://eslint.org/docs/latest/rules/no-new-wrappers
  'no-new-wrappers': 'error',

  // Disallow octal escape sequences in string literals.
  // https://eslint.org/docs/latest/rules/no-octal-escape
  'no-octal-escape': 'error',

  // Disallow reassigning function parameters.
  // https://eslint.org/docs/latest/rules/no-param-reassign
  'no-param-reassign': [
    'error',
    {
      props: true,
      ignorePropertyModificationsFor: [
        'acc',
        'accumulator',
        'e',
        'ctx',
        'context',
        'req',
        'request',
        'res',
        'response',
        '$scope',
        'staticContext',
      ],
    },
  ],

  // Disallow the unary operators `++` and `--`.
  // https://eslint.org/docs/latest/rules/no-plusplus
  'no-plusplus': 'error',

  // Disallow the use of the `__proto__` property.
  // https://eslint.org/docs/latest/rules/no-proto
  'no-proto': 'error',

  // Disallow `javascript:` URLs.
  // https://eslint.org/docs/latest/rules/no-script-url
  'no-script-url': 'error',

  // Disallow comma operators.
  // https://eslint.org/docs/latest/rules/no-sequences
  'no-sequences': 'error',

  // Disallow `void` operators.
  // https://eslint.org/docs/latest/rules/no-void
  'no-void': 'error',
}

export default bannedPatternsRules
