import { readJson } from "fs-extra"

import { getLogger } from "~util/logging"

const log = getLogger()

export type ManifestBackground = {
  service_worker: string
}

export class Manifest {
  name: string
  description: string
  manifest_version: number
  author: string
  background: ManifestBackground
  version: string

  constructor(options: any) {
    this.name = options.name
    this.description = options.description
    this.manifest_version = options.manifest_version
    this.author = options.author
    this.background = options.background
    this.version = options.version

    if (this.manifest_version !== 2)
      throw new Error("only manifest v2 is supported")
  }

  static async fromFile(filePath: string): Promise<Manifest> {
    log.debug("Reading manifest at: ", filePath)
    const json = await readJson(filePath)
    return new Manifest(json)
  }
}
