import spawnAsync from "@expo/spawn-async"

export type ExecOptions = {
  cwd?: string
  env?: Record<string, string>
}

export class FastlaneExec {
  private _options?: ExecOptions

  constructor(options?: ExecOptions) {
    this._options = options
  }

  async exec(args: string[], params: {} = {}) {
    return await spawnAsync(
      "bundle",
      ["exec", "fastlane", ...args, ...reduceParams(params)],
      this._options
    )
  }
}

const reduceParams = (params: {} = {}) => {
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc.push(`${key}:${value}`)
    }
    return acc
  }, [])
}
