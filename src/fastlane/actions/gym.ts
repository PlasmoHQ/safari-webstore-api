
import { Action, ActionOptions } from "~fastlane/common/action"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type GymOptions = {

}

export class GymAction extends Action {
  options?: GymOptions

  constructor(options: GymOptions, actionOptions?: ActionOptions) {
    super("gym", actionOptions)
    this.options = options
  }
}