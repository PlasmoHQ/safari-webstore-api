
import { Lane, LaneOptions } from '~fastlane/lanes/'

export type PilotOptions = LaneOptions & {
  
}

export class PilotLane extends Lane {
  options: PilotOptions
  
  constructor(options: PilotOptions) {
    super('pilot', options)
    this.options = options
  }
}