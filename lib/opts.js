import path from 'path'

const DWEB_URL_REGEX = /^(dweb:\/\/)?([0-9a-f]{64})/i

export function parseDWebUrl (url) {
  return DWEB_URL_REGEX.exec(url)
}

export function isDWebUrl (url) {
  return !!parseDWebUrl(url)
}

export async function dweburlOpt (arg) {
  if (arg) {
    var match = DWEB_URL_REGEX.exec(arg)
    if (match) return `dweb://${match[2]}`
  }
}

export function dirOpt (arg) {
  if (arg) {
    if (!path.isAbsolute(arg)) return path.resolve(process.cwd(), arg)
    return arg
  }
  return process.cwd()
}

export function dweburlToKey (url) {
  var match = DWEB_URL_REGEX.exec(url)
  return match && match[2]
}