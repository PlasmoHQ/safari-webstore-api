
import { Action, ActionOptions } from "~fastlane/common/action"
import { getLogger } from "~util/logging"

const log = getLogger()

export type SetupCIOptions = {
  force: boolean,
  provider?: string
}

export class SetupCIAction extends Action {
  options: SetupCIOptions

  constructor(options: SetupCIOptions, actionOptions?: ActionOptions) {
    super("setup_ci", actionOptions)
    this.options = options
  }

  async setup() {
    log.debug("Setting up CI environment for match")
    return await super.run([], this.options)
  }
}