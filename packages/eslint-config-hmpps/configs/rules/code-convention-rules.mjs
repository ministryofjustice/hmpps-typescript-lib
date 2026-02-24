/**
 * Code-structure and convention universal rules.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
const codeConventionRules = {
  // Require `default` cases in `switch` statements.
  // https://eslint.org/docs/latest/rules/default-case
  'default-case': [
    'error',
    {
      commentPattern: '^no default$',
    },
  ],

  // Enforce `default` clauses in `switch` statements to be last.
  // https://eslint.org/docs/latest/rules/default-case-last
  'default-case-last': 'error',

  // Enforce default parameters to be last.
  // https://eslint.org/docs/latest/rules/default-param-last
  'default-param-last': 'error',

  // Enforce dot notation whenever possible.
  // https://eslint.org/docs/latest/rules/dot-notation
  'dot-notation': [
    'error',
    {
      allowKeywords: true,
    },
  ],

  // Enforce getter and setter pairs in objects and classes.
  // https://eslint.org/docs/latest/rules/accessor-pairs
  'accessor-pairs': 'off',

  // Require `return` statements after callbacks.
  // https://eslint.org/docs/latest/rules/callback-return
  'callback-return': 'off',

  // Enforce consistent naming when capturing the current execution context.
  // https://eslint.org/docs/latest/rules/consistent-this
  'consistent-this': 'off',

  // Require function names to match the name of the variable or property to which they are assigned.
  // https://eslint.org/docs/latest/rules/func-name-matching
  'func-name-matching': [
    'off',
    'always',
    {
      includeCommonJSModuleExports: false,
      considerPropertyDescriptor: true,
    },
  ],

  // Require or disallow named `function` expressions.
  // https://eslint.org/docs/latest/rules/func-names
  'func-names': 'warn',

  // Enforce the consistent use of either `function` declarations or expressions assigned to variables.
  // https://eslint.org/docs/latest/rules/func-style
  'func-style': ['off', 'expression'],

  // Require grouped accessor pairs in object literals and classes.
  // https://eslint.org/docs/latest/rules/grouped-accessor-pairs
  'grouped-accessor-pairs': 'error',

  // Require error handling in callbacks.
  // https://eslint.org/docs/latest/rules/handle-callback-err
  'handle-callback-err': 'off',

  // Disallow specified identifiers.
  // https://eslint.org/docs/latest/rules/id-denylist
  'id-denylist': 'off',

  // Enforce minimum and maximum identifier lengths.
  // https://eslint.org/docs/latest/rules/id-length
  'id-length': 'off',

  // Require identifiers to match a specified regular expression.
  // https://eslint.org/docs/latest/rules/id-match
  'id-match': 'off',

  // Require or disallow initialization in variable declarations.
  // https://eslint.org/docs/latest/rules/init-declarations
  'init-declarations': 'off',

  // Require constructor names to begin with a capital letter.
  // https://eslint.org/docs/latest/rules/new-cap
  'new-cap': [
    'error',
    {
      newIsCap: true,
      newIsCapExceptions: [],
      capIsNew: false,
      capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
    },
  ],

  // Disallow `catch` clause parameters from shadowing variables in the outer scope.
  // https://eslint.org/docs/latest/rules/no-catch-shadow
  'no-catch-shadow': 'off',

  // Disallow equal signs explicitly at the beginning of regular expressions.
  // https://eslint.org/docs/latest/rules/no-div-regex
  'no-div-regex': 'off',

  // Disallow duplicate module imports.
  // https://eslint.org/docs/latest/rules/no-duplicate-imports
  'no-duplicate-imports': 'off',

  // Disallow `null` comparisons without type-checking operators.
  // https://eslint.org/docs/latest/rules/no-eq-null
  'no-eq-null': 'off',

  // Disallow shorthand type conversions.
  // https://eslint.org/docs/latest/rules/no-implicit-coercion
  'no-implicit-coercion': [
    'off',
    {
      boolean: false,
      number: true,
      string: true,
      allow: [],
    },
  ],

  // Disallow declarations in the global scope.
  // https://eslint.org/docs/latest/rules/no-implicit-globals
  'no-implicit-globals': 'off',

  // Disallow inline comments after code.
  // https://eslint.org/docs/latest/rules/no-inline-comments
  'no-inline-comments': 'off',

  // Disallow unnecessary nested blocks.
  // https://eslint.org/docs/latest/rules/no-lone-blocks
  'no-lone-blocks': 'error',

  // Disallow `if` statements as the only statement in `else` blocks.
  // https://eslint.org/docs/latest/rules/no-lonely-if
  'no-lonely-if': 'error',

  // Disallow assignments to native objects or read-only global variables.
  // https://eslint.org/docs/latest/rules/no-native-reassign
  'no-native-reassign': 'off',

  // Disallow negated conditions.
  // https://eslint.org/docs/latest/rules/no-negated-condition
  'no-negated-condition': 'off',

  // Disallow negating the left operand in `in` expressions.
  // https://eslint.org/docs/latest/rules/no-negated-in-lhs
  'no-negated-in-lhs': 'off',

  // Disallow `Object` constructors.
  // https://eslint.org/docs/latest/rules/no-new-object
  'no-new-object': 'error',

  // Disallow unnecessary `return await`.
  // https://eslint.org/docs/latest/rules/no-return-await
  'no-return-await': 'error',

  // Disallow unnecessary calls to `.call()` and `.apply()`.
  // https://eslint.org/docs/latest/rules/no-useless-call
  'no-useless-call': 'off',

  // Disallow unnecessary computed property keys in objects and classes.
  // https://eslint.org/docs/latest/rules/no-useless-computed-key
  'no-useless-computed-key': 'error',

  // Require destructuring from arrays and/or objects.
  // https://eslint.org/docs/latest/rules/prefer-destructuring
  'prefer-destructuring': [
    'error',
    {
      VariableDeclarator: {
        array: false,
        object: true,
      },
      AssignmentExpression: {
        array: true,
        object: false,
      },
    },
    {
      enforceForRenamedProperties: false,
    },
  ],

  // Enforce using named capture group in regular expression.
  // https://eslint.org/docs/latest/rules/prefer-named-capture-group
  'prefer-named-capture-group': 'off',

  // Require `Reflect` methods where applicable.
  // https://eslint.org/docs/latest/rules/prefer-reflect
  'prefer-reflect': 'off',

  // Disallow async functions which have no `await` expression.
  // https://eslint.org/docs/latest/rules/require-await
  'require-await': 'off',

  // Enforce the use of `u` or `v` flag on regular expressions.
  // https://eslint.org/docs/latest/rules/require-unicode-regexp
  'require-unicode-regexp': 'off',

  // Disallow the use of variables before they are defined.
  // https://eslint.org/docs/latest/rules/no-use-before-define
  'no-use-before-define': 0,

  // Disallow empty functions.
  // https://eslint.org/docs/latest/rules/no-empty-function
  'no-empty-function': [
    'error',
    {
      allow: ['constructors', 'arrowFunctions'],
    },
  ],

  // Disallow `else` blocks after `return` statements in `if` statements.
  // https://eslint.org/docs/latest/rules/no-else-return
  'no-else-return': [
    'error',
    {
      allowElseIf: false,
    },
  ],

  // Disallow use of chained assignment expressions.
  // https://eslint.org/docs/latest/rules/no-multi-assign
  'no-multi-assign': ['error'],

  // Disallow initializing variables to `undefined`.
  // https://eslint.org/docs/latest/rules/no-undef-init
  'no-undef-init': 'error',

  // Disallow ternary operators when simpler alternatives exist.
  // https://eslint.org/docs/latest/rules/no-unneeded-ternary
  'no-unneeded-ternary': [
    'error',
    {
      defaultAssignment: false,
    },
  ],

  // Disallow unnecessary concatenation of literals or template literals.
  // https://eslint.org/docs/latest/rules/no-useless-concat
  'no-useless-concat': 'error',

  // Disallow renaming import, export, and destructured assignments to the same name.
  // https://eslint.org/docs/latest/rules/no-useless-rename
  'no-useless-rename': [
    'error',
    {
      ignoreDestructuring: false,
      ignoreImport: false,
      ignoreExport: false,
    },
  ],

  // Disallow redundant return statements.
  // https://eslint.org/docs/latest/rules/no-useless-return
  'no-useless-return': 'error',

  // Disallow the use of `Math.pow` in favor of the `**` operator.
  // https://eslint.org/docs/latest/rules/prefer-exponentiation-operator
  'prefer-exponentiation-operator': 'error',

  // Disallow `parseInt()` and `Number.parseInt()` in favor of binary, octal, and hexadecimal literals.
  // https://eslint.org/docs/latest/rules/prefer-numeric-literals
  'prefer-numeric-literals': 'error',

  // Disallow using `Object.assign` with an object literal as the first argument and prefer the use of object spread instead.
  // https://eslint.org/docs/latest/rules/prefer-object-spread
  'prefer-object-spread': 'error',

  // Disallow use of the `RegExp` constructor in favor of regular expression literals.
  // https://eslint.org/docs/latest/rules/prefer-regex-literals
  'prefer-regex-literals': [
    'error',
    {
      disallowRedundantWrapping: true,
    },
  ],

  // Require template literals instead of string concatenation.
  // https://eslint.org/docs/latest/rules/prefer-template
  'prefer-template': 'error',

  // Require symbol descriptions.
  // https://eslint.org/docs/latest/rules/symbol-description
  'symbol-description': 'error',
}

export default codeConventionRules
