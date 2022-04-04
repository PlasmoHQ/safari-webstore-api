
import tmp from "tmp"
import unzipper from "unzipper"
import fs from "fs-extra"

export const extractZip = (filePath: string, dest: string) => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: dest }))
      .on('error', reject)
      .on('close', resolve)
  })
}

export const createTmp = (prefix: string) => {
  return new Promise<string>((resolve, reject) => {
    tmp.setGracefulCleanup()
    tmp.dir({ prefix }, (err, path) => {
      if (err) reject(err)
      resolve(path)
    })
  })
}