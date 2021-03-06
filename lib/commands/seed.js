import chalk from 'chalk'
import * as DWebStruct from '../dweb/struct.js'
import { getMirroringClient } from '../dweb/index.js'
import { parseDWebUrl } from '../urls.js'

const FULL_USAGE = `
Examples:

  dweb seed dweb://1234..af/
  dweb seed dweb://1234..af/ dweb:://fedc..21/
`

export default {
  name: 'seed',
  description: 'Download and make dweb data available to the dWeb.',
  usage: {
    simple: '{urls...}',
    full: FULL_USAGE
  },
  command: async function (args) {
    if (!args._[0]) throw new Error('At least URL is required')
    var mirroringClient = getMirroringClient()

    var keys = []
    for (let url of args._) {
      let urlp = parseDWebUrl(url)
      keys.push(urlp.hostname)
    }

    for (const key of keys) {
      var struct = await DWebStruct.get(key)
      await mirroringClient.mirror(struct.key, struct.type)
      console.log(`Seeding ${chalk.bold(short(key))}`)
    }
    process.exit(0)
  }
}

function short (key) {
  return `${key.slice(0, 6)}..${key.slice(-2)}`
}
