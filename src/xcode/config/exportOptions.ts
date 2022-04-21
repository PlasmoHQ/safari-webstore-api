
import plist from "plist"
import fs from "fs-extra"
import { getVerboseLogger } from "~util/logging"
import type { Platform, ProvisioningProfile } from "~/index"

const vLog = getVerboseLogger()

export type ExportOptions = {
  provisioningProfiles: {
    [key: string]: string
  }
}

export type GenerateExportOptions = {
  bundleId: string,
  extensionBundleId: string, 
  platforms: Platform[],
  provisioningProfiles?: ProvisioningProfile[]
}

export class ExportOptionsPlist {
  platform: string
  options: ExportOptions

  constructor(platform: Platform, options: ExportOptions) {
    this.platform = platform
    this.options = options
  }

  static async generate(path, options: GenerateExportOptions) {
    const { bundleId, extensionBundleId, platforms } = options
    for (const platform of platforms) {
      let exportOptionsPlist
      if (options.provisioningProfiles) {
        exportOptionsPlist = ExportOptionsPlist.userProvided(options.provisioningProfiles, platform)
      } else {
        exportOptionsPlist = ExportOptionsPlist.matchDefaults(bundleId, extensionBundleId, platform)
      }
      await exportOptionsPlist.persist(path)
    }
  }

  async persist(dir: string) {
    vLog(`Generating ExportOptions plist and writing to file...`)
    const fileName = `ExportOptions.${this.platform}.plist`
    const filePath = `${dir}/${fileName}`
    const plistString = plist.build(this.options)
    await fs.writeFile(filePath, plistString)
    vLog(`${fileName} generated at: ${filePath}`)
  }

  static matchDefaults(bundleId: string, extensionBundleId: string, platform: Platform) {
    return new ExportOptionsPlist(platform, {
      provisioningProfiles: {
        [bundleId]: provisioningProfileName(bundleId, platform),
        [extensionBundleId]: provisioningProfileName(extensionBundleId, platform)
      }
    })
  }
  
  static userProvided(profiles: ProvisioningProfile[], platform: Platform) {
    const filteredByPlatform = profiles.filter(profile => profile.platform === platform)
    return new ExportOptionsPlist(platform, {
      provisioningProfiles: filteredByPlatform.reduce((acc, profile) => {
        acc[profile.bundleId] = profile.name
        return acc
      }, {})
    })
  }
}

const provisioningProfileName = (bundleId: string, platform: Platform) => {  
  const nameComponents = ['match', 'AppStore', bundleId]
  if (platform !== "ios") nameComponents.push(platform)
  return nameComponents.join(' ')
}

export default ExportOptionsPlist