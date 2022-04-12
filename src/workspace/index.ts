
import fs from "fs-extra"
import { spawn } from '~util/process'
import { ls, tmp, extractZip, findFileByExtName } from '~util/file'
import { getVerboseLogger } from '~util/logging'
import xml from 'xml'
import path from 'path'

const vLog = getVerboseLogger()

export class Workspace {
  path: string
  extension: string
  hasXcodeWorkspace: boolean

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
    await this.validateXcodeWorkspace()
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
    vLog("Generating Ruby configuration...")
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

  async xcodeProjectDirectory(): Promise<string> {
    return await findFileByExtName(this.path, '.xcodeproj', 2)
  }
  
  async xcodeWorkspaceDirectory(): Promise<string> {
    return await findFileByExtName(this.path, '.xcworkspace', 1)
  }

  private async validateXcodeWorkspace() {
    const xcworkspace = await this.xcodeWorkspaceDirectory()
    const xcodeproj = await this.xcodeProjectDirectory()
    if (xcworkspace && xcodeproj) {
      this.hasXcodeWorkspace = true
      vLog("Found Xcode project and workspace in static workspace...")
    } else if (xcodeproj) {
      vLog("Found Xcode project in static workspace...")
      await this.generateXcodeWorkspace()
    }
  }

  async generateXcodeWorkspace() {
    vLog("Generating Xcode workspace...")
    const xcodeprojPath = await this.xcodeProjectDirectory()
    const name = path.basename(xcodeprojPath, '.xcodeproj')
    const fileRef = { FileRef: [{ _attr: { location: `container:${xcodeprojPath}` }}] }
    const workspace = { Workspace: [{ _attr: { version: '1.0' }}, fileRef] }
    const xmlString = xml(workspace, { declaration: true, indent: '\t' })
    const workspaceDirectory = `${this.path}/${name}.xcworkspace`
    await fs.ensureDir(workspaceDirectory)
    const filePath = `${workspaceDirectory}/contents.xcworkspacedata`
    await fs.writeFile(filePath, xmlString)
    this.hasXcodeWorkspace = true
  }
}

const hasRequired = (required, files) => {
  return required.every(f => files.includes(f))
}