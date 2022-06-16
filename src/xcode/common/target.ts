
import type { Platform } from "./platform"

export class Target {
  name: string
  platform: Platform
  extension: boolean

  constructor(name: string, target: string) {
    this.name = target
    this.platform = target.endsWith('(iOS)') ? 'ios' : 'macos'
    this.extension = target.split(`${name} `)[1].startsWith('Extension')
  }
}