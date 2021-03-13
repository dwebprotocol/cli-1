import DCast from 'dcast'
import randomWords from 'random-words'
import chalk from 'chalk'

const FULL_USAGE = `
  The cast command is a general-purpose tool for sending data over the dWeb
  according to a secret passphrase. You choose a phrase (try to make it hard-ish
  to guess!) and then share the phrase with your recipient. The phrase is only
  good for 30-60 minutes.

On the sending device:

  cat hello.txt | dweb cast "for Satoshi"

On the receiving device:

  dweb cast "for Satoshi" > ./hello.txt

This can be really useful for sharing dweb keys between devices. For instance:

  > dweb sync ./my-folder
  Creating new dDrive...
  Source: my-folder/
  Target: dweb://f7145e1bbc0d17705861e996b47422e0ca50a80db9441249bd721ff426b79f2a/
  Begin sync? [y/N] y
  Syncing...
  Synced
  > echo "dweb://f7145e1bbc0d17705861e996b47422e0ca50a80db9441249bd721ff426b79f2a/" \\
    | dweb cast "nobody can guess"
`

export default {
  name: 'cast',
  description: 'Send a stream of data over the dWeb.',
  usage: {
    simple: '[passphrase]',
    full: FULL_USAGE
  },
  command: async function (args) {
    var phrase = args._[0] ? args._.join(' ') : randomWords(3).join(' ')
    const cast = new DCast(phrase)

    if (!args._[0]) {
      console.error('[dcast] Generated passphrase:')
      console.error('')
      console.error('  ', chalk.bold(phrase))
      console.error('')
    }
    
    cast.on('remote-address', function ({ host, port }) {
      if (!host) console.error('[dcast] Could not detect remote address')
      else console.error('[dcast] Joined the dWeb DHT - remote address is ' + host + ':' + port)
      if (port) console.error('[dcast] Network is holepunchable \\o/')
    })

    cast.on('connected', function () {
      console.error('[dcast] Success! Encrypted tunnel established to remote peer')
    })

    cast.on('end', () => cast.end())

    process.stdin.pipe(cast).pipe(process.stdout)
    process.stdin.unref()

    process.once('SIGINT', () => {
      if (!cast.connected) closeASAP()
      else cast.end()
    })

    function closeASAP () {
      console.error('[dcast] Shutting down cast...')

      const timeout = setTimeout(() => process.exit(1), 2000)
      cast.destroy()
      cast.on('close', function () {
        clearTimeout(timeout)
      })
    }
  }
}
