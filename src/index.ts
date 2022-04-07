
import { enableVerboseLogging } from "~util/logging"
import { FastlaneClient, FastlaneOptions } from "~fastlane/"
import { Workspace } from "~workspace/"

export type Options = {
  bundleId?: string
  verbose?: boolean
  workspace?: string
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
    await workspace.prepare()
    const extension = await workspace.extractExtension(options.filePath)
    const fastlane = new FastlaneClient({} as FastlaneOptions)
    await fastlane.convert(extension, workspace.path)
    //await fastlane.auth()
    //await fastlane.produce()
    //await fastlane.build()
    //await fastlane.pilot()
    //await fastlane.deliver()
  }
}