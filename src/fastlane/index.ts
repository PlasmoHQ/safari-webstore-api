
import { ConvertWebExtensionAction, ConvertWebExtensionOptions } from "./actions/convert"
import { AuthLane, AuthOptions } from "./lanes/auth"
import { ProduceLane, ProduceOptions } from "./lanes/produce"
import { BuildLane, BuildOptions } from "./lanes/build"
import { PilotLane, PilotOptions } from "./lanes/pilot"
import { DeliverLane, DeliverOptions } from "./lanes/deliver"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type FastlaneOptions = {
  workspace: String
}

export class FastlaneClient {
  options: FastlaneOptions

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

  // auth with developer portal and itunes connect
  async auth(options?: AuthOptions) {
    const lane = new AuthLane(options)
  }

  // create app in developer portal and app store connect
  async produce(options?: ProduceOptions) {
    const lane = new ProduceLane(options)
  }

  // build and sign app
  async build(options?: BuildOptions) {
    const lane = new BuildLane(options)
  }

  // upload and deploy to testflight
  async pilot(options?: PilotOptions) {
    const lane = new PilotLane(options)
  }

  // upload and submit to the app store
  async deliver(options?: DeliverOptions) {
    const lane = new DeliverLane(options)
  }
}