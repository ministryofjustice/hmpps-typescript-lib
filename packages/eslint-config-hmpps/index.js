const { rules: bestPracticesRules } = require('./rules/best-practices')
const { rules: errorsRules } = require('./rules/errors')
const { rules: nodeRules } = require('./rules/node')
const { rules: styleRules } = require('./rules/style')
const { rules: variablesRules } = require('./rules/variables')
const { rules: es6Rules } = require('./rules/es6')
const { rules: importsRules } = require('./rules/imports')
const { rules: strictRules } = require('./rules/strict')

const rules = Object.assign({}, bestPracticesRules, errorsRules, nodeRules, styleRules, variablesRules, es6Rules, importsRules, strictRules)

module.exports = {
  rules,
};
