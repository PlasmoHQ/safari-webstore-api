
import { ConfigFile } from "~fastlane/common/config"
import type { Options } from "~/"

// https://docs.fastlane.tools/actions/gym/#gymfile
export type Gymfile = {
  export_method: string,
  export_team_id: string
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

  static map(ops: Options): Gymfile {
    return {
      export_method: "app-store",
      export_team_id: ops.teamId
    }
  }
}