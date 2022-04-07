
import { enableVerboseLogging, getVerboseLogger } from "~util/logging"
import { FastlaneClient, FastlaneOptions } from "~fastlane/"
import { Workspace } from "~workspace/"
import type { APIKey } from "~fastlane/config/auth"
import type { Appfile } from "~fastlane/config/appfile"

const vLog = getVerboseLogger()

export type Options = {
  bundleId: string,
  devAppleId?: string,
  devPortalId?: string,
  devTeamName?: string,
  devTeamId?: string,
  devItunesConnectId?: string,
  devItcTeamName?: string,
  devItcTeamId?: string,
  keyId: string,
  keyIssuerId: string,
  key: string,
  keyDuration?: number,
  keyInHouse?: boolean,
  workspace?: string
  verbose?: boolean
}

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
      appfile: appfile(this.options),
      key: key(this.options)
    })
    if (workspace.hasXcodeProject) vLog("Skipping conversion because Xcode project already exists")
    else await fastlane.convert(extension, workspace.path)
    await fastlane.configure()
    //await fastlane.build()
    //await fastlane.deliver()
  }
}

const appfile = (options: Options): Appfile => {
  return {
    app_identifier: options.bundleId,
    apple_id: options.devAppleId,
    apple_dev_portal_id: options.devPortalId,
    team_name: options.devTeamName,
    team_id: options.devTeamId,
    itunes_connect_id: options.devItunesConnectId,
    itc_team_id: options.devItcTeamId,
    itc_team_name: options.devItcTeamName
  }
}

const key = (options: Options): APIKey => {
  return {
    key_id: options.keyId,
    issuer_id: options.keyIssuerId,
    key: options.key,
    duration: options.keyDuration,
    in_house: options.keyInHouse,
  }
}