import chalk from 'chalk'
import bytes from 'bytes'
import ddatabaseCrypto from '@ddatabase/crypto'
import * as dweb from '../dweb/index.js'
import * as DWebStruct from '../dweb/struct.js'
import * as netStats from '../dweb/net-stats.js'

export class DWebStructInfoTracker {
  constructor (keyStr) {
    this.keyStr = keyStr
    this.key = Buffer.from(keyStr, 'hex')
    this.discoveryKey = ddatabaseCrypto.discoveryKey(this.key)

    this.size = undefined
    this.totalBlocks = undefined
    this.downloadedBlocks = undefined
    this.netCfg = undefined
    this.netStats = undefined
    this.struct = undefined
    this.loadStructPromise = undefined
  }

  get peers () {
    if (!this.struct) return []
    return (this.struct.api.metadata || this.struct.api.feed || this.struct.api).peers
  }

  genStatusLine () {
    var netCfg = this.genStatusNetCfg()
    if (!this.struct) {
      return `${this.genStatusIdent()}: ${netCfg}`
    }

    return `
      ${this.genStatusIdent()}:
      ${this.genStatusPeerCount()} |
      ${this.genStatusPctDownloaded()}
      ${this.genStatusNetStats()}
      - ${netCfg}
    `.split('\n').map(s => s.trim()).join(' ')
  }

  genStatusIdent (long = false) {
    if (!this.struct) return `${chalk.bold(maybeShort(this.keyStr, !long))}`
    return `${chalk.bold(maybeShort(this.keyStr, !long))} (${chalk.bold(this.struct.type)})`
  }

  genStatusPeerCount () {
    return `${this.peers.length} connected`
  }

  genStatusPctDownloaded () {
    if (typeof this.totalBlocks === 'undefined') return ''
    if (this.totalBlocks) {
      return `${this.totalBlocks ? Math.round(this.downloadedBlocks/this.totalBlocks*100) : 100}% downloaded (${bytes(this.size)} total)`
    }
    return 'Calculating...'
  }

  genStatusNetStats () {
    var stats = this.netStats
    if (!stats) return ''
    var dl = bytes(stats.download[stats.download.length - 1], {unitSeparator: ' '})
    var ul = bytes(stats.upload[stats.download.length - 1], {unitSeparator: ' '})
    return `[↓${dl}/s ↑${ul}/s]`
  }

  genStatusNetCfg () {
    var netCfg = 'Not swarming'
    if (this.netCfg) {
      if (this.netCfg.announce) netCfg = `Announced to seed`
      else if (this.netCfg.lookup) netCfg = `Watching for announced seeders`
    }
    return netCfg
  }

  async fetchState () {
    this.netCfg = await dweb.getClient().network.status(this.discoveryKey).catch(e => undefined)

    if (!this.struct) {
      /* dont await */ this.attemptLoadStruct()
      return
    }

    await this.calcBlockState().catch(e => undefined)
  }

  async attemptLoadStruct () {
    if (this.loadStructPromise) {
      return this.loadStructPromise
    }
    this.loadStructPromise = new Promise(async (resolve, reject) => {
      try {
        this.struct = await DWebStruct.get(this.keyStr, {noNetConfig: true, expect: undefined})
        this.netStats = netStats.get(this.struct)
        resolve()
      } catch (e) {
        // suppress errors
      }
    })
  }

  async calcBlockState () {
    if (!this.struct) return
    if (this.struct.type === 'ddrive') {
      let [total, size, downloaded] = [0, 0, 0]
      let contentBase = await new Promise(resolve => this.struct.api.getContent((err, base) => resolve(base)))
      for (let entry of await this.struct.api.promises.readdir('/', {recursive: true, includeStats: true})) {
        total += entry.stat.blocks
        size += entry.stat.size
        downloaded += await countHasBaseBlocks(contentBase, entry.stat.offset, entry.stat.offset + entry.stat.blocks)
      }
      this.totalBlocks = total
      this.size = size
      this.downloadedBlocks = downloaded
    } else if (this.struct.type === 'dwebtree') {
      this.downloadedBlocks = await this.struct.api.feed.downloaded()
      this.totalBlocks = this.struct.api.feed.length
      this.size = this.struct.api.feed.byteLength
    } else {
      this.downloadedBlocks = await this.struct.api.downloaded()
      this.totalBlocks = this.struct.api.length
      this.size = this.struct.api.byteLength
    }
  }
}

function short (key) {
  return `${key.slice(0, 6)}..${key.slice(-2)}`
}

function maybeShort (key, yesShort) {
  if (yesShort) return short(key)
  return key
}

async function countHasBaseBlocks (base, from, to) {
  var count = 0
  for (let i = from; i < to; i++) {
    count += (await base.has(i)) ? 1 : 0
  }
  return count
}
