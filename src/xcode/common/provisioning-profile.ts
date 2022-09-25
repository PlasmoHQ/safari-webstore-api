
import type { Platform } from "~xcode/common/platform"

export type ProvisioningProfileType = 
  "appstore" | 
  "adhoc" | 
  "development" |
  "enterprise" |
  "developer_id" |
  "mac_installer_distribution"

export type ProvisioningProfileOptions = {
  bundleId: string,
  platform: Platform,
  type: ProvisioningProfileType,
  name: string
}

export type PartialProvisioningProfileOptions = ProvisioningProfileOptions | {
  bundleId: string,
  platform: Platform,
  type?: ProvisioningProfileType,
  name?: string
}

export class ProvisioningProfile {
  name: string
  type: ProvisioningProfileType
  platform: Platform
  bundleId: string

  constructor(options: PartialProvisioningProfileOptions) {
    this.platform = options.platform
    this.bundleId = options.bundleId
    this.type = options.type || "appstore"
    this.name = options.name || this.defaultName()
  }

  private defaultName(): string {
    const type = camelCaseType(this.type)
    const nameComponents = ['match', type, this.bundleId]
    if (this.platform !== "ios") nameComponents.push(this.platform)
    return nameComponents.join(' ')
  }

  static profiles(profiles: PartialProvisioningProfileOptions[], platform?: Platform): ProvisioningProfile[] {
    const results = profiles.map(profile => new ProvisioningProfile(profile))
    return platform ? results.filter(profile => profile.platform === platform): results
  }
  
  static defaultProfiles(bundleId: string, extensionBundleId: string, platform: Platform): ProvisioningProfile[] {
    return [
      new ProvisioningProfile({ bundleId, platform }),
      new ProvisioningProfile({ bundleId: extensionBundleId, platform })
    ]
  }
}

const camelCaseType = (type: ProvisioningProfileType) => ({
  "appstore": "AppStore",
  "adhoc": "AdHoc",
  "development": "Development",
  "enterprise": "Enterprise",
  "developer_id": "Developer ID",
  "mac_installer_distribution": "AppStore"
})[type]
