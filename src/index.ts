
import { enableVerboseLogging, getLogger } from "~util/logging"
import { FastlaneClient } from "~fastlane/"
import Workspace from "~workspace/"
import type { APIKey } from "~fastlane/config/auth"
import type { Appfile } from "~fastlane/config/appfile"
import type { Matchfile } from "~fastlane/config/matchfile"
import type { Gymfile } from "~fastlane/config/gymfile"
import { XcodeWorkspace } from "~xcode/"
import type { ConvertWebExtensionOptions } from "~fastlane/actions/convert"
import { ExportOptionsPlist } from "~xcode/config/exportOptions"
import type { Platform } from "~xcode/common/platform"
import type { ProvisioningProfileOptions } from "~xcode/common/provisioningProfile"
import { GITHUB_RUN_NUMBER } from "~util/env"

const log = getLogger()

export type IdentityOptions = {
  appleId?: string,
  appleDevPortalId?: string,
  teamName?: string,
  teamId?: string,
  itunesConnectId?: string,
  itcTeamName?: string,
  itcTeamId?: string,
}

export type KeyOptions = {
  keyId: string,
  issuerId: string,
  key: string,
  duration?: number
}

export type AppOptions = {
  bundleId: string,
  extensionBundleId?: string,
  appName: string,
  appCategory: string,
  platforms?: Platform[],
  buildNumber?: number
}

export type CodeSigningOptions = {
  provisioningProfiles?: ProvisioningProfileOptions[]
}

export type MatchOptions = {
  matchStorageMode: string,
  matchGitUrl: string,
  matchGitBranch: string,
  matchGitBasicAuthorization: string,
  matchGitBearerAuthorization: string,
  matchGitPrivateKey: string,
  matchGoogleCloudBucketName: string,
  matchGoogleCloudKeysFile: string,
  matchGoogleCloudProjectId: string,
  matchS3Region: string,
  matchS3AccessKey: string,
  matchS3SecretAccessKey: string,
  matchS3Bucket: string
}

export type ClientOptions = {
  workspace?: string
  verbose?: boolean
}

export type Options = 
            AppOptions & 
            IdentityOptions & 
            KeyOptions & 
            CodeSigningOptions &
            MatchOptions &
            ClientOptions

export const errorMap = {

}

export const requiredFields = Object.keys(errorMap) as Array<
  keyof typeof errorMap
>

const defaults = {
  platforms: ["ios", "macos"] as Platform[]
}

type SubmitOptions = {
  filePath: string
}

export class SafariAppStoreClient {
  options = {} as Options

  constructor(options: Options) {
    for (const field of requiredFields) {
      if (!options[field]) throw new Error(errorMap[field])
    }
    
    if (options.verbose) enableVerboseLogging()

    this.options = {
      ...options,
      platforms: options.platforms || defaults.platforms,
      extensionBundleId: options.extensionBundleId || `${options.bundleId}.extension`
    }
  }

  async submit(options: SubmitOptions) {
    const { bundleId, platforms, extensionBundleId } = this.options

    log.success("Safari extension conversion and submission has begun")

    // Extract extension, Validate workspace, prepare Ruby environment
    const workspace = new Workspace(this.options.workspace)
    await workspace.assemble(options.filePath)

    // Xcode build options
    await ExportOptionsPlist.generate(workspace.path, {
      bundleId, extensionBundleId, platforms
    })

    // Fastlane
    const fastlane = new FastlaneClient({
      workspace: workspace.path,
      appfile: appfileMap(this.options),
      matchfile: matchfileMap(this.options),
      gymfile: gymfileMap(this.options),
      key: keyMap(this.options),
      platforms: this.options.platforms
    })
    await fastlane.configure()

    // Setup CI
    await fastlane.setupCI()

    // safari-web-extension-converter
    if (workspace.hasXcode) log.info("Skipping conversion because Xcode workspace already exists")
    else await fastlane.convert(workspace.extension.path, convertMap(this.options))

    // Reference Xcode Workspace
    const xcodeWorkspace = await XcodeWorkspace.findWorkspace(workspace.path)
    const schemes = await xcodeWorkspace.schemes()

    // Add App Category
    await xcodeWorkspace.writeKeyToInfoPlists('LSApplicationCategoryType', `public.app-category.${this.options.appCategory}`)

    // Fastlane Update Project Team
    await fastlane.updateProjectTeam(this.options.teamId)
    
    // Fastlane Update Code Signing Settings
    await fastlane.updateCodeSigningSettings({ bundleId, extensionBundleId })

    // Fastlane Match
    await fastlane.match()

    // Fastlane Increment Build Number
    await fastlane.incrementBuildNumber(this.options.buildNumber || GITHUB_RUN_NUMBER)

    // Fastlane Gym
    const { ipa, pkg } = await fastlane.gym({ schemes, output_name: this.options.appName })
    
    // Fastlane Deliver
    await fastlane.deliver({ ipa })
    await fastlane.deliver({ pkg })

    log.success("Successfully published Safari Extension to App Store Connect. Please visit App Store Connect to verify the upload, complete the submission, and submit for review.")
  }
}

const appfileMap = (ops: Options): Appfile => {
  return {
    app_identifier: ops.bundleId,
    apple_id: ops.appleId,
    apple_dev_portal_id: ops.appleDevPortalId,
    team_name: ops.teamName,
    team_id: ops.teamId,
    itunes_connect_id: ops.itunesConnectId,
    itc_team_id: ops.itcTeamId,
    itc_team_name: ops.itcTeamName
  }
}

const matchfileMap = (ops: Options): Matchfile => {
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

const gymfileMap = (ops: Options): Gymfile => {
  return {
    export_method: "app-store",
    export_team_id: ops.teamId
  }
}

const keyMap = (ops: KeyOptions): APIKey => {
  return {
    key_id: ops.keyId,
    issuer_id: ops.issuerId,
    key: ops.key,
    in_house: false, // enterprise not yet supported
    duration: ops.duration
  }
}

const convertMap = (ops: AppOptions): ConvertWebExtensionOptions => {
  return {
    app_name: ops.appName,
    bundle_identifier: ops.bundleId,
    ios_only: ops.platforms.length === 1 && ops.platforms[0] === "ios",
    mac_only: ops.platforms.length === 1 && ops.platforms[0] === "macos"
  }
}