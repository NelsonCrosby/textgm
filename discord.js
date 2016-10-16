'use strict'

const log = require('debug')('textgm:discord')
const Discord = require('discord.js')
const shlex = require('shell-quote')

const client = new Discord.Client()

const commands = {
  '.help'() {
    this.reply(`
.start-game <game>`)
  },

  '.start-game'(game) {
    log('Starting', game)
  }
}

const games = {}

client.on('ready', () => {
  log('Ready!')
})

client.on('message', (msg) => {
  if (msg.content.startsWith('.')) {
    let args = shlex.parse(msg.content)
    let cmd = args.shift()
    commands[cmd].apply(msg, args)
  } else {
    log(msg.content)
  }
})

process.on('SIGINT', () => {
  client.destroy().then(process.exit)
})

client.login(process.env.TGM_TOKEN)
