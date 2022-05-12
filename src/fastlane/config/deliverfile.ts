
import { ConfigFile } from "~fastlane/common/config"

// https://docs.fastlane.tools/actions/deliver/#available-options
export type Deliverfile = {
  api_key_path?: string
  precheck_include_in_app_purchases?: boolean
}

export class FastlaneDeliverfile extends ConfigFile {
  deliverfile: Deliverfile

  constructor(deliverfile: Deliverfile) {
    super({ name: 'Deliverfile' })
    this.deliverfile = deliverfile
  }
  
  async persist(path: string): Promise<string> {
    return await this.writeRuby(this.deliverfile, `${path}/fastlane`)
  }
}