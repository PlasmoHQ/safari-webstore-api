
import fs from "fs-extra"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

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

export class FastlaneAppfile {
  options: Appfile

  constructor(options: Appfile) {
    this.options = options
  }
  
  async generate(path: string) {
    vLog("Generating Appfile...")
    const filePath = `${path}/fastlane/Appfile`
    const content = Object.entries(this.options).reduce((acc, entry) => {
      const [key, value] = entry
      if (value) acc.push(`${key} "${value}"`)
      return acc
    }, []).join("\n")
    await fs.writeFile(filePath, content)
    vLog("Appfile generated at: ", filePath)
    return filePath
  }
}