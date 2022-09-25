import fs from "fs-extra"

import { extractZip } from "~util/file"
import { getLogger } from "~util/logging"

import { Manifest } from "./manifest"

const log = getLogger()

export class Extension {
  path: string
  manifest: Manifest

  constructor(path: string, manifest: Manifest) {
    this.path = path
    this.manifest = manifest
  }

  static async extract(zipPath: string, path: string): Promise<Extension> {
    log.debug(`Checking if provided extension zip exists at ${zipPath}...`)
    await fs.ensureFile(zipPath)

    const extractionPath = `${path}/extension/`
    log.debug("Extracting extension...")
    await extractZip(zipPath, extractionPath)
    log.debug("Extension extracted to: ", extractionPath)

    const manifestPath = `${extractionPath}/manifest.json`
    log.debug("Searching for manifest.json at", manifestPath)
    const manifest = await Manifest.fromFile(manifestPath)

    log.success("Extension extracted")
    return new Extension(extractionPath, manifest)
  }
}
