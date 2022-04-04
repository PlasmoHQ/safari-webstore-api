
import { 
  spawn as spawnStream, 
  SpawnOptionsWithoutStdio
} from "child_process"

declare class Error {
  public message: string
  public name: string
  public exitCode: number
  public stdout: string
  public stderr: string
  constructor(message: string)
}

export class ProcessError extends Error {
  constructor(exitCode: number, stdout: string, stderr: string) {
    super(`child process exited with code ${exitCode}`)
    this.name = this.constructor.name
    this.exitCode = exitCode
    this.stdout = stdout
    this.stderr = stderr
  }
}

export const spawn = (command: string, args: Array<string>, options: SpawnOptionsWithoutStdio) => {
  return new Promise((resolve, reject) => {
    let [stdout, stderr] = ["", ""]
    const process = spawnStream(command, args, options)
    process.stdout.on('data', (data) => { stdout += data.toString() })
    process.stderr.on('data', (data) => { stderr += data.toString() })
    process.on('close', (code) => {
      if (code === 0) resolve(stdout)
      else reject(new ProcessError(code, stdout, stderr))
    })
  })
}