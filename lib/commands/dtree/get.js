import * as DWebStruct from '../../dweb/struct.js'
import { statusLogger } from '../../status-logger.js'
import { fromPathToDTreeKeyList, parseDWebUrl } from '../../urls.js'

const FULL_USAGE = `
Examples:

  dweb dtree get dweb://1234..af/foo
  dweb dtree get dweb://1234..af/foo/bar
`

export default {
  name: 'dtree get',
  description: 'Get the value of an entry of the given dwebtree URL.',
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
    var entry = await keyspace.get(path[path.length - 1])

    statusLog.clear()
    console.log(JSON.stringify(entry.value, null, 2))

    process.exit(0)
  }
}
