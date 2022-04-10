
import { ConfigFile } from "~fastlane/common/config"

// https://docs.fastlane.tools/actions/gym/#gymfile
export type Gymfile = {
  
}

export class FastlaneGymfile extends ConfigFile {
  gymfile: Gymfile

  constructor(gymfile: Gymfile) {
    super({ name: 'Gymfile' })
    this.gymfile = gymfile
  }
  
  async persist(path: string): Promise<string> {
    return await this.writeRuby(this.gymfile, `${path}/fastlane`)
  }
}