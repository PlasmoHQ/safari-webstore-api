
import fs from "fs-extra"
import { spawn } from '~util/process'
import { ls, tmp, extractZip } from '~util/file'
import { getVerboseLogger } from '~util/logging'
import { XcodeProject, XcodeWorkspace } from "~xcode/"

const vLog = getVerboseLogger()

export class Workspace {
  path: string
  extension: string
  hasXcode: boolean

  constructor(path?: string) {
    this.path = path
  }
  
  async assemble(zipPath: string) {
    if (this.path) await this.validate()
    else this.path = await this.create()
    await this.installRubyDependencies()
    this.extension = await this.extractExtension(zipPath)
  }

  // user provided workspace (bring your own ruby and fastfile)
  private async validate(): Promise<string> {
    vLog("Validating provided workspace...")
    await fs.ensureDir(this.path)
    await this.validateXcode()
    await this.validateRuby()
    await this.validateFastlane()
    return this.path
  }
  
  private async extractExtension(zipPath: string): Promise<string> {
    const extension = `${this.path}/extension/`
    vLog("Extracting extension...")
    await extractZip(zipPath, extension)
    vLog("Extension extracted to: ", extension)
    return extension
  }

  private async create(): Promise<string> {
    vLog("Creating tmp directory...")
    const dir = await tmp('plasmo-safari')
    vLog("Created tmp directory at: ", dir)
    vLog("Workspace is empty, generating...")
    await this.generateRuby()
    await this.generateFastlane()
    vLog("Workspace generated at: ", dir)
    return dir
  }
  
  private async validateRuby() {
    const hasRuby = hasRequired(['Gemfile'], await ls(this.path, 1))
    if (!hasRuby) return await this.generateRuby()
  }

  private async generateRuby() {
    vLog(`Generating Ruby configuration is ${__dirname}`)
    fs.copySync('./template/ruby', this.path)
  }

  private async validateFastlane() {
    const required = ['fastlane/.env', 'fastlane/Pluginfile']
    const hasFastlane = hasRequired(required, await ls(this.path, 2))
    if (!hasFastlane) await this.generateFastlane()
  }
  
  private async generateFastlane() {
    vLog("Generating Fastlane configuration...")
    fs.copySync('./template/fastlane', `${this.path}/fastlane`)
  }

  private async installRubyDependencies() {
    vLog("Installing Ruby dependencies...")
    const cwd = this.path
    return await spawn('bundle', ['install'], { cwd })
  }

  private async validateXcode() {
    const xcworkspace = await XcodeWorkspace.findWorkspace(this.path)
    const xcodeprojs = await XcodeProject.findProjects(this.path)
    const hasXcodeproj = xcodeprojs.length > 0
    if (xcworkspace && hasXcodeproj) {
      this.hasXcode = true
      vLog("Found Xcode project and workspace in static workspace...")
    } else if (hasXcodeproj) {
      vLog("Found Xcode project in static workspace...")
      await this.generateXcodeWorkspace(xcodeprojs)
    }
  }

  private async generateXcodeWorkspace(xcodeprojs: XcodeProject[]) {
    vLog("Generating Xcode workspace...")
    const { name } = xcodeprojs[0] // takes workspace name from first project
    await XcodeWorkspace.generate(this.path, name, xcodeprojs)
    this.hasXcode = true
  }
}

const hasRequired = (required, files) => {
  return required.every(f => files.includes(f))
}

export default Workspace