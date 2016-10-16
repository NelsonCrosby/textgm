'use strict'

const EventEmitter = require('events')
const log = require('debug')('textgm:game')

module.exports =
class Game extends EventEmitter {
  constructor() {
    super()
    this.options = {}

    this.on('message', this._onMessage)
  }

  getOption(k) {
    return this.options[k]
  }

  setOption(k, v) {
    return this['_setOption_' + k](v)
  }

  start() {
    return Promise.resolve(this)
  }

  _onMessage(msg) {
    log(msg)
    this.emit('reply', msg.sender, 'Got message')
  }
}
