
import fs from "fs-extra"
import { spawn } from '~util/process'
import { ls, tmp, extractZip } from '~util/file'
import { getLogger } from '~util/logging'
import { XcodeProject, XcodeWorkspace } from "~xcode/"

const log = getLogger()

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
    await this.generate()
    await this.installRubyDependencies()
    this.extension = await this.extractExtension(zipPath)
  }

  // user provided workspace (bring your own ruby and fastfile)
  private async validate(): Promise<string> {
    log.debug("Validating provided workspace...")
    await fs.ensureDir(this.path)
    await this.validateXcode()
    await this.validateRuby()
    await this.validateFastlane()
    return this.path
  }
  
  private async extractExtension(zipPath: string): Promise<string> {
    const extension = `${this.path}/extension/`
    log.debug("Extracting extension...")
    await extractZip(zipPath, extension)
    log.debug("Extension extracted to: ", extension)
    log.success("Extension extracted")
    return extension
  }

  private async create(): Promise<string> {
    log.debug("Creating tmp directory...")
    const dir = await tmp('plasmo-safari')
    log.debug("Created tmp directory at: ", dir)
    return dir
  }

  private async generate() {
    log.debug("Workspace is empty, generating...")
    await this.generateRuby()
    await this.generateFastlane()
    log.debug("Workspace generated at: ", this.path)
  }
  
  private async validateRuby() {
    const hasRuby = hasRequired(['Gemfile'], await ls(this.path, 1))
    if (!hasRuby) return await this.generateRuby()
  }

  private async generateRuby() {
    log.debug(`Generating Ruby configuration in ${this.path}`)
    fs.copySync(`${__dirname}/template/ruby`, this.path)
  }

  private async validateFastlane() {
    const required = ['fastlane/.env', 'fastlane/Pluginfile']
    const hasFastlane = hasRequired(required, await ls(this.path, 2))
    if (!hasFastlane) await this.generateFastlane()
  }
  
  private async generateFastlane() {
    log.info("Generating Fastlane configuration...")
    fs.copySync(`${__dirname}/template/fastlane`, `${this.path}/fastlane`)
    log.info("Fastlane template generated")
  }

  private async installRubyDependencies() {
    log.info("Installing Ruby dependencies...")
    const cwd = this.path
    await spawn('bundle', ['install'], { cwd })
    log.success("Ruby dependencies installed")
  }

  private async validateXcode() {
    const xcworkspace = await XcodeWorkspace.findWorkspace(this.path)
    const xcodeprojs = await XcodeProject.findProjects(this.path)
    const hasXcodeproj = xcodeprojs.length > 0
    if (xcworkspace && hasXcodeproj) {
      this.hasXcode = true
      log.debug("Found Xcode project and workspace in static workspace...")
    } else if (hasXcodeproj) {
      log.info("Found Xcode project in static workspace...")
      await this.generateXcodeWorkspace(xcodeprojs)
    }
  }

  private async generateXcodeWorkspace(xcodeprojs: XcodeProject[]) {
    log.debug("Generating Xcode workspace...")
    const { name } = xcodeprojs[0] // takes workspace name from first project
    await XcodeWorkspace.generate(this.path, name, xcodeprojs)
    this.hasXcode = true
  }
}

const hasRequired = (required, files) => {
  return required.every(f => files.includes(f))
}

export default Workspace