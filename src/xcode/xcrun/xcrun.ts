import spawnAsync from "@expo/spawn-async"

export class XCRun {
  cwd: string

  constructor(cwd: string) {
    this.cwd = cwd
  }

  async exec(args: string[] = []) {
    return await spawnAsync("xcrun", args, { cwd: this.cwd })
  }
}
