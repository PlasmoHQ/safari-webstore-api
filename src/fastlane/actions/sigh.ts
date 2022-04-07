
import { Action, ActionOptions } from "~fastlane/common/action"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type SighOptions = {
  development?: boolean
  readonly: true,
  platform?: string,
  api_key_path: string
}

export class SighAction extends Action {
  options?: SighOptions

  constructor(options?: SighOptions, actionOptions?: ActionOptions) {
    super("sigh", actionOptions)
    this.options = options
  }
  
  async getProvisioningProfile() {
    vLog("Fetching provisioning profiles with sigh")
    await super.run([], this.options)
  }
}