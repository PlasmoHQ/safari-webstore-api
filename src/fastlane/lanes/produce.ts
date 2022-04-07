
import { Lane, LaneOptions } from '~fastlane/lanes/'

export type ProduceOptions = LaneOptions & {
  
}

// relies on username, password, and 2FA auth
// not yet supported by the App Store Connect API
// tabling for now; will implement manual developer flow later

// https://docs.fastlane.tools/actions/app_store_connect_api_key/
// https://github.com/fastlane/fastlane/tree/master/credentials_manager
// https://docs.fastlane.tools/actions/produce/

export class ProduceLane extends Lane {
  options: ProduceOptions

  constructor(options: ProduceOptions) {
    super('produce', options)
    this.options = options
  }
}