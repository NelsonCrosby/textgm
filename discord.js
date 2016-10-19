'use strict'

const log = require('debug')('textgm:discord')
const Discord = require('discord.js')

const Game = require('./game')

const client = new Discord.Client()
const games = {}

function onGameUpdate(chan, msg) {
  log('got message', chan.id, msg)
  chan.sendMessage(msg)
}

function onGameInfo(chan, msg) {
  log('got info', chan.id, msg)
  chan.sendMessage(['***Info***', msg])
}

function onGameReply(chan, sender, msg) {
  chan.sendMessage(`<@!${sender.id}>, ${msg}`)
}

const commands = {
  '.help'() {
    this.channel.sendMessage(`<@!${this.author.id}>\n`
        + `**Help for textgm:**\n\n`
        + `Welcome to textgm - a bot allowing you to play `
        + `text adventures in Discord! You can play a game `
        + `in any channel on this server using the `
        + "`.start-game` command (see below). Each channel "
        + `can one run game, and each channel's game is `
        + `separate from games in other channels.\n\n`
        + `Messages sent while a game is running won't `
        + `automatically be processed. This allows you to `
        + `coordinate with other players in the channel easily. `
        + `To send a command to the game, prefix your message `
        + "with a `>` (optionally with spaces after it). "
        + `Note that only the first line will be sent to `
        + `the game - if you enter multiple lines the rest `
        + `will be ignored.\n\n`
        + `Each game will likely have slightly different `
        + "command capabilities - use `>HELP` to see how "
        + `a particular game works.\n\n`
        + `The following **commands** manipulate the game `
        + `running in this channel:\n\n`
        + "- `.help` displays this help text.\n"
        + "- `.source` gives you a link to textgm's source code.\n"
        + "- `.start-game <game name>` starts a new game "
        + `in this channel.\n`
        + "- `.game-set <key> <value>` sets an option on "
        + `the current game runner.\n`)
  },

  '.source'(who) {
    who = who || `<@!${this.author.id}>`
    this.channel.sendMessage(`${who}: https://github.com/NelsonCrosby/textgm`)
  },

  '.start-game'(name) {
    let channel = this.channel
    channel.sendMessage(`@here Starting game ${name}...`)
    let game = new Game(channel.id, name)
    games[channel.id] = game
    game.on('update', msg => onGameUpdate(channel, msg))
    game.on('info', msg => onGameInfo(channel, msg))
    game.on('reply', (sender, msg) => onGameReply(channel, sender, msg))
    return game.start()
      .then(() => channel.sendMessage('@here Game started'))
  },

  '.game-set'(k, v) {
    let game = games[this.channel.id]
    if (game == null) {
      this.reply('there is no game running!')
    } else {
      try {
        game.setOption(k, v)
        this.reply(`${k} = ${game.getOption(k)}`)
      } catch (e) {
        if (e instanceof TypeError) {
          this.reply(`${k} is not a valid key, or ${v} is not a valid value for ${k}.`)
        } else {
          throw e
        }
      }
    }
  },
}

client.on('ready', () => {
  log('Ready!')
})

client.on('message', (msg) => {
  let { content, author } = msg
  if (content.startsWith('.')) {
    let args = content.split(' ')
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
