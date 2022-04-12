
import tmpAsync from "tmp"
import unzipper from "unzipper"
import fs from "fs-extra"
import path from "path"

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
export const ls = async (dir: string, maxDepth?: number, relative: string = ""): Promise<string[]> => {
  type Path = string | string[]
  const files = await fs.readdir(dir)
  const _ls = async (file: string): Promise<Path> => {
    const absolutePath = `${dir}/${file}`
    const relativePath = `${relative}${file}`
    const stat = await fs.lstat(absolutePath)
    const tooDeep = maxDepth && relativePath.split(path.sep).length >= maxDepth
    if (stat.isDirectory() && !tooDeep) return await ls(absolutePath, maxDepth, `${relativePath}/`)
    else if (stat.isDirectory()) return `${relativePath}/`
    else return relativePath
  }
  const promises: Promise<Path>[] = await files.map(_ls)
  const paths: Path[] = await Promise.all(promises)
  return paths.flat()
}

export const emptyDir = async (dir: string): Promise<boolean> => {
  const length = await fs.readdir(dir).length 
  return (length === 0)
}

export const findFile = async (dir: string, fn: (filePath: string, depth: number) => boolean, depth?: number) => {
  const files = await ls(dir, depth)
  return files.find((filePath) => {
    const paths = path.normalize(filePath).split(path.sep)
    return fn(filePath, paths.length)
  })
}

export const findFileByExtName = async (dir: string, ext: string, depth?: number) => {
  return await findFile(dir, (filePath) => {
    return path.extname(filePath) === ext
  }, depth)
}