
import { ConfigFile } from "~fastlane/common/config"

// https://docs.fastlane.tools/actions/match/
export type Matchfile = {
  app_identifier: string,
  platform: string[],
  additional_cert_types?: string[],
  readonly: boolean,
  api_key_path: string
}

export class FastlaneMatchfile extends ConfigFile {
  matchfile: Matchfile

  constructor(matchfile: Matchfile) {
    super({ name: 'Matchfile' })
    this.matchfile = matchfile
  }
  
  async persist(path: string): Promise<string> {
    return await this.writeRuby(this.matchfile, `${path}/fastlane`)
  }
}