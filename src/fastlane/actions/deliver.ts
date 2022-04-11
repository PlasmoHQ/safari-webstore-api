
import { Action, ActionOptions } from "~fastlane/common/action"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type DeliverOptions = {

}

export class DeliverAction extends Action {
  options?: DeliverOptions

  constructor(options: DeliverOptions, actionOptions?: ActionOptions) {
    super("deliver", actionOptions)
    this.options = options
  }
}