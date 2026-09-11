import { telemetry } from '../client'

type UserMetadata = {
  userId?: string
  userUuid?: string
  username?: string
  authSource?: string
  activeCaseLoadId?: string
}

type UserMetadataAttributes = Record<string, string | number | boolean | undefined>

type UserMetadataResponse<TResponse> = TResponse & { locals?: { user?: UserMetadata } }

type UserMetadataOptions<TRequest, TResponse> = {
  getAttributes?: (req: TRequest, res: UserMetadataResponse<TResponse>) => UserMetadataAttributes
}

/**
 * Adds user metadata to the active telemetry span.
 *
 * By default, reads the user from `res.locals.user` and includes non-empty
 * `userId`, `userUuid`, and, for NOMIS users, `activeCaseLoadId`.
 * Register after middleware that populates the user and any caseload data.
 *
 * @param options - Optional attribute selector.
 * @param options.getAttributes - Adds or overrides default attributes using the
 * request and response. Runs on every request, including when no local user exists.
 * Undefined values and empty strings are omitted, including overridden defaults.
 *
 * @example
 * // Use the default metadata from res.locals.user.
 * app.use(telemetryMiddleware.addUserMetadataToTelemetry())
 *
 * @example
 * // Add attributes from the request using your application's request type.
 * app.use(telemetryMiddleware.addUserMetadataToTelemetry({
 *   getAttributes: (req: Request) => ({
 *     username: req.user?.username,
 *     auth_source: req.user?.authSource,
 *   }),
 * }))
 *
 * @example
 * // Select attributes from response locals.
 * app.use(telemetryMiddleware.addUserMetadataToTelemetry({
 *   getAttributes: (_req, res) => ({
 *     username: res.locals?.user?.username,
 *     auth_source: res.locals?.user?.authSource,
 *   }),
 * }))
 *
 * @example
 * // Override default identifiers with values from the session.
 * app.use(telemetryMiddleware.addUserMetadataToTelemetry({
 *   getAttributes: (req: Request) => ({
 *     userId: req.session.user?.userId,
 *     userUuid: req.session.user?.userUuid,
 *   }),
 * }))
 */
export function addUserMetadataToTelemetry<TRequest, TResponse>(
  options: UserMetadataOptions<TRequest, TResponse> = {},
) {
  return (req: TRequest, res: UserMetadataResponse<TResponse>, next: () => void): void => {
    const user = res.locals?.user
    const attributes: UserMetadataAttributes = {
      userId: user?.userId,
      userUuid: user?.userUuid,
      activeCaseLoadId: user?.authSource === 'nomis' ? user.activeCaseLoadId : undefined,
      ...options.getAttributes?.(req, res),
    }

    telemetry.setSpanAttributes(getPopulatedAttributes(attributes))
    next()
  }
}

function getPopulatedAttributes(attributes: UserMetadataAttributes) {
  const populatedAttributes: Record<string, string | number | boolean> = {}

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      populatedAttributes[key] = value
    }
  })

  return populatedAttributes
}
