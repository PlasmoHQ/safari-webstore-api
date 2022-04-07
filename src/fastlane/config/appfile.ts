
import fs from "fs-extra"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

// https://docs.fastlane.tools/advanced/#appfile
export type AppfileOptions = {
  app_identifier: string // bundle identifier of extension
  apple_id?: string // use below ids if different between Portal/Connect 
  apple_dev_portal_id?: string // if different creds between Portal/Connect
  itunes_connect_id?: string // if different creds between Portal/Connect
  team_name?: string // developer portal team
  team_id?: string // developer portal team
  itc_team_name?: string // App Store Connect team
  itc_team_id?: string // App Store Connect team
}

export class Appfile {
  options: AppfileOptions

  constructor(options: AppfileOptions) {
    this.options = options
  }
  
  async generate(filePath: string) {
    vLog("Generating Appfile...")
    const content = Object.entries(this.options).reduce((acc, entry) => {
      const [key, value] = entry
      acc.push(`${key} "${value}"`)
      return acc
    }, []).join("\n")
    await fs.writeFile(filePath, content)
    vLog("Appfile generated at: ", filePath)
    return filePath
  }
}