import * as DWebStruct from '../../dweb/struct.js'
import { statusLogger } from '../../status-logger.js'
import { parseDWebUrl } from '../../urls.js'

const FULL_USAGE = `
Examples:

  dweb drive ls dweb://1234..af/
  dweb drive ls dweb://1234..af/foo/bar
`

export default {
  name: 'drive ls',
  description: 'List the entries of the given ddrive URL.',
  usage: {
    simple: '{url}',
    full: FULL_USAGE
  },
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')

    var statusLog = statusLogger(['Accessing dWeb...'])
    statusLog.print()

    var urlp =  parseDWebUrl(args._[0])
    var drive = await DWebStruct.get(urlp.hostname, {expect: 'ddrive'})
    var res = await drive.api.promises.readdir(urlp.pathname || '/')

    statusLog.clear()
    console.log(res.join('\n'))

    process.exit(0)
  }
}
