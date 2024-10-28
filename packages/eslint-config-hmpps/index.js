const _import = require("eslint-plugin-import")
const noOnlyTests = require("eslint-plugin-no-only-tests")

const { fixupPluginRules } = require("@eslint/compat")

const globals = require("globals")
const typescriptEslint = require("@typescript-eslint/eslint-plugin")
const tsParser = require("@typescript-eslint/parser")
const js = require("@eslint/js")

const { FlatCompat } = require("@eslint/eslintrc")

const { rules: bestPracticesRules } = require('./rules/best-practices')
const { rules: errorsRules } = require('./rules/errors')
const { rules: nodeRules } = require('./rules/node')
const { rules: styleRules } = require('./rules/style')
const { rules: variablesRules } = require('./rules/variables')
const { rules: es6Rules } = require('./rules/es6')
const { rules: importsRules } = require('./rules/imports')
const { rules: strictRules } = require('./rules/strict')

const airBnbRules = Object.assign({}, bestPracticesRules, errorsRules, nodeRules, styleRules, variablesRules, es6Rules, importsRules, strictRules)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

module.exports = [
  {
    ignores: [
      "**/node_modules",
      "**/public",
      "**/assets",
      "**/cypress.json",
      "**/reporter-config.json",
      "**/dist/",
    ],
  },
  {
    rules: airBnbRules,
  },
  ...compat.extends("plugin:prettier/recommended"),
  {
    plugins: {
      import: fixupPluginRules(_import),
      "no-only-tests": noOnlyTests,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        },
      },
    },
    rules: {
      "no-unused-vars": [1, {
        argsIgnorePattern: "res|next|^err|_",
        ignoreRestSiblings: true,
      }],
      "no-use-before-define": 0,
      semi: 0,
      "import/no-named-as-default-member": 0,
      "import/no-unresolved": "error",
      "import/extensions": ["error", "ignorePackages", {
        js: "never",
        mjs: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      }],
      "comma-dangle": ["error", "always-multiline"],
      "import/no-extraneous-dependencies": ["error", {
        devDependencies: [
          "**/*.test.js",
          "**/*.test.ts",
          "**/testutils/**",
          "cypress.config.ts",
          "esbuild/**/*",
        ],
      }],
      "no-only-tests/no-only-tests": "error",
      "prettier/prettier": ["error", {
        trailingComma: "all",
        singleQuote: true,
        printWidth: 120,
        semi: false,
      }],
      "no-empty-function": ["error", {
        allow: ["constructors", "arrowFunctions"],
      }],
    },
  },
  ...compat.extends(
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ).map(config => ({
    ...config,
    files: ["**/*.ts"],
    ignores: ["**/*.js"],
  })),
  {
    files: ["**/*.ts"],
    ignores: ["**/*.js"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": ["error"],
      "@typescript-eslint/no-use-before-define": 0,
      "class-methods-use-this": 0,
      "no-useless-constructor": 0,
      "@typescript-eslint/no-unused-vars": [1, {
        argsIgnorePattern: "res|next|^err|_",
        ignoreRestSiblings: true,
      }],
      "@typescript-eslint/semi": 0,
      "import/no-unresolved": "error",
      "import/no-named-as-default-member": 0,
      "prettier/prettier": ["error", {
        trailingComma: "all",
        singleQuote: true,
        printWidth: 120,
        semi: false,
      }],
    },
  }
]
