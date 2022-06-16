
import { ConfigFile } from "~fastlane/common/config"
import type { Options } from "~/"

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

  static map(ops: Options): Matchfile {
    return {
      app_identifier: [ops.bundleId, ops.extensionBundleId],
      storage_mode: ops.matchStorageMode,
      git_url: ops.matchGitUrl,
      git_branch: ops.matchGitBranch,
      git_basic_authorization: ops.matchGitBasicAuthorization,
      git_bearer_authorization: ops.matchGitBearerAuthorization,
      git_private_key: ops.matchGitPrivateKey,
      google_cloud_bucket_name: ops.matchGoogleCloudBucketName,
      google_cloud_keys_file: ops.matchGoogleCloudKeysFile,
      google_cloud_project_id: ops.matchGoogleCloudProjectId,
      s3_region: ops.matchS3Region,
      s3_access_key: ops.matchS3AccessKey,
      s3_secret_access_key: ops.matchS3SecretAccessKey,
      s3_bucket: ops.matchS3Bucket
    }
  }
}