
import fs from "fs-extra"
import { getVerboseLogger, enableVerboseLogging } from "~util/logging"
import { extractZip, tmp, ls, emptyDir } from "~util/file"
import { spawn } from "~util/process"

const vLog = getVerboseLogger()

export type Options = {
  bundleId?: string
  verbose?: boolean
}

export const errorMap = {
}

export const requiredFields = Object.keys(errorMap) as Array<
  keyof typeof errorMap
>

export type SubmitOptions = {
  filePath: string // extension zip file path
  workspacePath?: string // custom static workspace
}


export class SafariAppStoreClient {
  options = {} as Options

  constructor(options: Options) {
    for (const field of requiredFields) {
      if (!options[field]) {
        throw new Error(errorMap[field])
      }
      this.options[field] = options[field]
    }
    
    if (options.verbose) enableVerboseLogging()
  }

  async submit(options: SubmitOptions) {
    const { filePath, workspacePath } = options
    const dir = await workspace(filePath, workspacePath)
  }
}

const workspace = async (filePath: string, path?: string): Promise<string> => {
  const dir = path || await createTmp()
  await fs.ensureDir(dir) // ensure dir exists or create
  if (await emptyDir(dir)) {
    vLog("Workspace is empty, generating...")
    await generateWorkspace(dir, filePath)
    vLog("Workspace generated at: ", dir)
  } else if (await validWorkspace(dir)) {
    vLog("Valid workspace found...")
  }
  return dir
}

const validWorkspace = async (workspacePath: string): Promise<boolean> => {
  const files = await ls(workspacePath)
  const requiredFiles = await ls('./template/')
  const hasRequired = requiredFiles.every(v => files.includes(v))
  if (!hasRequired) throw new Error('missing required workspace files')
  return hasRequired
}

const createTmp = async () => {
  vLog("Creating tmp directory...")
  const dir = await tmp('plasmo-safari')
  vLog("Created tmp directory at: ", dir)
  return dir
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

const extractExtension = async (workspacePath: string, zipPath: string) => {
  const extension = `${workspacePath}/extension/`
  vLog("Extracting extension...")
  await extractZip(zipPath, extension)
  vLog("Extension extracted to: ", extension)
  return extension
}

const generateWorkspace = async (workspacePath: string, zipPath: string) => {
  const extension = await extractExtension(workspacePath, zipPath)
  await fs.copySync('./template/', workspacePath) // copy Fastlane template
  await installDependencies(workspacePath)
  await generateXcodeProject(extension, workspacePath)
  const appfile: AppfileOptions = { app_identifier: "" }
  await generateAppfile(`${workspacePath}/fastlane/Appfile`, appfile)
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

const generateXcodeProject = async (extensionPath: string, dir: string) => {
  vLog("Generating Xcode project...")
  await fastlane('generate', { extension: extensionPath }, dir)
}

const fastlane = async (lane: string, params: ConvertWebExtensionParams, cwd: string) => {
  const { extension } = params
  return await spawn('bundle', [
    'exec', 'fastlane', 
    lane, `extension:${extension}`
  ], { cwd }) // actions execute from the fastlane subdirectory
}

const installDependencies = async (cwd: string) => {
  vLog("Installing Ruby dependencies...")
  return await spawn('bundle', ['install', '--deployment'], { cwd })
}