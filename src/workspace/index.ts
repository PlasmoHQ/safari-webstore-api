
import fs from "fs-extra"
import { spawn } from '~util/process'
import { ls, tmp, extractZip } from '~util/file'
import { getVerboseLogger } from '~util/logging'

const vLog = getVerboseLogger()

export class Workspace {
  path: string
  hasXcodeProject: boolean

  constructor(path?: string) {
    this.path = path
  }
  
  async assemble(zipPath: string): Promise<string> {
    if (this.path) await this.validate()
    else this.path = await this.create()
    await this.installDependencies()
    const extension = await this.extractExtension(zipPath)
    return extension
  }

  // user provided workspace (bring your own ruby and fastfile)
  private async validate(): Promise<string> {
    await fs.ensureDir(this.path)
    const [ruby, fastlane, xcode] = await checkWorkspace(this.path)
    if (xcode) {
      vLog("Found Xcode project in static workspace...")
      this.hasXcodeProject = true
    }
    if (!ruby) await generateRuby(this.path)
    if (!fastlane) await generateFastlane(this.path)
    return this.path
  }

  private async create(): Promise<string> {
    vLog("Creatomg tmp directory")
    const dir = await createTmp()
    vLog("Workspace is empty, generating...")
    await generateRuby(dir)
    await generateFastlane(dir)
    vLog("Workspace generated at: ", dir)
    return dir
  }

  private async installDependencies() {
    vLog("Installing Ruby dependencies...")
    const cwd = this.path
    return await spawn('bundle', ['install'], { cwd })
  }
  
  private async extractExtension(zipPath: string): Promise<string> {
    const extension = `${this.path}/extension/`
    vLog("Extracting extension...")
    await extractZip(zipPath, extension)
    vLog("Extension extracted to: ", extension)
    return extension
  }
}

const checkWorkspace = async (path: string): Promise<[boolean, boolean, boolean]> => {
  vLog("Validating provided workspace...")
  const files = await ls(path)
  const ruby = await validRuby(files)
  const fastlane = await validFastlane(files)
  const xcode = await hasXcodeProject(files)
  return [ruby, fastlane, xcode]
}

const hasRequired = (required, files) => {
  return required.every(f => files.includes(f))
}

const validFastlane = async (files: string[]) => {
  const required = ['fastlane/.env', 'fastlane/Pluginfile']
  return hasRequired(required, files)
}

const hasXcodeProject = async (files: string[]): Promise<boolean> => {
  const file = files.find(file => {
    const paths = file.split('/')
    return paths.length === 3 && paths[1].endsWith('.xcodeproj')
  })
  return file ? true : false
}

const createTmp = async () => {
  vLog("Creating tmp directory...")
  const dir = await tmp('plasmo-safari')
  vLog("Created tmp directory at: ", dir)
  return dir
}

const generateRuby = async (dir: string): Promise<void> => {
  vLog("Generating Ruby configuration...")
  fs.copySync('./template/ruby', dir)
}

const generateFastlane = async (dir: string): Promise<void> => {
  vLog("Generating Fastlane configuration...")
  fs.copySync('./template/fastlane', `${dir}/fastlane`)
}

const validRuby = async (files: string[]) => {
  return hasRequired(['Gemfile'], files)
}