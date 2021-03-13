import * as DWebStruct from '../../dweb/struct.js'
import { statusLogger } from '../../status-logger.js'
import { fromPathToDTreeKeyList, parseDWebUrl } from '../../urls.js'

const FULL_USAGE = `
Examples:

  dweb dtree del dweb://1234..af/foo
  dweb dtree del dweb://1234..af/foo/bar
`

export default {
  name: 'dtree del',
  description: 'Delete an entry of the given dwebtree URL.',
  usage: {
    simple: '{url}',
    full: FULL_USAGE
  },
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')

    var statusLog = statusLogger(['Accessing dWeb...'])
    statusLog.print()

    var urlp = parseDWebUrl(args._[0])
    var dtree = await DWebStruct.get(urlp.hostname, {expect: 'dwebtree'})

    var path = fromPathToDTreeKeyList(urlp.pathname)
    var keyspace = dtree.api
    for (let i = 0; i < path.length - 1; i++) {
      keyspace = keyspace.sub(path[i])
    }
    await keyspace.del(path[path.length - 1])

    statusLog.clear()
    console.log(`/${path.map(encodeURIComponent).join('/')} has been deleted`)

    process.exit(0)
  }
}
