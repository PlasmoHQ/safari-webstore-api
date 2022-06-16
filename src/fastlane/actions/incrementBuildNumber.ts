
import { Action, ActionOptions } from "~fastlane/common/action"
import { getLogger } from "~util/logging"

const log = getLogger()

export type IncrementBuildNumberOptions = {
  xcodeproj: string,
  build_number?: number
}

export class IncrementBuildNumberAction extends Action {
  options: IncrementBuildNumberOptions

  constructor(options: IncrementBuildNumberOptions, actionOptions?: ActionOptions) {
    super("increment_build_number", actionOptions)
    this.options = options
  }

  async increment() {
    const { build_number } = this.options
    if (build_number) log.debug(`Setting build number to ${build_number}`)
    else log.debug("Incrementing build number")
    return await super.run([], this.options)
  }
}