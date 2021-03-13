import * as DWebStruct from '../../dweb/struct.js'
import { statusLogger } from '../../status-logger.js'
import { parseDWebUrl } from '../../urls.js'

const FULL_USAGE = `
Examples:

  dweb drive mkdir dweb://1234..af/foldername
`

export default {
  name: 'drive mkdir',
  description: 'Create a new directory at the given ddrive URL.',
  usage: {
    simple: '{url}',
    full: FULL_USAGE
  },
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')

    var statusLog = statusLogger(['Accessing dWeb...'])
    statusLog.print()

    var urlp =  parseDWebUrl(args._[0])
    if (!urlp.pathname || urlp.pathname === '/') {
      throw new Error('Root folder already exists')
    }
    var drive = await DWebStruct.get(urlp.hostname, {expect: 'ddrive'})
    await drive.api.promises.mkdir(urlp.pathname || '/')

    statusLog.clear()
    console.log(`${urlp.pathname} created`)
    process.exit(0)
  }
}
