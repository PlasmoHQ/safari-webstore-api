
import { Lane, LaneOptions } from '~fastlane/lanes/'

export type BuildOptions = LaneOptions & {
  
}

export class BuildLane extends Lane {
  options: BuildOptions

  constructor(options: BuildOptions) {
    super('build', options)
    this.options = options
  }
}