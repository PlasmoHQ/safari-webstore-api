
import { ConfigFile } from "~fastlane/common/config"

export type DeveloperPortal = {
  apple_id?: string
  apple_dev_portal_id?: string
  team_name?: string
  team_id?: string
}

export type AppStoreConnect = {
  itunes_connect_id?: string
  itc_team_name?: string
  itc_team_id?: string
}

export type AppleDeveloper = DeveloperPortal & AppStoreConnect

// https://docs.fastlane.tools/advanced/#appfile
export type Appfile = AppleDeveloper & {
  app_identifier: string // bundle identifier of extension app
}

export class FastlaneAppfile extends ConfigFile {
  appfile: Appfile

  constructor(appfile: Appfile) {
    super({ name: 'Appfile' })
    this.appfile = appfile
  }
  async persist(path: string): Promise<string> {
    return await super.writeRuby(this.appfile, `${path}/fastlane`)
  }
}