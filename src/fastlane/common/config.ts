
import fs from "fs-extra"
import { getLogger } from "~util/logging"

const log = getLogger()

export type ConfigFileOptions = {
  name: string
}

export abstract class ConfigFile {
  options: ConfigFileOptions

  constructor(options: ConfigFileOptions) {
    this.options = options
  }

  abstract persist(path: string): Promise<string>

  async writeJSON(json: any, path: string): Promise<string> {
    const content = JSON.stringify(json)
    return await this.writeFile(path, content)
  }
  
  async writeRuby(params: {}, path: string): Promise<string> {
    const content = Object.entries(params).reduce((acc, entry) => {
      const [key, value] = entry
      if (key && value != null) acc.push(rubyGenerator(key, value))
      return acc
    }, []).join("\n")
    return await this.writeFile(path, content)
  }

  private async writeFile(path: string, content: string): Promise<string> {
    const { name } = this.options
    log.debug(`Generating ${name} and writing to file...`)
    const filePath = `${path}/${name}`
    await fs.writeFile(filePath, content)
    log.debug(`${name} generated at: ${filePath}`)
    return filePath
  }
}

// ruby type representation
const rubyGenerator = (key, value): string => {
  return `${key}(${wrapped(value)})`
}

const wrapped = (operand: any, indent: number = 0): string => {
  const types = {
    "object": (operand) => wrappedObject(operand, indent),
    "boolean": (operand) => operand.toString(),
    "number": (operand) => operand.toString(),
    "string": (operand) => `"${operand}"`
  }
  const type = types[typeof operand]
  return type(operand)
}

const wrappedObject = (object: any, spaces: number = 0): string => {
  const indent = " ".repeat(spaces)
  const nextIndent = indent + "  "
  if (Array.isArray(object)) {
    const stringifiedArray = object.map((value) => {
      return `${nextIndent}${wrapped(value, spaces+2)}`
    }).join(",\n")
    return `[\n${stringifiedArray}\n${indent}]`
  } else {
    const stringifiedObject = kvMap(object, (key, value) => {
      return `${nextIndent}${key}: ${wrapped(value, spaces+2)}`
    }).join(",\n")
    return `{\n${stringifiedObject}\n${indent}}`
  }
}

const kvMap = (kv: Object, fn: (key, value) => string): Array<any> => {
  return Object.entries(kv).reduce((acc, entry) => {
    const [key, value] = entry
    const output = fn(key, value)
    if (output) acc.push(fn(key, value))
    return acc
  }, [])
}
