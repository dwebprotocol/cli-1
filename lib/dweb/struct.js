import EventEmitter from 'events'
import ddrive from 'ddrive'
import DWebTree from 'dwebtree'
import { getClient } from './index.js'
import lock from '../lock.js'
import { fromURLToKeyStr } from '../urls.js'
import DWebTrieMessages from 'dwebtrie/lib/messages.js'
import DWebTreeMessages from 'dwebtree/lib/messages.js'

// globals
// =

export const activeStructures = {} // [keyStr] => DWebStructure

// exported apis
// =

class DWebStructure extends EventEmitter {
  constructor (keyStr) {
    super()
    this.keyStr = keyStr
    this.type = undefined
    this.header = undefined
    this.api = undefined
  }

  get key () {
    return this.base?.key
  }

  get discoveryKey () {
    return this.base?.discoveryKey
  }

  get url () {
    return `dweb://${this.keyStr}`
  }

  get base () {
    if (!this.api) return undefined
    if (this.type === 'ddrive') return this.api.metadata
    if (this.type === 'dwebtree') return this.api.feed
  }

  async load ({noNetConfig} = {noNetConfig: false}) {
    var base
    var wasOpen = !!this.api

    // detect the dweb-structure type
    if (!this.type || !this.header) {
      base = getClient().basestore().get(this.keyStr)
      await base.ready()
      if (!noNetConfig) getClient().network.configure(base, {lookup: true, announce: true})
      let headerBlock = await base.get(0)
      try {
        this.header = DWebTrieMessages.Header.decode(headerBlock)
        if (this.header.type === 'dwebtrie') {
          this.type = this.header.subtype || 'ddrive'
        } else {
          throw new Error() // bounce to the next parser
        }
      } catch {
        try {
          this.header = DWebTreeMessages.Header.decode(headerBlock)
          if (this.header?.protocol !== 'dwebtree') {
            throw new Error() // bounce to next parser
          }
          this.type = 'dwebtree'
        } catch {
          this.header = undefined
          this.type = 'unknown'
        }
      }
    }

    // load the dweb-structure API session
    if (this.type === 'ddrive') {
      this.api = ddrive(getClient().basestore(), this.keyStr, {extension: false})
      await this.api.promises.ready()
    } else if (this.type === 'dwebtree') {
      base = base || getClient().basestore().get(this.keyStr)
      this.api = new DWebTree(base, {
        keyEncoding: 'binary',
        valueEncoding: 'json'
      })
      await this.api.ready()
    } else {
      this.api = base || getClient().basestore().get(this.keyStr)
      await this.api.ready()
    }

    if (wasOpen) {
      this.emit('reloaded')
    }
  }

  async create (type, {noNetConfig} = {noNetConfig: false}) {
    if (this.type) {
      throw new Error('Cannot call create on a dweb structure that already exists')
    }
    if (type !== 'ddrive' && type !== 'dwebtree') {
      throw new Error(`Unknown dDatabase structure type (${type}) cannot create`)
    }

    this.type = type

    if (this.type === 'ddrive') {
      this.api = ddrive(getClient().basestore(), null, {extension: false})
      await this.api.promises.ready()
      this.keyStr = this.key.toString('hex')
    } else if (this.type === 'dwebtree') {
      let base = getClient().basestore().get(null)
      this.api = new DWebTree(base, {
        keyEncoding: 'binary',
        valueEncoding: 'json'
      })
      await this.api.ready()
      this.keyStr = this.key.toString('hex')
    }

    if (!noNetConfig) getClient().network.configure(this.base, {lookup: true, announce: true})
  }


  async close () {
    if (this.api) {
      // TODO do we need to configure the dWeb with announce/lookup false?
      this.api.close()
      this.api = undefined
      this.emit('closed')
    }
  }
}

export async function get (key, {expect, noNetConfig} = {expect: undefined, noNetConfig: false}) {
  var keyStr = fromURLToKeyStr(key)
  var release = await lock(`dweb-struct-get:${keyStr}`)
  try {
    if (keyStr in activeStructures) {
      return activeStructures[keyStr]
    }
    var struct = new DWebStructure(keyStr)
    await struct.load({noNetConfig})
    activeStructures[keyStr] = struct

    if (expect && struct.type !== expect) {
      throw new Error(`The dweb:// was expected to be a ${expect}, got ${struct.type}`)
    }

    return struct
  } finally {
    release()
  }
}

export async function create (type) {
  var struct = new DWebStructure(null)
  await struct.create(type)
  activeStructures[struct.keyStr] = struct
  return struct
}
