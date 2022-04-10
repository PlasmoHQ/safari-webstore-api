
import { ConfigFile } from "~fastlane/common/config"

export type APIKey = {
  key_id: string
  issuer_id: string
  key: string
  duration?: number
  in_house: boolean
}

export class FastlaneAPIKey extends ConfigFile {
  key: APIKey

  constructor(key: APIKey) {
    super({ name: `${key.key_id}.json`})
    this.key = key
  }

  async persist(path: string): Promise<string> {
    return await this.writeJSON(this.key, path)
  }
}