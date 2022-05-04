
import { Action, ActionOptions } from "~fastlane/common/action"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type DeliverOptions = {
  ipa?: string,
  pkg?: string
}

export class DeliverAction extends Action {
  options?: DeliverOptions

  constructor(options: DeliverOptions, actionOptions: ActionOptions) {
    super("deliver", actionOptions)
    this.options = options
  }

  async upload() {
    const { ipa, pkg } = this.options
    vLog("Executing Deliver to upload to iTunes Connect...")
    await super.run([], { 
      force: true, 
      automatic_release: false,
      skip_screenshots: true,
      skip_metadata: true,
      ipa,
      pkg
    })
  }
}