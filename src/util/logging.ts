
import { Transform, PassThrough, TransformCallback } from "stream"

let VERBOSE = false

export const enableVerboseLogging = () => {
  VERBOSE = true
}

export const getVerboseLogger = (error?: boolean) => {
  return (...args: any[]) => {
    if (VERBOSE) {
      if (error) console.error(...args)
      else console.log(...args)
    }
  }
}

export class LogStream extends Transform {
  private log: (string) => void

  constructor(error?: boolean) {
    super()
    this.log = getVerboseLogger(error)
  }

  _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
    this.log(chunk.toString())
    callback(null, chunk)
  }
}