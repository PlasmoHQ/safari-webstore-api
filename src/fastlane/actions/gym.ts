
import { Action, ActionOptions } from "~fastlane/common/action"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type GymOptions = {
  schemes: string[]
}

export class GymAction extends Action {
  options?: GymOptions

  constructor(options: GymOptions, actionOptions: ActionOptions) {
    super("gym", actionOptions)
    this.options = options
  }

  async buildSchemes() {
    vLog("Executing Gym to build schemes...")
    const { schemes } = this.options
    for (const scheme of schemes) {
      vLog(`Building ${scheme}...`)
      await super.run([], { scheme })
    }
  }
}