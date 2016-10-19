'use strict'

const cp = require('child_process')
const EventEmitter = require('events')
const fs = require('fs')
const log = require('debug')('textgm:game')

const TOPDIR = 'DATA'

module.exports =
class Game extends EventEmitter {
  constructor(chid, name) {
    super()
    this.name = name
    this.options = {}

    this.on('message', this._onMessage)

    this._startup = new Promise((resolve, reject) => {
      fs.mkdir(`${TOPDIR}/${chid}`, (err) => {
        if (err) reject(err)
        else resolve()
      })
    }).then(() => { this.gamefile = `${TOPDIR}/games/${name}` })
  }

  getOption(k) {
    return this.options[k]
  }

  setOption(k, v) {
    return this['_setOption_' + k](v)
  }

  start() {
    return this._startup.then(() => {
      let proc = cp.spawn('dfrotz', [ this.gamefile ])
      this.proc = proc

      proc.stdout.setEncoding('utf8')
      proc.stdout.on('data', data => this.emit('update', data))
      proc.stderr.setEncoding('utf8')
      proc.stderr.on('data', data => this.emit('info', data))
    })
  }

  _onMessage(msg) {
    log(msg)
    this.proc.stdin.write(msg.content + '\n', 'utf8', log)
  }
}
