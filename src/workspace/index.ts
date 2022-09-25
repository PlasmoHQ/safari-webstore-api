import spawnAsync from "@expo/spawn-async"
import { copySync, ensureDir } from "fs-extra"

import { tmp } from "~util/file"
import { getLogger } from "~util/logging"
import { Extension } from "~workspace/extension"
import { XcodeProject, XcodeWorkspace } from "~xcode/"

// TODO:
// Purge all the logger and use our own
// Find a way to inline all the fastlane/ruby stuffs
// refactor some of the unused class to be straightforward fx calls

const log = getLogger()

export class Workspace {
  path: string
  extension: Extension
  hasXcode: boolean

  constructor(path?: string) {
    this.path = path
  }

  async assemble(zipPath: string) {
    if (this.path) await this.validate()
    else this.path = await this.create()
    this.extension = await Extension.extract(zipPath, this.path)
    await this.generate()
  }

  // user provided workspace (bring your own ruby and fastfile)
  private async validate(): Promise<string> {
    log.debug("Validating provided workspace...")
    await ensureDir(this.path)
    await this.validateXcode()
    return this.path
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

  private async create(): Promise<string> {
    log.debug("Creating tmp directory...")
    const dir = await tmp("plasmo-safari")
    log.debug("Created tmp directory at: ", dir)
    return dir
  }

  private async generate() {
    log.debug("Workspace is empty, generating...")
    await this.generateRuby()
    await this.generateFastlane()
    await this.installRubyDependencies()
    log.debug("Workspace generated at: ", this.path)
  }

  private async generateRuby() {
    log.debug(`Generating Ruby configuration in ${this.path}`)
    copySync(`${__dirname}/template/ruby`, this.path)
  }

  private async generateFastlane() {
    log.info("Generating Fastlane configuration...")
    copySync(`${__dirname}/template/fastlane`, `${this.path}/fastlane`)
    log.info("Fastlane template generated")
  }

  private async installRubyDependencies() {
    log.info("Installing Ruby dependencies...")
    const cwd = this.path
    await spawnAsync("bundle", ["install"], { cwd })
    log.success("Ruby dependencies installed")
  }
}

export default Workspace
