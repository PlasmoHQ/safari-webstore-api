
import { spawn } from "~util/process"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export class XcodeWorkspace {
  parentDirectory: string

  constructor(parentDirectory: string) {
    this.parentDirectory = parentDirectory
  }

  async workspace() {
    const json = await this._list()
    return json.workspace
  }

  async schemes(): Promise<string[]> {
    vLog("Fetching Xcode Workspace schemes...")
    const workspace = await this.workspace()
    return workspace.schemes.slice(0, 2)
  }

  async _list() {
    const json = await spawn('xcodebuild', ['-list', '-json'], { cwd: this.parentDirectory }) 
    return JSON.parse(json)
  }
}

export class XcodeProject extends XcodeWorkspace {
  
  async project() {
    const json = await this._list()
    return json.project
  }
  
  async schemes(): Promise<string[]> {
    vLog("Fetching Xcode Project schemes...")
    const project = await this.project()
    return project.schemes
  }
  
  async targets(): Promise<string[]> {
    vLog("Fetching Xcode Project targets...")
    const project = await this.project()
    return project.targets
  }
}