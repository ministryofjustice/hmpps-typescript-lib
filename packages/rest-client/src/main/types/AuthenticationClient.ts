export interface AuthenticationClient {
  getToken: (username?: string) => Promise<string>
}
