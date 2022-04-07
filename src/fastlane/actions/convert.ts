
import { Action, ActionOptions } from "~fastlane/common/action"

export type ConvertWebExtensionOptions = {
  project_location?: string
  rebuild_project?: boolean
  app_name?: string
  bundle_identifier?: string
  swift?: boolean
  objc?: boolean
  ios_only?: boolean
  mac_only?: boolean
  copy_resources?: boolean
  force?: boolean
}

export class ConvertWebExtensionAction extends Action {
  options?: ConvertWebExtensionOptions

  constructor(options?: ConvertWebExtensionOptions, actionOptions?: ActionOptions) {
    super("convert_web_extension", actionOptions)
    this.options = options
  }
  
  // needs absolute path
  async run(extension: string) {
    await super.run({
      extension,
      ...this.options
    })
  }
}