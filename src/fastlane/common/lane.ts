import { ExecOptions, FastlaneExec } from "~fastlane/common/exec"

export type LaneOptions = ExecOptions & {}

export class Lane extends FastlaneExec {
  name: string

  constructor(name: string, options?: LaneOptions) {
    super(options)
    this.name = name
  }

  async run(params?: {}) {
    return await this.exec([this.name], params)
  }
}
