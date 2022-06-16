
import { ConfigFile } from "~fastlane/common/config"
import type { Options } from "~/"

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

  static map(ops: Options): APIKey {
    return {
      key_id: ops.keyId,
      issuer_id: ops.issuerId,
      key: ops.key,
      in_house: false, // enterprise not yet supported
      duration: ops.duration
    }
  }
}