import dhub from 'dhub'
const DHubClient = dhub.Client

import { setup } from '../../dweb/index.js'

const FULL_USAGE = `
Examples:

  dweb daemon start
`
export default {
  name: 'daemon start',
  description: 'Start the dHub daemon.',
  usage: {
    full: FULL_USAGE
  },
  command: async function (args) {
    await setup()
    try {
      const client = new DHubClient()
      await client.ready()
      await client.status()
    } catch (err) {
      console.error('Could not start the daemon:')
      console.error(err)
      process.exit(1)
    }
    console.log('Daemon is running.')
    process.exit(0)
  }
}
