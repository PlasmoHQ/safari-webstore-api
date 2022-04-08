
import { 
  spawn as spawnStream, 
  SpawnOptionsWithoutStdio
} from "child_process"
import type { Readable } from "stream"
import { getVerboseLogger, LogStream } from "~/util/logging"
import { readStreamSync } from "~/util/stream"

const vLog = getVerboseLogger()

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

export const spawn = async (command: string, args: Array<string>, options: SpawnOptionsWithoutStdio): Promise<string> => {
  try {
    const stdoutStream = await _spawn(command, args, options)
    return await readStreamSync(stdoutStream)
  } catch ([code, stdoutStream, stderrStream]) {
    const stdout = await readStreamSync(stdoutStream)
    const stderr = await readStreamSync(stderrStream)
    throw new ProcessError(code, stdout, stderr)
  }
}

const _spawn = (command, args, options): Promise<Readable> => {
  return new Promise<Readable>((resolve, reject) => {
    vLog(`Spawning child_process "${command} ${args.join(" ")}"...`)
    const process = spawnStream(command, args, options)
    const stdout = process.stdout.pipe(new LogStream())
    const stderr = process.stderr.pipe(new LogStream(true))
    process.on('close', (code) => {
      if (code === 0) resolve(stdout)
      else reject([code, stdout, stderr])
    })
  })
}

