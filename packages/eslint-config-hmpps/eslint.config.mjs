import hmppsConfig from './index.cjs'

export default hmppsConfig({
  // ignoring linting within Airbnb rules since they are vendored as-is
  extraIgnorePaths: ['airbnbRules/'],
})
