/**
 * Complexity and size-limit rules.
 *
 * @type {import('eslint').Linter.RulesRecord}
 */
const complexityRules = {
  // Enforce a maximum cyclomatic complexity allowed in a program.
  // https://eslint.org/docs/latest/rules/complexity
  complexity: ['off', 20],

  // Enforce a maximum number of classes per file.
  // https://eslint.org/docs/latest/rules/max-classes-per-file
  'max-classes-per-file': ['error', 1],

  // Enforce a maximum depth that blocks can be nested.
  // https://eslint.org/docs/latest/rules/max-depth
  'max-depth': ['off', 4],

  // Enforce a maximum number of lines per file.
  // https://eslint.org/docs/latest/rules/max-lines
  'max-lines': [
    'off',
    {
      max: 300,
      skipBlankLines: true,
      skipComments: true,
    },
  ],

  // Enforce a maximum number of lines of code in a function.
  // https://eslint.org/docs/latest/rules/max-lines-per-function
  'max-lines-per-function': [
    'off',
    {
      max: 50,
      skipBlankLines: true,
      skipComments: true,
      IIFEs: true,
    },
  ],

  // Enforce a maximum depth that callbacks can be nested.
  // https://eslint.org/docs/latest/rules/max-nested-callbacks
  'max-nested-callbacks': 'off',

  // Enforce a maximum number of parameters in function definitions.
  // https://eslint.org/docs/latest/rules/max-params
  'max-params': ['off', 3],

  // Enforce a maximum number of statements allowed in function blocks.
  // https://eslint.org/docs/latest/rules/max-statements
  'max-statements': ['off', 10],

  // Disallow magic numbers.
  // https://eslint.org/docs/latest/rules/no-magic-numbers
  'no-magic-numbers': [
    'off',
    {
      ignore: [],
      ignoreArrayIndexes: true,
      enforceConst: true,
      detectObjects: false,
    },
  ],
}

export default complexityRules
