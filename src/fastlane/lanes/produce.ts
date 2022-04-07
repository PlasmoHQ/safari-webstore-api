
import { Lane, LaneOptions } from '~fastlane/lanes/'

export type ProduceOptions = LaneOptions & {
  
}

export class ProduceLane extends Lane {
  options: ProduceOptions

  constructor(options: ProduceOptions) {
    super('produce', options)
    this.options = options
  }
}