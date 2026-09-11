import { telemetry } from '../client'
import { addUserMetadataToTelemetry } from './addUserMetadataToTelemetry'

jest.mock('../client', () => ({
  telemetry: { setSpanAttributes: jest.fn() },
}))

describe('addUserMetadataToTelemetry()', () => {
  const next = jest.fn()
  const middleware = addUserMetadataToTelemetry()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should add user identifiers and caseload when the user is from NOMIS', () => {
    // Arrange
    const user = {
      userId: '123',
      userUuid: '11111111-1111-1111-1111-111111111111',
      authSource: 'nomis',
      activeCaseLoadId: 'MDI',
      username: 'USER_NAME',
      token: 'access-token',
    }

    // Act
    middleware({}, { locals: { user } }, next)

    // Assert
    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({
      userId: user.userId,
      userUuid: user.userUuid,
      activeCaseLoadId: 'MDI',
    })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it.each(['delius', 'external', 'azuread', undefined])(
    'should omit the caseload when the auth source is %s',
    authSource => {
      // Arrange
      const user = { userId: '123', userUuid: 'uuid', authSource, activeCaseLoadId: 'MDI' }

      // Act
      middleware({}, { locals: { user } }, next)

      // Assert
      expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({ userId: '123', userUuid: 'uuid' })
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    },
  )

  it.each([
    { user: { userId: '123' }, expected: { userId: '123' } },
    { user: { userUuid: 'uuid' }, expected: { userUuid: 'uuid' } },
    { user: { authSource: 'nomis', activeCaseLoadId: 'MDI' }, expected: { activeCaseLoadId: 'MDI' } },
  ])('should add available metadata when the user has only $expected', ({ user, expected }) => {
    // Arrange
    const response = { locals: { user } }

    // Act
    middleware({}, response, next)

    // Assert
    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith(expected)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it.each([
    {},
    { locals: {} },
    { locals: { user: {} } },
    { locals: { user: { userId: '', userUuid: '', authSource: 'nomis', activeCaseLoadId: '' } } },
  ])('should continue without metadata when user details are absent or empty: %j', response => {
    // Arrange
    const request = {}

    // Act
    middleware(request, response, next)

    // Assert
    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({})
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it('should merge request attributes with defaults when a selector is supplied', () => {
    // Arrange
    const request = { user: { username: 'USER_NAME', authSource: 'nomis' } }
    const response = { locals: { user: { userId: '123', authSource: 'nomis', activeCaseLoadId: 'MDI' } } }
    const configuredMiddleware = addUserMetadataToTelemetry({
      getAttributes: (req: typeof request) => ({
        username: req.user.username,
        auth_source: req.user.authSource,
      }),
    })

    // Act
    configuredMiddleware(request, response, next)

    // Assert
    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({
      userId: '123',
      activeCaseLoadId: 'MDI',
      username: 'USER_NAME',
      auth_source: 'nomis',
    })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it('should include service metadata when the selector reads custom request and response fields', () => {
    // Arrange
    const request = { session: { user: { serviceRole: 'caseworker', loginCount: 0, isAdmin: false } } }
    const response = { locals: { region: 'north' } }
    const configuredMiddleware = addUserMetadataToTelemetry({
      getAttributes: (req: typeof request, res: typeof response) => ({
        service_role: req.session.user.serviceRole,
        login_count: req.session.user.loginCount,
        is_admin: req.session.user.isAdmin,
        region: res.locals.region,
      }),
    })

    // Act
    configuredMiddleware(request, response, next)

    // Assert
    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({
      service_role: 'caseworker',
      login_count: 0,
      is_admin: false,
      region: 'north',
    })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it('should override or omit defaults when the selector returns matching attribute names', () => {
    // Arrange
    const user = { userId: '123', userUuid: 'uuid', authSource: 'nomis', activeCaseLoadId: 'MDI' }
    const configuredMiddleware = addUserMetadataToTelemetry({
      getAttributes: () => ({
        userId: undefined,
        userUuid: 'replacement-uuid',
        activeCaseLoadId: '',
        username: '',
        auth_source: undefined,
      }),
    })

    // Act
    configuredMiddleware({}, { locals: { user } }, next)

    // Assert
    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({ userUuid: 'replacement-uuid' })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it.each([{}, { locals: {} }])('should run the selector when local user data is missing: %j', response => {
    // Arrange
    const request = {}
    const getAttributes = jest.fn(() => ({ username: 'USER_NAME' }))
    const configuredMiddleware = addUserMetadataToTelemetry({ getAttributes })

    // Act
    configuredMiddleware(request, response, next)

    // Assert
    expect(getAttributes).toHaveBeenCalledTimes(1)
    expect(getAttributes).toHaveBeenCalledWith(request, response)
    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({ username: 'USER_NAME' })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it('should select metadata for each request when the middleware is reused', () => {
    // Arrange
    const configuredMiddleware = addUserMetadataToTelemetry({
      getAttributes: (_req, res) => ({ username: res.locals?.user?.username }),
    })

    // Act
    configuredMiddleware({}, { locals: { user: { username: 'FIRST_USER' } } }, next)
    configuredMiddleware({}, { locals: { user: { username: 'SECOND_USER' } } }, next)

    // Assert
    expect(telemetry.setSpanAttributes).toHaveBeenNthCalledWith(1, { username: 'FIRST_USER' })
    expect(telemetry.setSpanAttributes).toHaveBeenNthCalledWith(2, { username: 'SECOND_USER' })
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenCalledWith()
  })

  it('should use the default metadata when options are empty', () => {
    // Arrange
    const configuredMiddleware = addUserMetadataToTelemetry({})
    const response = { locals: { user: { userId: '123' } } }

    // Act
    configuredMiddleware({}, response, next)

    // Assert
    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({ userId: '123' })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it('should preserve default metadata when the selector returns no attributes', () => {
    // Arrange
    const configuredMiddleware = addUserMetadataToTelemetry({ getAttributes: () => ({}) })
    const response = { locals: { user: { userId: '123' } } }

    // Act
    configuredMiddleware({}, response, next)

    // Assert
    expect(telemetry.setSpanAttributes).toHaveBeenCalledWith({ userId: '123' })
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })
})
