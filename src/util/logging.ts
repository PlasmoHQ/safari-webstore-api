
let VERBOSE = false

export const enableVerboseLogging = () => {
  VERBOSE = true
}

export const getVerboseLogger = () => {
  return (...args) => VERBOSE && console.log(...args)
}