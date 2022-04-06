
import tmpAsync from "tmp"
import unzipper from "unzipper"
import fs from "fs-extra"

export const extractZip = (filePath: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: dest }))
      .on('error', reject)
      .on('close', resolve)
  })
}

export const tmp = (prefix: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    tmpAsync.setGracefulCleanup()
    tmpAsync.dir({ prefix }, (err, path) => {
      if (err) reject(err)
      resolve(path)
    })
  })
}

// recursive ls with relative paths
export const ls = async (dir: string, relative: string = ""): Promise<string[]> => {
  type Path = string | string[]
  const files = await fs.readdir(dir)
  const _ls = async (file: string): Promise<Path> => {
    const absolutePath = `${dir}/${file}`
    const relativePath = `${relative}${file}`
    const stat = await fs.lstat(absolutePath)
    if (stat.isDirectory()) return await ls(absolutePath, `${relativePath}/`)
    return relativePath
  }
  const promises: Promise<Path>[] = await files.map(_ls)
  const paths: Path[] = await Promise.all(promises)
  return paths.flat()
}

export const emptyDir = async (dir: string): Promise<boolean> => {
  const length = await fs.readdir(dir).length 
  return (length === 0)
}