
import { enableVerboseLogging } from "~util/logging"
import { ConvertLane } from "~lanes/convert"

export type Options = {
  bundleId?: string
  verbose?: boolean
  workspace?: string
}

export type ConvertOptions = {
  filePath: string
}

export type ProduceOptions = {
  
}

export type BuildOptions = {

}

export type PilotOptions = {
  
}

export type SubmitOptions = {
  
}

export const errorMap = {
}

export const requiredFields = Object.keys(errorMap) as Array<
  keyof typeof errorMap
>

export class SafariAppStoreClient {
  options = {} as Options
  workspace: string

  constructor(options: Options) {
    for (const field of requiredFields) {
      if (!options[field]) throw new Error(errorMap[field])
    }
    
    if (options.verbose) enableVerboseLogging()

    this.options = options
  }

  // generate Xcode project
  async convert(options: ConvertOptions) {
    const lane = new ConvertLane(options)
    const staticDir = this.options.workspace
    const { workspace, extension } = await lane.run(staticDir)
  }

  // create app in developer portal and app store connect
  async produce(options: ProduceOptions = {}) {

  }

  // build and sign app
  async build(options: BuildOptions = {}) {
   
  }

  // upload and deploy to testflight
  async pilot(options: PilotOptions = {}) {

  }

  // upload and submit to the app store
  async submit(options: SubmitOptions = {}) {

  }
}