export type MessageOptions = {
  /**
   * Whether to log an error if the message cannot be sent
   * Defaults to false (In most cases logging should be handled by the default error handler)
   */
  logOnError: boolean

  /**
   * Whether to throw an error if the message cannot be sent
   * Defaults to true (In most cases the user operation should fail if the message cannot be sent)
   */
  throwOnError: boolean
}
