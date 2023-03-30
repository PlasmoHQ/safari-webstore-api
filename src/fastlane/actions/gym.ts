import { Action, type ActionOptions } from "~fastlane/common/action"
import { getLogger } from "~util/logging"

const log = getLogger()

export type GymOptions = {
  schemes: string[]
  output_name: string
}

export type GymOutput = {
  ipa: string
  pkg: string
}

export class GymAction extends Action {
  options?: GymOptions

  constructor(options: GymOptions, actionOptions: ActionOptions) {
    super("gym", actionOptions)
    this.options = options
  }

  async buildSchemes(): Promise<GymOutput> {
    log.info("Executing Fastlane Gym to build schemes...")
    const { schemes, output_name } = this.options
    let output = {} as GymOutput
    for (const scheme of schemes) {
      const platform = scheme.endsWith("(macOS)") ? "macos" : "ios"
      log.debug(`Building ${scheme} for platform ${platform}...`)
      const export_options = `./ExportOptions.${platform}.plist`
      const output_directory = "./build"
      if (platform === "ios")
        output.ipa = `${output_directory}/${output_name}.ipa`
      else output.pkg = `${output_directory}/${output_name}.pkg`
      await super.run([], {
        scheme,
        export_options,
        output_directory,
        output_name
      })
      log.success(`Built and archived ${platform} app`)
    }
    return output
  }
}
