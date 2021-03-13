import * as DWebStruct from '../../dweb/struct.js'
import { statusLogger } from '../../status-logger.js'
import { parseDWebUrl } from '../../urls.js'

const FULL_USAGE = `
Examples:

  dweb drive cat dweb://1234..af/index.html
`

export default {
  name: 'drive cat',
  description: 'Output the content of the given ddrive URL.',
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

    if (process.stdout.isTTY) {
      let res = await drive.api.promises.readFile(urlp.pathname, 'utf8')
      statusLog.clear()
      console.log(res)
      process.exit(0)
    } else {
      let out = drive.api.createReadStream(urlp.pathname)
      out.on('error', err => {
        statusLog.clear()
        console.error(err)
        process.exit(1)
      })
      out.on('end', () => {
        statusLog.clear()
        process.exit(0)
      })
      out.pipe(process.stdout)
    }
  }
}
