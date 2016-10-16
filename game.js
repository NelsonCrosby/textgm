'use strict'

const EventEmitter = require('events')
const log = require('debug')('textgm:game')

module.exports =
class Game extends EventEmitter {
  constructor() {
    super()

    this.on('message', this._onMessage)
  }

  _onMessage(msg) {
    log(msg)
    this.emit('reply', msg.sender, 'Got message')
  }

  start() {
    return Promise.resolve(this)
  }
}
