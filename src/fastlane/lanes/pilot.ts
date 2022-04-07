
import { Lane, LaneOptions } from '~fastlane/common/lane'

export type PilotOptions = LaneOptions & {
  
}

export class PilotLane extends Lane {
  options: PilotOptions
  
  constructor(options: PilotOptions) {
    super('pilot', options)
    this.options = options
  }
}