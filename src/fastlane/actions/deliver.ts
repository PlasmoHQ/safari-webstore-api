import { Action, type ActionOptions } from "~fastlane/common/action"
import { getLogger } from "~util/logging"

const log = getLogger()

export type DeliverOptions = {
  ipa?: string
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
    log.info(
      "Executing Fastlane Deliver to upload binaries to App Store Connect..."
    )
    await super.run([], {
      force: true,
      automatic_release: false,
      submit_for_review: false,
      skip_screenshots: true,
      skip_metadata: true,
      ipa,
      pkg
    })
    log.success("Delivered app to App Store Connect")
  }
}
