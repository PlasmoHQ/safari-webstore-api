
import { Action, ActionOptions } from "~fastlane/common/action"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type CertOptions = {
  development?: boolean,
  platform?: string,
  type?: string,
  api_key_path: string,
}

export class CertAction extends Action {
  options?: CertOptions

  constructor(options?: CertOptions, actionOptions?: ActionOptions) {
    super("cert", actionOptions)
    this.options = options
  }
  
  async getCertificates() {
    vLog("Fetching certificates with cert")
    await super.run([], this.options)
  }
}