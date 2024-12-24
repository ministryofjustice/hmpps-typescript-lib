/**
 * Used to add user info to requests.
 * This is called on req.locals and any details that are added to the returned object will be added as customDimensions on request items.
 *
 * For prisons this must include at a minimum the user's username and active case load ID.
 */
export type UserDataPublisher = (user: Record<string, unknown>) => Record<string, unknown>
