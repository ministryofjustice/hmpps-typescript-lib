// eslint-disable-next-line import/extensions
import hmppsConfig from './index.js'

export default [
  // ignoring linting within Airbnb rules since they are vendored as-is
  { ignores: ['airbnbRules/'] },
  ...hmppsConfig,
]
