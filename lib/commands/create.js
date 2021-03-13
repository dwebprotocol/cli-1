import * as DWebStruct from '../dweb/struct.js'
import { getMirroringClient } from '../dweb/index.js'

export default {
  name: 'create',
  description: 'Create a new dDrive or dTree.',
  usage: {
    simple: '{drive|dtree}',
    full: ''
  },
  command: async function (args) {
    var struct
    if (args._[0] === 'drive' || args._[0] === 'ddrive') {
      struct = await DWebStruct.create('ddrive')
      console.error('Drive Created:', struct.url)
    } else if (args._[0] === 'dtree' || args._[0] === 'dwebtree') {
      struct = await DWebStruct.create('dwebtree')
      console.error('dTree Created:', struct.url)
    } else {
      if (args._[0]) console.error('Unknown type:', args._[0], '- must be a "drive" or "dtree".')
      else console.error('What do you want to create? Can be a "drive" or "dtree".')
      process.exit(1)
    }

    await getMirroringClient().mirror(struct.key, struct.type)
    console.log('Seeding', struct.type)
    process.exit(0)
  }
}
