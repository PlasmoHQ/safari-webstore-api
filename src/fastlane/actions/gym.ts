
import { Action, ActionOptions } from "~fastlane/common/action"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type GymOptions = {
  schemes: string[]
  output_name: string
}

export type GymOutput = {
  ipa: string,
  pkg: string
}

export class GymAction extends Action {
  options?: GymOptions
  
  constructor(options: GymOptions, actionOptions: ActionOptions) {
    super("gym", actionOptions)
    this.options = options
  }

  async buildSchemes(): Promise<GymOutput> {
    vLog("Executing Gym to build schemes...")
    const { schemes, output_name } = this.options
    let output = {} as GymOutput
    for (const scheme of schemes) {
      const platform = scheme.endsWith("(macOS)") ? "macos" : "ios"
      vLog(`Building ${scheme} for platform ${platform}...`)
      const export_options = `./ExportOptions.${platform}.plist`
      const output_directory = "./build"
      if (platform === 'ios') output.ipa = `${output_directory}/${output_name}.ipa`
      else output.pkg = `${output_directory}/${output_name}.pkg`
      await super.run([], {
        scheme,
        export_options,
        output_directory,
        output_name
      })
    }
    return output
  }
}