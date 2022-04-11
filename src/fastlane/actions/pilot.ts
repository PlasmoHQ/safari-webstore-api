
import { Action, ActionOptions } from "~fastlane/common/action"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type PilotOptions = {

}

export class PilotAction extends Action {
  options?: PilotOptions

  constructor(options: PilotOptions, actionOptions?: ActionOptions) {
    super("pilot", actionOptions)
    this.options = options
  }
}