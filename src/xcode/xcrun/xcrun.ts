
import { spawn } from "~util/process"

export class XCRun {
  cwd: string

  constructor(cwd: string) {
    this.cwd = cwd
  }
  
  async exec(args: string[] = []) {
    return await spawn('xcrun', args, { cwd: this.cwd })
  }
}