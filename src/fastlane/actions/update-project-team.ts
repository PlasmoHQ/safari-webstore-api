import { Action, type ActionOptions } from "~fastlane/common/action"
import { getLogger } from "~util/logging"

const log = getLogger()

export type UpdateProjectTeamOptions = {
  path: string
  teamid: string
}

export class UpdateProjectTeamAction extends Action {
  options: UpdateProjectTeamOptions

  constructor(
    options: UpdateProjectTeamOptions,
    actionOptions?: ActionOptions
  ) {
    super("update_project_team", actionOptions)
    this.options = options
  }

  async update() {
    log.debug("Updating project team")
    const { path, teamid } = this.options
    return await super.run([path, teamid], this.options)
  }
}
