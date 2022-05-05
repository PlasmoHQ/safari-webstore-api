
import { Action, ActionOptions } from "~fastlane/common/action"
import { getLogger } from "~util/logging"

const log = getLogger()

export type PilotOptions = {

}

export class PilotAction extends Action {
  options?: PilotOptions

  constructor(options: PilotOptions, actionOptions?: ActionOptions) {
    super("pilot", actionOptions)
    this.options = options
  }
}