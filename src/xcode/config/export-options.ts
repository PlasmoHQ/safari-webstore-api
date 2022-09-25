import { writeFile } from "fs/promises"
import plist from "plist"

import type { Platform } from "~/xcode/common/platform"
import { getLogger } from "~util/logging"
import type { ProvisioningProfileOptions } from "~xcode/common/provisioning-profile"
import { ProvisioningProfile } from "~xcode/common/provisioning-profile"

const log = getLogger()

export type ExportOptions = {
  provisioningProfiles: {
    [key: string]: string
  }
}

export type GenerateExportOptions = {
  bundleId: string
  extensionBundleId: string
  platforms: Platform[]
  provisioningProfiles?: ProvisioningProfileOptions[]
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
      let profiles
      if (options.provisioningProfiles) {
        profiles = ProvisioningProfile.profiles(
          options.provisioningProfiles,
          platform
        )
      } else {
        // match defaults
        profiles = ProvisioningProfile.defaultProfiles(
          bundleId,
          extensionBundleId,
          platform
        )
      }

      const exportOptionsPlist = new ExportOptionsPlist(platform, {
        provisioningProfiles: profiles.reduce((acc, profile) => {
          acc[profile.bundleId] = profile.name
          return acc
        }, {})
      })
      await exportOptionsPlist.persist(path)
    }
  }

  async persist(dir: string) {
    log.debug(`Generating ExportOptions plist and writing to file...`)
    const fileName = `ExportOptions.${this.platform}.plist`
    const filePath = `${dir}/${fileName}`
    const plistString = plist.build(this.options)
    await writeFile(filePath, plistString)
    log.debug(`${fileName} generated at: ${filePath}`)
  }
}

export default ExportOptionsPlist
