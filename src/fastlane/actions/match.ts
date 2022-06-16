
import { Action, ActionOptions } from "~fastlane/common/action"
import { getLogger } from "~util/logging"

const log = getLogger()

type CertType = "mac_installer_distribution" | "developer_id_installer"

export type MatchOptions = {
  type: string,
  readonly: true,
  platform?: string,
  api_key_path: string,
  additional_cert_types?: CertType[],
  verbose?: boolean
}

// sync code signing
// additional params like git/S3 are provided by ENV
// https://docs.fastlane.tools/actions/match/
export class MatchAction extends Action {
  options: MatchOptions

  constructor(options: MatchOptions, actionOptions: ActionOptions) {
    super("match", actionOptions)
    this.options = options
  }
  
  async syncCodeSigning() {
    const { type, platform } = this.options
    log.debug(`Syncing ${type} ${platform} certs with match...`)
    return await super.run([ type ], {
      ...this.options,
      keychain_name: "fastlane_tmp_keychain",
      keychain_password: "",
      additional_cert_types: platform === 'macos' ? ["mac_installer_distribution"] : []
    })
  }
}