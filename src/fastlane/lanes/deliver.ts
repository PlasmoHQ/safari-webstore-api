
import { Lane, LaneOptions } from '~fastlane/lanes/'

export type DeliverOptions = LaneOptions & {
  
}

export class DeliverLane extends Lane {
  options: LaneOptions

  constructor(options: DeliverOptions) {
    super('deliver', options)
    this.options = options
  }
}