
import { FastlaneExec, ExecOptions } from "~fastlane/common/exec"

export type ActionOptions = ExecOptions & {
  
}

// actions execute from the context 
// of the fastlane subdirectory
export class Action extends FastlaneExec {
  name: string

  constructor(name: string, options?: ActionOptions) {
    super(options)
    this.name = name
  }

  async run(params?: {}) {
    this.exec(['run', this.name], params)
  }
}

