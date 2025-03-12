export default interface AuthenticationClient {
  getToken: (username?: string) => Promise<string>
}
