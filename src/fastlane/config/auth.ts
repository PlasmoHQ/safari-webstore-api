
import fs from "fs-extra"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type APIKey = {
  key_id: string
  issuer_id: string
  key: string
  duration?: number
  in_house: boolean
}

export class FastlaneAPIKey {
  key: APIKey

  constructor(key: APIKey) {
    this.key = key
  }

  async writeJSON(path: string): Promise<string> {
    vLog("Writing API key to JSON file...")
    const { key_id } = this.key
    const filePath = `${path}/fastlane/${key_id}.json`
    const content = JSON.stringify(this.key)
    await fs.writeFile(filePath, content)
    vLog(`API key written to: ${filePath}`)
    return filePath
  }
}