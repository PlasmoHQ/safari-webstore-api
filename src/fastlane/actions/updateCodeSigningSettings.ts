
import { Action, ActionOptions } from "~fastlane/common/action"
import { getLogger } from "~util/logging"

const log = getLogger()

export type UpdateCodeSigningSettingsOptions = {
  path: string,
  targets: string[],
  profile_name: string
}

export class UpdateCodeSigningSettingsAction extends Action {
  options: UpdateCodeSigningSettingsOptions

  constructor(options: UpdateCodeSigningSettingsOptions, actionOptions?: ActionOptions) {
    super("update_code_signing_settings", actionOptions)
    this.options = options
  }

  async update() {
    log.debug("Updating code signing settings and disabling automatic code signing...")
    return await super.run([], {
      ...this.options,
      use_automatic_signing: false
    })
  }
}