
import fs from "fs-extra"
import { extractZip, createTmp } from "~util/file"
import { spawn } from "~util/process"

export type Options = {
  productId: string
  clientId: string
  clientSecret: string
  accessTokenUrl: string
}

export const errorMap = {
  productId:
    "Product ID is required. To get one, go to: https://partner.microsoft.com/en-us/dashboard/microsoftedge/{product-id}/package/dashboard",
  clientId:
    "Client ID is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi",
  clientSecret:
    "Client Secret is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi",
  accessTokenUrl:
    "Access token URL is required. To get one: https://partner.microsoft.com/en-us/dashboard/microsoftedge/publishapi"
}

export const requiredFields = Object.keys(errorMap) as Array<
  keyof typeof errorMap
>

export class SafariAppStoreClient {
  options = {} as Options

  constructor(options: Options) {
    for (const field of requiredFields) {
      if (!options[field]) {
        throw new Error(errorMap[field])
      }
      this.options[field] = options[field]
    }
  }

  async submit({ filePath = "" }) {
    const dir = await generateWorkspace(filePath)
  }
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
  const content = Object.entries(options).reduce((acc, entry) => {
    const [key, value] = entry
    acc[key].push(`${key} "${value}"`)
    return acc
  }, []).join("\n")
  await fs.writeFile(filePath, content)
  return filePath
}

const generateWorkspace = async (zipPath: string) => {
  const dir = await createTmp('plasmo-safari')
  console.log("Created tmp directory at: ", dir)
  const extension = `${dir}/extension/`
  console.log("Extracting extension...")
  await extractZip(zipPath, extension)
  console.log("Extension extracted to: ", extension)
  await fs.copySync('./template/', dir) // copy Fastlane template
  await installDependencies(dir)
  console.log("Generating Xcode project...")
  await fastlane('generate', { extension }, dir)
  const appfile: AppfileOptions = { app_identifier: "" }
  await generateAppfile(`${dir}/fastlane/Appfile`, appfile)
  return dir
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

const fastlane = async (lane: string, params: ConvertWebExtensionParams, cwd: string) => {
  const { extension } = params
  return await spawn('bundle', [
    'exec', 'fastlane', 
    lane, `extension:${extension}`
  ], { cwd }) // actions execute from the fastlane subdirectory
}

const installDependencies = async (cwd: string) => {
  console.log("Installing Ruby dependencies...")
  return await spawn('bundle', ['install', '--deployment'], { cwd })
}