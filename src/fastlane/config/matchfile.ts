
import { ConfigFile } from "~fastlane/common/config"

// https://docs.fastlane.tools/actions/match/
export type Matchfile = {
  app_identifier: string[]
  additional_cert_types?: string[],
  api_key_path?: string,
  storage_mode: string,
  git_url: string,
  git_branch: string,
  git_basic_authorization: string,
  git_bearer_authorization: string,
  git_private_key: string,
  google_cloud_bucket_name: string,
  google_cloud_keys_file: string,
  google_cloud_project_id: string,
  s3_region: string,
  s3_access_key: string,
  s3_secret_access_key: string,
  s3_bucket: string,
  keychain_name?: string,
  keychain_password?: string
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