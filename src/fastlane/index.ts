
import { ConvertWebExtensionAction, ConvertWebExtensionOptions } from "./actions/convert"
import { MatchAction, MatchOptions } from "./actions/match"
import { GymAction, GymOptions } from "./actions/gym"
import { PilotAction, PilotOptions } from "./actions/pilot"
import { DeliverAction, DeliverOptions } from "./actions/deliver"
import { getVerboseLogger } from "~util/logging"
import { FastlaneAPIKey, APIKey } from "~fastlane/config/auth"
import { FastlaneAppfile, Appfile } from "~fastlane/config/appfile"
import { FastlaneMatchfile, Matchfile } from "~fastlane/config/matchfile"
import { FastlaneGymfile, Gymfile } from "~fastlane/config/gymfile"
import type { CodeSigningOptions } from "~/"
import type { Workspace } from "~/workspace/"

const vLog = getVerboseLogger()

export type FastlaneOptions = {
  workspace: string,
  key: APIKey,
  appfile: Appfile,
  matchfile: Matchfile,
  gymfile: Gymfile,
  platforms: string[]
}

export class FastlaneClient {
  options: FastlaneOptions
  apiKeyPath: string

  constructor(options: FastlaneOptions) {
    this.options = options
  }

  // generate Xcode project and workspace from extension folder
  async convert(workspace: Workspace, options?: ConvertWebExtensionOptions) {
    const cwd = this.options.workspace
    vLog("Converting extension...")
    const cwe = new ConvertWebExtensionAction(options, { cwd })
    await cwe.convert(workspace.extension)
    vLog("Xcode project successfully generated")
    await workspace.generateXcodeWorkspace()
  }

  // generate hardcoded Appfile
  // auth with developer portal and itunes connect
  async configure(options?: CodeSigningOptions) {
    vLog("Configuring Fastlane...")
    const { workspace } = this.options
    const appfile = new FastlaneAppfile(this.options.appfile)
    await appfile.persist(workspace)
    const key = new FastlaneAPIKey(this.options.key)
    this.apiKeyPath = await key.persist(workspace)
    const matchfile = new FastlaneMatchfile({
      api_key_path: this.apiKeyPath,
      ...this.options.matchfile
    })
    await matchfile.persist(workspace)
    const gymfile = new FastlaneGymfile(this.options.gymfile)
    await gymfile.persist(workspace)
    await this.codeSigningSetup()
    vLog("Fastlane successfully configured")
  }

  private async codeSigningSetup() {
    const actionOptions = { cwd: this.options.workspace }
    for (const platform of this.options.platforms) {
      for (const type of ["development", "appstore"]) {
        vLog(`Gathering ${platform} codesigning materials for ${type}...`)
        const matchOptions = { type, platform } as MatchOptions
        const match = new MatchAction(matchOptions, actionOptions)
        await match.syncCodeSigning()
      }
    }
  }

  // build and sign app
  async gym(options?: GymOptions) {
    const actionOptions = { cwd: this.options.workspace }
    const gym = new GymAction(options, actionOptions)
    await gym.buildSchemes()
  }

  // upload and deploy to testflight
  private async pilot(options?: PilotOptions) {
    const pilot = new PilotAction(options)
  }

  // upload and submit to the app store
  async deliver(options?: DeliverOptions) {
    const deliver = new DeliverAction(options)
  }
}