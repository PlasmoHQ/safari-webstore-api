
import { Lane, LaneOptions } from '~fastlane/lanes/'

export type AuthOptions = LaneOptions & {

}

export class AuthLane extends Lane {
  options: AuthOptions
  
  constructor(options: AuthOptions) {
    super('auth', options)
    this.options = options
  }
}