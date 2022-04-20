
import { Action, ActionOptions } from "~fastlane/common/action"
import { getVerboseLogger } from "~util/logging"

const vLog = getVerboseLogger()

export type UpdateProjectTeamOptions = {
  path: string,
  teamid: string
}

export class UpdateProjectTeamAction extends Action {
  options: UpdateProjectTeamOptions

  constructor(options: UpdateProjectTeamOptions, actionOptions?: ActionOptions) {
    super("update_project_team", actionOptions)
    this.options = options
  }

  async update() {
    const { path, teamid } = this.options
    return await super.run([ path, teamid ], this.options)
  }
}