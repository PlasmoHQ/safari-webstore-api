
import { enableVerboseLogging, getLogger } from "~util/logging"
import Workspace from "~workspace/"
import { XcodeWorkspace } from "~xcode/"
import { FastlaneClient } from "~fastlane/"
import { FastlaneAPIKey } from "~fastlane/config/auth"
import { FastlaneAppfile } from "~fastlane/config/appfile"
import { FastlaneMatchfile } from "~fastlane/config/matchfile"
import { FastlaneGymfile } from "~fastlane/config/gymfile"
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
  matchPassword: string,
  matchStorageMode?: string,
  matchGitUrl?: string,
  matchGitBranch?: string,
  matchGitBasicAuthorization?: string,
  matchGitBearerAuthorization?: string,
  matchGitPrivateKey?: string,
  matchGoogleCloudBucketName?: string,
  matchGoogleCloudKeysFile?: string,
  matchGoogleCloudProjectId?: string,
  matchS3Region?: string,
  matchS3AccessKey?: string,
  matchS3SecretAccessKey?: string,
  matchS3Bucket?: string
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
  "bundleId": "requires an app bundle identifier: https://cocoacasts.com/what-are-app-ids-and-bundle-identifiers/",
  "appName": "requires an app name",
  "appCategory": "requires the last component of a LSApplicationCategoryType: https://developer.apple.com/documentation/bundleresources/information_property_list/lsapplicationcategorytype",
  "keyId": "requires an App Store Connect API Key id: https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api",
  "key": "requires an App Store Connect API Key: https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api",
  "issuerId": "requires an App Store Connect API Key issuer id: https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api"
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

export class SafariPublisher {
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
    const { bundleId, platforms, extensionBundleId, matchPassword } = this.options

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
      appfile: FastlaneAppfile.map(this.options),
      matchfile: FastlaneMatchfile.map(this.options),
      gymfile: FastlaneGymfile.map(this.options),
      key: FastlaneAPIKey.map(this.options),
      platforms: this.options.platforms
    })
    await fastlane.configure()

    // Setup CI
    await fastlane.setupCI()

    // safari-web-extension-converter
    if (workspace.hasXcode) log.info("Skipping conversion because Xcode workspace already exists")
    else await fastlane.convert(workspace.extension.path, {
      app_name: this.options.appName,
      bundle_identifier: this.options.bundleId,
      ios_only: this.options.platforms.length === 1 && this.options.platforms[0] === "ios",
      mac_only: this.options.platforms.length === 1 && this.options.platforms[0] === "macos"
    })

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
    await fastlane.match(matchPassword)

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