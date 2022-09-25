import { XCRun } from "~xcode/xcrun/xcrun"

export class XcodeBuild extends XCRun {
  async list() {
    const { stdout } = await this.run(["-list", "-json"])
    return JSON.parse(stdout)
  }

  private async run(args: string[] = []) {
    return this.exec(["xcodebuild"].concat(args))
  }
}

export default XcodeBuild
