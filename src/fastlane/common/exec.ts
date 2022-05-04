
import { spawn } from "~util/process"

export type ExecOptions = {
  cwd?: string
}

export class FastlaneExec {
  private _options?: ExecOptions

  constructor(options?: ExecOptions) {
    this._options = options
  }

  async exec(args: string[], params: {} = {}) {
    return await spawn('bundle', [
      'exec', 'fastlane'
    ].concat(args, reduceParams(params)), this._options) 
  }
}

const reduceParams = (params: {} = {}) => {
  return Object.entries(params).reduce((acc, entry) => {
    const [key, value] = entry
    if (value !== undefined) acc.push(`${key}:${value}`)
    return acc
  }, [])
}