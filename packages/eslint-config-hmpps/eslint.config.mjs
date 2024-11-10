import hmppsConfig from './index.cjs'

export default hmppsConfig({
  extraIgnorePaths: [
    // ignoring Airbnb rules since they are vendored as-is
    'airbnbRules/',
    // ignoring sample application folder used for rule testing
    'test/sample-application/',
  ],
})
