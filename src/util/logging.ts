import consola from "consola"
import { Transform, type TransformCallback } from "stream"

export const enableVerboseLogging = () => {
  consola.level = Infinity
}

export const getLogger = () => {
  return consola
}

export class LogStream extends Transform {
  private log

  constructor(error?: boolean) {
    super()
    this.log = getLogger().debug
  }

  _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    this.log(chunk.toString())
    callback(null, chunk)
  }
}
