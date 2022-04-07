
import { enableVerboseLogging, getVerboseLogger } from "~util/logging"
import { FastlaneClient, FastlaneOptions } from "~fastlane/"
import { Workspace } from "~workspace/"
import type { APIKey } from "~fastlane/config/auth"

const vLog = getVerboseLogger()

export type Options = {
  bundleId: string
  key: APIKey
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
    const fastlane = new FastlaneClient({} as FastlaneOptions)
    if (workspace.hasXcodeProject) vLog("Skipping conversion because Xcode project already exists")
    else await fastlane.convert(extension, workspace.path)
    const apiKeyPath = await fastlane.auth(this.options.key)
    //await fastlane.build()
    //await fastlane.deliver()
  }
}