
import { Action, ActionOptions } from "~fastlane/common/action"

export type MatchOptions = {
  type: string,
  readonly: true,
  platform: string[],
  api_key_path: string,
  verbose: boolean
}

// sync code signing
// additional params like git/S3 are provided by ENV
// https://docs.fastlane.tools/actions/match/
export class MatchAction extends Action {
  options?: MatchOptions

  constructor(options?: MatchOptions, actionOptions?: ActionOptions) {
    super("match", actionOptions)
    this.options = options
  }
  
  async match() {
    const { type } = this.options
    await super.run([ type ], this.options)
  }
}