
import { ConfigFile } from "~fastlane/common/config"

// https://docs.fastlane.tools/actions/match/
export type Matchfile = {
  app_identifier: string[]
  additional_cert_types?: string[],
  api_key_path?: string,
  git_url?: string
  readonly?: boolean,
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