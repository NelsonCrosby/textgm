'use strict'

const log = require('debug')('textgm:discord')
const Discord = require('discord.js')
const shlex = require('shell-quote')

const Game = require('./game')

const client = new Discord.Client()
const games = {}

function onGameUpdate(chan, msg) {
  chan.sendMessage(msg)
}

function onGameInfo(chan, msg) {
  chan.sendMessage(['***Info***', msg])
}

function onGameReply(chan, sender, msg) {
  chan.sendMessage(`<@!${sender.id}>, ${msg}`)
}

const commands = {
  '.help'() {
    this.reply(`
.start-game <game>`)
  },

  '.start-game'(name) {
    let channel = this.channel
    channel.sendMessage(`@here Starting game ${name}...`)
    let game = new Game(name)
    games[channel.id] = game
    game.on('update', msg => onGameUpdate(channel, msg))
    game.on('info', msg => onGameInfo(channel, msg))
    game.on('reply', (sender, msg) => onGameReply(channel, sender, msg))
    return game.start()
      .then(() => channel.sendMessage('@here Game started'))
  },
}

client.on('ready', () => {
  log('Ready!')
})

client.on('message', (msg) => {
  let { content, author } = msg
  if (content.startsWith('.')) {
    let args = shlex.parse(content)
    let cmd = args.shift()
    commands[cmd].apply(msg, args)
  } else if (author.id !== client.user.id
      && content.startsWith('>')) {
    let game = games[msg.channel.id]
    if (game != null) {
      game.emit('message', {
        content: content
          .split('\n', 1)[0]
          .substring(1)
          .trim(),
        sender: {
          id: author.id,
          nick: author.username
        }
      })
    }
  }
})

process.on('SIGINT', () => {
  client.destroy().then(process.exit)
})

client.login(process.env.TGM_TOKEN)
