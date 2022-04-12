
import { spawn } from "~util/process"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export class XcodeWorkspace {
  parentDirectory: string

  constructor(parentDirectory: string) {
    this.parentDirectory = parentDirectory
  }

  async getSchemes(): Promise<string[]> {
    vLog("Fetching Xcode Project schemes...")
    const json = await spawn('xcodebuild', ['-list', '-json'], { cwd: this.parentDirectory }) 
    const list = JSON.parse(json)
    return list.workspace.schemes
  }
}