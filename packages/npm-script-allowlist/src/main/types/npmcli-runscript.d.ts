declare module '@npmcli/run-script' {
  interface RunScriptOptions {
    event: string
    path?: string
    stdio?: 'inherit' | 'pipe' | 'ignore'
    env?: Record<string, string>
    banner?: boolean
    pkg?: string
  }

  function runScript(options: RunScriptOptions): Promise<void>

  export = runScript
}
