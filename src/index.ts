
import { enableVerboseLogging, getVerboseLogger } from "~util/logging"
import { FastlaneClient } from "~fastlane/"
import Workspace from "~workspace/"
import type { APIKey } from "~fastlane/config/auth"
import type { Appfile } from "~fastlane/config/appfile"
import type { Matchfile } from "~fastlane/config/matchfile"
import type { Gymfile } from "~fastlane/config/gymfile"
import { XcodeWorkspace } from "~xcode/"
import type { ConvertWebExtensionOptions } from "~fastlane/actions/convert"

const vLog = getVerboseLogger()

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

export type Platform = "ios" | "macos"

export type AppOptions = {
  bundleId: string,
  extensionBundleId?: string,
  appName: string,
  platforms?: Platform[]
}

export type ProvisioningProfileType = 
  "appstore" | 
  "adhoc" | 
  "development" |
  "enterprise" |
  "developer_id" |
  "mac_installer_distribution"

export type ProvisioningProfile = {
  bundleId: string,
  name: string,
  type: ProvisioningProfileType,
  platform: Platform
}

export type CodeSigningOptions = {
  provisioningProfiles?: ProvisioningProfile[]
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

    this.options = options
  }

  async submit(options: SubmitOptions) {

    // Validate workspace
    const workspace = new Workspace(this.options.workspace)
    await workspace.assemble(options.filePath)

    // Xcode build options
    await workspace.generateExportOptions({
      bundleId: this.options.bundleId,
      extensionBundleId: extensionBundleId(this.options),
      platforms: this.options.platforms || defaults.platforms,
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

    // safari-web-extension-converter
    if (workspace.hasXcodeWorkspace) vLog("Skipping conversion because Xcode workspace already exists")
    else await fastlane.convert(workspace, convertMap(this.options))
    
    // Fastlane Update Project Team
    await fastlane.updateProjectTeam(workspace, this.options.teamId)

    // Fastlane Match
    //await fastlane.match()

    // Fastlane Gym
    const schemes = await new XcodeWorkspace(workspace.path).schemes()
    await fastlane.gym({ schemes })

    // Fastlane Deliver
    //await fastlane.deliver()
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
    app_identifier: [ops.bundleId, extensionBundleId(ops)],
    //git_url: ops.gitUrl,
    //readonly: ops.readonly
  }
}

const extensionBundleId = (ops: Options): string => {
  const extensionBundleId = `${ops.bundleId}.extension`
  return ops.extensionBundleId || extensionBundleId
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