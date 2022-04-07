
import { enableVerboseLogging, getVerboseLogger } from "~util/logging"
import { FastlaneClient, FastlaneOptions } from "~fastlane/"
import { Workspace } from "~workspace/"
import type { APIKey } from "~fastlane/config/auth"
import type { Appfile } from "~fastlane/config/appfile"

const vLog = getVerboseLogger()

export type DevOptions = {
  devAppleId?: string,
  devPortalId?: string,
  devTeamName?: string,
  devTeamId?: string,
  devItunesConnectId?: string,
  devItcTeamName?: string,
  devItcTeamId?: string,
}

export type KeyOptions = {
  keyId: string,
  keyIssuerId: string,
  key: string,
  keyDuration?: number,
  keyInHouse?: boolean,
}

export type AppOptions = {
  bundleId: string
}

export type CodeSigningOptions = {
  match: boolean
  cert: boolean
  sigh: boolean
}

export type ClientOptions = {
  workspace?: string
  verbose?: boolean
}

export type Options = 
            AppOptions & 
            DevOptions & 
            KeyOptions & 
            CodeSigningOptions &
            ClientOptions

export const errorMap = {

}

export const requiredFields = Object.keys(errorMap) as Array<
  keyof typeof errorMap
>

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
    const workspace = new Workspace(this.options.workspace)
    const extension = await workspace.assemble(options.filePath)
    const fastlane = new FastlaneClient({
      workspace: workspace.path,
      appfile: appfileMap(this.options),
      key: keyMap(this.options)
    })
    if (workspace.hasXcodeProject) vLog("Skipping conversion because Xcode project already exists")
    else await fastlane.convert(extension)
    await fastlane.configure(this.options)
    await fastlane.build()
    await fastlane.deliver()
  }
}

const appfileMap = (ops: Options): Appfile => {
  return {
    app_identifier: ops.bundleId,
    apple_id: ops.devAppleId,
    apple_dev_portal_id: ops.devPortalId,
    team_name: ops.devTeamName,
    team_id: ops.devTeamId,
    itunes_connect_id: ops.devItunesConnectId,
    itc_team_id: ops.devItcTeamId,
    itc_team_name: ops.devItcTeamName
  }
}

const keyMap = (options: KeyOptions): APIKey => {
  return {
    key_id: options.keyId,
    issuer_id: options.keyIssuerId,
    key: options.key,
    duration: options.keyDuration,
    in_house: options.keyInHouse,
  }
}