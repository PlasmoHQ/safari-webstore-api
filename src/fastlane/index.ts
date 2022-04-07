
import { ConvertWebExtensionAction, ConvertWebExtensionOptions } from "./actions/convert"
import { ProduceLane, ProduceOptions } from "./lanes/produce"
import { BuildLane, BuildOptions } from "./lanes/build"
import { PilotLane, PilotOptions } from "./lanes/pilot"
import { DeliverLane, DeliverOptions } from "./lanes/deliver"
import { getVerboseLogger } from "~util/logging"
import { FastlaneAPIKey, APIKey } from "~fastlane/config/auth"
import { FastlaneAppfile, Appfile, AppleDeveloper } from "~fastlane/config/appfile"

const vLog = getVerboseLogger()

export type FastlaneOptions = {
  workspace: string
  key: APIKey
  appfile: Appfile
}

export class FastlaneClient {
  options: FastlaneOptions
  apiKeyPath: string

  constructor(options: FastlaneOptions) {
    this.options = options
  }

  // generate Xcode project with extension folder
  async convert(extension: string, cwd: string, options?: ConvertWebExtensionOptions) {
    vLog("Converting extension...")
    const lane = new ConvertWebExtensionAction(options, { cwd })
    await lane.run(extension)
    vLog("Xcode project successfully generated")
  }

  // generate hardcoded Appfile
  // auth with developer portal and itunes connect
  async configure() {
    vLog("Configuring Fastlane...")
    const appfile = new FastlaneAppfile(this.options.appfile)
    await appfile.generate(this.options.workspace)
    const key = new FastlaneAPIKey(this.options.key)
    this.apiKeyPath = await key.writeJSON(this.options.workspace)
  }

  // create app in developer portal and app store connect
  private async produce(options?: ProduceOptions) {
    const lane = new ProduceLane(options)
  }

  // build and sign app
  async build(options?: BuildOptions) {
    const lane = new BuildLane(options)
  }

  // upload and deploy to testflight
  private async pilot(options?: PilotOptions) {
    const lane = new PilotLane(options)
  }

  // upload and submit to the app store
  async deliver(options?: DeliverOptions) {
    const lane = new DeliverLane(options)
  }
}