import chalk from 'chalk'
import dhub from 'dhub'
const DHubClient = dhub.Client

const FULL_USAGE = `
Examples:

  dweb daemon status
`

export default {
  name: 'daemon status',
  description: 'Check the status of the dHub daemon.',
  usage: {
    simple: '',
    full: FULL_USAGE
  },
  command: async function (args) {
    try {
      let client = new DHubClient()
      await client.ready()
      let st = await client.status()
      const versionString = st.version ? `v${st.version}` : '(Unknown Version)'
      console.error(chalk.bold(`dHub ${versionString}`))
      console.error(chalk.bold(`dHub API v${st.apiVersion}`))
      console.error(`Your address: ${st.remoteAddress} (${st.holepunchable ? 'Hole-punchable' : 'Not Hole-punchable'})`)
    } catch {
      console.error(`Daemon not active`)
    }

    process.exit(0)
  }
}
