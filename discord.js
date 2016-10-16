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
    this.channel.sendMessage(`@here Starting game ${game}...`)
    games[this.channel.id] = {
      send(info) {
        log(info)
      }
    }
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
  } else if (msg.author.id !== client.user.id) {
    let game = games[msg.channel.id]
    if (game != null) {
      game.send({
        content: msg.content,
        sender: {
          id: msg.author.id,
          nick: msg.author.username
        }
      })
    }
  }
})

process.on('SIGINT', () => {
  client.destroy().then(process.exit)
})

client.login(process.env.TGM_TOKEN)
