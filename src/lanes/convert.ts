import fs from "fs-extra"
import { extractZip, tmp, ls, emptyDir } from "~util/file"
import { spawn } from "~util/process"
import { getVerboseLogger } from "~util/logging"
import type { ConvertOptions } from "~/"

const vLog = getVerboseLogger()

export class ConvertLane {
  filePath: string
  cwd: string

  constructor(options: ConvertOptions) {
    const { filePath } = options
    this.filePath = filePath
  }

  async run(staticDir?: string) {
    const [workspace, extension] = await getWorkspace(this.filePath, staticDir)
    await installDependencies(workspace)
    await generateXcodeProject(workspace, extension)
  }
}

type Workspace = {
  path: string
}

type Extension = {
  path: string
}

const getWorkspace = async (filePath: string, path?: string): Promise<[Workspace, Extension]> => {
  const dir = path || await createTmp()
  let workspace = { path: dir } as Workspace
  let extension = null
  await fs.ensureDir(workspace.path) // ensure dir exists or create
  if (await emptyDir(workspace.path)) {
    vLog("Workspace is empty, generating...")
    let [res1, res2] = await generateWorkspace(workspace.path, filePath)
    workspace = res1
    extension = res2
    vLog("Workspace generated at: ", workspace.path)
  } else if (await validWorkspace(workspace)) {
    vLog("Valid workspace found...")
  } else {
    throw new Error("Invalid workspace")
  }
  return [workspace, extension]
}

const createTmp = async () => {
  vLog("Creating tmp directory...")
  const dir = await tmp('plasmo-safari')
  vLog("Created tmp directory at: ", dir)
  return dir
}

const hasRequired = (required, files) => {
  return required.every(f => files.includes(f))
}

const validRuby = async (files: string[]) => {
  const required = [
    './bundle/config',
    'Gemfile',
    'Gemfile.lock'
  ]
  return hasRequired(required, files)
}

const validFastlane = async (files: string[]) => {
  const required = [
    'fastlane/Appfile',
    'fastlane/Pluginfile',
    'fastlane/Fastfile'
  ]
  return hasRequired(required, files)
}

const hasXcodeProject = async (files: string[]): Promise<boolean> => {
  const file = files.find(file => file.includes('.xcodeproj'))
  return file ? true : false
}

const checkWorkspace = async (workspace: Workspace): Promise<[boolean, boolean, boolean]> => {
  const files = await ls(workspace.path)
  const ruby = await validRuby(files)
  const fastlane = await validFastlane(files)
  const xcode = await hasXcodeProject(files)
  return [ruby, fastlane, xcode]
}

const validWorkspace = async (workspace: Workspace): Promise<boolean> => {
  const [ruby, fastlane,] = await checkWorkspace(workspace)
  return ruby && fastlane
}

const extractExtension = async (workspacePath: string, zipPath: string) => {
  const extension = `${workspacePath}/extension/`
  vLog("Extracting extension...")
  await extractZip(zipPath, extension)
  vLog("Extension extracted to: ", extension)
  return extension
}

const generateWorkspace = async (dir: string, zipPath: string): Promise<Workspace> => {
  const extension = await extractExtension(dir, zipPath)
  fs.copySync('./template/', dir) // copy Fastlane template
  //const appfile: AppfileOptions = { app_identifier: "" }
  //await generateAppfile(`${workspacePath}/fastlane/Appfile`, appfile)
  return { path: dir, extensionPath: extension }
}

const installDependencies = async (workspace: Workspace) => {
  console.log("Installing Ruby dependencies...")
  return await spawn('bundle', ['install', '--deployment'], { cwd: workspace.path })
}

type ConvertWebExtensionParams = {
  extension: string
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

const generateXcodeProject = async (workspace: Workspace, extension: Extension) => {
  vLog("Generating Xcode project...")
  await fastlane('generate', { extension: extension.path }, workspace.path)
}

const fastlane = async (lane: string, params: ConvertWebExtensionParams, cwd: string) => {
  const { extension } = params
  return await spawn('bundle', [
    'exec', 'fastlane', 
    lane, `extension:${extension}`
  ], { cwd }) // actions execute from the fastlane subdirectory
}

// https://docs.fastlane.tools/advanced/#appfile
export type AppfileOptions = {
  app_identifier: string // bundle identifier of extension
  apple_id?: string // use below ids if different between Portal/Connect 
  apple_dev_portal_id?: string // if different creds between Portal/Connect
  itunes_connect_id?: string // if different creds between Portal/Connect
  team_name?: string // developer portal team
  team_id?: string // developer portal team
  itc_team_name?: string // App Store Connect team
  itc_team_id?: string // App Store Connect team
}

const generateAppfile = async (filePath, options: AppfileOptions) => {
  vLog("Generating Appfile...")
  const content = Object.entries(options).reduce((acc, entry) => {
    const [key, value] = entry
    acc.push(`${key} "${value}"`)
    return acc
  }, []).join("\n")
  await fs.writeFile(filePath, content)
  vLog("Appfile generated at: ", filePath)
  return filePath
}